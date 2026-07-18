import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseConfigured = Boolean(url && anon && !anon.includes('COLE_AQUI'))

export const supabase: SupabaseClient | null = supabaseConfigured ? createClient(url!, anon!) : null

/** Sync fire-and-forget: nunca bloqueia a UI do jogo */
export async function syncProfile(row: Record<string, unknown>) {
  if (!supabase) return
  try {
    await supabase.from('profiles').upsert(row, { onConflict: 'id' })
  } catch (e) {
    console.warn('[sync] profiles', e)
  }
}

export async function syncCheckin(row: Record<string, unknown>) {
  if (!supabase) return
  try {
    await supabase.from('daily_checkins').upsert(row, { onConflict: 'user_id,data' })
  } catch (e) {
    console.warn('[sync] checkins', e)
  }
}

/* ---------------- Competições / desafios ---------------- */

export interface DesafioRow {
  id: string
  codigo: string
  nome: string
  tipo: 'diversao' | 'moedas' | 'pix'
  valor: number
  max_participantes: number
  dias: number
  status: 'aguardando' | 'ativo' | 'finalizado'
  criado_por: string
}

export interface ParticipanteRow {
  desafio_id: string
  user_id: string
  nome: string
  pago: boolean
  pontos: number
}

export async function criarDesafioRemoto(row: {
  codigo: string
  nome: string
  tipo: string
  valor: number
  max_participantes: number
  dias: number
  criado_por: string
}): Promise<string | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase.from('desafios').insert(row).select('id').single()
    if (error || !data) return null
    return data.id as string
  } catch (e) {
    console.warn('[sync] criar desafio', e)
    return null
  }
}

export async function buscarDesafioPorCodigo(codigo: string): Promise<DesafioRow | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase.from('desafios').select('*').eq('codigo', codigo).maybeSingle()
    if (error || !data) return null
    return data as DesafioRow
  } catch (e) {
    console.warn('[sync] buscar desafio', e)
    return null
  }
}

export async function entrarParticipanteRemoto(
  desafioId: string,
  userId: string,
  nome: string,
  pago: boolean,
): Promise<{ ok: true } | { ok: false; motivo: 'completo' | 'duplicado' | 'outro' }> {
  if (!supabase) return { ok: false, motivo: 'outro' }
  try {
    const { error } = await supabase.from('desafio_participantes').insert({ desafio_id: desafioId, user_id: userId, nome, pago })
    if (error) {
      if (error.code === '23505') return { ok: false, motivo: 'duplicado' }
      if (error.message?.includes('desafio_completo')) return { ok: false, motivo: 'completo' }
      return { ok: false, motivo: 'outro' }
    }
    return { ok: true }
  } catch (e) {
    console.warn('[sync] entrar desafio', e)
    return { ok: false, motivo: 'outro' }
  }
}

export async function fetchMeusDesafios(userId: string): Promise<{ desafio: DesafioRow; participantes: ParticipanteRow[] }[] | null> {
  if (!supabase) return null
  try {
    const { data: minhas, error } = await supabase.from('desafio_participantes').select('desafio_id').eq('user_id', userId)
    if (error || !minhas || !minhas.length) return error ? null : []
    const ids = minhas.map((m) => m.desafio_id)
    const { data: desafios, error: e2 } = await supabase.from('desafios').select('*').in('id', ids).order('criado_em', { ascending: false })
    if (e2 || !desafios) return null
    const { data: participantes, error: e3 } = await supabase.from('desafio_participantes').select('*').in('desafio_id', ids)
    if (e3 || !participantes) return null
    return desafios.map((d) => ({ desafio: d as DesafioRow, participantes: participantes.filter((p) => p.desafio_id === d.id) as ParticipanteRow[] }))
  } catch (e) {
    console.warn('[sync] listar desafios', e)
    return null
  }
}

export async function fetchLeaderboard(): Promise<{ nome: string; xp: number; nivel: number; score: number }[] | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('nome, xp, nivel, health_score')
      .order('xp', { ascending: false })
      .limit(50)
    if (error || !data) return null
    return data.map((r) => ({ nome: r.nome, xp: r.xp ?? 0, nivel: r.nivel ?? 1, score: r.health_score ?? 0 }))
  } catch {
    return null
  }
}
