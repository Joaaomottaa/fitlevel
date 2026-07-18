import { motion } from 'framer-motion'
import { useGame } from '@/stores/game'
import { TopBar } from '@/components/ui'
import { AvatarEngine } from '@/components/avatar/AvatarEngine'
import { STAGE_INFO, avgScore } from '@/lib/gamification'
import { TimeTravel } from '@/components/TimeTravel'
import { useAuth } from '@/stores/auth'
import { cn } from '@/lib/utils'

const MARCOS = [
  { dia: 1, estagio: 1, desc: 'Sobrepeso · colesterol alto · hábitos ruins. O ponto de partida.' },
  { dia: 25, estagio: 2, desc: 'Começando mudanças. A postura melhora, a energia aparece.' },
  { dia: 50, estagio: 3, desc: 'Avatar em transformação. Novos hábitos sendo consolidados.' },
  { dia: 75, estagio: 4, desc: 'Boa forma e mais energia. Você virou exemplo.' },
  { dia: 100, estagio: 5, desc: 'Modelo saudável. Conquista celebrada — campeão da jornada! 🏆' },
]

export default function Jornada() {
  const g = useGame()
  const mode = useAuth((s) => s.mode)
  if (!g.profile || !g.avatar) return null
  const dia = g.diaJornada()
  const media7 = avgScore(g.checkins, 7, g.hoje())

  return (
    <div className="min-h-screen app-bg">
      <TopBar titulo="🗺️ Jornada de 100 dias" />
      <div className="mx-auto max-w-lg px-4 py-4 safe-bottom">
        <div className="card text-center mb-4">
          <p className="font-black text-lg">
            Dia <span className="grad-text text-3xl">{dia}</span> de 100
          </p>
          <p className="text-sm font-bold text-slate-400">Média dos últimos 7 dias: {media7 || '—'} pts</p>
        </div>

        <div className="relative pl-8">
          {/* linha vertical */}
          <div className="absolute left-[30px] top-4 bottom-4 w-1.5 rounded-full bg-slate-200 dark:bg-white/10" />
          <motion.div
            className="absolute left-[30px] top-4 w-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-cyan-500"
            initial={{ height: 0 }}
            animate={{ height: `${Math.min(dia, 100)}%` }}
            style={{ maxHeight: 'calc(100% - 2rem)' }}
          />
          <div className="flex flex-col gap-4">
            {MARCOS.map((m) => {
              const alcancado = dia >= m.dia
              const atual = dia >= m.dia && (MARCOS.find((x) => x.dia > m.dia)?.dia ?? 101) > dia
              return (
                <motion.div
                  key={m.dia}
                  className={cn('card relative flex gap-3 items-center', atual && 'ring-2 ring-emerald-400', !alcancado && 'opacity-60')}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: alcancado ? 1 : 0.55, x: 0 }}
                >
                  <div className={cn(
                    'absolute -left-[26px] w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center text-[10px]',
                    alcancado ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700',
                  )}>
                    {alcancado && '✓'}
                  </div>
                  <div className={cn(!alcancado && 'grayscale opacity-70')}>
                    <AvatarEngine
                      config={{ ...g.avatar!, estagio: m.estagio as 1 | 2 | 3 | 4 | 5, humor: alcancado ? 'feliz' : 'neutro' }}
                      size={86}
                      animado={atual}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Dia {m.dia}</p>
                    <p className="font-black grad-text">{STAGE_INFO[m.estagio].nome}</p>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{m.desc}</p>
                    {atual && <p className="text-[11px] font-black text-emerald-500 mt-1">📍 Você está aqui</p>}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="card mt-4 text-center">
          <p className="text-sm font-bold text-slate-400">
            Ao completar os 100 dias, uma nova temporada começa com metas renovadas. A jornada nunca para! 🔄
          </p>
        </div>
      </div>
      {mode === 'demo' && <TimeTravel />}
    </div>
  )
}
