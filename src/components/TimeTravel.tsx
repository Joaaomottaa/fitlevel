import { useState } from 'react'
import { useGame } from '@/stores/game'

/**
 * Slider "viagem no tempo" - modo demonstração para o pitch:
 * arrasta o dia da jornada e o avatar evolui ao vivo na frente dos jurados.
 */
export function TimeTravel() {
  const dia = useGame((s) => s.diaJornada())
  const timeTravel = useGame((s) => s.timeTravel)
  const [aberto, setAberto] = useState(false)

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="fixed bottom-28 right-4 z-40 glass rounded-full px-3 py-2 text-xs font-black text-violet-500"
      >
        🕐 Demo
      </button>
    )
  }

  return (
    <div className="fixed bottom-28 inset-x-4 z-40 mx-auto max-w-lg">
      <div className="glass rounded-3xl p-4 !bg-white/90 dark:!bg-slate-900/95">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase tracking-wide text-violet-500">🕐 Máquina do tempo (demo)</span>
          <button onClick={() => setAberto(false)} className="text-xs font-black text-slate-400">✕ fechar</button>
        </div>
        <input
          type="range"
          min={1}
          max={100}
          value={dia}
          onChange={(e) => timeTravel(Number(e.target.value))}
        />
        <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
          <span>Dia 1</span>
          <span className="text-emerald-500 text-sm font-black">Dia {dia}</span>
          <span>Dia 100</span>
        </div>
      </div>
    </div>
  )
}
