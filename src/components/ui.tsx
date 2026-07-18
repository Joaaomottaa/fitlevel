import { create } from 'zustand'
import { AnimatePresence, motion } from 'framer-motion'
import { NavLink, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Bot, ChevronLeft, ClipboardCheck, Coins, Flame, House, LayoutGrid, Map } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGame } from '@/stores/game'
import { levelProgress } from '@/lib/gamification'

/* ---------------- Toast ---------------- */

interface ToastState {
  msgs: { id: number; texto: string; tipo: 'ok' | 'erro' | 'info' }[]
  push: (texto: string, tipo?: 'ok' | 'erro' | 'info') => void
}

export const useToast = create<ToastState>((set, get) => ({
  msgs: [],
  push: (texto, tipo = 'ok') => {
    const id = Date.now() + Math.random()
    set({ msgs: [...get().msgs, { id, texto, tipo }] })
    setTimeout(() => set({ msgs: get().msgs.filter((m) => m.id !== id) }), 3500)
  },
}))

export function Toaster() {
  const msgs = useToast((s) => s.msgs)
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[92%] max-w-sm pointer-events-none">
      <AnimatePresence>
        {msgs.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'glass rounded-2xl px-4 py-3 text-sm font-bold text-center',
              m.tipo === 'erro' && 'border-red-400/50 text-red-500',
              m.tipo === 'ok' && 'border-teal-400/50',
            )}
          >
            {m.texto}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ---------------- Anel de progresso ---------------- */

export function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  label,
  sublabel,
  color = 'url(#gradRing)',
}: {
  value: number
  size?: number
  stroke?: number
  label?: string
  sublabel?: string
  color?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const off = c - (Math.min(value, 100) / 100) * c
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="gradRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-slate-200 dark:stroke-white/10" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: off }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black">{label ?? `${value}`}</span>
        {sublabel && <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{sublabel}</span>}
      </div>
    </div>
  )
}

/* ---------------- Barra de XP ---------------- */

export function XPBar() {
  const xp = useGame((s) => s.xp)
  const { level, pct, toNext } = levelProgress(xp)
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-400 to-fuchsia-400 text-white font-black shadow-lg shadow-violet-400/25 shrink-0">
        {level}
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mb-1">
          <span>Nível {level}</span>
          <span>{toNext} XP p/ nível {level + 1}</span>
        </div>
        <div className="h-2.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>
    </div>
  )
}

/* ---------------- Badges pequenos ---------------- */

export function StreakFlame() {
  const streak = useGame((s) => s.streak())
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1.5 font-black text-orange-500">
      <Flame size={16} className={cn(streak > 0 && 'animate-pulse')} fill="currentColor" />
      <span>{streak}</span>
    </div>
  )
}

export function CoinBadge() {
  const moedas = useGame((s) => s.moedas)
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3 py-1.5 font-black text-amber-500">
      <Coins size={16} />
      <span>{moedas}</span>
    </div>
  )
}

/* ---------------- Modal ---------------- */

export function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6 !bg-white/95 dark:!bg-slate-900/95"
            initial={{ y: 60, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ---------------- Navegação ---------------- */

const NAV = [
  { to: '/home', icone: House, rotulo: 'Home' },
  { to: '/jornada', icone: Map, rotulo: 'Jornada' },
  { to: '/checkin', icone: ClipboardCheck, rotulo: 'Check-in', destaque: true },
  { to: '/chat', icone: Bot, rotulo: 'Chat IA' },
  { to: '/menu', icone: LayoutGrid, rotulo: 'Mais' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-lg px-4 pb-3">
        <div className="glass rounded-3xl flex items-center justify-around py-2 px-2 !shadow-xl">
          {NAV.map((n) => {
            const I = n.icone
            return n.destaque ? (
              <NavLink key={n.to} to={n.to} className="relative -mt-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-sky-500 shadow-xl shadow-sky-400/35 flex items-center justify-center text-white border-4 border-white dark:border-slate-900 active:scale-90 transition-transform">
                  <I size={26} strokeWidth={2.4} />
                </div>
              </NavLink>
            ) : (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl text-[10px] font-extrabold transition-colors',
                    isActive ? 'text-teal-500' : 'text-slate-400 dark:text-slate-500',
                  )
                }
              >
                <I size={22} strokeWidth={2.4} />
                {n.rotulo}
              </NavLink>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export function TopBar({ titulo, voltar }: { titulo: string; voltar?: boolean }) {
  const nav = useNavigate()
  return (
    <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 dark:bg-[#0c1322]/70 border-b border-slate-100 dark:border-white/5">
      <div className="mx-auto max-w-lg flex items-center gap-3 px-4 py-3">
        {voltar && (
          <button onClick={() => nav(-1)} className="w-9 h-9 rounded-xl bg-slate-900/5 dark:bg-white/10 flex items-center justify-center">
            <ChevronLeft size={20} strokeWidth={2.6} />
          </button>
        )}
        <h1 className="text-lg font-black">{titulo}</h1>
        <div className="ml-auto flex gap-2">
          <StreakFlame />
          <CoinBadge />
        </div>
      </div>
    </div>
  )
}

/* ---------------- Tema ---------------- */

export function aplicarTema(tema: 'dark' | 'light') {
  document.documentElement.classList.toggle('dark', tema === 'dark')
  localStorage.setItem('fitlevel-tema', tema)
}

export function temaAtual(): 'dark' | 'light' {
  return (localStorage.getItem('fitlevel-tema') as 'dark' | 'light') ?? 'light'
}
