import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import {
  createSession,
  createMessage,
  getSessionById,
  getSessionsByUserId,
  getMessagesBySessionId,
  updateSession,
  getQuestions,
  seedQuestionsIfEmpty,
} from "./db";
import { z } from "zod";

// ─── System Prompt for Tech Recruiter ────────────────────────────────────────

function buildRecruiterSystemPrompt(config: {
  targetRole: string;
  seniority: string;
  company: string | null;
  interviewType: string;
}) {
  const companyContext = config.company
    ? `You are interviewing a candidate for ${config.company}. Focus on ${config.company}'s leadership principles and culture.`
    : "You are interviewing a candidate for a top US tech company.";

  return `You are an experienced Tech Recruiter conducting a mock interview in English.
${companyContext}
The candidate is a Brazilian professional applying for a ${config.seniority}-level ${config.targetRole} position.
Interview type: ${config.interviewType}.

CRITICAL RULES:
1. Ask ONE question at a time. Never list multiple questions.
2. Wait for the candidate's answer before proceeding.
3. After each answer, provide structured feedback in Portuguese (pt-BR) using this exact JSON format:
{
  "type": "feedback",
  "starScore": <0-10 float>,
  "starBreakdown": {
    "situation": <0-10>,
    "task": <0-10>,
    "action": <0-10>,
    "result": <0-10>
  },
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "culturalTips": ["<tip integrated naturally>"],
  "improvedAnswer": "<a polished version of the answer in English>",
  "nextQuestion": "<the next interview question in English>"
}

4. Cultural tips for Brazilians to integrate naturally in feedback:
   - Use "I" not "We" to show personal ownership
   - Be direct and concise, avoid "enrolação"
   - Always quantify results with metrics (%, $, time saved, etc.)
   - Show confidence without being arrogant

5. For the first message, introduce yourself briefly and ask the first question.
6. After 5-7 questions, wrap up with a closing summary.

Keep questions relevant to ${config.interviewType} interviews for ${config.seniority} ${config.targetRole}.`;
}

// ─── Routers ──────────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  questions: router({
    list: publicProcedure
      .input(
        z.object({
          company: z.string().optional(),
          interviewType: z.string().optional(),
          seniority: z.string().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        await seedQuestionsIfEmpty();
        return getQuestions(input ?? {});
      }),
  }),

  sessions: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getSessionsByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const session = await getSessionById(input.id);
        if (!session || session.userId !== ctx.user.id) return null;
        const messages = await getMessagesBySessionId(input.id);
        return { session, messages };
      }),
  }),

  interview: router({
    start: protectedProcedure
      .input(
        z.object({
          targetRole: z.string(),
          seniority: z.enum(["junior", "mid", "senior", "staff", "principal"]),
          company: z.string().nullable(),
          interviewType: z.enum(["behavioral", "system_design", "coding", "mixed"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Create session
        await createSession({
          userId: ctx.user.id,
          targetRole: input.targetRole,
          seniority: input.seniority,
          company: input.company ?? undefined,
          interviewType: input.interviewType,
          status: "active",
          questionCount: 0,
        });

        // Fetch the created session
        const sessions = await getSessionsByUserId(ctx.user.id);
        const session = sessions[0];

        // Generate intro + first question
        const systemPrompt = buildRecruiterSystemPrompt({
          targetRole: input.targetRole,
          seniority: input.seniority,
          company: input.company,
          interviewType: input.interviewType,
        });

        const llmResponse = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content:
                "Start the interview. Introduce yourself briefly in English and ask the first question.",
            },
          ],
        });

        const introContent =
          String(llmResponse.choices?.[0]?.message?.content ?? "Hello! Let's begin your mock interview.");

        // Save intro message
        await createMessage({
          sessionId: session.id,
          role: "assistant",
          content: introContent,
          messageType: "intro",
        });

        return { sessionId: session.id, message: introContent };
      }),

    sendMessage: protectedProcedure
      .input(
        z.object({
          sessionId: z.number(),
          content: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const session = await getSessionById(input.sessionId);
        if (!session || session.userId !== ctx.user.id) {
          throw new Error("Session not found");
        }

        // Save user message
        await createMessage({
          sessionId: input.sessionId,
          role: "user",
          content: input.content,
          messageType: "answer",
        });

        // Get conversation history
        const history = await getMessagesBySessionId(input.sessionId);

        const systemPrompt = buildRecruiterSystemPrompt({
          targetRole: session.targetRole,
          seniority: session.seniority,
          company: session.company ?? null,
          interviewType: session.interviewType,
        });

        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...history.map((m) => ({
            role: m.role as "assistant" | "user",
            content: m.content,
          })),
        ];

        const llmResponse = await invokeLLM({ messages });
        const rawContent = String(llmResponse.choices?.[0]?.message?.content ?? "");

        // Try to parse structured feedback JSON
        let feedbackData: any = null;
        let nextQuestion = "";
        let starScore: number | undefined;
        let starBreakdown: any = null;

        try {
          const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            feedbackData = JSON.parse(jsonMatch[0]);
            starScore = feedbackData.starScore;
            starBreakdown = feedbackData.starBreakdown;
            nextQuestion = feedbackData.nextQuestion ?? "";
          }
        } catch {
          // Not structured, treat as plain text
        }

        // Save feedback message
        await createMessage({
          sessionId: input.sessionId,
          role: "assistant",
          content: rawContent,
          messageType: "feedback",
          starScore: starScore ?? null,
          starBreakdown: starBreakdown ?? null,
        });

        // Update question count
        await updateSession(input.sessionId, {
          questionCount: (session.questionCount ?? 0) + 1,
        });

        return {
          content: rawContent,
          feedbackData,
          nextQuestion,
          starScore,
          starBreakdown,
        };
      }),

    end: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const session = await getSessionById(input.sessionId);
        if (!session || session.userId !== ctx.user.id) throw new Error("Session not found");

        const messages = await getMessagesBySessionId(input.sessionId);
        const feedbackMessages = messages.filter((m) => m.messageType === "feedback" && m.starScore != null);

        const avgScore =
          feedbackMessages.length > 0
            ? feedbackMessages.reduce((sum, m) => sum + (m.starScore ?? 0), 0) / feedbackMessages.length
            : null;

        // Generate closing summary
        const systemPrompt = buildRecruiterSystemPrompt({
          targetRole: session.targetRole,
          seniority: session.seniority,
          company: session.company ?? null,
          interviewType: session.interviewType,
        });

        const llmResponse = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({ role: m.role as "assistant" | "user", content: m.content })),
            {
              role: "user",
              content:
                "Please provide a final summary of the interview in Portuguese (pt-BR). Include overall strengths, main areas for improvement, and an overall score out of 10.",
            },
          ],
        });

        const closingContent = String(llmResponse.choices?.[0]?.message?.content ?? "Interview completed.");

        await createMessage({
          sessionId: input.sessionId,
          role: "assistant",
          content: closingContent,
          messageType: "closing",
        });

        await updateSession(input.sessionId, {
          status: "completed",
          score: avgScore ?? undefined,
          completedAt: new Date(),
        });

        return { summary: closingContent, score: avgScore };
      }),
  }),
});

export type AppRouter = typeof appRouter;
