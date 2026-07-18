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
