import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db and llm modules
vi.mock("./db", () => ({
  createSession: vi.fn().mockResolvedValue({}),
  getSessionsByUserId: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      targetRole: "Software Engineer",
      seniority: "mid",
      company: "Amazon",
      interviewType: "behavioral",
      status: "active",
      questionCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getSessionById: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    targetRole: "Software Engineer",
    seniority: "mid",
    company: "Amazon",
    interviewType: "behavioral",
    status: "active",
    questionCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  createMessage: vi.fn().mockResolvedValue({}),
  getMessagesBySessionId: vi.fn().mockResolvedValue([
    {
      id: 1,
      sessionId: 1,
      role: "assistant",
      content: "Hello! Let's begin your mock interview. Tell me about yourself.",
      messageType: "intro",
      createdAt: new Date(),
    },
  ]),
  updateSession: vi.fn().mockResolvedValue({}),
  getQuestions: vi.fn().mockResolvedValue([
    {
      id: 1,
      content: "Tell me about a time you had a conflict with a co-worker.",
      company: "Amazon",
      interviewType: "behavioral",
      seniority: "all",
      theme: "Conflict",
      tips: "Use STAR method.",
      createdAt: new Date(),
    },
  ]),
  seedQuestionsIfEmpty: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content:
            'Great start! {"type":"feedback","starScore":7.5,"starBreakdown":{"situation":8,"task":7,"action":7,"result":8},"strengths":["Good structure"],"improvements":["Add more metrics"],"culturalTips":["Use I instead of We"],"improvedAnswer":"I led the team...","nextQuestion":"Tell me about a failure."}',
        },
      },
    ],
  }),
}));

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("questions.list", () => {
  it("returns questions from the bank", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.questions.list({});
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("content");
    expect(result[0]).toHaveProperty("interviewType");
  });
});

describe("interview.start", () => {
  it("creates a session and returns sessionId and intro message", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.interview.start({
      targetRole: "Software Engineer",
      seniority: "mid",
      company: "Amazon",
      interviewType: "behavioral",
    });
    expect(result).toHaveProperty("sessionId");
    expect(result).toHaveProperty("message");
    expect(typeof result.sessionId).toBe("number");
    expect(typeof result.message).toBe("string");
  });
});

describe("interview.sendMessage", () => {
  it("processes user answer and returns feedback", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.interview.sendMessage({
      sessionId: 1,
      content: "In my previous role, I worked on a project where I had a conflict with a teammate.",
    });
    expect(result).toHaveProperty("content");
    expect(result).toHaveProperty("feedbackData");
    expect(result.feedbackData).not.toBeNull();
    if (result.feedbackData) {
      expect(result.feedbackData).toHaveProperty("starScore");
      expect(result.feedbackData.starScore).toBeGreaterThan(0);
    }
  });
});

describe("sessions.list", () => {
  it("returns sessions for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.sessions.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
  });
});
