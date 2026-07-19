/**
 * Camada de IA orquestrada pelo n8n - o diferencial do projeto.
 * Cada função chama um webhook; se o n8n não estiver configurado,
 * o app usa fallbacks locais (o jogo nunca quebra).
 */
const BASE = (import.meta.env.VITE_N8N_BASE_URL as string | undefined)?.replace(/\/$/, '')

export const n8nConfigured = Boolean(BASE)

async function call<T>(path: string, body: unknown, timeoutMs = 60_000): Promise<T | null> {
  if (!BASE) return null
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), timeoutMs)
    const res = await fetch(`${BASE}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
    clearTimeout(t)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch (e) {
    console.warn(`[n8n] ${path} indisponível`, e)
    return null
  }
}

/** Foto → parâmetros do avatar (Claude Vision via n8n) */
export function analisarFoto(payload: { fotoFrenteBase64: string; fotoCostasBase64?: string; sexo: string; imc: number }) {
  return call<{ skinTone: string; hair: string; hairColor: string; beard: string }>('evo-avatar-analyze', payload, 90_000)
}

/** Chat de saúde com contexto do perfil (aceita foto do prato opcional) */
export function chatSaude(payload: {
  pergunta: string
  perfil: Record<string, unknown>
  historico: { role: string; content: string }[]
  imagemBase64?: string
}) {
  return call<{ resposta: string }>('evo-health-chat', payload, 90_000)
}

/** Plano alimentar completo gerado por IA */
export function gerarPlanoAlimentar(payload: Record<string, unknown>) {
  return call<{ plano: unknown }>('evo-meal-plan', payload, 120_000)
}

/** Feedback motivacional do check-in */
export function feedbackCheckin(payload: { nome: string; score: number; streak: number; historico: number[] }) {
  return call<{ feedback: string }>('evo-daily-feedback', payload, 30_000)
}
