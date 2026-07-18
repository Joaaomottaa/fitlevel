import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGame, type CheckinResult } from '@/stores/game'
import { ProgressRing, TopBar, useToast } from '@/components/ui'
import { EvolutionModal, celebrar } from '@/components/avatar/EvolutionModal'
import { ACHIEVEMENTS } from '@/data/achievements'
import { feedbackCheckin } from '@/lib/n8n'
import { cn } from '@/lib/utils'

export default function Checkin() {
  const g = useGame()
  const toast = useToast((s) => s.push)
  const nav = useNavigate()
  const hoje = g.hoje()
  const jaFeito = Boolean(g.checkins[hoje])

  const [sonoHoras, setSonoHoras] = useState(7)
  const [sonoQualidade, setSonoQualidade] = useState(3)
  const [aguaMl, setAguaMl] = useState(1500)
  const [exercicioMin, setExercicioMin] = useState(0)
  const [exercicioTipo, setExercicioTipo] = useState('Nenhum')
  const [refeicoes, setRefeicoes] = useState(3)
  const [frutas, setFrutas] = useState(false)
  const [verduras, setVerduras] = useState(false)
  const [acucar, setAcucar] = useState(false)
  const [gordura, setGordura] = useState(false)
  const [humor, setHumor] = useState(3)
  const [estresse, setEstresse] = useState(3)
  const [resultado, setResultado] = useState<CheckinResult | null>(null)
  const [feedback, setFeedback] = useState('')
  const [mostrarEvolucao, setMostrarEvolucao] = useState(false)

  if (!g.profile) return null

  const enviar = () => {
    const r = g.submitCheckin({
      sonoHoras, sonoQualidade, aguaMl, exercicioMin, exercicioTipo,
      refeicoesRegistradas: refeicoes, comeuFrutas: frutas, comeuVerduras: verduras,
      acucar, gordura, humor, estresse,
    })
    setResultado(r)
    setFeedback(r.feedback)
    if (r.score >= 70) celebrar()
    r.conquistas.forEach((id) => toast(`🏆 ${ACHIEVEMENTS.find((a) => a.id === id)?.titulo}!`))
    // feedback IA via n8n substitui o local quando disponível
    const historico = Object.values(g.checkins).slice(-7).map((c) => c.score)
    feedbackCheckin({ nome: g.profile!.nome, score: r.score, streak: g.streak(), historico }).then((res) => {
      if (res?.feedback) {
        setFeedback(res.feedback)
        g.setFeedback(hoje, res.feedback)
      }
    })
  }

  /* ------- resultado ------- */
  if (resultado) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center p-6">
        <motion.div className="card !p-8 w-full max-w-sm text-center" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Score do dia</p>
          <div className="my-4 flex justify-center">
            <ProgressRing value={resultado.score} size={150} stroke={14} label={`${resultado.score}`} sublabel="de 100" />
          </div>
          <div className="flex justify-center gap-2 mb-4">
            <span className="rounded-full bg-violet-500/15 text-violet-500 px-3 py-1.5 text-sm font-black">+{resultado.xpGanho} XP</span>
            <span className="rounded-full bg-amber-400/15 text-amber-500 px-3 py-1.5 text-sm font-black">+{resultado.moedasGanhas} 🪙</span>
          </div>
          <motion.p className="text-sm font-bold text-slate-500 dark:text-slate-300" key={feedback} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            🤖 {feedback}
          </motion.p>
          {resultado.subiumNivel && <p className="mt-3 font-black text-violet-500">⬆️ Você subiu de nível!</p>}
          <button
            className="btn-primary w-full mt-6"
            onClick={() => (resultado.evoluiu ? setMostrarEvolucao(true) : nav('/home'))}
          >
            {resultado.evoluiu ? 'Ver evolução do avatar ✨' : 'Voltar ao início'}
          </button>
        </motion.div>
        <EvolutionModal open={mostrarEvolucao} onClose={() => nav('/home')} estagio={resultado.novoEstagio} />
      </div>
    )
  }

  /* ------- já feito ------- */
  if (jaFeito) {
    return (
      <div className="min-h-screen app-bg">
        <TopBar titulo="Check-in diário" voltar />
        <div className="mx-auto max-w-lg p-6 text-center">
          <div className="card !p-8">
            <span className="text-5xl">✅</span>
            <h2 className="font-black text-xl mt-3">Check-in de hoje já feito!</h2>
            <p className="font-bold text-slate-400 mt-1">Score: {g.checkins[hoje].score}. Volte amanhã para manter o streak 🔥</p>
            <button className="btn-primary mt-5 w-full" onClick={() => nav('/home')}>Voltar</button>
          </div>
        </div>
      </div>
    )
  }

  /* ------- questionário ------- */
  const EMOJIS_HUMOR = ['😞', '😕', '😐', '🙂', '😄']
  const EMOJIS_STRESS = ['🧘', '😌', '😐', '😬', '🤯']

  return (
    <div className="min-h-screen app-bg">
      <TopBar titulo="Check-in diário" voltar />
      <div className="mx-auto max-w-lg px-4 py-4 flex flex-col gap-4 safe-bottom">
        <div className="card">
          <h3 className="font-black mb-2">😴 Sono</h3>
          <span className="label">Dormiu quantas horas? <b className="text-emerald-500">{sonoHoras}h</b></span>
          <input type="range" min={0} max={12} step={0.5} value={sonoHoras} onChange={(e) => setSonoHoras(+e.target.value)} />
          <span className="label mt-3">Qualidade do sono</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} className={cn('chip flex-1 justify-center text-lg', sonoQualidade === n && 'chip-active')} onClick={() => setSonoQualidade(n)}>
                {['😫', '😪', '😐', '😊', '🤩'][n - 1]}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-black mb-2">💧 Hidratação</h3>
          <span className="label">Bebeu quanta água? <b className="text-cyan-500">{(aguaMl / 1000).toFixed(2)}L</b> <span className="text-slate-400">(meta {(g.profile.metaAguaMl / 1000).toFixed(1)}L)</span></span>
          <input type="range" min={0} max={5000} step={250} value={aguaMl} onChange={(e) => setAguaMl(+e.target.value)} />
          <div className="flex gap-2 mt-2">
            {[250, 500, 1000].map((ml) => (
              <button key={ml} className="chip" onClick={() => setAguaMl((v) => Math.min(5000, v + ml))}>+{ml}ml</button>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-black mb-2">🏃 Exercício</h3>
          <span className="label">Minutos de atividade: <b className="text-emerald-500">{exercicioMin} min</b></span>
          <input type="range" min={0} max={180} step={5} value={exercicioMin} onChange={(e) => setExercicioMin(+e.target.value)} />
          {exercicioMin > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {['Caminhada', 'Corrida', 'Musculação', 'Funcional', 'Bike', 'Esporte', 'Outro'].map((t) => (
                <button key={t} className={cn('chip', exercicioTipo === t && 'chip-active')} onClick={() => setExercicioTipo(t)}>{t}</button>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-black mb-2">🍽️ Alimentação</h3>
          <span className="label">Refeições registradas: <b className="text-emerald-500">{refeicoes}</b></span>
          <input type="range" min={0} max={6} value={refeicoes} onChange={(e) => setRefeicoes(+e.target.value)} />
          <div className="grid grid-cols-2 gap-2 mt-3">
            {([['🍎 Comi frutas', frutas, setFrutas], ['🥦 Comi verduras', verduras, setVerduras], ['🍬 Exagerei no açúcar', acucar, setAcucar], ['🍟 Exagerei na gordura', gordura, setGordura]] as [string, boolean, (v: boolean) => void][]).map(([l, v, set]) => (
              <button key={l} className={cn('chip justify-center', v && 'chip-active')} onClick={() => set(!v)}>{l}</button>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-black mb-2">🧠 Bem-estar</h3>
          <span className="label">Como está seu humor?</span>
          <div className="flex gap-2">
            {EMOJIS_HUMOR.map((e, i) => (
              <button key={i} className={cn('chip flex-1 justify-center text-lg', humor === i + 1 && 'chip-active')} onClick={() => setHumor(i + 1)}>{e}</button>
            ))}
          </div>
          <span className="label mt-3">Nível de estresse</span>
          <div className="flex gap-2">
            {EMOJIS_STRESS.map((e, i) => (
              <button key={i} className={cn('chip flex-1 justify-center text-lg', estresse === i + 1 && 'chip-active')} onClick={() => setEstresse(i + 1)}>{e}</button>
            ))}
          </div>
        </div>

        <button className="btn-primary text-lg" onClick={enviar}>
          Calcular meu score ⚡
        </button>
      </div>
    </div>
  )
}
