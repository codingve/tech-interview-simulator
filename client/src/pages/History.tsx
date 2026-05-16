import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BrainCircuit,
  Plus,
  Trophy,
  Clock,
  Building2,
  MessageSquare,
  TrendingUp,
  BookOpen,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Em andamento", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  completed: { label: "Concluída", color: "text-green-400 bg-green-400/10 border-green-400/20" },
  abandoned: { label: "Abandonada", color: "text-muted-foreground bg-secondary border-border" },
};

const TYPE_LABELS: Record<string, string> = {
  behavioral: "Behavioral",
  system_design: "System Design",
  coding: "Coding",
  mixed: "Mixed",
};

function ScoreRing({ score }: { score: number | null }) {
  if (score === null) return (
    <div className="w-14 h-14 rounded-full border-2 border-border flex items-center justify-center">
      <span className="text-xs text-muted-foreground">—</span>
    </div>
  );

  const color = score >= 8 ? "#4ade80" : score >= 6 ? "oklch(0.78 0.12 85)" : score >= 4 ? "#facc15" : "#f87171";
  const pct = (score / 10) * 100;
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg width="56" height="56" className="-rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="oklch(0.25 0.02 250)" strokeWidth="3" />
        <circle
          cx="28" cy="28" r={r} fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold" style={{ color }}>{score.toFixed(1)}</span>
      </div>
    </div>
  );
}

export default function History() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const { data: sessions = [], isLoading } = trpc.sessions.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading || (!isAuthenticated && !loading)) {
    if (!isAuthenticated && !loading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Faça login para ver seu histórico</h2>
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-primary text-primary-foreground"
            >
              Entrar com Manus
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const completedSessions = sessions.filter((s) => s.status === "completed" && s.score !== null);
  const avgScore =
    completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.score ?? 0), 0) / completedSessions.length
      : null;
  const bestScore =
    completedSessions.length > 0
      ? Math.max(...completedSessions.map((s) => s.score ?? 0))
      : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Início</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <BrainCircuit className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-semibold text-sm">
              Interview<span className="text-primary">AI</span>
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => navigate("/setup")}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Nova Simulação
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          <h1 className="font-serif text-4xl font-bold mb-2">
            Seu <span className="text-gold-gradient">Progresso</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            {sessions.length} simulações realizadas
          </p>

          {/* Stats */}
          {sessions.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {[
                { icon: BookOpen, label: "Total de Sessões", value: sessions.length },
                { icon: Trophy, label: "Sessões Concluídas", value: completedSessions.length },
                {
                  icon: TrendingUp,
                  label: "Média Geral",
                  value: avgScore !== null ? avgScore.toFixed(1) + "/10" : "—",
                },
                {
                  icon: Trophy,
                  label: "Melhor Pontuação",
                  value: bestScore !== null ? bestScore.toFixed(1) + "/10" : "—",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  className="glass-card rounded-xl p-4"
                >
                  <stat.icon className="w-4 h-4 text-primary mb-2" />
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Sessions list */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-card animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Nenhuma simulação ainda</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Comece sua primeira simulação de entrevista agora.
              </p>
              <Button
                onClick={() => navigate("/setup")}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Iniciar Primeira Simulação
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session, i) => {
                const statusInfo = STATUS_LABELS[session.status] ?? STATUS_LABELS.abandoned;
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <button
                      onClick={() => navigate(`/interview/${session.id}`)}
                      className="w-full glass-card rounded-xl p-5 text-left hover:border-primary/30 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-4">
                        <ScoreRing score={session.score ?? null} />

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="font-semibold text-foreground truncate">
                              {session.targetRole}
                            </span>
                            <span
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full border font-medium",
                                statusInfo.color
                              )}
                            >
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            {session.company && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {session.company}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {TYPE_LABELS[session.interviewType] ?? session.interviewType}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {session.questionCount} perguntas
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(session.createdAt).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
