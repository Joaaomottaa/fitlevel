import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { useGame } from '@/stores/game'
import { TopBar, useToast } from '@/components/ui'
import { Icon } from '@/components/icons'
import { CATEGORIA_LABEL, MISSIONS, categoriasFracas, missoesDaSemana, missoesDoDia } from '@/data/missions'
import { ACHIEVEMENTS } from '@/data/achievements'
import { celebrar } from '@/components/avatar/EvolutionModal'
import { cn } from '@/lib/utils'
import type { Mission } from '@/types'

export default function Missoes() {
  const g = useGame()
  const toast = useToast((s) => s.push)
  const [aba, setAba] = useState<'hoje' | 'semanais' | 'todas'>('hoje')
  if (!g.profile) return null

  const hoje = g.hoje()
  const feitas = g.missoesFeitas[hoje] ?? []
  const feitasSemana = Object.entries(g.missoesFeitas)
    .filter(([d]) => d > new Date(new Date(hoje).getTime() - 7 * 86400000).toISOString().slice(0, 10))
    .flatMap(([, ids]) => ids)

  const fracas = categoriasFracas(g.profile)
  const doDia = missoesDoDia(hoje, g.profile)
  const semanais = missoesDaSemana(g.profile)
  const lista = aba === 'hoje' ? doDia : aba === 'semanais' ? semanais : MISSIONS.filter((m) => m.freq === 'diaria')

  const concluidasHoje = doDia.filter((m) => feitas.includes(m.id)).length
  const xpDisponivel = doDia.filter((m) => !feitas.includes(m.id)).reduce((s, m) => s + m.xp, 0)

  const concluir = (m: Mission) => {
    const novas = g.completeMission(m.id, m.xp, m.moedas, m.titulo)
    toast(`+${m.xp} XP · +${m.moedas} moedas`)
    if (novas.length) {
      celebrar()
      novas.forEach((id) => toast(`Conquista: ${ACHIEVEMENTS.find((a) => a.id === id)?.titulo}! 🏆`))
    }
  }

  return (
    <div className="min-h-screen app-bg">
      <TopBar titulo="Missões" voltar />
      <div className="mx-auto max-w-lg px-4 py-4 safe-bottom">
        {/* progresso do dia */}
        <div className="card mb-4 !p-4 bg-gradient-to-r from-teal-400/10 to-sky-400/10">
          <div className="flex items-center justify-between mb-2">
            <p className="font-black">Progresso de hoje</p>
            <p className="text-sm font-black text-teal-500">{concluidasHoje}/{doDia.length}</p>
          </div>
          <div className="h-3 rounded-full bg-white/70 dark:bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 to-sky-500"
              animate={{ width: `${(concluidasHoje / Math.max(doDia.length, 1)) * 100}%` }}
            />
          </div>
          <p className="text-[11px] font-bold text-slate-400 mt-2">
            {xpDisponivel > 0 ? `Ainda dá para ganhar +${xpDisponivel} XP hoje` : 'Todas as missões do dia concluídas! 🎉'}
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          {([['hoje', 'Do dia'], ['semanais', 'Semanais'], ['todas', 'Todas']] as const).map(([v, l]) => (
            <button key={v} className={cn('chip flex-1 justify-center', aba === v && 'chip-active')} onClick={() => setAba(v)}>{l}</button>
          ))}
        </div>

        {aba === 'hoje' && (
          <div className="card !p-3 mb-3 flex items-start gap-2">
            <Sparkles size={18} className="text-violet-400 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Missões geradas a partir do seu perfil - seus focos são{' '}
              {fracas.slice(0, 3).map((f, i) => (
                <span key={f}>
                  {i > 0 && (i === Math.min(fracas.length, 3) - 1 ? ' e ' : ', ')}
                  <b className="text-teal-500">{CATEGORIA_LABEL[f]}</b>
                </span>
              ))}
              .
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {lista.map((m) => {
            const feita = m.freq === 'semanal' ? feitasSemana.includes(m.id) : feitas.includes(m.id)
            const prioridade = fracas.slice(0, 3).includes(m.categoria)
            return (
              <div key={m.id} className={cn('card flex items-center gap-3', feita && 'opacity-60')}>
                <div className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0',
                  feita ? 'bg-teal-500 text-white' : 'bg-gradient-to-br from-teal-400/15 to-sky-400/15 text-teal-600 dark:text-teal-400',
                )}>
                  {feita ? <Check size={22} strokeWidth={3} /> : <Icon name={m.icone} size={22} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className={cn('font-black text-sm', feita && 'line-through')}>{m.titulo}</p>
                    {prioridade && !feita && aba !== 'semanais' && (
                      <span className="text-[9px] font-black uppercase bg-violet-400/15 text-violet-500 px-1.5 py-0.5 rounded-full">seu foco</span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-slate-400">{m.desc}</p>
                  <p className="text-[11px] font-black text-violet-500 mt-0.5">+{m.xp} XP · +{m.moedas} moedas {m.freq === 'semanal' && '· semanal'}</p>
                </div>
                {!feita && (
                  <button className="btn-primary !py-2 !px-4 text-xs" onClick={() => concluir(m)}>
                    Concluir
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
