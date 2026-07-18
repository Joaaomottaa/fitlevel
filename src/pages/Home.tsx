import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { ArrowRight, Calendar, ChevronRight, ClipboardCheck, PartyPopper, Scale, Target, TrendingDown, TrendingUp } from 'lucide-react'
import { useGame } from '@/stores/game'
import { AvatarEngine } from '@/components/avatar/AvatarEngine'
import { CoinBadge, ProgressRing, StreakFlame, XPBar, useToast } from '@/components/ui'
import { Icon } from '@/components/icons'
import { STAGE_INFO } from '@/lib/gamification'
import { missoesDoDia } from '@/data/missions'
import { ACHIEVEMENTS } from '@/data/achievements'
import { celebrar } from '@/components/avatar/EvolutionModal'
import { saudacao } from '@/lib/utils'

export default function Home() {
  const g = useGame()
  const toast = useToast((s) => s.push)
  if (!g.profile || !g.avatar) return null

  const dia = g.diaJornada()
  const estagio = g.estagioAtual()
  const score = g.scoreSaude()
  const hoje = g.hoje()
  const checkinHoje = g.checkins[hoje]
  const feitas = g.missoesFeitas[hoje] ?? []
  const missoes = missoesDoDia(hoje, g.profile)

  const ultimos7 = Object.keys(g.checkins)
    .filter((d) => d <= hoje)
    .sort()
    .slice(-7)
    .map((d) => ({ dia: d.slice(8) + '/' + d.slice(5, 7), score: g.checkins[d].score }))

  const proxConquista = ACHIEVEMENTS.find((a) => !g.conquistas.includes(a.id))
  const kgPerdidos = +(g.profile.pesoInicial - g.profile.pesoAtual).toFixed(1)

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 safe-bottom">
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-slate-400">{saudacao()},</p>
          <h1 className="text-xl font-black">{g.profile.nome.split(' ')[0]} 👋</h1>
        </div>
        <div className="flex gap-2">
          <StreakFlame />
          <CoinBadge />
        </div>
      </div>

      {/* cena do avatar */}
      <motion.div
        className="card relative overflow-hidden !p-0"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300/25 via-teal-200/15 to-teal-400/20 dark:from-sky-500/15 dark:via-transparent dark:to-teal-500/10" />
        <div className="relative flex items-center">
          <div className="flex-1 pl-2">
            <AvatarEngine config={g.avatar} size={190} />
          </div>
          <div className="flex-1 pr-4 py-4 flex flex-col gap-2">
            <div className="text-center">
              <ProgressRing value={score} size={110} label={`${score}`} sublabel="Score de Saúde" />
            </div>
            <div className="glass rounded-2xl px-3 py-2 text-center">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Estágio {estagio}/5</p>
              <p className="text-sm font-black grad-text">{STAGE_INFO[estagio].nome}</p>
            </div>
          </div>
        </div>
        {/* progresso da jornada */}
        <div className="relative px-4 pb-4">
          <div className="flex justify-between items-center text-[11px] font-black text-slate-500 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1"><Calendar size={12} /> Dia {dia} de 100</span>
            <span>{100 - dia} dias restantes</span>
          </div>
          <div className="h-3 rounded-full bg-white/60 dark:bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 via-sky-400 to-violet-400"
              initial={{ width: 0 }}
              animate={{ width: `${dia}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </motion.div>

      {/* XP */}
      <div className="card mt-3">
        <XPBar />
      </div>

      {/* check-in CTA */}
      {!checkinHoje ? (
        <Link to="/checkin">
          <motion.div
            className="mt-3 rounded-3xl p-4 bg-gradient-to-r from-teal-400 to-sky-500 text-white shadow-lg shadow-sky-400/30 flex items-center justify-between"
            whileTap={{ scale: 0.97 }}
            animate={{ scale: [1, 1.015, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <div className="flex items-center gap-3">
              <ClipboardCheck size={30} />
              <div>
                <p className="font-black text-lg">Fazer check-in de hoje</p>
                <p className="text-sm font-bold text-white/85">60 segundos · até +100 XP</p>
              </div>
            </div>
            <ArrowRight size={26} />
          </motion.div>
        </Link>
      ) : (
        <div className="card mt-3 flex items-center justify-between">
          <div>
            <p className="font-black">Score de hoje: <span className="grad-text text-xl">{checkinHoje.score}</span></p>
            <p className="text-xs font-bold text-slate-400">Check-in feito ✓ Volte amanhã!</p>
          </div>
          <PartyPopper size={28} className="text-teal-500" />
        </div>
      )}

      {/* estatísticas rápidas */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="card !p-3 text-center">
          <Scale size={16} className="mx-auto text-teal-500 mb-0.5" />
          <p className="text-lg font-black">{g.profile.pesoAtual}<span className="text-xs">kg</span></p>
          <p className="text-[10px] font-black uppercase text-slate-400">Peso atual</p>
        </div>
        <div className="card !p-3 text-center">
          {kgPerdidos >= 0 ? <TrendingDown size={16} className="mx-auto text-sky-500 mb-0.5" /> : <TrendingUp size={16} className="mx-auto text-sky-500 mb-0.5" />}
          <p className="text-lg font-black text-sky-500">{kgPerdidos > 0 ? `-${kgPerdidos}` : kgPerdidos}<span className="text-xs">kg</span></p>
          <p className="text-[10px] font-black uppercase text-slate-400">Evolução</p>
        </div>
        <div className="card !p-3 text-center">
          <Target size={16} className="mx-auto text-violet-500 mb-0.5" />
          <p className="text-lg font-black text-violet-500">{g.profile.pesoMeta}<span className="text-xs">kg</span></p>
          <p className="text-[10px] font-black uppercase text-slate-400">Meta</p>
        </div>
      </div>

      {/* missões do dia */}
      <div className="card mt-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-black flex items-center gap-1.5"><Target size={18} className="text-teal-500" /> Missões de hoje</h2>
          <Link to="/missoes" className="text-xs font-black text-sky-500 flex items-center">ver todas <ChevronRight size={14} /></Link>
        </div>
        <div className="flex flex-col gap-2">
          {missoes.slice(0, 3).map((m) => {
            const feita = feitas.includes(m.id)
            return (
              <button
                key={m.id}
                disabled={feita}
                onClick={() => {
                  const novas = g.completeMission(m.id, m.xp, m.moedas, m.titulo)
                  toast(`+${m.xp} XP · +${m.moedas} moedas`)
                  if (novas.length) {
                    celebrar()
                    novas.forEach((id) => toast(`Conquista: ${ACHIEVEMENTS.find((a) => a.id === id)?.titulo}! 🏆`))
                  }
                }}
                className={`flex items-center gap-3 rounded-2xl p-3 text-left transition-all ${feita ? 'bg-teal-500/10 opacity-60' : 'bg-slate-900/[0.03] dark:bg-white/5 active:scale-95'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${feita ? 'bg-teal-500 text-white' : 'bg-gradient-to-br from-teal-400/15 to-sky-400/15 text-teal-600 dark:text-teal-400'}`}>
                  <Icon name={feita ? 'check' : m.icone} size={20} />
                </div>
                <div className="flex-1">
                  <p className={`font-black text-sm ${feita ? 'line-through' : ''}`}>{m.titulo}</p>
                  <p className="text-[11px] font-bold text-slate-400">+{m.xp} XP · +{m.moedas} moedas</p>
                </div>
                {!feita && <span className="text-xs font-black text-teal-500">FAZER</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* gráfico semanal */}
      {ultimos7.length >= 2 && (
        <div className="card mt-3">
          <h2 className="font-black mb-1 flex items-center gap-1.5"><TrendingUp size={18} className="text-sky-500" /> Últimos 7 dias</h2>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ultimos7} margin={{ top: 6, right: 6, left: -26, bottom: 0 }}>
                <defs>
                  <linearGradient id="gScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="dia" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 16, fontWeight: 700, border: 'none' }} />
                <Area type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={3} fill="url(#gScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* próxima conquista */}
      {proxConquista && (
        <Link to="/conquistas">
          <div className="card mt-3 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-violet-400/10 text-violet-400 flex items-center justify-center">
              <Icon name={proxConquista.icone} size={22} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-slate-400">Próxima conquista</p>
              <p className="font-black text-sm">{proxConquista.titulo}</p>
            </div>
            <span className="text-xs font-black text-violet-500">+{proxConquista.xp} XP</span>
          </div>
        </Link>
      )}
    </div>
  )
}
