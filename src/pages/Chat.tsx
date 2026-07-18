import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Camera, ImagePlus, Send, X } from 'lucide-react'
import { useGame } from '@/stores/game'
import { TopBar, useToast } from '@/components/ui'
import { chatSaude, n8nConfigured } from '@/lib/n8n'
import { SUGESTOES_CHAT, respostaLocal } from '@/lib/chatbot'
import { comprimirImagem } from '@/lib/image'

export default function Chat() {
  const g = useGame()
  const toast = useToast((s) => s.push)
  const [texto, setTexto] = useState('')
  const [imagem, setImagem] = useState<string | null>(null)
  const [digitando, setDigitando] = useState(false)
  const fim = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: 'smooth' })
  }, [g.chat, digitando])

  const anexar = async (file: File) => {
    const b64 = await comprimirImagem(file, 900, 0.75)
    setImagem(b64)
  }

  const enviar = async (pergunta: string) => {
    if ((!pergunta.trim() && !imagem) || digitando) return
    const img = imagem
    setTexto('')
    setImagem(null)
    const conteudo = pergunta.trim() || 'Analise este prato: estime as calorias e os macros, e me diga se combina com meu objetivo.'
    g.addChat({ role: 'user', content: conteudo, imagem: img ?? undefined })
    setDigitando(true)
    const perfil = g.profile
      ? { nome: g.profile.nome, idade: g.profile.idade, peso: g.profile.pesoAtual, altura: g.profile.alturaCm, imc: g.profile.imc, objetivo: g.profile.objetivo, metaCalorias: g.profile.metaCalorias, metaAguaMl: g.profile.metaAguaMl, restricoes: g.profile.restricoes, doencas: g.profile.doencas }
      : {}
    const historico = g.chat.slice(-8).map((m) => ({ role: m.role, content: m.content }))
    const res = await chatSaude({ pergunta: conteudo, perfil, historico, imagemBase64: img ?? undefined })
    setDigitando(false)
    if (res?.resposta) {
      g.addChat({ role: 'assistant', content: res.resposta })
    } else if (img) {
      g.addChat({ role: 'assistant', content: 'Para analisar fotos de pratos eu preciso da IA conectada (n8n). Configure o workflow evo-health-chat e me envie de novo! 📸' })
      if (!n8nConfigured) toast('n8n não configurado no .env', 'info')
    } else {
      g.addChat({ role: 'assistant', content: respostaLocal(conteudo, g.profile) })
    }
  }

  return (
    <div className="min-h-screen app-bg flex flex-col">
      <TopBar titulo="FitLevel IA" />
      <div className="mx-auto max-w-lg w-full flex-1 flex flex-col px-4 py-4 safe-bottom">
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pb-4">
          {g.chat.length === 0 && (
            <div className="card text-center !p-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-teal-400 to-sky-500 text-white flex items-center justify-center mb-3">
                <Bot size={30} />
              </div>
              <p className="font-black">Oi! Sou a IA do FitLevel.</p>
              <p className="text-sm font-bold text-slate-400 mt-1">
                Pergunte sobre nutrição, treino e sono - ou envie a <b className="text-teal-500">foto do seu prato</b> 📷 que eu estimo as calorias.
                {!n8nConfigured && ' (modo offline: respostas da base TACO)'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {SUGESTOES_CHAT.map((s) => (
                  <button key={s} className="chip text-xs" onClick={() => enviar(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {g.chat.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={
                m.role === 'user'
                  ? 'self-end max-w-[85%] rounded-3xl rounded-br-md px-4 py-3 bg-gradient-to-r from-teal-400 to-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-400/20'
                  : 'self-start max-w-[85%] card !p-3 !rounded-3xl !rounded-tl-md text-sm font-bold whitespace-pre-wrap'
              }
            >
              {m.imagem && <img src={m.imagem} alt="foto enviada" className="rounded-2xl mb-2 max-h-48 w-full object-cover" />}
              {m.content}
            </motion.div>
          ))}
          {digitando && (
            <div className="self-start card !p-3 !rounded-3xl text-sm font-black text-slate-400 animate-pulse">
              FitLevel IA está digitando…
            </div>
          )}
          <div ref={fim} />
        </div>

        {/* pré-visualização da imagem anexada */}
        {imagem && (
          <div className="mb-2 relative w-24">
            <img src={imagem} alt="anexo" className="w-24 h-24 object-cover rounded-2xl border-2 border-teal-400" />
            <button
              onClick={() => setImagem(null)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
            >
              <X size={14} strokeWidth={3} />
            </button>
          </div>
        )}

        <div className="flex gap-2 sticky bottom-24">
          <label className="btn-ghost !px-3.5 cursor-pointer" title="Enviar foto do prato">
            {imagem ? <Camera size={20} className="text-teal-500" /> : <ImagePlus size={20} />}
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && anexar(e.target.files[0])} />
          </label>
          <input
            className="input flex-1"
            placeholder={imagem ? 'Comente a foto (opcional)…' : 'Pergunte algo sobre saúde…'}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && enviar(texto)}
          />
          <button className="btn-primary !px-4" onClick={() => enviar(texto)} disabled={digitando}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
