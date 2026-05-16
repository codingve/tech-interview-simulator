# Tech Interview Simulator - TODO

## Schema & Backend
- [x] Schema: tabelas sessions, messages, questions no banco
- [x] Migration SQL aplicada via webdev_execute_sql
- [x] db.ts: queries para sessions, messages, questions
- [x] router: interview.start, interview.sendMessage, interview.endSession
- [x] router: questions.list com filtros por empresa e tipo
- [x] router: sessions.list, sessions.getById com mensagens
- [x] LLM: system prompt de Tech Recruiter com feedback STAR
- [x] LLM: geração de feedback integrado com dicas culturais para brasileiros

## Design System & Layout
- [x] index.css: paleta premium dark (slate/indigo/gold), tipografia Inter + Playfair Display
- [x] App.tsx: rotas (/, /setup, /interview/:id, /history, /questions)
- [x] Landing page (Home.tsx) com hero, features e CTA

## Telas
- [x] Setup page: seleção de cargo, senioridade, empresa e tipo de entrevista
- [x] Interview page: chat interativo com IA, uma pergunta por vez, aguarda resposta
- [x] Interview page: feedback STAR inline após cada resposta
- [x] Questions page: banco de perguntas com filtros (empresa: Amazon, Google, Meta; tipo: Behavioral, System Design, Coding)
- [x] History page: listagem de sessões com pontuação e data
- [x] History page: detalhe de sessão com transcrição e métricas de progresso

## Qualidade
- [x] Vitest: testes dos routers principais (6 testes passando)
- [x] Loading states e empty states em todas as telas
- [x] Responsividade mobile
- [x] Animações e micro-interações premium (framer-motion)
- [x] TypeScript sem erros
