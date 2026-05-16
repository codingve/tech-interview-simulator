import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Streamdown } from "streamdown";
import {
  ArrowLeft,
  BrainCircuit,
  Send,
  StopCircle,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Globe2,
  ChevronDown,
  ChevronUp,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ParsedFeedback = {
  type: string;
  starScore: number;
  starBreakdown: { situation: number; task: number; action: number; result: number };
  strengths: string[];
  improvements: string[];
  culturalTips: string[];
  improvedAnswer: string;
  nextQuestion: string;
};

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  messageType: string;
  feedbackData?: ParsedFeedback | null;
  showFeedback?: boolean;
};

function StarScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8 ? "text-green-400" : score >= 6 ? "text-primary" : score >= 4 ? "text-yellow-400" : "text-red-400";
  return (
    <span className={cn("font-bold text-lg", color)}>
      {score.toFixed(1)}<span className="text-xs font-normal text-muted-foreground">/10</span>
    </span>
  );
}

function StarBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 8 ? "bg-green-500" : value >= 6 ? "bg-primary" : value >= 4 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / 10) * 100}%` }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
      <span className="text-xs font-medium w-6 text-right">{value}</span>
    </div>
  );
}

function FeedbackCard({ feedback, expanded, onToggle }: { feedback: ParsedFeedback; expanded: boolean; onToggle: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 rounded-xl border border-primary/20 bg-primary/5 overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Feedback STAR</span>
          <StarScoreBadge score={feedback.starScore} />
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* STAR Breakdown */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Breakdown STAR
                </p>
                <StarBar label="Situation" value={feedback.starBreakdown.situation} />
                <StarBar label="Task" value={feedback.starBreakdown.task} />
                <StarBar label="Action" value={feedback.starBreakdown.action} />
                <StarBar label="Result" value={feedback.starBreakdown.result} />
              </div>

              {/* Strengths */}
              {feedback.strengths?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Pontos Fortes
                  </p>
                  <ul className="space-y-1.5">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {feedback.improvements?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Áreas de Melhoria
                  </p>
                  <ul className="space-y-1.5">
                    {feedback.improvements.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cultural Tips */}
              {feedback.culturalTips?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Dicas Culturais
                  </p>
                  <ul className="space-y-1.5">
                    {feedback.culturalTips.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Globe2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improved Answer */}
              {feedback.improvedAnswer && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Resposta Aprimorada
                  </p>
                  <div className="p-3 rounded-lg bg-secondary border border-border text-sm text-muted-foreground italic leading-relaxed">
                    "{feedback.improvedAnswer}"
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Interview() {
  const { id } = useParams<{ id: string }>();
  const sessionId = parseInt(id ?? "0");
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isEnded, setIsEnded] = useState(false);
  const [expandedFeedbacks, setExpandedFeedbacks] = useState<Set<string>>(new Set());
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load existing session
  const { data: sessionData } = trpc.sessions.getById.useQuery(
    { id: sessionId },
    { enabled: !!sessionId && isAuthenticated }
  );

  useEffect(() => {
    if (sessionData?.messages) {
      const loaded: Message[] = sessionData.messages.map((m) => {
        let feedbackData: ParsedFeedback | null = null;
        if (m.messageType === "feedback") {
          try {
            const jsonMatch = m.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) feedbackData = JSON.parse(jsonMatch[0]);
          } catch {}
        }
        return {
          id: String(m.id),
          role: m.role as "assistant" | "user",
          content: m.content,
          messageType: m.messageType,
          feedbackData,
          showFeedback: false,
        };
      });
      setMessages(loaded);
      if (sessionData.session.status === "completed") setIsEnded(true);
    }
  }, [sessionData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = trpc.interview.sendMessage.useMutation({
    onSuccess: (data) => {
      let feedbackData: ParsedFeedback | null = null;
      try {
        const jsonMatch = data.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) feedbackData = JSON.parse(jsonMatch[0]);
      } catch {}

      const msgId = Date.now().toString();
      setMessages((prev) => [
        ...prev,
        {
          id: msgId,
          role: "assistant",
          content: data.content,
          messageType: "feedback",
          feedbackData,
          showFeedback: false,
        },
      ]);
      // Auto-expand feedback
      if (feedbackData) {
        setExpandedFeedbacks((prev) => { const next = new Set(prev); next.add(msgId); return next; });
      }
    },
    onError: (err) => toast.error("Erro: " + err.message),
  });

  const endMutation = trpc.interview.end.useMutation({
    onSuccess: (data) => {
      setIsEnded(true);
      setFinalScore(data.score);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: data.summary,
          messageType: "closing",
        },
      ]);
    },
    onError: (err) => toast.error("Erro ao encerrar: " + err.message),
  });

  const handleSend = () => {
    const text = input.trim();
    if (!text || sendMutation.isPending) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: text, messageType: "answer" },
    ]);
    setInput("");
    sendMutation.mutate({ sessionId, content: text });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleFeedback = (id: string) => {
    setExpandedFeedbacks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getDisplayContent = (msg: Message) => {
    if (msg.messageType === "feedback" && msg.feedbackData) {
      return msg.feedbackData.nextQuestion
        ? `**Next question:** ${msg.feedbackData.nextQuestion}`
        : msg.content.replace(/\{[\s\S]*\}/, "").trim();
    }
    return msg.content;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl flex-shrink-0">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/history")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm hidden sm:block">Histórico</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <BrainCircuit className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-semibold text-sm">
              Interview<span className="text-primary">AI</span>
            </span>
            {sessionData?.session && (
              <span className="hidden sm:block text-xs text-muted-foreground ml-2">
                {sessionData.session.company ?? "Tech Company"} · {sessionData.session.targetRole}
              </span>
            )}
          </div>
          {!isEnded && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => endMutation.mutate({ sessionId })}
              disabled={endMutation.isPending}
              className="border-destructive/50 text-destructive hover:bg-destructive/10 text-xs"
            >
              <StopCircle className="w-3.5 h-3.5 mr-1.5" />
              Encerrar
            </Button>
          )}
          {isEnded && (
            <Button
              size="sm"
              onClick={() => navigate("/setup")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
            >
              Nova Simulação
            </Button>
          )}
        </div>
      </nav>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-4">
                  <BrainCircuit className="w-6 h-6 text-primary animate-pulse" />
                </div>
                <p className="text-muted-foreground text-sm">Aguardando o Tech Recruiter...</p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex-shrink-0 flex items-center justify-center mt-0.5">
                  {msg.messageType === "closing" ? (
                    <Trophy className="w-4 h-4 text-primary" />
                  ) : (
                    <BrainCircuit className="w-4 h-4 text-primary" />
                  )}
                </div>
              )}

              <div className={cn("max-w-[85%]", msg.role === "user" ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary/15 border border-primary/25 rounded-tr-sm text-foreground"
                      : "bg-secondary border border-border rounded-tl-sm text-foreground"
                  )}
                >
                  <Streamdown>{getDisplayContent(msg)}</Streamdown>
                </div>

                {/* Feedback card */}
                {msg.feedbackData && (
                  <FeedbackCard
                    feedback={msg.feedbackData}
                    expanded={expandedFeedbacks.has(msg.id)}
                    onToggle={() => toggleFeedback(msg.id)}
                  />
                )}
              </div>
            </motion.div>
          ))}

          {/* Loading indicator */}
          {sendMutation.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex-shrink-0 flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-secondary border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center h-5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Final score */}
          {isEnded && finalScore !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-6 text-center border-gradient"
            >
              <Trophy className="w-10 h-10 text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-1">Pontuação Final</p>
              <p className="text-5xl font-bold text-gold-gradient mb-3">
                {finalScore.toFixed(1)}<span className="text-xl text-muted-foreground">/10</span>
              </p>
              <Button
                onClick={() => navigate("/history")}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Ver Histórico Completo
              </Button>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      {!isEnded && (
        <div className="flex-shrink-0 border-t border-border/50 bg-background/80 backdrop-blur-xl p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Responda em inglês como faria na entrevista real... (Enter para enviar)"
                  disabled={sendMutation.isPending}
                  rows={1}
                  className="w-full resize-none rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground px-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all disabled:opacity-50 max-h-40"
                  style={{ minHeight: "48px" }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = Math.min(target.scrollHeight, 160) + "px";
                  }}
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || sendMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-12 p-0 rounded-xl flex-shrink-0 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Responda como faria em uma entrevista real · Shift+Enter para nova linha
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
