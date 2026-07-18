import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { useGame } from '@/stores/game'
import { TopBar } from '@/components/ui'
import { Icon } from '@/components/icons'
import { ACHIEVEMENTS } from '@/data/achievements'
import { cn } from '@/lib/utils'

export default function Conquistas() {
  const conquistas = useGame((s) => s.conquistas)
  return (
    <div className="min-h-screen app-bg">
      <TopBar titulo="Sala de Conquistas" voltar />
      <div className="mx-auto max-w-lg px-4 py-4 safe-bottom">
        <div className="card text-center mb-4">
          <p className="text-3xl font-black grad-text">{conquistas.length}/{ACHIEVEMENTS.length}</p>
          <p className="text-xs font-black uppercase text-slate-400">medalhas desbloqueadas</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ACHIEVEMENTS.map((a, i) => {
            const tem = conquistas.includes(a.id)
            return (
              <motion.div
                key={a.id}
                className={cn('card !p-4 text-center', !tem && 'opacity-55')}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: tem ? 1 : 0.55, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div
                  className={cn(
                    'w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-2',
                    tem
                      ? 'bg-gradient-to-br from-amber-300 to-orange-400 text-white shadow-lg shadow-amber-300/30'
                      : 'bg-slate-200 dark:bg-white/10 text-slate-400',
                  )}
                >
                  {tem ? <Icon name={a.icone} size={26} /> : <Lock size={22} />}
                </div>
                <p className="font-black text-sm leading-tight">{a.titulo}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1">{a.desc}</p>
                <p className={cn('text-[10px] font-black mt-1', tem ? 'text-teal-500' : 'text-slate-400')}>
                  {tem ? '✓ desbloqueada' : `+${a.xp} XP`}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
