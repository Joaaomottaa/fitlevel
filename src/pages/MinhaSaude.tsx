import { useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useGame } from '@/stores/game'
import { Modal, ProgressRing, TopBar, useToast } from '@/components/ui'
import { NIVEL_CUIDADO_COR, NIVEL_CUIDADO_LABEL, calcRiskFactors, classificaIMC } from '@/lib/health'
import { avgScore } from '@/lib/gamification'
import { ACHIEVEMENTS } from '@/data/achievements'
import { celebrar } from '@/components/avatar/EvolutionModal'
import { fmtNum } from '@/lib/utils'

export default function MinhaSaude() {
  const g = useGame()
  const toast = useToast((s) => s.push)
  const [editPeso, setEditPeso] = useState(false)
  const [novoPeso, setNovoPeso] = useState('')
  if (!g.profile) return null
  const p = g.profile
  const imcInfo = classificaIMC(p.imc)
  const riscos = calcRiskFactors(p)
  const hoje = g.hoje()
  const media7 = avgScore(g.checkins, 7, hoje)
  const media30 = avgScore(g.checkins, 30, hoje)

  const historico = Object.keys(g.checkins).filter((d) => d <= hoje).sort().slice(-30)
    .map((d) => ({ dia: d.slice(8), score: g.checkins[d].score }))

  return (
    <div className="min-h-screen app-bg">
      <TopBar titulo="❤️ Minha Saúde" />
      <div className="mx-auto max-w-lg px-4 py-4 flex flex-col gap-3 safe-bottom">
        {/* scores */}
        <div className="card flex items-center justify-around">
          <div className="text-center">
            <ProgressRing value={g.scoreSaude()} size={100} label={`${g.scoreSaude()}`} sublabel="Geral" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-cyan-500">{media7 || '—'}</p>
            <p className="text-[10px] font-black uppercase text-slate-400">Média semanal</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-violet-500">{media30 || '—'}</p>
            <p className="text-[10px] font-black uppercase text-slate-400">Média mensal</p>
          </div>
        </div>

        {/* indicadores calculados */}
        <div className="grid grid-cols-2 gap-2">
          <div className="card !p-3">
            <p className="text-[10px] font-black uppercase text-slate-400">IMC</p>
            <p className="text-xl font-black" style={{ color: imcInfo.cor }}>{p.imc}</p>
            <p className="text-xs font-bold" style={{ color: imcInfo.cor }}>{imcInfo.rotulo}</p>
          </div>
          <div className="card !p-3">
            <p className="text-[10px] font-black uppercase text-slate-400">TMB (Mifflin-St Jeor)</p>
            <p className="text-xl font-black">{fmtNum(p.tmb)} <span className="text-xs">kcal</span></p>
            <p className="text-xs font-bold text-slate-400">metabolismo basal</p>
          </div>
          <div className="card !p-3">
            <p className="text-[10px] font-black uppercase text-slate-400">Gasto diário</p>
            <p className="text-xl font-black">{fmtNum(p.gastoCalorico)} <span className="text-xs">kcal</span></p>
            <p className="text-xs font-bold text-slate-400">com atividade</p>
          </div>
          <div className="card !p-3">
            <p className="text-[10px] font-black uppercase text-slate-400">Meta calórica</p>
            <p className="text-xl font-black text-emerald-500">{fmtNum(p.metaCalorias)} <span className="text-xs">kcal</span></p>
            <p className="text-xs font-bold text-slate-400">{p.objetivo === 'perder_peso' ? 'déficit de 400' : p.objetivo === 'ganhar_massa' ? 'superávit de 300' : 'manutenção'}</p>
          </div>
        </div>

        {/* peso */}
        <div className="card flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Peso</p>
            <p className="font-black text-lg">{p.pesoAtual}kg <span className="text-sm text-slate-400">→ meta {p.pesoMeta}kg</span></p>
            <p className="text-xs font-bold text-emerald-500">{p.pesoInicial - p.pesoAtual > 0 ? `-${(p.pesoInicial - p.pesoAtual).toFixed(1)}kg desde o início 🎉` : 'Registre seu progresso semanalmente'}</p>
          </div>
          <button className="btn-ghost !py-2 !px-4 text-sm" onClick={() => setEditPeso(true)}>⚖️ Atualizar</button>
        </div>

        {/* fatores de risco */}
        <div className="card">
          <h2 className="font-black mb-3">Nível de cuidado por fator</h2>
          <div className="flex flex-col gap-3">
            {riscos.map((r) => (
              <div key={r.nome}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-black">{r.icone} {r.nome}</p>
                  <span className="text-[10px] font-black uppercase" style={{ color: NIVEL_CUIDADO_COR[r.nivel] }}>
                    {NIVEL_CUIDADO_LABEL[r.nivel]}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <div key={n} className="h-2 flex-1 rounded-full" style={{ background: n <= r.nivel ? NIVEL_CUIDADO_COR[r.nivel] : 'rgba(148,163,184,0.25)' }} />
                  ))}
                </div>
                <p className="text-[11px] font-semibold text-slate-400 mt-1">{r.dica}</p>
              </div>
            ))}
          </div>
        </div>

        {/* evolução 30 dias */}
        {historico.length >= 2 && (
          <div className="card">
            <h2 className="font-black mb-1">📈 Evolução (30 dias)</h2>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historico} margin={{ top: 6, right: 6, left: -26, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gSaude" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="dia" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 16, fontWeight: 700 }} />
                  <Area type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} fill="url(#gSaude)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <p className="text-[11px] font-semibold text-slate-400 text-center px-4">
          ⚠️ Indicadores informativos calculados por fórmulas validadas — não substituem avaliação médica.
        </p>
      </div>

      <Modal open={editPeso} onClose={() => setEditPeso(false)}>
        <h3 className="font-black text-lg mb-3">⚖️ Atualizar peso</h3>
        <input className="input" type="number" step="0.1" placeholder={`Atual: ${p.pesoAtual}kg`} value={novoPeso} onChange={(e) => setNovoPeso(e.target.value)} />
        <button
          className="btn-primary w-full mt-3"
          disabled={!novoPeso}
          onClick={() => {
            const novas = g.updatePeso(Number(novoPeso))
            setEditPeso(false)
            setNovoPeso('')
            toast('Peso atualizado! 📉')
            if (novas.length) {
              celebrar()
              novas.forEach((id) => toast(`🏆 ${ACHIEVEMENTS.find((a) => a.id === id)?.titulo}!`))
            }
          }}
        >
          Salvar
        </button>
      </Modal>
    </div>
  )
}
