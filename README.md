# 🧬 EVO — Seu avatar, sua evolução

> **Hackathon Órbita 2026 · Desafio: Saúde Gamificada**
> Programa de 100 dias onde ações reais do participante transformam a evolução do seu avatar.

O EVO é um app de saúde gamificada onde você não acompanha números — **você cuida de alguém: você mesmo, em forma de avatar**. Cada check-in, missão e hábito saudável gera pontos que transformam gradualmente um avatar com sobrepeso e hábitos ruins (dia 1) em um modelo saudável e ativo (dia 100).

## ✨ Funcionalidades

| Área | O que tem |
|---|---|
| 🧬 **Avatar evolutivo** | Motor SVG paramétrico com 5 morfologias corporais; IA analisa sua foto e gera o avatar; editor completo (pele, cabelo, barba, roupas, acessórios); humor reativo ao seu dia |
| 📋 **Onboarding inteligente** | 27 dados de saúde → cálculo automático de IMC, TMB (Mifflin-St Jeor), gasto calórico, metas de calorias/água e Score de Saúde inicial |
| ✅ **Check-in diário** | Questionário de 60s (sono, água, exercício, alimentação, humor, estresse) → score 0–100 com pesos por impacto em saúde |
| 🎮 **Gamificação completa** | XP, níveis (curva √), moedas, streak, missões diárias sorteadas pelos seus pontos fracos, 20 conquistas, roleta diária, loja de cosméticos |
| 🗺️ **Jornada de 100 dias** | Trilha visual com marcos nos dias 1·25·50·75·100; temporadas renováveis |
| ❤️ **Minha Saúde** | Fatores de risco com "nível de cuidado", médias semanais/mensais, gráficos de evolução |
| 🥗 **Plano alimentar IA** | Gerado por IA com base TACO (alimentos brasileiros), macros, substituições e exportação em PDF |
| 🤖 **Chat IA** | Assistente de saúde com contexto do seu perfil |
| 🏆 **Social** | Ranking global (Supabase realtime), feed de atividades, amigos |
| ⚔️ **Competições** | Desafios por diversão, moedas ou PIX real com escrow (simulado no MVP) |
| ⭐ **Freemium** | Free: jornada completa · Premium: IA ilimitada, itens exclusivos, desafios PIX |

## 🏗️ Arquitetura

```
React SPA (Vite + TS + Tailwind + Framer Motion + Zustand)
   ├── Supabase  → Auth (e-mail + Google OAuth + recuperação), Postgres + RLS, ranking
   └── n8n 🧠    → TODA a IA em workflows visuais (webhooks):
        ├── evo-avatar-analyze   (Claude Vision: foto → parâmetros do avatar)
        ├── evo-health-chat      (assistente de saúde)
        ├── evo-meal-plan        (plano alimentar estruturado)
        └── evo-daily-feedback   (mensagens motivacionais do check-in)
```

**Decisões-chave:**
- **A IA devolve parâmetros, nunca imagens** → avatar anima, evolui e troca de roupa sem custo de geração.
- **Local-first** → o jogo funciona offline/sem backend; Supabase sincroniza ranking e n8n turbina com IA. O demo nunca quebra.
- **Chaves de API vivem só no n8n** → nada sensível chega ao navegador.
- **O avatar nunca regride de corpo** → vergonha desengaja, empatia retém (dias ruins deixam ele triste, não gordo de novo).

## 🧮 Lógica de score (exigência do desafio)

```
score_diário = sono(25) + hidratação(15) + exercício(25) + alimentação(25) + bem-estar(10)
médias semanais/mensais = média móvel dos diários
health_score = média dos últimos 14 dias (mede consistência, não picos)
XP do check-in = 50 + score/2 · nível = √(XP/100) · moedas ≈ XP/3
evolução do avatar = tempo + consistência (ex.: estágio 3 = dia ≥40 E média7d ≥60)
```

## 🚀 Rodando o projeto

```bash
npm install
cp .env.example .env   # preencha as variáveis
npm run dev
```

1. **Supabase**: crie um projeto, cole `supabase/schema.sql` no SQL Editor e execute.
   Em *Authentication → Sign In / Up*, **desative "Confirm email"** (para o demo).
   Copie a URL e a **publishable key** para o `.env`.
2. **n8n**: siga `n8n/README.md` (importar 4 workflows + 1 credencial).
3. Sem configurar nada? Clique em **"Explorar em modo demo"** — usuário semeado no dia 47 da jornada com slider de viagem no tempo. 🕐

## 🛠️ Stack

React 18 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · Zustand · Recharts · jsPDF · Supabase · n8n · Claude API (Anthropic) · Tabela TACO/UNICAMP

## 📈 Roadmap pós-hackathon

Google Fit/Apple Health (passos → missões automáticas) · scanner de refeições por foto · código de barras (OpenFoodFacts) · PIX real (Mercado Pago) · guildas e passe de temporada · **B2B corporativo** (redução de sinistralidade de planos de saúde).

---

*Feito com 💚 em 8 horas de maratona · Hackathon Órbita · 18/07/2026*
