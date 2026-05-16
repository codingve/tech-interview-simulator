import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  ArrowLeft,
  ArrowRight,
  Building2,
  Code2,
  Users,
  Layers,
  Shuffle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const COMPANIES = [
  { id: "Amazon", label: "Amazon", color: "oklch(0.75 0.15 55)" },
  { id: "Google", label: "Google", color: "oklch(0.65 0.18 240)" },
  { id: "Meta", label: "Meta", color: "oklch(0.65 0.18 260)" },
  { id: "Microsoft", label: "Microsoft", color: "oklch(0.65 0.18 220)" },
  { id: "Apple", label: "Apple", color: "oklch(0.75 0.01 250)" },
  { id: "Netflix", label: "Netflix", color: "oklch(0.55 0.22 25)" },
  { id: null, label: "Qualquer empresa", color: "oklch(0.60 0.01 250)" },
];

const ROLES = [
  "Software Engineer",
  "Senior Software Engineer",
  "Staff Software Engineer",
  "Engineering Manager",
  "Product Manager",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps / SRE",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
];

const SENIORITIES = [
  { id: "junior", label: "Junior", desc: "0–2 anos" },
  { id: "mid", label: "Mid-level", desc: "2–5 anos" },
  { id: "senior", label: "Senior", desc: "5–8 anos" },
  { id: "staff", label: "Staff", desc: "8+ anos" },
  { id: "principal", label: "Principal", desc: "Liderança técnica" },
];

const INTERVIEW_TYPES = [
  { id: "behavioral", label: "Behavioral", desc: "Perguntas comportamentais (STAR)", icon: Users },
  { id: "system_design", label: "System Design", desc: "Arquitetura de sistemas", icon: Layers },
  { id: "coding", label: "Coding", desc: "Algoritmos e estruturas de dados", icon: Code2 },
  { id: "mixed", label: "Mixed", desc: "Combinação de todos os tipos", icon: Shuffle },
];

type Step = 1 | 2 | 3 | 4;

export default function Setup() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const [step, setStep] = useState<Step>(1);
  const [company, setCompany] = useState<string | null>(null);
  const [role, setRole] = useState("Software Engineer");
  const [seniority, setSeniority] = useState<string>("mid");
  const [interviewType, setInterviewType] = useState<string>("behavioral");

  const startMutation = trpc.interview.start.useMutation({
    onSuccess: (data) => {
      navigate(`/interview/${data.sessionId}`);
    },
    onError: (err) => {
      toast.error("Erro ao iniciar entrevista: " + err.message);
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Faça login para continuar</h2>
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

  const handleStart = () => {
    startMutation.mutate({
      targetRole: role,
      seniority: seniority as any,
      company: company,
      interviewType: interviewType as any,
    });
  };

  const steps = [
    { label: "Empresa", num: 1 },
    { label: "Cargo", num: 2 },
    { label: "Nível", num: 3 },
    { label: "Tipo", num: 4 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <BrainCircuit className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-semibold text-sm">
              Interview<span className="text-primary">AI</span>
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
                      step > s.num
                        ? "bg-primary text-primary-foreground"
                        : step === s.num
                        ? "bg-primary/20 border-2 border-primary text-primary"
                        : "bg-secondary text-muted-foreground border border-border"
                    )}
                  >
                    {step > s.num ? "✓" : s.num}
                  </div>
                  <span
                    className={cn(
                      "text-xs mt-1.5 font-medium",
                      step >= s.num ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-px mx-3 mt-[-12px] transition-all duration-300",
                      step > s.num ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Step 1: Company */}
          {step === 1 && (
            <div>
              <h1 className="font-serif text-3xl font-bold mb-2">Para qual empresa?</h1>
              <p className="text-muted-foreground mb-8">
                Selecione a empresa para personalizar as perguntas e o contexto cultural.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {COMPANIES.map((c) => (
                  <button
                    key={String(c.id)}
                    onClick={() => setCompany(c.id)}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all duration-200 hover:border-primary/50",
                      company === c.id
                        ? "border-primary bg-primary/10 glow-gold"
                        : "border-border bg-card hover:bg-accent"
                    )}
                  >
                    <Building2
                      className="w-5 h-5 mb-2"
                      style={{ color: c.color }}
                    />
                    <p className="text-sm font-semibold">{c.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Role */}
          {step === 2 && (
            <div>
              <h1 className="font-serif text-3xl font-bold mb-2">Qual o cargo alvo?</h1>
              <p className="text-muted-foreground mb-8">
                Escolha o cargo para o qual você está se preparando.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all duration-200 hover:border-primary/50",
                      role === r
                        ? "border-primary bg-primary/10 glow-gold"
                        : "border-border bg-card hover:bg-accent"
                    )}
                  >
                    <p className="text-sm font-semibold">{r}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Seniority */}
          {step === 3 && (
            <div>
              <h1 className="font-serif text-3xl font-bold mb-2">Nível de senioridade</h1>
              <p className="text-muted-foreground mb-8">
                O nível define a profundidade e complexidade das perguntas.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SENIORITIES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSeniority(s.id)}
                    className={cn(
                      "p-5 rounded-xl border text-left transition-all duration-200 hover:border-primary/50",
                      seniority === s.id
                        ? "border-primary bg-primary/10 glow-gold"
                        : "border-border bg-card hover:bg-accent"
                    )}
                  >
                    <p className="font-semibold mb-1">{s.label}</p>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Interview Type */}
          {step === 4 && (
            <div>
              <h1 className="font-serif text-3xl font-bold mb-2">Tipo de entrevista</h1>
              <p className="text-muted-foreground mb-8">
                Escolha o foco da sua simulação.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {INTERVIEW_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setInterviewType(t.id)}
                    className={cn(
                      "p-5 rounded-xl border text-left transition-all duration-200 hover:border-primary/50",
                      interviewType === t.id
                        ? "border-primary bg-primary/10 glow-gold"
                        : "border-border bg-card hover:bg-accent"
                    )}
                  >
                    <t.icon
                      className={cn(
                        "w-6 h-6 mb-3",
                        interviewType === t.id ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <p className="font-semibold mb-1">{t.label}</p>
                    <p className="text-sm text-muted-foreground">{t.desc}</p>
                  </button>
                ))}
              </div>

              {/* Summary */}
              <div className="glass-card rounded-2xl p-5 border-gradient mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Resumo da Simulação
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Empresa</p>
                    <p className="font-semibold">{company ?? "Qualquer empresa"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cargo</p>
                    <p className="font-semibold">{role}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Nível</p>
                    <p className="font-semibold capitalize">{seniority}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tipo</p>
                    <p className="font-semibold capitalize">{interviewType.replace("_", " ")}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
            disabled={step === 1}
            className="border-border text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {step < 4 ? (
            <Button
              onClick={() => setStep((s) => Math.min(4, s + 1) as Step)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleStart}
              disabled={startMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 glow-gold"
            >
              {startMutation.isPending ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin mr-2" />
                  Iniciando...
                </>
              ) : (
                <>
                  Iniciar Entrevista
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
