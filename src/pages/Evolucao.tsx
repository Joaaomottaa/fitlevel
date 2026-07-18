import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Camera, ImagePlus, Plus, Scale, Trash2 } from 'lucide-react'
import { useGame } from '@/stores/game'
import { Modal, TopBar, useToast } from '@/components/ui'
import { comprimirImagem } from '@/lib/image'
import { diffDays, todayISO } from '@/lib/utils'

export default function Evolucao() {
  const g = useGame()
  const toast = useToast((s) => s.push)
  const [adicionando, setAdicionando] = useState(false)
  const [foto, setFoto] = useState<string | null>(null)
  const [data, setData] = useState(todayISO())
  const [peso, setPeso] = useState('')
  const [nota, setNota] = useState('')
  const [confirmarRemover, setConfirmarRemover] = useState<string | null>(null)
  if (!g.profile) return null

  const fotos = g.evolucaoFotos
  const primeira = fotos[0]
  const ultima = fotos[fotos.length - 1]
  const deltaKg = primeira?.peso && ultima?.peso ? +(ultima.peso - primeira.peso).toFixed(1) : null
  const deltaDias = primeira && ultima ? diffDays(primeira.data, ultima.data) : 0

  const salvar = () => {
    if (!foto) return
    g.addEvolucaoFoto({ data, foto, peso: peso ? Number(peso) : undefined, nota: nota || undefined })
    setAdicionando(false)
    setFoto(null)
    setPeso('')
    setNota('')
    setData(todayISO())
    toast('Foto registrada na sua linha do tempo! 📸')
  }

  const fmt = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

  return (
    <div className="min-h-screen app-bg">
      <TopBar titulo="Minha Evolução" voltar />
      <div className="mx-auto max-w-lg px-4 py-4 flex flex-col gap-3 safe-bottom">

        {/* antes e depois */}
        {fotos.length >= 2 ? (
          <motion.div className="card !p-4 overflow-hidden" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-black mb-3 flex items-center gap-1.5">
              <Camera size={18} className="text-teal-500" /> Antes e depois
              <span className="ml-auto text-[11px] font-black text-slate-400">{deltaDias} dias de diferença</span>
            </p>
            <div className="flex gap-2 items-stretch">
              <div className="flex-1 relative rounded-2xl overflow-hidden">
                <img src={primeira.foto} alt="antes" className="w-full h-56 object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs font-black">{fmt(primeira.data)}</p>
                  {primeira.peso && <p className="text-white/80 text-[11px] font-bold">{primeira.peso}kg</p>}
                </div>
              </div>
              <div className="self-center text-teal-500">
                <ArrowRight size={22} strokeWidth={3} />
              </div>
              <div className="flex-1 relative rounded-2xl overflow-hidden ring-2 ring-teal-400">
                <img src={ultima.foto} alt="depois" className="w-full h-56 object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs font-black">{fmt(ultima.data)}</p>
                  {ultima.peso && <p className="text-white/80 text-[11px] font-bold">{ultima.peso}kg</p>}
                </div>
              </div>
            </div>
            {deltaKg !== null && (
              <div className="mt-3 rounded-2xl bg-gradient-to-r from-teal-400/10 to-sky-400/10 p-3 text-center">
                <p className="font-black text-lg grad-text">{deltaKg > 0 ? `+${deltaKg}` : deltaKg} kg</p>
                <p className="text-[11px] font-bold text-slate-400">em {deltaDias} dias de jornada - orgulho define! 💪</p>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="card !p-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-teal-400 to-sky-500 text-white flex items-center justify-center mb-3">
              <Camera size={28} />
            </div>
            <p className="font-black">Registre sua transformação</p>
            <p className="text-sm font-bold text-slate-400 mt-1">
              Adicione fotos com data e peso. Com 2 ou mais fotos, o antes/depois aparece aqui - a prova visual de que a jornada funciona.
            </p>
          </div>
        )}

        <button className="btn-primary" onClick={() => setAdicionando(true)}>
          <Plus size={18} strokeWidth={3} /> Adicionar foto de hoje
        </button>

        {/* linha do tempo */}
        {fotos.length > 0 && (
          <>
            <p className="font-black px-1 mt-1">Linha do tempo ({fotos.length} {fotos.length === 1 ? 'registro' : 'registros'})</p>
            <div className="grid grid-cols-2 gap-2">
              {[...fotos].reverse().map((f, i) => (
                <motion.div
                  key={f.id}
                  className="card !p-0 overflow-hidden relative group"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <img src={f.foto} alt={f.data} className="w-full h-44 object-cover" />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 to-transparent p-2.5">
                    <p className="text-white text-xs font-black">{fmt(f.data)} · dia {Math.max(1, diffDays(g.profile!.jornadaInicio, f.data) + 1)}</p>
                    {f.peso && (
                      <p className="text-white/85 text-[11px] font-bold flex items-center gap-1"><Scale size={11} /> {f.peso}kg</p>
                    )}
                    {f.nota && <p className="text-white/70 text-[10px] font-semibold truncate">{f.nota}</p>}
                  </div>
                  <button
                    onClick={() => setConfirmarRemover(f.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-black/45 text-white flex items-center justify-center backdrop-blur-sm"
                  >
                    <Trash2 size={15} />
                  </button>
                </motion.div>
              ))}
            </div>
          </>
        )}

        <p className="text-[11px] font-semibold text-slate-400 text-center px-4">
          Suas fotos ficam salvas apenas no seu dispositivo. Você decide se e quando compartilhar.
        </p>
      </div>

      {/* modal adicionar */}
      <Modal open={adicionando} onClose={() => setAdicionando(false)}>
        <h3 className="font-black text-lg mb-3">Nova foto de evolução</h3>
        <label className={`w-full rounded-2xl border-2 border-dashed ${foto ? 'border-teal-400' : 'border-slate-300 dark:border-white/15'} flex flex-col items-center justify-center py-6 cursor-pointer mb-3`}>
          {foto ? (
            <img src={foto} alt="preview" className="max-h-52 rounded-xl object-cover" />
          ) : (
            <>
              <ImagePlus size={30} className="text-slate-400 mb-1" />
              <p className="text-sm font-black text-slate-400">Toque para escolher a foto</p>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) setFoto(await comprimirImagem(file, 800, 0.72))
            }}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="label">Data</span>
            <input className="input" type="date" value={data} max={todayISO()} onChange={(e) => setData(e.target.value)} />
          </div>
          <div>
            <span className="label">Peso (kg)</span>
            <input className="input" type="number" step="0.1" placeholder="opcional" value={peso} onChange={(e) => setPeso(e.target.value)} />
          </div>
        </div>
        <span className="label mt-3">Anotação</span>
        <input className="input" placeholder='Ex.: "primeira semana de treino"' value={nota} onChange={(e) => setNota(e.target.value)} />
        <button className="btn-primary w-full mt-4" disabled={!foto} onClick={salvar}>
          Salvar registro
        </button>
      </Modal>

      {/* confirmar remoção */}
      <Modal open={Boolean(confirmarRemover)} onClose={() => setConfirmarRemover(null)}>
        <p className="font-black text-lg">Remover esta foto?</p>
        <p className="text-sm font-bold text-slate-400 mt-1">O registro sai da sua linha do tempo.</p>
        <div className="flex gap-2 mt-4">
          <button className="btn-ghost flex-1" onClick={() => setConfirmarRemover(null)}>Cancelar</button>
          <button
            className="btn flex-1 bg-red-500 text-white"
            onClick={() => {
              g.removeEvolucaoFoto(confirmarRemover!)
              setConfirmarRemover(null)
              toast('Foto removida')
            }}
          >
            Remover
          </button>
        </div>
      </Modal>
    </div>
  )
}
