import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  MessageSquareText,
  BarChart3,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Globe2,
  Target,
  TrendingUp,
} from "lucide-react";

const COMPANIES = ["Amazon", "Google", "Meta", "Microsoft", "Apple", "Netflix"];

const FEATURES = [
  {
    icon: MessageSquareText,
    title: "Mock Interview com IA",
    description:
      "Entrevistas simuladas com um Tech Recruiter de IA que faz uma pergunta por vez, aguarda sua resposta e avança no seu ritmo.",
  },
  {
    icon: BrainCircuit,
    title: "Feedback STAR Automático",
    description:
      "Avaliação detalhada de cada resposta usando o método STAR — Situation, Task, Action, Result — com pontuação e sugestões de melhoria.",
  },
  {
    icon: BookOpen,
    title: "Banco de Perguntas",
    description:
      "Centenas de perguntas reais de Amazon, Google, Meta e outras top companies, filtráveis por empresa, tipo e senioridade.",
  },
  {
    icon: Globe2,
    title: "Dicas Culturais para Brasileiros",
    description:
      "Orientações integradas ao feedback sobre comunicação direta, uso do 'I' para ownership e como quantificar resultados.",
  },
  {
    icon: BarChart3,
    title: "Histórico e Progresso",
    description:
      "Acompanhe sua evolução ao longo do tempo com pontuações por sessão, gráficos de progresso e transcrições completas.",
  },
  {
    icon: Target,
    title: "Configuração de Perfil",
    description:
      "Personalize cada simulação com cargo alvo, nível de senioridade, empresa específica e tipo de entrevista.",
  },
];

const STATS = [
  { value: "28+", label: "Perguntas no banco" },
  { value: "3", label: "Top companies" },
  { value: "4", label: "Tipos de entrevista" },
  { value: "100%", label: "Feedback em PT-BR" },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate("/setup");
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground tracking-tight">
              Interview<span className="text-primary">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">
                  Olá, {user?.name?.split(" ")[0]}
                </span>
                <Button
                  size="sm"
                  onClick={() => navigate("/setup")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Iniciar Simulação
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Entrar
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.95 0.005 250) 1px, transparent 1px), linear-gradient(90deg, oklch(0.95 0.005 250) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-6">
              <Sparkles className="w-3 h-3" />
              Preparação para o mercado americano
            </div>
            <h1 className="font-serif text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Domine a{" "}
              <span className="text-gold-gradient">entrevista</span>{" "}
              da sua vida
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              Plataforma de simulação com IA para profissionais brasileiros que buscam oportunidades
              em <strong className="text-foreground">Amazon, Google, Meta</strong> e outras grandes
              empresas de tecnologia dos EUA.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              {["Feedback STAR", "Dicas Culturais", "Mock Interview", "Progresso"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs bg-secondary text-secondary-foreground border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={handleCTA}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 glow-gold transition-all duration-200 active:scale-[0.97]"
              >
                Começar Simulação Gratuita
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/questions")}
                className="border-border text-foreground hover:bg-accent"
              >
                Ver Banco de Perguntas
              </Button>
            </div>
          </motion.div>

          {/* Hero visual — mock chat */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="hidden lg:block"
          >
            <div className="glass-card rounded-2xl p-6 border-gradient">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/50">
                <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Tech Recruiter AI</p>
                  <p className="text-xs text-muted-foreground">Amazon • Senior SWE</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">Ao vivo</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <BrainCircuit className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-secondary rounded-xl rounded-tl-sm px-4 py-3 text-sm max-w-xs">
                    <p className="text-foreground">
                      Tell me about a time you had to deliver a project under a very tight deadline.
                      How did you manage it?
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="bg-primary/15 border border-primary/20 rounded-xl rounded-tr-sm px-4 py-3 text-sm max-w-xs">
                    <p className="text-foreground">
                      In my last role, I led a team to ship a critical feature in 3 days instead of
                      2 weeks...
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <BrainCircuit className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-secondary rounded-xl rounded-tl-sm px-4 py-3 text-sm max-w-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary">Feedback STAR</span>
                      <span className="ml-auto text-xs font-bold text-green-400">8.5/10</span>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Ótimo uso de métricas! Lembre-se de usar "I" ao invés de "we" para mostrar
                      seu ownership individual.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="text-center"
            >
              <p className="text-3xl font-bold text-gold-gradient mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Companies */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-center text-sm text-muted-foreground mb-8 uppercase tracking-widest">
          Prepare-se para as melhores empresas
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {COMPANIES.map((company) => (
            <div
              key={company}
              className="px-5 py-2.5 rounded-full border border-border bg-card text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all duration-200"
            >
              {company}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-14"
        >
          <h2 className="font-serif text-4xl font-bold mb-4">
            Tudo que você precisa para{" "}
            <span className="text-gold-gradient">se destacar</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Uma plataforma completa, pensada para profissionais brasileiros que querem conquistar
            vagas nas maiores empresas de tecnologia do mundo.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="relative rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-12 text-center"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h2 className="font-serif text-4xl font-bold mb-4">
            Pronto para a sua próxima entrevista?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Comece agora com uma simulação personalizada e receba feedback profissional em tempo
            real.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={handleCTA}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-10 glow-gold active:scale-[0.97] transition-all duration-200"
            >
              Começar Agora — É Gratuito
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-muted-foreground">
            {["Sem cartão de crédito", "Feedback em Português", "Perguntas reais de FAANG"].map(
              (item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  {item}
                </div>
              )
            )}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
              <BrainCircuit className="w-3 h-3 text-primary" />
            </div>
            <span className="text-sm font-medium">
              Interview<span className="text-primary">AI</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Preparação para entrevistas em empresas de tecnologia dos EUA
          </p>
        </div>
      </footer>
    </div>
  );
}
