import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '@/stores/game'
import { Modal, TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { AvatarEngine } from '@/components/avatar/AvatarEngine'
import { STAGE_INFO, avgScore, calcStreak, stageFor } from '@/lib/gamification'
import { calcIMC, classificaIMC } from '@/lib/health'
import { TimeTravel } from '@/components/TimeTravel'
import { useAuth } from '@/stores/auth'
import { addDaysISO, cn } from '@/lib/utils'

interface Marco {
  dia: number
  titulo: string
  icone: string
  desc: string
}

const MARCOS: Marco[] = [
  { dia: 1, titulo: 'Largada', icone: 'foguete', desc: 'O ponto de partida. Todo campeão já esteve exatamente aqui.' },
  { dia: 3, titulo: 'Primeiros passos', icone: 'passos', desc: 'Os 3 primeiros dias são os mais difíceis - e você passou por eles.' },
  { dia: 7, titulo: '1 semana', icone: 'calendario', desc: 'Uma semana completa. O hábito começa a criar raiz.' },
  { dia: 15, titulo: '15 dias', icone: 'chama', desc: 'Duas semanas: seu corpo já sente a diferença.' },
  { dia: 30, titulo: '1 mês', icone: 'medalha', desc: 'Um mês inteiro! A transformação começa a ficar visível.' },
  { dia: 45, titulo: '45 dias', icone: 'musculacao', desc: 'Quase metade. A constância virou rotina.' },
  { dia: 60, titulo: '2 meses', icone: 'raio', desc: 'Dois meses. Os novos hábitos agora são o seu normal.' },
  { dia: 75, titulo: '75 dias', icone: 'estrela', desc: 'Boa forma de verdade - energia lá em cima.' },
  { dia: 90, titulo: 'Reta final', icone: 'brilho', desc: 'Faltam só 10 dias. Nada pode te parar agora.' },
  { dia: 100, titulo: 'Campeão', icone: 'trofeu', desc: 'Campeão da jornada: 100 dias que mudaram tudo!' },
]

// geometria da pista (viewBox 360 x H)
const XS = [180, 92, 268, 92, 268, 92, 268, 92, 268, 180]
const Y0 = 88
const STEP = 112
const W = 360
const H = Y0 + STEP * (MARCOS.length - 1) + 88

const PONTOS = MARCOS.map((_, i) => ({ x: XS[i], y: Y0 + i * STEP }))

const ROAD = (() => {
  let d = `M ${PONTOS[0].x} ${PONTOS[0].y}`
  for (let i = 1; i < PONTOS.length; i++) {
    const a = PONTOS[i - 1]
    const b = PONTOS[i]
    const my = (a.y + b.y) / 2
    d += ` C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`
  }
  return d
})()

// cenário: árvores, flores e nuvens ao longo da pista
const ARVORES = [
  { x: 320, y: 148, s: 1.1 }, { x: 42, y: 256, s: 0.85 }, { x: 322, y: 402, s: 0.8 },
  { x: 36, y: 520, s: 1.15 }, { x: 318, y: 664, s: 0.95 }, { x: 44, y: 822, s: 1.05 },
  { x: 320, y: 934, s: 0.8 }, { x: 48, y: 1052, s: 0.9 },
]
const FLORES = [
  { x: 72, y: 152 }, { x: 300, y: 330 }, { x: 58, y: 468 }, { x: 308, y: 582 },
  { x: 66, y: 706 }, { x: 296, y: 882 }, { x: 78, y: 1008 },
]
const NUVENS = [
  { x: 62, y: 54 }, { x: 286, y: 96 }, { x: 70, y: 560 }, { x: 292, y: 758 },
]

function estagioAlvo(dia: number): 1 | 2 | 3 | 4 | 5 {
  return dia >= 95 ? 5 : dia >= 70 ? 4 : dia >= 40 ? 3 : dia >= 15 ? 2 : 1
}

function Stat({ label, valor, extra, cor }: { label: string; valor: string; extra?: string; cor?: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-3">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-lg font-black leading-tight" style={cor ? { color: cor } : undefined}>{valor}</p>
      {extra && <p className="text-[10px] font-bold text-slate-400">{extra}</p>}
    </div>
  )
}

export default function Jornada() {
  const g = useGame()
  const mode = useAuth((s) => s.mode)
  const [sel, setSel] = useState<Marco | null>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  const dia = g.diaJornada()

  // fração percorrida da pista (0-100), interpolando entre marcos
  const prog = useMemo(() => {
    if (dia >= 100) return 100
    let i = 0
    while (i < MARCOS.length - 1 && MARCOS[i + 1].dia <= dia) i++
    const a = MARCOS[i]
    const b = MARCOS[Math.min(i + 1, MARCOS.length - 1)]
    const frac = b.dia === a.dia ? 0 : Math.max(0, Math.min(1, (dia - a.dia) / (b.dia - a.dia)))
    return ((i + frac) / (MARCOS.length - 1)) * 100
  }, [dia])

  // posição exata do avatar sobre a curva da pista
  useEffect(() => {
    const path = pathRef.current
    if (!path) return
    const pt = path.getPointAtLength((path.getTotalLength() * prog) / 100)
    setPos({ x: pt.x, y: pt.y })
  }, [prog])

  // centraliza a tela no avatar ao abrir
  useEffect(() => {
    const t = setTimeout(() => avatarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400)
    return () => clearTimeout(t)
  }, [])

  if (!g.profile || !g.avatar) return null
  const p = g.profile
  const proximo = MARCOS.find((m) => m.dia > dia)
  const media7Hoje = avgScore(g.checkins, 7, g.hoje())

  /** Peso naquele dia: usa fotos de evolução com peso como histórico real; senão interpola */
  const pesoNoDia = (diaAlvo: number): number => {
    const dataAlvo = addDaysISO(p.jornadaInicio, diaAlvo - 1)
    const registros = g.evolucaoFotos.filter((f) => f.peso && f.data <= dataAlvo)
    if (registros.length) return registros[registros.length - 1].peso!
    const frac = dia <= 1 ? 1 : Math.min(1, (diaAlvo - 1) / (dia - 1))
    return +(p.pesoInicial + (p.pesoAtual - p.pesoInicial) * frac).toFixed(1)
  }

  return (
    <div className="min-h-screen app-bg">
      <TopBar titulo="🗺️ Jornada de 100 dias" />
      <div className="mx-auto max-w-lg px-4 py-4 safe-bottom">
        {/* progresso geral */}
        <div className="card mb-4">
          <div className="flex items-end justify-between">
            <p className="font-black text-lg">
              Dia <span className="grad-text text-3xl">{dia}</span> de 100
            </p>
            <p className="text-xs font-bold text-slate-400">média 7d: {media7Hoje || '-'} pts</p>
          </div>
          <div className="h-3 rounded-full bg-slate-100 dark:bg-white/10 mt-2 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 to-sky-500"
              initial={{ width: 0 }}
              animate={{ width: `${dia}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[11px] font-bold text-slate-400 mt-2">
            {proximo
              ? `Próxima parada: ${proximo.titulo} (dia ${proximo.dia}) - faltam ${proximo.dia - dia} ${proximo.dia - dia === 1 ? 'dia' : 'dias'}`
              : 'Você completou a temporada! Uma nova jornada de 100 dias te espera.'}
          </p>
        </div>

        {/* a pista */}
        <div className="card !p-2 overflow-hidden">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-sky-100/80 via-emerald-50/70 to-teal-100/80 dark:from-[#0d1830] dark:via-[#0c1526] dark:to-[#0e1f2e]">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
              <defs>
                <linearGradient id="trilha-prog" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2dd4bf" />
                  <stop offset="1" stopColor="#0ea5e9" />
                </linearGradient>
                <filter id="trilha-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="9" />
                </filter>
                <pattern id="trilha-xadrez" width="12" height="12" patternUnits="userSpaceOnUse">
                  <rect width="12" height="12" fill="#f8fafc" />
                  <rect width="6" height="6" fill="#1e293b" />
                  <rect x="6" y="6" width="6" height="6" fill="#1e293b" />
                </pattern>
              </defs>

              {/* nuvens (claras de dia, discretas à noite) */}
              {NUVENS.map((n, i) => (
                <g key={`n${i}`} className="fill-white/90 dark:fill-white/[0.06]">
                  <ellipse cx={n.x} cy={n.y} rx={22} ry={10} />
                  <ellipse cx={n.x + 16} cy={n.y + 4} rx={15} ry={8} />
                  <ellipse cx={n.x - 16} cy={n.y + 4} rx={13} ry={7} />
                </g>
              ))}
              {/* estrelas só no tema escuro */}
              {[[30, 30], [120, 18], [230, 40], [330, 22], [200, 500], [40, 640], [310, 540], [150, 1120]].map(([sx, sy], i) => (
                <circle key={`s${i}`} cx={sx} cy={sy} r={1.6} className="fill-transparent dark:fill-white/50" />
              ))}

              {/* árvores */}
              {ARVORES.map((a, i) => (
                <g key={`a${i}`} transform={`translate(${a.x} ${a.y}) scale(${a.s})`}>
                  <ellipse cx="0" cy="20" rx="16" ry="4" className="fill-black/10 dark:fill-black/40" />
                  <rect x="-2.5" y="2" width="5" height="17" rx="2" className="fill-amber-700/70 dark:fill-amber-900/80" />
                  <circle cx="0" cy="-9" r="15" className="fill-emerald-400/80 dark:fill-emerald-800/90" />
                  <circle cx="-11" cy="-1" r="10" className="fill-emerald-300/80 dark:fill-emerald-900/90" />
                  <circle cx="11" cy="-1" r="10" className="fill-teal-300/80 dark:fill-teal-900/90" />
                  <circle cx="-4" cy="-14" r="3" className="fill-white/30 dark:fill-white/5" />
                </g>
              ))}

              {/* flores */}
              {FLORES.map((f, i) => (
                <g key={`f${i}`} transform={`translate(${f.x} ${f.y})`}>
                  {[0, 60, 120, 180, 240, 300].map((ang) => (
                    <circle
                      key={ang}
                      cx={Math.cos((ang * Math.PI) / 180) * 3.4}
                      cy={Math.sin((ang * Math.PI) / 180) * 3.4}
                      r={2.4}
                      className={i % 2 ? 'fill-pink-300/90 dark:fill-pink-400/40' : 'fill-amber-300/90 dark:fill-amber-400/40'}
                    />
                  ))}
                  <circle r={2.2} className="fill-white/90 dark:fill-white/40" />
                </g>
              ))}

              {/* profundidade (3D): a mesma pista deslocada para baixo */}
              <path d={ROAD} fill="none" strokeWidth={56} strokeLinecap="round" transform="translate(0 9)" className="stroke-slate-400/40 dark:stroke-black/70" />
              {/* borda da pista */}
              <path d={ROAD} fill="none" strokeWidth={56} strokeLinecap="round" className="stroke-slate-200 dark:stroke-slate-700" />
              {/* asfalto */}
              <path d={ROAD} fill="none" strokeWidth={46} strokeLinecap="round" className="stroke-white dark:stroke-slate-800" />
              {/* brilho neon do trecho percorrido */}
              <motion.path
                d={ROAD}
                fill="none"
                strokeWidth={52}
                strokeLinecap="round"
                stroke="url(#trilha-prog)"
                pathLength={100}
                strokeDasharray="100"
                initial={false}
                animate={{ strokeDashoffset: 100 - prog }}
                transition={{ duration: 0.9, ease: 'easeInOut' }}
                opacity={0.45}
                filter="url(#trilha-glow)"
              />
              {/* trecho percorrido */}
              <motion.path
                ref={pathRef}
                d={ROAD}
                fill="none"
                strokeWidth={46}
                strokeLinecap="round"
                stroke="url(#trilha-prog)"
                pathLength={100}
                strokeDasharray="100"
                initial={false}
                animate={{ strokeDashoffset: 100 - prog }}
                transition={{ duration: 0.9, ease: 'easeInOut' }}
                opacity={0.95}
              />
              {/* faixa central tracejada */}
              <path d={ROAD} fill="none" strokeWidth={3.5} strokeLinecap="round" strokeDasharray="10 14" className="stroke-white/90 dark:stroke-white/25" />

              {/* bandeirinha da largada */}
              <g transform={`translate(${PONTOS[0].x + 52} ${PONTOS[0].y - 40})`}>
                <rect x="0" y="0" width="3.5" height="44" rx="1.5" className="fill-slate-400 dark:fill-slate-500" />
                <path d="M 3.5 2 L 34 9 L 3.5 17 Z" fill="url(#trilha-xadrez)" stroke="#94a3b8" strokeWidth="1" />
              </g>

              {/* faixa de chegada */}
              <g>
                <rect x={PONTOS[9].x - 62} y={PONTOS[9].y - 56} width="5" height="52" rx="2" className="fill-slate-400 dark:fill-slate-500" />
                <rect x={PONTOS[9].x + 57} y={PONTOS[9].y - 56} width="5" height="52" rx="2" className="fill-slate-400 dark:fill-slate-500" />
                <rect x={PONTOS[9].x - 62} y={PONTOS[9].y - 56} width="124" height="16" rx="3" fill="url(#trilha-xadrez)" stroke="#94a3b8" strokeWidth="1" />
              </g>

              {/* sombra 3D sob cada marco */}
              {PONTOS.map((pt, i) => (
                <ellipse key={i} cx={pt.x} cy={pt.y + 27} rx={25} ry={6} className="fill-black/10 dark:fill-black/40" />
              ))}
            </svg>

            {/* marcos clicáveis */}
            {MARCOS.map((m, i) => {
              const done = dia >= m.dia
              const atual = done && (MARCOS[i + 1]?.dia ?? 101) > dia
              return (
                <button
                  key={m.dia}
                  onClick={() => setSel(m)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
                  style={{ left: `${(PONTOS[i].x / W) * 100}%`, top: `${(PONTOS[i].y / H) * 100}%` }}
                  aria-label={`Dia ${m.dia}: ${m.titulo}`}
                >
                  {atual && <span className="absolute -inset-1.5 rounded-full bg-violet-400/30 animate-ping" />}
                  <span
                    className={cn(
                      'relative flex items-center justify-center rounded-full border-4 shadow-lg transition-transform group-hover:scale-110 group-active:scale-90 overflow-hidden',
                      done
                        ? 'w-14 h-14 border-white/80 dark:border-white/20 bg-gradient-to-br from-teal-400 to-sky-500 text-white shadow-sky-500/40'
                        : 'w-12 h-12 border-white/70 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600',
                    )}
                  >
                    {/* reflexo glossy */}
                    <span className="absolute inset-x-1.5 top-1 h-[42%] rounded-full bg-white/35 dark:bg-white/20 blur-[1.5px] pointer-events-none" />
                    <Icon name={done ? m.icone : 'cadeado'} size={done ? 22 : 17} />
                  </span>
                  <span
                    className={cn(
                      'absolute left-1/2 -translate-x-1/2 top-full mt-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-black glass',
                      done ? 'text-teal-600 dark:text-teal-300' : 'text-slate-400',
                    )}
                  >
                    Dia {m.dia} · {m.titulo}
                  </span>
                </button>
              )
            })}

            {/* avatar caminhando na pista */}
            {pos && (
              <motion.div
                className="absolute z-20 pointer-events-none"
                initial={false}
                animate={{ left: `${(pos.x / W) * 100}%`, top: `${(pos.y / H) * 100}%` }}
                transition={{ type: 'spring', stiffness: 55, damping: 16 }}
              >
                <div ref={avatarRef} className="-translate-x-1/2 -translate-y-[88%]">
                  <AvatarEngine config={{ ...g.avatar, estagio: g.estagioAtual() }} size={78} />
                  <span className="block mx-auto -mt-3 h-2 w-12 rounded-full bg-black/25 blur-[2px]" />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="card mt-4 text-center">
          <p className="text-sm font-bold text-slate-400">
            Toque em um marco alcançado para rever sua evolução naquele dia. Ao completar os 100 dias, uma nova temporada começa! 🔄
          </p>
        </div>
      </div>

      {/* raio-x do marco */}
      <Modal open={Boolean(sel)} onClose={() => setSel(null)}>
        {sel && (() => {
          const alcancado = dia >= sel.dia
          const dataISO = addDaysISO(p.jornadaInicio, sel.dia - 1)
          const dataFmt = new Date(dataISO + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

          if (!alcancado) {
            return (
              <div className="text-center">
                <div className="w-14 h-14 mx-auto rounded-3xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 mb-3">
                  <Icon name="cadeado" size={26} />
                </div>
                <h3 className="font-black text-lg">Dia {sel.dia} · {sel.titulo}</h3>
                <p className="text-sm font-bold text-slate-400 mt-1">{sel.desc}</p>
                <div className="mx-auto my-3 w-fit grayscale opacity-60">
                  <AvatarEngine config={{ ...g.avatar!, estagio: estagioAlvo(sel.dia), humor: 'neutro' }} size={110} animado={false} />
                </div>
                <p className="text-sm font-black text-violet-500">
                  Faltam {sel.dia - dia} {sel.dia - dia === 1 ? 'dia' : 'dias'} para chegar aqui. Continue!
                </p>
              </div>
            )
          }

          const media7 = avgScore(g.checkins, 7, dataISO)
          const est = stageFor(sel.dia, media7)
          const peso = pesoNoDia(sel.dia)
          const imc = calcIMC(peso, p.alturaCm)
          const imcInfo = classificaIMC(imc)
          const streakDia = calcStreak(g.checkins, dataISO)
          const delta = +(p.pesoInicial - peso).toFixed(1)
          const atual = (MARCOS[MARCOS.indexOf(sel) + 1]?.dia ?? 101) > dia

          return (
            <div>
              <div className="flex items-center gap-3">
                <div className="shrink-0 rounded-3xl bg-gradient-to-b from-cyan-400/15 to-emerald-400/10 p-1">
                  <AvatarEngine config={{ ...g.avatar!, estagio: est, humor: 'feliz' }} size={104} animado={false} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{dataFmt} · Dia {sel.dia} de 100</p>
                  <h3 className="font-black text-lg leading-tight">{sel.titulo}</h3>
                  <p className="text-[11px] font-black grad-text">Estágio {est} - {STAGE_INFO[est].nome}</p>
                  {atual && <p className="text-[11px] font-black text-violet-500 mt-0.5">📍 Você está aqui</p>}
                </div>
              </div>

              <p className="text-xs font-bold text-slate-400 mt-2">{sel.desc}</p>

              <div className="grid grid-cols-3 gap-2 mt-3">
                <Stat
                  label="Peso"
                  valor={`${peso.toFixed(1)} kg`}
                  extra={delta > 0 ? `-${delta.toFixed(1)} kg` : 'partida'}
                />
                <Stat label="IMC" valor={String(imc)} extra={imcInfo.rotulo} cor={imcInfo.cor} />
                <Stat label="Streak" valor={String(streakDia)} extra={streakDia === 1 ? 'dia' : 'dias'} />
              </div>

              <button className="btn-primary w-full mt-4" onClick={() => setSel(null)}>Fechar</button>
            </div>
          )
        })()}
      </Modal>

      {mode === 'demo' && <TimeTravel />}
    </div>
  )
}
