# n8n — Cérebro de IA do EVO 🧠

Toda a inteligência artificial do app roda em workflows do n8n. O frontend chama
webhooks; se o n8n estiver offline, o app usa fallbacks locais (nunca quebra).

## Importar os workflows (2 min)

1. No n8n: **menu ⋯ → Import from File** → importe os 4 JSONs desta pasta.
2. Crie UMA credencial do tipo **Header Auth**:
   - Name: `Anthropic x-api-key`
   - Header Name: `x-api-key`
   - Header Value: `sua chave da Anthropic (sk-ant-...)`
3. Abra cada workflow, clique no nó **Claude API** e selecione essa credencial.
4. **Ative** os 4 workflows (toggle no topo).

## Conectar o frontend

No `.env` do projeto: 

```
VITE_N8N_BASE_URL=https://SEU-N8N/webhook
```

(a URL base dos webhooks de produção — os paths `evo-*` já estão nos workflows)

## Endpoints

| Workflow | Path | Entrada | Saída |
|---|---|---|---|
| Health Chat | `POST /webhook/evo-health-chat` | `{pergunta, perfil, historico}` | `{resposta}` |
| Feedback Check-in | `POST /webhook/evo-daily-feedback` | `{nome, score, streak, historico}` | `{feedback}` |
| Plano Alimentar | `POST /webhook/evo-meal-plan` | `{perfil, gosta, naoGosta, refeicoesDia}` | `{plano}` |
| Avatar Vision | `POST /webhook/evo-avatar-analyze` | `{fotoFrenteBase64, sexo, imc}` | `{skinTone, hair, hairColor, beard}` |

## Segurança

- A chave da Anthropic **nunca** chega ao navegador — vive só na credencial do n8n.
- A `sb_secret_...` do Supabase (se usar nós de banco) também fica só aqui.
- CORS: os webhooks respondem com `Access-Control-Allow-Origin: *` para o demo;
  em produção, restrinja ao domínio do app.

## Ideia extra (se sobrar tempo no hackathon)

5º workflow "engagement-cron": Schedule diário → busca no Supabase usuários sem
check-in há 2+ dias → Claude gera mensagem de resgate personalizada → envia por
e-mail/Telegram. Previsão de churn virando ação automática — ótimo pro pitch.
