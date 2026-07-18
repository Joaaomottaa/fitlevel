import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'
import { Modal } from '@/components/ui'
import { AvatarEngine } from './AvatarEngine'
import { STAGE_INFO } from '@/lib/gamification'
import { useGame } from '@/stores/game'

export function celebrar() {
  confetti({ particleCount: 140, spread: 75, origin: { y: 0.6 }, colors: ['#10b981', '#06b6d4', '#8b5cf6', '#fbbf24'] })
  setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0 } }), 250)
  setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1 } }), 400)
}

export function EvolutionModal({ open, onClose, estagio }: { open: boolean; onClose: () => void; estagio: number }) {
  const avatar = useGame((s) => s.avatar)
  const info = STAGE_INFO[estagio]

  useEffect(() => {
    if (open) celebrar()
  }, [open])

  if (!avatar) return null
  return (
    <Modal open={open} onClose={onClose}>
      <div className="text-center">
        <motion.p
          className="text-xs font-black uppercase tracking-widest text-amber-500"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ⭐ Evolução desbloqueada ⭐
        </motion.p>
        <motion.h2
          className="text-3xl font-black grad-text mt-1"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.15 }}
        >
          {info?.nome}
        </motion.h2>
        <motion.div
          initial={{ scale: 0.5, rotate: -6, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.3, stiffness: 120 }}
          className="my-2 flex justify-center"
        >
          <AvatarEngine config={{ ...avatar, estagio: estagio as 1 | 2 | 3 | 4 | 5, humor: 'energico' }} size={200} />
        </motion.div>
        <p className="font-bold text-slate-500 dark:text-slate-300">{info?.desc}</p>
        <p className="text-sm font-semibold text-slate-400 mt-2">Seu avatar mudou porque VOCÊ mudou. 💚</p>
        <button className="btn-primary w-full mt-5" onClick={onClose}>
          Continuar a jornada
        </button>
      </div>
    </Modal>
  )
}
