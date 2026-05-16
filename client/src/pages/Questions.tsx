import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BrainCircuit,
  Search,
  BookOpen,
  Building2,
  Code2,
  Users,
  Layers,
  Shuffle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

const COMPANY_FILTERS = [
  { id: "", label: "Todas" },
  { id: "Amazon", label: "Amazon" },
  { id: "Google", label: "Google" },
  { id: "Meta", label: "Meta" },
  { id: "Microsoft", label: "Microsoft" },
  { id: "Apple", label: "Apple" },
];

const TYPE_FILTERS = [
  { id: "", label: "Todos", icon: BookOpen },
  { id: "behavioral", label: "Behavioral", icon: Users },
  { id: "system_design", label: "System Design", icon: Layers },
  { id: "coding", label: "Coding", icon: Code2 },
];

const TYPE_COLORS: Record<string, string> = {
  behavioral: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  system_design: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  coding: "text-green-400 bg-green-400/10 border-green-400/20",
  mixed: "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

export default function Questions() {
  const [, navigate] = useLocation();
  const [companyFilter, setCompanyFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: questions = [], isLoading } = trpc.questions.list.useQuery({
    company: companyFilter || undefined,
    interviewType: typeFilter || undefined,
  });

  const filtered = questions.filter((q) =>
    search ? q.content.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
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
          <Button
            size="sm"
            onClick={() => navigate("/setup")}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Praticar
          </Button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold mb-2">
              Banco de <span className="text-gold-gradient">Perguntas</span>
            </h1>
            <p className="text-muted-foreground">
              {filtered.length} perguntas de entrevistas reais de top companies
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar perguntas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 mb-8">
            {/* Company filter */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
                Empresa
              </p>
              <div className="flex flex-wrap gap-2">
                {COMPANY_FILTERS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCompanyFilter(c.id)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-sm border transition-all duration-200",
                      companyFilter === c.id
                        ? "bg-primary/15 border-primary/50 text-primary font-medium"
                        : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type filter */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
                Tipo
              </p>
              <div className="flex flex-wrap gap-2">
                {TYPE_FILTERS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTypeFilter(t.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm border transition-all duration-200",
                      typeFilter === t.id
                        ? "bg-primary/15 border-primary/50 text-primary font-medium"
                        : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                    )}
                  >
                    <t.icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Questions list */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-card animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma pergunta encontrada com esses filtros.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  className="glass-card rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                    className="w-full p-5 text-left flex items-start gap-4 hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {q.company && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium">
                            {q.company}
                          </span>
                        )}
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full border font-medium",
                            TYPE_COLORS[q.interviewType] ?? "text-muted-foreground bg-secondary border-border"
                          )}
                        >
                          {q.interviewType.replace("_", " ")}
                        </span>
                        {q.theme && (
                          <span className="text-xs text-muted-foreground">{q.theme}</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground leading-relaxed">{q.content}</p>
                    </div>
                    <div className="flex-shrink-0 mt-0.5">
                      {expandedId === q.id ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {expandedId === q.id && q.tips && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 pb-5"
                    >
                      <div className="flex gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{q.tips}</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
