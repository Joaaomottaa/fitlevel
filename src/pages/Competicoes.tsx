import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '@/stores/game'
import { Modal, TopBar, useToast } from '@/components/ui'
import { cn, uid } from '@/lib/utils'
import { buscarDesafioPorCodigo, criarDesafioRemoto, entrarParticipanteRemoto, fetchMeusDesafios, supabaseConfigured } from '@/lib/supabase'

interface Desafio {
  id: string
  codigo: string
  nome: string
  tipo: 'diversao' | 'moedas' | 'pix'
  valor: number
  participantes: { nome: string; pago: boolean; pontos: number }[]
  maxParticipantes: number
  status: 'aguardando' | 'ativo' | 'finalizado'
  dias: number
}

function gerarCodigo() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

const DESAFIOS_INICIAIS: Desafio[] = [
  {
    id: uid(), codigo: gerarCodigo(), nome: 'Desafio 30 dias sem açúcar', tipo: 'pix', valor: 10,
    participantes: [
      { nome: 'Marina', pago: true, pontos: 780 },
      { nome: 'Carlos', pago: true, pontos: 645 },
      { nome: 'Você', pago: true, pontos: 812 },
      { nome: 'Juliana', pago: true, pontos: 590 },
      { nome: 'Pedro', pago: false, pontos: 0 },
    ],
    maxParticipantes: 5,
    status: 'aguardando', dias: 30,
  },
  {
    id: uid(), codigo: gerarCodigo(), nome: 'Corrida de streak — quem aguenta mais?', tipo: 'moedas', valor: 100,
    participantes: [
      { nome: 'Você', pago: true, pontos: 12 },
      { nome: 'Fê', pago: true, pontos: 9 },
    ],
    maxParticipantes: 2,
    status: 'ativo', dias: 14,
  },
]

export default function Competicoes() {
  const g = useGame()
  const toast = useToast((s) => s.push)
  const [desafios, setDesafios] = useState(DESAFIOS_INICIAIS)
  const [criando, setCriando] = useState(false)
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<'diversao' | 'moedas' | 'pix'>('diversao')
  const [valor, setValor] = useState(10)
  const [qtdParticipantes, setQtdParticipantes] = useState(4)
  const [codigoCriado, setCodigoCriado] = useState<string | null>(null)
  const [entrando, setEntrando] = useState(false)
  const [codigoDigitado, setCodigoDigitado] = useState('')
  if (!g.profile) return null

  const fecharCriacao = () => {
    setCriando(false)
    setCodigoCriado(null)
    setNome('')
    setTipo('diversao')
    setValor(10)
    setQtdParticipantes(4)
  }

  const criar = () => {
    const codigo = gerarCodigo()
    setDesafios((prev) => [{
      id: uid(), codigo, nome, tipo, valor: tipo === 'diversao' ? 0 : valor,
      participantes: [{ nome: 'Você', pago: tipo !== 'pix', pontos: 0 }],
      maxParticipantes: qtdParticipantes,
      status: 'aguardando', dias: 30,
    }, ...prev])
    setCodigoCriado(codigo)
  }

  const entrar = () => {
    const codigo = codigoDigitado.trim().toUpperCase()
    if (!codigo) return
    const desafio = desafios.find((d) => d.codigo === codigo)
    if (!desafio) {
      toast('Código não encontrado. Confira e tente novamente.', 'erro')
      return
    }
    if (desafio.participantes.some((p) => p.nome === 'Você')) {
      toast('Você já está nesse desafio.', 'info')
      return
    }
    if (desafio.participantes.length >= desafio.maxParticipantes) {
      toast('Esse desafio já está completo.', 'erro')
      return
    }
    setDesafios((prev) => prev.map((d) => {
      if (d.id !== desafio.id) return d
      const participantes = [...d.participantes, { nome: 'Você', pago: d.tipo !== 'pix', pontos: 0 }]
      const completo = participantes.length >= d.maxParticipantes
      const todosPagaram = participantes.every((p) => p.pago)
      return { ...d, participantes, status: completo && todosPagaram ? 'ativo' : d.status }
    }))
    toast('🎉 Você entrou no desafio!')
    setEntrando(false)
    setCodigoDigitado('')
  }

  return (
    <div className="min-h-screen app-bg">
      <TopBar titulo="⚔️ Competições" voltar />
      <div className="mx-auto max-w-lg px-4 py-4 flex flex-col gap-3 safe-bottom">
        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={() => setCriando(true)}>➕ Criar desafio</button>
          <button className="btn-ghost flex-1" onClick={() => setEntrando(true)}>🔑 Entrar com código</button>
        </div>

        {desafios.map((d) => {
          const pagos = d.participantes.filter((p) => p.pago).length
          const premio = d.tipo === 'pix' ? d.valor * d.participantes.length : d.valor
          const lider = [...d.participantes].sort((a, b) => b.pontos - a.pontos)[0]
          return (
            <motion.div key={d.id} className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-black">{d.nome}</p>
                  <p className="text-[11px] font-bold text-slate-400">{d.dias} dias · {d.participantes.length}/{d.maxParticipantes} participantes</p>
                </div>
                <span className={cn(
                  'text-[10px] font-black uppercase px-2.5 py-1 rounded-full',
                  d.status === 'ativo' ? 'bg-emerald-500/15 text-emerald-500' : d.status === 'aguardando' ? 'bg-amber-400/15 text-amber-500' : 'bg-slate-400/15 text-slate-400',
                )}>
                  {d.status === 'aguardando' ? '⏳ aguardando' : d.status === 'ativo' ? '🔥 ativo' : '🏁 finalizado'}
                </span>
              </div>

              {d.status === 'aguardando' && d.participantes.length < d.maxParticipantes && (
                <button
                  className="mt-2 w-full rounded-2xl border-2 border-dashed border-teal-400/40 p-2.5 text-center flex items-center justify-center gap-2"
                  onClick={() => {
                    navigator.clipboard?.writeText(d.codigo)
                    toast('Código copiado! Envie para seus amigos.')
                  }}
                >
                  <span className="text-[11px] font-bold text-slate-400">Código do convite:</span>
                  <span className="font-black tracking-widest text-teal-500">{d.codigo}</span>
                  <span className="text-[10px] font-black text-slate-400">📋 copiar</span>
                </button>
              )}

              <div className="rounded-2xl bg-slate-900/5 dark:bg-white/5 p-3 mt-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Prêmio</p>
                  <p className="font-black text-lg">
                    {d.tipo === 'pix' ? `R$ ${premio},00 💰` : d.tipo === 'moedas' ? `${premio} 🪙` : 'Glória eterna 😄'}
                  </p>
                </div>
                {d.tipo === 'pix' && (
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-slate-400">PIX em escrow</p>
                    <p className="text-xs font-black text-amber-500">{pagos}/{d.participantes.length} pagaram</p>
                  </div>
                )}
              </div>

              {d.tipo === 'pix' && d.status === 'aguardando' && (
                <div className="mt-2 rounded-2xl border-2 border-dashed border-amber-400/40 p-3 text-center">
                  <p className="text-xs font-bold text-slate-400">
                    💡 O valor fica <b>bloqueado</b> até o fim. Quando todos pagarem, o desafio inicia automaticamente e o vencedor recebe via PIX.
                  </p>
                  <p className="text-[10px] font-black text-amber-500 mt-1">[SIMULAÇÃO — integração Mercado Pago no roadmap]</p>
                </div>
              )}

              <div className="mt-3 flex flex-col gap-1.5">
                {[...d.participantes].sort((a, b) => b.pontos - a.pontos).map((p, i) => (
                  <div key={p.nome} className="flex items-center gap-2 text-sm">
                    <span className="w-6 text-center font-black text-slate-400">{i + 1}º</span>
                    <span className={cn('font-black flex-1', p.nome === 'Você' && 'text-emerald-500')}>{p.nome}</span>
                    {!p.pago && <span className="text-[10px] font-black text-amber-500">aguardando PIX</span>}
                    <span className="font-black text-violet-500">{p.pontos} pts</span>
                  </div>
                ))}
              </div>
              {d.status === 'ativo' && lider.nome === 'Você' && (
                <p className="text-center text-xs font-black text-emerald-500 mt-2">Você está liderando! 🏆</p>
              )}
            </motion.div>
          )
        })}
      </div>

      <Modal open={criando} onClose={fecharCriacao}>
        {codigoCriado ? (
          <div className="text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="font-black text-lg">Desafio criado!</h3>
            <p className="text-sm font-bold text-slate-400 mt-1">Envie este código para até {qtdParticipantes - 1} amigo(s) entrarem.</p>
            <button
              className="w-full mt-4 rounded-2xl border-2 border-dashed border-teal-400/40 p-4 flex items-center justify-center gap-2"
              onClick={() => {
                navigator.clipboard?.writeText(codigoCriado)
                toast('Código copiado! Envie para seus amigos.')
              }}
            >
              <span className="font-black text-2xl tracking-widest text-teal-500">{codigoCriado}</span>
              <span className="text-xs font-black text-slate-400">📋 copiar</span>
            </button>
            <button className="btn-primary w-full mt-4" onClick={fecharCriacao}>Concluir</button>
          </div>
        ) : (
          <>
            <h3 className="font-black text-lg mb-3">⚔️ Novo desafio</h3>
            <span className="label">Nome do desafio</span>
            <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: 30 dias de treino" />
            <span className="label mt-3">Quantas pessoas vão participar (incluindo você)?</span>
            <div className="flex items-center gap-3">
              <input type="range" min={2} max={10} step={1} value={qtdParticipantes} onChange={(e) => setQtdParticipantes(+e.target.value)} />
              <span className="font-black text-lg text-emerald-500 w-8 text-center">{qtdParticipantes}</span>
            </div>
            <span className="label mt-3">Aposta</span>
            <div className="flex gap-2">
              {([['diversao', '😄 Diversão'], ['moedas', '🪙 Moedas'], ['pix', '💰 PIX real']] as const).map(([v, l]) => (
                <button key={v} className={cn('chip flex-1 justify-center', tipo === v && 'chip-active')} onClick={() => setTipo(v)}>{l}</button>
              ))}
            </div>
            {tipo !== 'diversao' && (
              <>
                <span className="label mt-3">{tipo === 'pix' ? 'Valor por pessoa (R$)' : 'Aposta em moedas'}: <b className="text-emerald-500">{valor}</b></span>
                <input type="range" min={tipo === 'pix' ? 5 : 50} max={tipo === 'pix' ? 100 : 500} step={5} value={valor} onChange={(e) => setValor(+e.target.value)} />
              </>
            )}
            {tipo === 'pix' && g.profile.plano !== 'premium' && (
              <p className="text-xs font-black text-amber-500 mt-2">⭐ Desafios com PIX real são exclusivos do Premium</p>
            )}
            <button className="btn-primary w-full mt-4" disabled={!nome || (tipo === 'pix' && g.profile.plano !== 'premium')} onClick={criar}>
              Criar e gerar código
            </button>
          </>
        )}
      </Modal>

      <Modal open={entrando} onClose={() => { setEntrando(false); setCodigoDigitado('') }}>
        <h3 className="font-black text-lg mb-3">🔑 Entrar em um desafio</h3>
        <span className="label">Código do convite</span>
        <input
          className="input uppercase tracking-widest text-center font-black"
          value={codigoDigitado}
          onChange={(e) => setCodigoDigitado(e.target.value.toUpperCase())}
          placeholder="EX.: A1B2C3"
          maxLength={6}
        />
        <button className="btn-primary w-full mt-4" disabled={!codigoDigitado.trim()} onClick={entrar}>
          Entrar no desafio
        </button>
      </Modal>
    </div>
  )
}
