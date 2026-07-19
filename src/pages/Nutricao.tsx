import { useState } from 'react'
import jsPDF from 'jspdf'
import { useGame } from '@/stores/game'
import { TopBar, useToast } from '@/components/ui'
import { gerarPlanoLocal, substituirItem } from '@/lib/nutrition'
import { gerarPlanoAlimentar, n8nConfigured } from '@/lib/n8n'
import type { MealPlan } from '@/types'

export default function Nutricao() {
  const g = useGame()
  const toast = useToast((s) => s.push)
  const [gosta, setGosta] = useState('')
  const [naoGosta, setNaoGosta] = useState('')
  const [refeicoesDia, setRefeicoesDia] = useState(4)
  const [gerando, setGerando] = useState(false)
  if (!g.profile) return null
  const p = g.profile
  const plano = g.mealPlan

  const gerar = async () => {
    setGerando(true)
    const payload = {
      perfil: { nome: p.nome, idade: p.idade, sexo: p.sexo, peso: p.pesoAtual, altura: p.alturaCm, objetivo: p.objetivo, metaCalorias: p.metaCalorias, restricoes: p.restricoes, alergias: p.alergias, doencas: p.doencas },
      gosta: gosta.split(',').map((s) => s.trim()).filter(Boolean),
      naoGosta: naoGosta.split(',').map((s) => s.trim()).filter(Boolean),
      refeicoesDia,
    }
    const res = await gerarPlanoAlimentar(payload)
    let novo: MealPlan
    if (res?.plano && (res.plano as MealPlan).refeicoes) {
      novo = res.plano as MealPlan
      toast('🤖 Plano gerado pela IA via n8n!')
    } else {
      novo = gerarPlanoLocal(p, { naoGosta: payload.naoGosta.concat(p.alergias), refeicoesDia })
      toast(n8nConfigured ? 'IA indisponível - plano gerado localmente (TACO)' : 'Plano gerado com a base TACO 🇧🇷', 'info')
    }
    g.setMealPlan(novo)
    setGerando(false)
  }

  const exportarPDF = () => {
    if (!plano) return
    const doc = new jsPDF()
    let y = 20
    doc.setFontSize(22).setTextColor(16, 185, 129).text('FitLevel - Plano Alimentar', 14, y)
    y += 8
    doc.setFontSize(11).setTextColor(100).text(`${p.nome} · ${p.idade} anos · Meta: ${p.metaCalorias} kcal/dia · Objetivo: ${p.objetivo.replace('_', ' ')}`, 14, y)
    y += 10
    for (const r of plano.refeicoes) {
      if (y > 260) { doc.addPage(); y = 20 }
      doc.setFontSize(14).setTextColor(6, 182, 212).text(`${r.nome} - ${r.horario}`, 14, y)
      y += 7
      doc.setFontSize(10).setTextColor(40)
      for (const item of r.itens) {
        doc.text(`• ${item.alimento} (${item.qtd}) - ${item.kcal} kcal · P ${item.prot}g · C ${item.carb}g · G ${item.gord}g`, 18, y)
        y += 6
      }
      y += 4
    }
    if (y > 240) { doc.addPage(); y = 20 }
    doc.setFontSize(13).setTextColor(139, 92, 246).text('Resumo do dia', 14, y)
    y += 7
    doc.setFontSize(10).setTextColor(40)
    doc.text(`Total: ${plano.totalKcal} kcal · Proteínas: ${plano.macros.prot}g · Carboidratos: ${plano.macros.carb}g · Gorduras: ${plano.macros.gord}g · Fibras: ~${plano.macros.fibra}g`, 14, y)
    y += 10
    doc.setFontSize(13).setTextColor(139, 92, 246).text('Recomendações', 14, y)
    y += 7
    doc.setFontSize(10).setTextColor(40)
    for (const rec of plano.recomendacoes) {
      const linhas = doc.splitTextToSize(`• ${rec}`, 180)
      doc.text(linhas, 14, y)
      y += linhas.length * 6
    }
    doc.save('evo-plano-alimentar.pdf')
    toast('📄 PDF exportado!')
  }

  return (
    <div className="min-h-screen app-bg">
      <TopBar titulo="🥗 Plano Alimentar IA" voltar />
      <div className="mx-auto max-w-lg px-4 py-4 flex flex-col gap-3 safe-bottom">
        {!plano && (
          <>
            <div className="card">
              <span className="label">Alimentos que você AMA (separe por vírgula)</span>
              <input className="input" value={gosta} onChange={(e) => setGosta(e.target.value)} placeholder="frango, banana, tapioca…" />
              <span className="label mt-3">Alimentos que você NÃO come</span>
              <input className="input" value={naoGosta} onChange={(e) => setNaoGosta(e.target.value)} placeholder="peixe, brócolis…" />
              <span className="label mt-3">Refeições por dia: <b className="text-emerald-500">{refeicoesDia}</b></span>
              <input type="range" min={3} max={5} value={refeicoesDia} onChange={(e) => setRefeicoesDia(+e.target.value)} />
              <p className="text-xs font-bold text-slate-400 mt-2">
                Suas restrições ({p.restricoes.join(', ') || 'nenhuma'}) e alergias ({p.alergias.join(', ') || 'nenhuma'}) já são consideradas automaticamente.
              </p>
            </div>
            <button className="btn-primary text-lg" disabled={gerando} onClick={gerar}>
              {gerando ? '🤖 Gerando seu plano…' : `Gerar plano de ${p.metaCalorias} kcal ✨`}
            </button>
          </>
        )}

        {plano && (
          <>
            <div className="card !p-3 grid grid-cols-4 gap-1 text-center">
              {[['🔥', `${plano.totalKcal}`, 'kcal'], ['🥩', `${plano.macros.prot}g`, 'prot'], ['🍞', `${plano.macros.carb}g`, 'carb'], ['🥑', `${plano.macros.gord}g`, 'gord']].map(([e, v, l]) => (
                <div key={l}>
                  <p className="text-lg">{e}</p>
                  <p className="font-black text-sm">{v}</p>
                  <p className="text-[9px] font-black uppercase text-slate-400">{l}</p>
                </div>
              ))}
            </div>
            {plano.refeicoes.map((r, ri) => (
              <div key={ri} className="card">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-black">{['☀️', '🕙', '🍽️', '🕓', '🌙'][ri] ?? '🍽️'} {r.nome}</h3>
                  <span className="text-xs font-black text-slate-400">{r.horario}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {r.itens.map((item, ii) => (
                    <div key={ii} className="flex items-center gap-2 rounded-2xl bg-slate-900/5 dark:bg-white/5 p-2.5">
                      <div className="flex-1">
                        <p className="font-black text-sm">{item.alimento} <span className="text-slate-400 font-bold">({item.qtd})</span></p>
                        <p className="text-[10px] font-bold text-slate-400">{item.kcal} kcal · P {item.prot}g · C {item.carb}g · G {item.gord}g</p>
                      </div>
                      <button className="chip !px-2.5 !py-1 text-xs" title="Substituir" onClick={() => g.setMealPlan(substituirItem(plano, ri, ii))}>🔄</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="card">
              <h3 className="font-black mb-1">💡 Recomendações</h3>
              {plano.recomendacoes.map((r, i) => (
                <p key={i} className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">• {r}</p>
              ))}
            </div>
            <div className="flex gap-2">
              <button className="btn-ghost flex-1" onClick={gerar} disabled={gerando}>{gerando ? '…' : '🔄 Regenerar'}</button>
              <button className="btn-primary flex-1" onClick={exportarPDF}>📄 Exportar PDF</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
