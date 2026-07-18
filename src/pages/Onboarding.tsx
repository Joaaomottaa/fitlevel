import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { AvatarConfig, Objetivo, Profile, Sexo } from '@/types'
import { calcGastoCalorico, calcHealthScoreInicial, calcIMC, calcMetaAgua, calcMetaCalorias, calcTMB, classificaIMC } from '@/lib/health'
import { useAuth } from '@/stores/auth'
import { useGame } from '@/stores/game'
import { useToast } from '@/components/ui'
import { analisarFoto, n8nConfigured } from '@/lib/n8n'
import { AvatarEngine, DEFAULT_AVATAR, HAIR_COLORS, HAIR_STYLES, SKIN_TONES, BEARDS } from '@/components/avatar/AvatarEngine'
import { cn, todayISO } from '@/lib/utils'

const TOTAL = 6

function Passo({ ativo, n, children }: { ativo: number; n: number; children: React.ReactNode }) {
  return ativo === n ? (
    <motion.div key={n} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex flex-col gap-4">
      {children}
    </motion.div>
  ) : null
}

export default function Onboarding() {
  const user = useAuth((s) => s.user)
  const completeOnboarding = useGame((s) => s.completeOnboarding)
  const toast = useToast((s) => s.push)
  const nav = useNavigate()
  const [passo, setPasso] = useState(1)

  // etapa 1 — identidade
  const [nome, setNome] = useState(user?.nome ?? '')
  const [sexo, setSexo] = useState<Sexo>('M')
  const [idade, setIdade] = useState(30)
  const [altura, setAltura] = useState(170)
  const [peso, setPeso] = useState(80)
  const [pesoMeta, setPesoMeta] = useState(75)
  const [circAbd, setCircAbd] = useState(0)
  // etapa 2 — objetivo e atividade
  const [objetivo, setObjetivo] = useState<Objetivo>('perder_peso')
  const [atividade, setAtividade] = useState(1.375)
  const [freqEx, setFreqEx] = useState('1-2x por semana')
  const [tipoTreino, setTipoTreino] = useState('Nenhum')
  // etapa 3 — sono e água
  const [sonoHoras, setSonoHoras] = useState(7)
  const [horarioSono, setHorarioSono] = useState('23:00')
  const [agua, setAgua] = useState(1.5)
  // etapa 4 — alimentação e vícios
  const [habitos, setHabitos] = useState<'ruim' | 'medio' | 'bom'>('medio')
  const [alcool, setAlcool] = useState<'nunca' | 'social' | 'frequente'>('social')
  const [fumante, setFumante] = useState(false)
  // etapa 5 — clínico
  const [doencas, setDoencas] = useState<string[]>([])
  const [historico, setHistorico] = useState<string[]>([])
  const [alergias, setAlergias] = useState('')
  const [restricoes, setRestricoes] = useState<string[]>([])
  const [medicamentos, setMedicamentos] = useState('')
  const [colesterol, setColesterol] = useState<'normal' | 'alto' | 'nao_sei'>('nao_sei')
  const [pressao, setPressao] = useState<'normal' | 'alta' | 'nao_sei'>('nao_sei')
  const [glicemia, setGlicemia] = useState<'normal' | 'alta' | 'nao_sei'>('nao_sei')
  const [pctGordura, setPctGordura] = useState('')
  // etapa 6 — avatar
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR(1))
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [analisando, setAnalisando] = useState(false)

  const imc = useMemo(() => calcIMC(peso, altura), [peso, altura])
  const imcInfo = classificaIMC(imc)

  const finalizar = () => {
    const tmb = calcTMB(sexo, peso, altura, idade)
    const gasto = calcGastoCalorico(tmb, atividade)
    const perfil: Profile = {
      id: user!.id,
      nome,
      sexo,
      idade,
      alturaCm: altura,
      pesoInicial: peso,
      pesoAtual: peso,
      pesoMeta,
      circAbdominal: circAbd || undefined,
      objetivo,
      nivelAtividade: atividade,
      freqExercicio: freqEx,
      tipoTreino,
      sonoHoras,
      horarioSono,
      aguaLitros: agua,
      habitosAlimentares: habitos,
      alcool,
      fumante,
      historicoFamiliar: historico,
      restricoes,
      alergias: alergias ? alergias.split(',').map((s) => s.trim()) : [],
      doencas,
      medicamentos,
      colesterol,
      pressao,
      glicemia,
      pctGordura: pctGordura ? Number(pctGordura) : undefined,
      plano: 'free',
      jornadaInicio: todayISO(),
      imc,
      tmb,
      gastoCalorico: gasto,
      metaCalorias: calcMetaCalorias(gasto, objetivo),
      metaAguaMl: calcMetaAgua(peso),
      healthScoreInicial: calcHealthScoreInicial({
        imc, fumante, alcool, sonoHoras, nivelAtividade: atividade, aguaLitros: agua,
        habitosAlimentares: habitos, pressao, glicemia, colesterol,
      }),
    }
    // estágio inicial do avatar reflete o corpo real (IMC)
    const estagioInicial = imc >= 30 ? 1 : imc >= 27 ? 1 : imc >= 25 ? 2 : 3
    completeOnboarding(perfil, { ...avatar, estagio: estagioInicial as 1 | 2 | 3 })
    nav('/home')
  }

  const onFoto = async (file: File) => {
    const b64 = await new Promise<string>((res) => {
      const r = new FileReader()
      r.onload = () => res(r.result as string)
      r.readAsDataURL(file)
    })
    setFotoPreview(b64)
    setAnalisando(true)
    const resultado = await analisarFoto({ fotoFrenteBase64: b64, sexo, imc })
    setAnalisando(false)
    if (resultado) {
      setAvatar((a) => ({ ...a, ...resultado }))
      toast('✨ IA analisou sua foto e criou seu avatar!')
    } else {
      // fallback local: heurística simples sem IA
      setAvatar((a) => ({ ...a, hair: sexo === 'F' ? 'longo' : 'curto' }))
      toast(n8nConfigured ? 'IA indisponível — ajuste manualmente' : 'n8n não configurado — ajuste o avatar manualmente', 'info')
    }
  }

  return (
    <div className="min-h-screen app-bg">
      <div className="mx-auto max-w-lg px-5 py-6">
        {/* progresso */}
        <div className="flex items-center gap-3 mb-6">
          {passo > 1 && (
            <button onClick={() => setPasso(passo - 1)} className="w-9 h-9 rounded-xl bg-slate-900/5 dark:bg-white/10 font-black">←</button>
          )}
          <div className="flex-1 h-2.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500" animate={{ width: `${(passo / TOTAL) * 100}%` }} />
          </div>
          <span className="text-xs font-black text-slate-400">{passo}/{TOTAL}</span>
        </div>

        {/* balão do guia */}
        <div className="flex items-start gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shrink-0">
            <img src="/logo-fitlevel-white.svg" alt="FitLevel" className="w-7 h-auto" />
          </div>
          <div className="card !p-3 !rounded-2xl !rounded-tl-md text-sm font-bold">
            {passo === 1 && 'Oi! Sou seu guia FitLevel. Vamos nos conhecer? Esses dados calculam seus indicadores de saúde.'}
            {passo === 2 && 'Qual é a sua missão? Isso define suas metas de calorias e treino.'}
            {passo === 3 && 'Sono e água são 40% do seu score diário. Como está sua rotina hoje?'}
            {passo === 4 && 'Sem julgamentos — quanto mais sincero, melhor seu plano. 🤝'}
            {passo === 5 && 'Agora a parte clínica. Se não souber algum valor, sem problema!'}
            {passo === 6 && 'Hora do momento mágico: envie uma foto e a IA cria um avatar com a sua cara! 📸'}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <Passo ativo={passo} n={1}>
            <div><span className="label">Nome</span><input className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como te chamamos?" /></div>
            <div><span className="label">Sexo biológico (para cálculo da TMB)</span>
              <div className="flex gap-2">
                {(['M', 'F', 'outro'] as Sexo[]).map((s) => (
                  <button key={s} className={cn('chip flex-1 justify-center', sexo === s && 'chip-active')} onClick={() => setSexo(s)}>
                    {s === 'M' ? '👨 Masculino' : s === 'F' ? '👩 Feminino' : '🌈 Outro'}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><span className="label">Idade: <b className="text-emerald-500">{idade}</b></span><input type="range" min={14} max={90} value={idade} onChange={(e) => setIdade(+e.target.value)} /></div>
              <div><span className="label">Altura: <b className="text-emerald-500">{altura}cm</b></span><input type="range" min={130} max={220} value={altura} onChange={(e) => setAltura(+e.target.value)} /></div>
              <div><span className="label">Peso atual: <b className="text-emerald-500">{peso}kg</b></span><input type="range" min={35} max={200} value={peso} onChange={(e) => setPeso(+e.target.value)} /></div>
              <div><span className="label">Peso desejado: <b className="text-cyan-500">{pesoMeta}kg</b></span><input type="range" min={35} max={200} value={pesoMeta} onChange={(e) => setPesoMeta(+e.target.value)} /></div>
            </div>
            <div><span className="label">Circunferência abdominal (cm) — opcional</span><input className="input" type="number" value={circAbd || ''} onChange={(e) => setCircAbd(+e.target.value)} placeholder="Ex.: 95" /></div>
            <div className="card !p-3 text-center text-sm font-bold">
              Seu IMC: <span style={{ color: imcInfo.cor }} className="font-black">{imc} — {imcInfo.rotulo}</span>
            </div>
            <button className="btn-primary" disabled={!nome} onClick={() => setPasso(2)}>Continuar</button>
          </Passo>

          <Passo ativo={passo} n={2}>
            <div><span className="label">Objetivo principal</span>
              <div className="grid grid-cols-2 gap-2">
                {([['perder_peso', '🔥 Perder peso'], ['ganhar_massa', '💪 Ganhar massa'], ['manter_peso', '⚖️ Manter peso'], ['saude_geral', '❤️ Saúde geral']] as [Objetivo, string][]).map(([v, l]) => (
                  <button key={v} className={cn('chip justify-center', objetivo === v && 'chip-active')} onClick={() => setObjetivo(v)}>{l}</button>
                ))}
              </div>
            </div>
            <div><span className="label">Nível de atividade física</span>
              <div className="flex flex-col gap-2">
                {([[1.2, 'Sedentário — trabalho sentado, sem exercício'], [1.375, 'Leve — exercício 1-3x/semana'], [1.55, 'Moderado — exercício 3-5x/semana'], [1.725, 'Intenso — exercício 6-7x/semana'], [1.9, 'Atleta — 2x por dia']] as [number, string][]).map(([v, l]) => (
                  <button key={v} className={cn('chip justify-start', atividade === v && 'chip-active')} onClick={() => setAtividade(v)}>{l}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><span className="label">Frequência atual</span>
                <select className="input" value={freqEx} onChange={(e) => setFreqEx(e.target.value)}>
                  {['Nunca', '1-2x por semana', '3-4x por semana', '5+ por semana'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div><span className="label">Tipo de treino</span>
                <select className="input" value={tipoTreino} onChange={(e) => setTipoTreino(e.target.value)}>
                  {['Nenhum', 'Musculação', 'Cardio/Corrida', 'Funcional/Crossfit', 'Esportes', 'Caminhada', 'Misto'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <button className="btn-primary" onClick={() => setPasso(3)}>Continuar</button>
          </Passo>

          <Passo ativo={passo} n={3}>
            <div><span className="label">Horas de sono por noite: <b className="text-emerald-500">{sonoHoras}h</b></span><input type="range" min={3} max={11} step={0.5} value={sonoHoras} onChange={(e) => setSonoHoras(+e.target.value)} /></div>
            <div><span className="label">Horário que costuma dormir</span><input className="input" type="time" value={horarioSono} onChange={(e) => setHorarioSono(e.target.value)} /></div>
            <div><span className="label">Água por dia: <b className="text-cyan-500">{agua.toFixed(1)}L</b></span><input type="range" min={0} max={5} step={0.25} value={agua} onChange={(e) => setAgua(+e.target.value)} /></div>
            <button className="btn-primary" onClick={() => setPasso(4)}>Continuar</button>
          </Passo>

          <Passo ativo={passo} n={4}>
            <div><span className="label">Como você avalia sua alimentação?</span>
              <div className="flex gap-2">
                {([['ruim', '🍔 Ruim'], ['medio', '🍝 Média'], ['bom', '🥗 Boa']] as ['ruim' | 'medio' | 'bom', string][]).map(([v, l]) => (
                  <button key={v} className={cn('chip flex-1 justify-center', habitos === v && 'chip-active')} onClick={() => setHabitos(v)}>{l}</button>
                ))}
              </div>
            </div>
            <div><span className="label">Consumo de álcool</span>
              <div className="flex gap-2">
                {([['nunca', 'Nunca'], ['social', 'Social'], ['frequente', 'Frequente']] as ['nunca' | 'social' | 'frequente', string][]).map(([v, l]) => (
                  <button key={v} className={cn('chip flex-1 justify-center', alcool === v && 'chip-active')} onClick={() => setAlcool(v)}>{l}</button>
                ))}
              </div>
            </div>
            <div><span className="label">Você fuma?</span>
              <div className="flex gap-2">
                <button className={cn('chip flex-1 justify-center', !fumante && 'chip-active')} onClick={() => setFumante(false)}>Não 🚭</button>
                <button className={cn('chip flex-1 justify-center', fumante && 'chip-active')} onClick={() => setFumante(true)}>Sim 🚬</button>
              </div>
            </div>
            <div><span className="label">Restrições alimentares</span>
              <div className="flex flex-wrap gap-2">
                {['Vegetariano', 'Vegano', 'Sem lactose', 'Sem glúten', 'Low carb'].map((r) => (
                  <button key={r} className={cn('chip', restricoes.includes(r) && 'chip-active')} onClick={() => setRestricoes((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r])}>{r}</button>
                ))}
              </div>
            </div>
            <button className="btn-primary" onClick={() => setPasso(5)}>Continuar</button>
          </Passo>

          <Passo ativo={passo} n={5}>
            <div><span className="label">Condições de saúde (toque para marcar)</span>
              <div className="flex flex-wrap gap-2">
                {['Diabetes', 'Pré-diabetes', 'Hipertensão', 'Colesterol alto', 'Asma', 'Ansiedade', 'Depressão', 'Nenhuma'].map((d) => (
                  <button key={d} className={cn('chip', doencas.includes(d) && 'chip-active')} onClick={() => setDoencas((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev.filter((x) => x !== 'Nenhuma' || d === 'Nenhuma'), d])}>{d}</button>
                ))}
              </div>
            </div>
            <div><span className="label">Histórico familiar</span>
              <div className="flex flex-wrap gap-2">
                {['Diabetes', 'Hipertensão', 'Infarto/AVC', 'Câncer', 'Obesidade', 'Nenhum'].map((d) => (
                  <button key={d} className={cn('chip', historico.includes(d) && 'chip-active')} onClick={() => setHistorico((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])}>{d}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {([['Colesterol', colesterol, setColesterol, ['normal', 'alto', 'nao_sei']], ['Pressão', pressao, setPressao, ['normal', 'alta', 'nao_sei']], ['Glicemia', glicemia, setGlicemia, ['normal', 'alta', 'nao_sei']]] as [string, string, (v: never) => void, string[]][]).map(([rotulo, valor, setter, opcoes]) => (
                <div key={rotulo as string}>
                  <span className="label">{rotulo}</span>
                  <select className="input !px-2 text-sm" value={valor as string} onChange={(e) => (setter as (v: string) => void)(e.target.value)}>
                    {(opcoes as string[]).map((o) => <option key={o} value={o}>{o === 'nao_sei' ? 'Não sei' : o[0].toUpperCase() + o.slice(1)}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><span className="label">% gordura (se souber)</span><input className="input" type="number" value={pctGordura} onChange={(e) => setPctGordura(e.target.value)} placeholder="Ex.: 25" /></div>
              <div><span className="label">Alergias</span><input className="input" value={alergias} onChange={(e) => setAlergias(e.target.value)} placeholder="Ex.: amendoim" /></div>
            </div>
            <div><span className="label">Medicamentos em uso</span><input className="input" value={medicamentos} onChange={(e) => setMedicamentos(e.target.value)} placeholder="Opcional" /></div>
            <button className="btn-primary" onClick={() => setPasso(6)}>Continuar</button>
          </Passo>

          <Passo ativo={passo} n={6}>
            <div className="card !p-4 text-center">
              <AvatarEngine config={avatar} size={180} />
              <label className="btn-violet w-full mt-2 cursor-pointer">
                📸 {fotoPreview ? 'Trocar foto' : 'Enviar foto para a IA'}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFoto(e.target.files[0])} />
              </label>
              {analisando && <p className="text-sm font-bold text-violet-500 mt-2 animate-pulse">🤖 IA analisando sua foto…</p>}
            </div>
            <div><span className="label">Tom de pele</span>
              <div className="flex gap-2">
                {SKIN_TONES.map((t) => (
                  <button key={t} className={cn('w-10 h-10 rounded-full border-4', avatar.skinTone === t ? 'border-emerald-400 scale-110' : 'border-transparent')} style={{ background: t }} onClick={() => setAvatar({ ...avatar, skinTone: t })} />
                ))}
              </div>
            </div>
            <div><span className="label">Cabelo</span>
              <div className="flex flex-wrap gap-2">
                {HAIR_STYLES.map((h) => (
                  <button key={h} className={cn('chip', avatar.hair === h && 'chip-active')} onClick={() => setAvatar({ ...avatar, hair: h })}>{h}</button>
                ))}
              </div>
            </div>
            <div><span className="label">Cor do cabelo</span>
              <div className="flex gap-2 flex-wrap">
                {HAIR_COLORS.map((c) => (
                  <button key={c} className={cn('w-8 h-8 rounded-full border-4', avatar.hairColor === c ? 'border-emerald-400 scale-110' : 'border-transparent')} style={{ background: c }} onClick={() => setAvatar({ ...avatar, hairColor: c })} />
                ))}
              </div>
            </div>
            <div><span className="label">Barba</span>
              <div className="flex gap-2">
                {BEARDS.map((b) => (
                  <button key={b} className={cn('chip', avatar.beard === b && 'chip-active')} onClick={() => setAvatar({ ...avatar, beard: b })}>{b}</button>
                ))}
              </div>
            </div>
            <button className="btn-primary" onClick={finalizar}>Começar a jornada de 100 dias 🚀</button>
          </Passo>
        </AnimatePresence>
      </div>
    </div>
  )
}
