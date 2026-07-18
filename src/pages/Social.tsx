import { useEffect, useState } from 'react'
import { useGame } from '@/stores/game'
import { TopBar } from '@/components/ui'
import { fetchLeaderboard, supabaseConfigured } from '@/lib/supabase'
import { levelFromXp } from '@/lib/gamification'
import { cn } from '@/lib/utils'
import type { FeedPost } from '@/types'
import { uid } from '@/lib/utils'

const AMIGOS_MOCK = [
  { nome: 'Marina Silva', xp: 4820, score: 82, emoji: '🏃‍♀️' },
  { nome: 'Carlos Eduardo', xp: 3910, score: 74, emoji: '🏋️' },
  { nome: 'Juliana Reis', xp: 3350, score: 88, emoji: '🧘‍♀️' },
  { nome: 'Pedro Alves', xp: 2100, score: 65, emoji: '🚴' },
  { nome: 'Fê Martins', xp: 1750, score: 71, emoji: '⚽' },
]

const FEED_MOCK: FeedPost[] = [
  { id: uid(), autor: 'Marina Silva', tipo: 'evolucao', texto: 'evoluiu para o estágio 4 — Boa forma! 💪', likes: 24, liked: false, quando: 'hoje' },
  { id: uid(), autor: 'Carlos Eduardo', tipo: 'conquista', texto: 'desbloqueou "Academia 5 dias seguidos" 🏆', likes: 15, liked: false, quando: 'hoje' },
  { id: uid(), autor: 'Juliana Reis', tipo: 'checkin', texto: 'fez score 94 no check-in de hoje! 🌟', likes: 31, liked: true, quando: 'ontem' },
]

export default function Social() {
  const g = useGame()
  const [aba, setAba] = useState<'ranking' | 'feed' | 'amigos'>('ranking')
  const [ranking, setRanking] = useState<{ nome: string; xp: number; nivel: number; score: number }[] | null>(null)
  const [feedMock, setFeedMock] = useState(FEED_MOCK)

  useEffect(() => {
    fetchLeaderboard().then(setRanking)
  }, [])

  if (!g.profile) return null

  const eu = { nome: `${g.profile.nome} (você)`, xp: g.xp, nivel: levelFromXp(g.xp), score: g.scoreSaude() }
  const listaRanking = (ranking && ranking.length > 1 ? ranking : [...AMIGOS_MOCK.map((a) => ({ nome: a.nome, xp: a.xp, nivel: levelFromXp(a.xp), score: a.score })), eu])
    .sort((a, b) => b.xp - a.xp)

  return (
    <div className="min-h-screen app-bg">
      <TopBar titulo="🏆 Social" />
      <div className="mx-auto max-w-lg px-4 py-4 safe-bottom">
        <div className="flex gap-2 mb-4">
          {([['ranking', '🏆 Ranking'], ['feed', '📣 Feed'], ['amigos', '🤝 Amigos']] as const).map(([v, l]) => (
            <button key={v} className={cn('chip flex-1 justify-center', aba === v && 'chip-active')} onClick={() => setAba(v)}>{l}</button>
          ))}
        </div>

        {aba === 'ranking' && (
          <>
            <p className="text-xs font-bold text-slate-400 mb-3 px-1">
              {ranking && ranking.length > 1 ? '🌍 Ranking global em tempo real (Supabase)' : '👥 Ranking entre amigos — o XP da semana reseta toda segunda!'}
            </p>
            <div className="flex flex-col gap-2">
              {listaRanking.map((r, i) => {
                const isEu = r.nome.includes('(você)')
                return (
                  <div key={r.nome + i} className={cn('card flex items-center gap-3 !p-3', isEu && 'ring-2 ring-emerald-400')}>
                    <div className={cn(
                      'w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white shrink-0',
                      i === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-600' : i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' : i === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-700' : 'bg-slate-400 dark:bg-slate-600',
                    )}>
                      {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-sm">{r.nome}</p>
                      <p className="text-[11px] font-bold text-slate-400">Nível {r.nivel} · Score {r.score}</p>
                    </div>
                    <p className="font-black text-violet-500">{r.xp.toLocaleString('pt-BR')} XP</p>
                  </div>
                )
              })}
            </div>
            {!supabaseConfigured && (
              <p className="text-[11px] font-bold text-slate-400 text-center mt-3">Configure o Supabase para ranking global multi-usuário em tempo real.</p>
            )}
          </>
        )}

        {aba === 'feed' && (
          <div className="flex flex-col gap-2">
            {[...g.feed, ...feedMock].map((post) => (
              <div key={post.id} className="card !p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center text-lg">
                    {post.tipo === 'evolucao' ? '🦋' : post.tipo === 'conquista' ? '🏆' : '✅'}
                  </div>
                  <div>
                    <p className="font-black text-sm">{post.autor}</p>
                    <p className="text-[10px] font-bold text-slate-400">{post.quando}</p>
                  </div>
                </div>
                <p className="font-bold text-sm">{post.autor.split(' ')[0]} {post.texto}</p>
                <div className="flex gap-4 mt-2">
                  <button
                    className={cn('text-xs font-black', post.liked ? 'text-red-500' : 'text-slate-400')}
                    onClick={() => {
                      if (g.feed.some((f) => f.id === post.id)) g.toggleLike(post.id)
                      else setFeedMock((prev) => prev.map((f) => f.id === post.id ? { ...f, liked: !f.liked, likes: f.likes + (f.liked ? -1 : 1) } : f))
                    }}
                  >
                    {post.liked ? '❤️' : '🤍'} {post.likes}
                  </button>
                  <button className="text-xs font-black text-slate-400">💬 Comentar</button>
                  <button className="text-xs font-black text-slate-400">↗️ Compartilhar</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {aba === 'amigos' && (
          <div className="flex flex-col gap-2">
            <button className="btn-primary">➕ Adicionar amigo por código</button>
            <p className="text-center text-xs font-bold text-slate-400 my-1">Seu código: <span className="text-emerald-500 font-black">EVO-{(g.userId ?? 'DEMO').slice(0, 6).toUpperCase()}</span></p>
            {AMIGOS_MOCK.map((a) => (
              <div key={a.nome} className="card flex items-center gap-3 !p-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-lg">{a.emoji}</div>
                <div className="flex-1">
                  <p className="font-black text-sm">{a.nome}</p>
                  <p className="text-[11px] font-bold text-slate-400">Nível {levelFromXp(a.xp)} · streak ativo 🔥</p>
                </div>
                <button className="chip text-xs">👋 Cutucar</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
