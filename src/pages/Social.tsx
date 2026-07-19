import { useEffect, useState } from 'react'
import { useGame } from '@/stores/game'
import { Modal, TopBar, useToast } from '@/components/ui'
import { fetchLeaderboard, supabaseConfigured } from '@/lib/supabase'
import { levelFromXp } from '@/lib/gamification'
import { cn, codigoAmigoDe } from '@/lib/utils'

const AMIGOS_MOCK = [
  { nome: 'Marina Silva', xp: 4820, score: 82, emoji: '🏃‍♀️' },
  { nome: 'Carlos Eduardo', xp: 3910, score: 74, emoji: '🏋️' },
  { nome: 'Juliana Reis', xp: 3350, score: 88, emoji: '🧘‍♀️' },
  { nome: 'Pedro Alves', xp: 2100, score: 65, emoji: '🚴' },
  { nome: 'Fê Martins', xp: 1750, score: 71, emoji: '⚽' },
]

interface Post {
  id: string
  autor: string
  tipo: 'evolucao' | 'conquista' | 'checkin' | 'texto'
  texto: string
  likes: number
  liked: boolean
  quando: string
}

const FEED_SEED: Post[] = [
  { id: 'seed-1', autor: 'Marina Silva', tipo: 'evolucao', texto: 'evoluiu para o estágio 4 - Boa forma! 💪', likes: 24, liked: false, quando: 'hoje' },
  { id: 'seed-2', autor: 'Carlos Eduardo', tipo: 'conquista', texto: 'desbloqueou "Academia 5 dias seguidos" 🏆', likes: 15, liked: false, quando: 'hoje' },
  { id: 'seed-3', autor: 'Juliana Reis', tipo: 'checkin', texto: 'fez score 94 no check-in de hoje! 🌟', likes: 31, liked: true, quando: 'ontem' },
]

const NOVIDADES_MOCK = [
  { id: 'n1', autor: 'Marina Silva', emoji: '🦋', texto: 'evoluiu para o estágio 4 - Boa forma!', quando: 'há 2h' },
  { id: 'n2', autor: 'Carlos Eduardo', emoji: '🏆', texto: 'desbloqueou a conquista "Força total"', quando: 'há 5h' },
  { id: 'n3', autor: 'Juliana Reis', emoji: '🔥', texto: 'atingiu um streak de 30 dias!', quando: 'ontem' },
  { id: 'n4', autor: 'Pedro Alves', emoji: '⚖️', texto: 'perdeu 2kg desde o início da jornada', quando: 'ontem' },
]

const ICONE_TIPO: Record<Post['tipo'], string> = { evolucao: '🦋', conquista: '🏆', checkin: '✅', texto: '💬' }

function xpDoPeriodo(xp: number, periodo: 'semana' | 'mes' | 'geral', nome: string): number {
  if (periodo === 'geral') return xp
  const jitter = ([...nome].reduce((n, c) => n + c.charCodeAt(0), 0) % 20) / 100
  const fator = periodo === 'semana' ? 0.1 + jitter : 0.38 + jitter
  return Math.round(xp * fator)
}

export default function Social() {
  const g = useGame()
  const toast = useToast((s) => s.push)
  const [aba, setAba] = useState<'ranking' | 'feed' | 'amigos'>('ranking')
  const [ranking, setRanking] = useState<{ nome: string; xp: number; nivel: number; score: number }[] | null>(null)

  // ranking
  const [periodo, setPeriodo] = useState<'semana' | 'mes' | 'geral'>('semana')
  const [busca, setBusca] = useState('')

  // feed
  const [feedAba, setFeedAba] = useState<'posts' | 'novidades'>('posts')
  const [seedPosts, setSeedPosts] = useState<Post[]>(FEED_SEED)
  const [novoPost, setNovoPost] = useState('')
  const [comentando, setComentando] = useState<string | null>(null)
  const [textoComentario, setTextoComentario] = useState('')

  // amigos
  const [addOpen, setAddOpen] = useState(false)
  const [codigoAmigo, setCodigoAmigo] = useState('')
  const [adicionando, setAdicionando] = useState(false)

  useEffect(() => {
    fetchLeaderboard().then(setRanking)
  }, [])

  if (!g.profile) return null
  const meuNome = g.profile.nome.split(' ')[0] || 'Você'
  const meuCodigo = codigoAmigoDe(g.userId ?? 'DEMO')
  const modoDemo = !supabaseConfigured || g.userId === 'demo'
  const global = Boolean(ranking && ranking.length > 1)

  // ---- Ranking ----
  const eu = { nome: `${g.profile.nome} (você)`, xp: g.xp, nivel: levelFromXp(g.xp), score: g.scoreSaude() }
  const baseRanking = global
    ? ranking!
    : [...AMIGOS_MOCK, ...g.amigos.map((a) => ({ nome: a.nome, xp: a.xp, score: a.score }))].map((a) => ({ nome: a.nome, xp: a.xp, nivel: levelFromXp(a.xp), score: a.score }))
  const listaRanking = (global ? baseRanking : [...baseRanking, eu])
    .map((r) => ({ ...r, xpP: xpDoPeriodo(r.xp, periodo, r.nome) }))
    .filter((r) => r.nome.toLowerCase().includes(busca.trim().toLowerCase()))
    .sort((a, b) => b.xpP - a.xpP)

  const labelPeriodo = periodo === 'semana' ? 'XP da semana' : periodo === 'mes' ? 'XP do mês' : 'XP total'

  // ---- Feed ----
  const feedPosts: Post[] = [...g.feed.map((f) => ({ id: f.id, autor: f.autor, tipo: f.tipo, texto: f.texto, likes: f.likes, liked: f.liked, quando: f.quando })), ...seedPosts]

  const publicar = () => {
    if (!novoPost.trim()) return
    g.addFeed('texto', novoPost.trim())
    setNovoPost('')
    toast('📣 Publicado no seu feed!')
  }

  const curtir = (post: Post) => {
    if (g.feed.some((f) => f.id === post.id)) g.toggleLike(post.id)
    else setSeedPosts((prev) => prev.map((f) => (f.id === post.id ? { ...f, liked: !f.liked, likes: f.likes + (f.liked ? -1 : 1) } : f)))
  }

  const enviarComentario = (postId: string) => {
    if (!textoComentario.trim()) return
    g.addComentario(postId, meuNome, textoComentario.trim())
    setTextoComentario('')
    setComentando(null)
    toast('💬 Comentário publicado!')
  }

  const compartilhar = (post: Post) => {
    const texto = `${post.autor} ${post.texto} - via FitLevel`
    navigator.clipboard?.writeText(texto).catch(() => {})
    toast('↗️ Copiado! Compartilhe com quem quiser.')
  }

  // ---- Amigos ----
  const amigosLista = [...g.amigos, ...AMIGOS_MOCK.map((a, i) => ({ id: `mock-${i}`, nome: a.nome, codigo: '', emoji: a.emoji, xp: a.xp, score: a.score }))]

  const interagir = (nome: string, acao: string) => {
    const primeiro = nome.split(' ')[0]
    const msgs: Record<string, string> = {
      cutucar: `👋 Você cutucou ${primeiro}!`,
      elogiar: `👏 Você elogiou ${primeiro}!`,
      desafiar: `⚔️ Desafio enviado para ${primeiro}!`,
      torcer: `🎉 Você está torcendo por ${primeiro}!`,
    }
    toast(msgs[acao] ?? `Interação enviada para ${primeiro}`)
  }

  const adicionarAmigo = async () => {
    if (adicionando) return
    setAdicionando(true)
    const res = await g.addAmigo(codigoAmigo)
    setAdicionando(false)
    if ('erro' in res) {
      toast(res.erro, 'erro')
      return
    }
    toast(`🤝 ${res.nome} agora é seu amigo!`)
    setCodigoAmigo('')
    setAddOpen(false)
  }

  return (
    <div className="min-h-screen app-bg">
      <TopBar titulo="🏆 Social" />
      <div className="mx-auto max-w-lg px-4 py-4 safe-bottom">
        <div className="flex gap-2 mb-4">
          {([['ranking', '🏆 Ranking'], ['feed', '📣 Feed'], ['amigos', '🤝 Amigos']] as const).map(([v, l]) => (
            <button key={v} className={cn('chip flex-1 justify-center', aba === v && 'chip-active')} onClick={() => setAba(v)}>{l}</button>
          ))}
        </div>

        {/* ===================== RANKING ===================== */}
        {aba === 'ranking' && (
          <>
            <div className="flex gap-2 mb-3">
              {([['semana', 'Semanal'], ['mes', 'Mensal'], ['geral', 'Geral']] as const).map(([v, l]) => (
                <button key={v} className={cn('chip flex-1 justify-center text-xs', periodo === v && 'chip-active')} onClick={() => setPeriodo(v)}>{l}</button>
              ))}
            </div>
            <input className="input mb-3" placeholder="🔍 Buscar amigo pelo nome" value={busca} onChange={(e) => setBusca(e.target.value)} />
            <p className="text-xs font-bold text-slate-400 mb-3 px-1">
              {global ? '🌍 Ranking global em tempo real (Supabase)' : `👥 Ranking entre amigos · ${labelPeriodo}`}
            </p>
            <div className="flex flex-col gap-2">
              {listaRanking.length === 0 && <p className="text-center text-sm font-bold text-slate-400 py-6">Nenhum amigo encontrado.</p>}
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
                    <div className="text-right">
                      <p className="font-black text-violet-500">{r.xpP.toLocaleString('pt-BR')} XP</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{labelPeriodo}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            {!supabaseConfigured && (
              <p className="text-[11px] font-bold text-slate-400 text-center mt-3">Configure o Supabase para ranking global multi-usuário em tempo real.</p>
            )}
          </>
        )}

        {/* ===================== FEED ===================== */}
        {aba === 'feed' && (
          <>
            <div className="flex gap-2 mb-3">
              {([['posts', '📝 Publicações'], ['novidades', '🔔 Novidades']] as const).map(([v, l]) => (
                <button key={v} className={cn('chip flex-1 justify-center text-xs', feedAba === v && 'chip-active')} onClick={() => setFeedAba(v)}>{l}</button>
              ))}
            </div>

            {feedAba === 'posts' && (
              <div className="flex flex-col gap-2">
                {/* compositor */}
                <div className="card !p-3">
                  <textarea
                    className="input !rounded-2xl resize-none"
                    rows={2}
                    placeholder={`No que você está pensando, ${meuNome}?`}
                    value={novoPost}
                    onChange={(e) => setNovoPost(e.target.value)}
                  />
                  <button className="btn-primary w-full mt-2 !py-2" disabled={!novoPost.trim()} onClick={publicar}>Publicar</button>
                </div>

                {feedPosts.map((post) => {
                  const comentarios = g.comentarios[post.id] ?? []
                  return (
                    <div key={post.id} className="card !p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center text-lg">
                          {ICONE_TIPO[post.tipo]}
                        </div>
                        <div>
                          <p className="font-black text-sm">{post.autor}</p>
                          <p className="text-[10px] font-bold text-slate-400">{post.quando}</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm">{post.tipo === 'texto' ? post.texto : `${post.autor.split(' ')[0]} ${post.texto}`}</p>

                      <div className="flex gap-4 mt-2">
                        <button className={cn('text-xs font-black', post.liked ? 'text-red-500' : 'text-slate-400')} onClick={() => curtir(post)}>
                          {post.liked ? '❤️' : '🤍'} {post.likes}
                        </button>
                        <button className="text-xs font-black text-slate-400" onClick={() => setComentando(comentando === post.id ? null : post.id)}>💬 {comentarios.length || 'Comentar'}</button>
                        <button className="text-xs font-black text-slate-400" onClick={() => compartilhar(post)}>↗️ Compartilhar</button>
                      </div>

                      {comentarios.length > 0 && (
                        <div className="mt-2 flex flex-col gap-1 border-t border-slate-100 dark:border-white/10 pt-2">
                          {comentarios.map((c, ci) => (
                            <p key={ci} className="text-xs"><b className="font-black">{c.autor}</b> <span className="text-slate-500 dark:text-slate-300">{c.texto}</span></p>
                          ))}
                        </div>
                      )}

                      {comentando === post.id && (
                        <div className="mt-2 flex gap-2">
                          <input
                            className="input !py-2 text-sm"
                            placeholder="Escreva um comentário…"
                            value={textoComentario}
                            autoFocus
                            onChange={(e) => setTextoComentario(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && enviarComentario(post.id)}
                          />
                          <button className="btn-primary !px-4 !py-2 text-sm" disabled={!textoComentario.trim()} onClick={() => enviarComentario(post.id)}>Enviar</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {feedAba === 'novidades' && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold text-slate-400 px-1 mb-1">Conquistas e evoluções dos seus amigos 🎉</p>
                {[
                  ...g.amigos.slice(0, 4).map((a) => ({ id: a.id, autor: a.nome, emoji: a.emoji, texto: `entrou na sua rede - mande um oi! (Nível ${levelFromXp(a.xp)})`, quando: 'agora' })),
                  ...NOVIDADES_MOCK,
                ].map((n) => (
                  <div key={n.id} className="card !p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-lg shrink-0">{n.emoji}</div>
                    <div className="flex-1">
                      <p className="text-sm"><b className="font-black">{n.autor.split(' ')[0]}</b> <span className="text-slate-500 dark:text-slate-300 font-semibold">{n.texto}</span></p>
                      <p className="text-[10px] font-bold text-slate-400">{n.quando}</p>
                    </div>
                    <button className="chip text-xs" onClick={() => toast(`🎉 Você parabenizou ${n.autor.split(' ')[0]}!`)}>👏</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ===================== AMIGOS ===================== */}
        {aba === 'amigos' && (
          <div className="flex flex-col gap-2">
            <button className="btn-primary" onClick={() => setAddOpen(true)}>➕ Adicionar amigo por código</button>
            <div className="card !p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Seu código</p>
                <p className="text-emerald-500 font-black tracking-wide">{meuCodigo}</p>
              </div>
              <button
                className="chip text-xs"
                onClick={() => { navigator.clipboard?.writeText(meuCodigo); toast('Código copiado!') }}
              >📋 Copiar</button>
            </div>

            {amigosLista.map((a) => (
              <div key={a.id} className="card !p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center text-lg shrink-0">{a.emoji}</div>
                  <div className="flex-1">
                    <p className="font-black text-sm">{a.nome}</p>
                    <p className="text-[11px] font-bold text-slate-400">Nível {levelFromXp(a.xp)} · Score {a.score} · streak ativo 🔥</p>
                  </div>
                  {a.id.startsWith('mock-') ? null : (
                    <button className="text-slate-300 hover:text-red-500 text-xs font-black" onClick={() => { g.removeAmigo(a.id); toast('Amigo removido') }}>✕</button>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="chip flex-1 justify-center text-xs" onClick={() => interagir(a.nome, 'cutucar')}>👋 Cutucar</button>
                  <button className="chip flex-1 justify-center text-xs" onClick={() => interagir(a.nome, 'elogiar')}>👏 Elogiar</button>
                  <button className="chip flex-1 justify-center text-xs" onClick={() => interagir(a.nome, 'desafiar')}>⚔️ Desafiar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={addOpen} onClose={() => { setAddOpen(false); setCodigoAmigo('') }}>
        <h3 className="font-black text-lg mb-1">🤝 Adicionar amigo</h3>
        <p className="text-xs font-bold text-slate-400 mb-3">Peça o código para o seu amigo e digite abaixo.</p>
        <span className="label">Código do amigo</span>
        <input
          className="input uppercase tracking-widest font-black"
          placeholder="EX.: FL-A1B2C3"
          value={codigoAmigo}
          onChange={(e) => setCodigoAmigo(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && adicionarAmigo()}
        />
        <button className="btn-primary w-full mt-4" disabled={!codigoAmigo.trim() || adicionando} onClick={adicionarAmigo}>
          {adicionando ? 'Verificando código...' : 'Adicionar'}
        </button>
        <p className="text-center text-xs font-bold text-slate-400 mt-3">Seu código: <span className="text-emerald-500 font-black">{meuCodigo}</span></p>
        {modoDemo && (
          <p className="text-center text-[11px] font-bold text-slate-400 mt-2">
            Modo demo - códigos de teste: <span className="font-black">FL-MARINA</span>, <span className="font-black">FL-CARLOS</span>, <span className="font-black">FL-JULIA</span>
          </p>
        )}
      </Modal>
    </div>
  )
}
