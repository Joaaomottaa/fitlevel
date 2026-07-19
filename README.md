# 🧬 FitLevel - Seu avatar, sua evolução

> **Hackathon Órbita 2026 · Desafio: Saúde Gamificada**
> Programa de 100 dias onde ações reais do participante transformam a evolução do seu avatar.

O FitLevel é um app de saúde gamificada onde você não acompanha números - **você cuida de alguém: você mesmo, em forma de avatar**. Cada check-in, missão e hábito saudável gera pontos que transformam gradualmente um avatar com sobrepeso e hábitos ruins (dia 1) em um modelo saudável e ativo (dia 100).

## ✨ Funcionalidades

| Área | O que tem |
|---|---|
| 🧬 **Avatar evolutivo** | Motor SVG paramétrico com 5 morfologias corporais; IA analisa sua foto e gera o avatar; editor com 7 tons de pele, 11 penteados, 12 cores de cabelo, 6 barbas, 5 estilos de olhos, 10 roupas e 11 acessórios; humor reativo ao seu dia |
| 📋 **Onboarding inteligente** | 27 dados de saúde → cálculo automático de IMC, TMB (Mifflin-St Jeor), gasto calórico, metas de calorias/água e Score de Saúde inicial |
| ✅ **Check-in diário** | Questionário de 60s (sono, água, exercício, alimentação, humor, estresse) → score 0-100 com pesos por impacto em saúde |
| 🎯 **Missões personalizadas** | Pool de ~30 missões diárias/semanais sorteadas pelos **pontos fracos detectados no onboarding** (fumante recebe missão de cigarro, quem dorme mal recebe missões de sono...) |
| 🎮 **Gamificação completa** | XP, níveis (curva √), moedas, streak, **32 conquistas com desbloqueio automático** (postam no feed), roleta diária com 8 prêmios incluindo **item surpresa**, loja com 20 cosméticos |
| 🗺️ **Jornada de 100 dias** | **Pista 3D serpenteante** estilo trilha de jogo: 10 marcos (dia 1, 3, 1 semana, 15 dias, 1 mês, 45, 2 meses, 75, reta final e 100), avatar caminhando na posição exata do progresso, cenário com árvores/nuvens, largada e faixa de chegada quadriculada. **Cada marco alcançado é clicável** e mostra o raio-x daquele dia: peso, IMC e streak na data |
| ❤️ **Minha Saúde** | Fatores de risco com "nível de cuidado", médias semanais/mensais, gráficos de evolução e **relatório de saúde em PDF** para download |
| 📸 **Evolução** | Linha do tempo de fotos do corpo com data, peso e nota; comparação antes/depois automática (fotos ficam só no dispositivo) |
| 🥗 **Plano alimentar IA** | Gerado por IA com base TACO (alimentos brasileiros), macros, substituições e exportação em PDF |
| 🤖 **Chat IA** | Assistente de saúde com contexto do seu perfil + **envio de foto do prato** para análise, direto na barra de navegação |
| 🏆 **Social** | **Amigos por código real** (`FL-XXXXXX`, salvo no cadastro e validado no banco), interações (cutucar, elogiar, desafiar), feed com **publicações próprias, comentários e compartilhar**, aba de novidades dos amigos, ranking com **filtro semanal/mensal/geral e busca por nome** |
| ⚔️ **Competições** | Desafios por diversão, moedas ou PIX real com escrow (simulado no MVP) |
| ⭐ **Freemium** | Free: jornada completa · Premium: IA ilimitada, itens exclusivos, desafios PIX |

## 🏗️ Arquitetura

```
React SPA (Vite + TS + Tailwind + Framer Motion + Zustand + lucide-react)
   ├── Supabase  → Auth (e-mail + Google OAuth + recuperação), Postgres + RLS,
   │               ranking global e busca de amigos por código
   └── n8n 🧠    → TODA a IA em workflows visuais (webhooks):
        ├── evo-avatar-analyze   (Claude Vision: foto → parâmetros do avatar)
        ├── evo-health-chat      (assistente de saúde + foto do prato)
        ├── evo-meal-plan        (plano alimentar estruturado)
        └── evo-daily-feedback   (mensagens motivacionais do check-in)
```

**Decisões-chave:**
- **A IA devolve parâmetros, nunca imagens** → avatar anima, evolui e troca de roupa sem custo de geração.
- **Local-first** → o jogo funciona offline/sem backend; Supabase sincroniza ranking/amigos e n8n turbina com IA. O demo nunca quebra.
- **Chaves de API vivem só no n8n** → nada sensível chega ao navegador.
- **O avatar nunca regride de corpo** → vergonha desengaja, empatia retém (dias ruins deixam ele triste, não gordo de novo).
- **Código de amigo nasce com a conta** → o trigger SQL de cadastro grava `codigo_amigo` no perfil; adicionar amigo valida formato, duplicidade e existência real no banco.

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

1. **Supabase**: crie um projeto, cole `supabase/schema.sql` no SQL Editor e execute
   (o script é idempotente - pode rodar de novo em um banco já criado; ele inclui a
   migração do `codigo_amigo`).
   Em *Authentication → Sign In / Up*, **desative "Confirm email"** (para o demo).
   Copie a URL e a **publishable key** para o `.env`.
2. **n8n**: siga `n8n/README.md` (importar 4 workflows + 1 credencial).
3. Sem configurar nada? Clique em **"Entrar em modo demo"** - usuário semeado no dia 47
   da jornada, com slider de viagem no tempo 🕐 e códigos de amigo de teste
   (`FL-MARINA`, `FL-CARLOS`, `FL-JULIA`).

## 🛠️ Stack

React 18 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · Zustand · lucide-react · Recharts · jsPDF · Supabase · n8n · Claude API (Anthropic) · Tabela TACO/UNICAMP

## 📈 Roadmap pós-hackathon

Google Fit/Apple Health (passos → missões automáticas) · scanner de refeições por foto · código de barras (OpenFoodFacts) · PIX real (Mercado Pago) · guildas e passe de temporada · code-splitting do bundle · **B2B corporativo** (redução de sinistralidade de planos de saúde).

---

*Feito com 💚 em 8 horas de maratona · Hackathon Órbita · 18/07/2026*
