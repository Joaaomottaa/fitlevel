import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Bot, Eye, Gamepad2, Rocket, Trophy } from 'lucide-react'
import { AvatarEngine, DEFAULT_AVATAR } from '@/components/avatar/AvatarEngine'
import { useAuth } from '@/stores/auth'

export default function Landing() {
  const loginDemo = useAuth((s) => s.loginDemo)
  return (
    <div className="min-h-screen app-bg flex flex-col">
      <div className="mx-auto max-w-lg w-full px-6 pt-10 pb-8 flex-1 flex flex-col">
        <div className="flex items-center gap-2">
          <img src="/logo-fitlevel.svg" alt="FitLevel" className="h-9 w-auto" />
          <span className="text-2xl font-black grad-text">FitLevel</span>
        </div>

        <motion.h1
          className="text-4xl font-black leading-tight mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Suba de nível
          <br />
          <span className="grad-text">na vida real.</span>
        </motion.h1>
        <motion.p
          className="mt-3 font-semibold text-slate-500 dark:text-slate-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          100 dias de jornada onde cada hábito saudável seu transforma um avatar que é a sua cara. Literalmente.
        </motion.p>

        <motion.div
          className="card mt-8 flex items-center justify-center gap-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center">
            <AvatarEngine config={{ ...DEFAULT_AVATAR(1), humor: 'cansado' }} size={130} />
            <p className="text-xs font-black text-slate-400">Dia 1</p>
          </div>
          <ArrowRight size={26} className="text-teal-500" strokeWidth={3} />
          <div className="text-center">
            <AvatarEngine config={{ ...DEFAULT_AVATAR(5), outfit: 'treino', humor: 'energico', accessory: 'medalha' }} size={130} />
            <p className="text-xs font-black text-teal-500">Dia 100</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-2 mt-6 text-center">
          {[
            [Gamepad2, 'Gamificado', 'XP, missões e streak'],
            [Bot, 'IA de verdade', 'Avatar, dieta e chat'],
            [Trophy, 'Social', 'Ranking e desafios'],
          ].map(([I, t, d]) => {
            const IconComp = I as typeof Gamepad2
            return (
              <div key={t as string} className="card !p-3">
                <IconComp size={22} className="mx-auto text-teal-500" />
                <div className="text-xs font-black mt-1.5">{t as string}</div>
                <div className="text-[10px] font-semibold text-slate-400">{d as string}</div>
              </div>
            )
          })}
        </div>

        <div className="mt-auto pt-8 flex flex-col gap-3">
          <Link to="/cadastro" className="btn-primary w-full">
            <Rocket size={18} /> Começar minha jornada
          </Link>
          <Link to="/login" className="btn-ghost w-full">
            Já tenho conta
          </Link>
          <button onClick={loginDemo} className="text-sm font-bold text-violet-500 py-1 flex items-center justify-center gap-1.5">
            <Eye size={15} /> Explorar em modo demo
          </button>
        </div>
      </div>
    </div>
  )
}
