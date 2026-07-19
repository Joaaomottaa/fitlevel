import jsPDF from 'jspdf'
import type { DailyCheckin, Profile } from '@/types'
import { avgScore } from './gamification'
import { NIVEL_CUIDADO_COR, NIVEL_CUIDADO_LABEL, calcRiskFactors, classificaIMC } from './health'
import { fmtNum } from './utils'

type RGB = [number, number, number]
const TEAL: RGB = [16, 185, 129]
const CYAN: RGB = [6, 182, 212]
const VIOLET: RGB = [139, 92, 246]
const SLATE: RGB = [100, 116, 139]
const DARK: RGB = [30, 41, 59]

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

interface ReportData {
  profile: Profile
  checkins: Record<string, DailyCheckin>
  scoreSaude: number
  streak: number
  hoje: string
  diaJornada: number
}

/** Gera um relatório de saúde em PDF, formatado e com identidade FitLevel. */
export function gerarRelatorioSaude({ profile: p, checkins, scoreSaude, streak, hoje, diaJornada }: ReportData) {
  const doc = new jsPDF()
  const W = doc.internal.pageSize.getWidth()
  const M = 16
  const media7 = avgScore(checkins, 7, hoje)
  const media30 = avgScore(checkins, 30, hoje)
  const imcInfo = classificaIMC(p.imc)
  const riscos = calcRiskFactors(p)

  // ---- Cabeçalho ----
  doc.setFillColor(...TEAL)
  doc.rect(0, 0, W, 34, 'F')
  doc.setFillColor(...CYAN)
  doc.rect(0, 30, W, 4, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold').setFontSize(24)
  doc.text('FitLevel', M, 17)
  doc.setFont('helvetica', 'normal').setFontSize(11)
  doc.text('Relatório de Saúde', M, 25)
  doc.setFontSize(9)
  const dataFmt = new Date(hoje + 'T12:00:00').toLocaleDateString('pt-BR')
  doc.text(`Emitido em ${dataFmt}`, W - M, 17, { align: 'right' })
  doc.text(`Dia ${diaJornada} de 100`, W - M, 24, { align: 'right' })

  let y = 46

  // ---- Identificação ----
  doc.setTextColor(...DARK).setFont('helvetica', 'bold').setFontSize(15)
  doc.text(p.nome || 'Usuário', M, y)
  y += 6
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(...SLATE)
  const sexoLabel = p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Feminino' : 'Outro'
  const objLabel = p.objetivo.replace(/_/g, ' ')
  doc.text(`${p.idade} anos  ·  ${sexoLabel}  ·  ${p.alturaCm} cm  ·  Objetivo: ${objLabel}`, M, y)
  y += 10

  // ---- Cartões de score ----
  const cardW = (W - M * 2 - 8) / 3
  const cards: { label: string; valor: string; cor: RGB }[] = [
    { label: 'SCORE GERAL', valor: String(scoreSaude), cor: TEAL },
    { label: 'MÉDIA 7 DIAS', valor: media7 ? String(media7) : '-', cor: CYAN },
    { label: 'MÉDIA 30 DIAS', valor: media30 ? String(media30) : '-', cor: VIOLET },
  ]
  cards.forEach((c, i) => {
    const x = M + i * (cardW + 4)
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(x, y, cardW, 24, 3, 3, 'F')
    doc.setTextColor(...c.cor).setFont('helvetica', 'bold').setFontSize(20)
    doc.text(c.valor, x + cardW / 2, y + 13, { align: 'center' })
    doc.setTextColor(...SLATE).setFont('helvetica', 'bold').setFontSize(7)
    doc.text(c.label, x + cardW / 2, y + 20, { align: 'center' })
  })
  y += 34

  // ---- Indicadores clínicos ----
  y = secao(doc, 'Indicadores calculados', M, y, W)
  const inds: [string, string, string][] = [
    ['IMC', `${p.imc}`, imcInfo.rotulo],
    ['TMB (Mifflin-St Jeor)', `${fmtNum(p.tmb)} kcal`, 'metabolismo basal'],
    ['Gasto diário', `${fmtNum(p.gastoCalorico)} kcal`, 'com atividade'],
    ['Meta calórica', `${fmtNum(p.metaCalorias)} kcal`, objLabel],
  ]
  const iW = (W - M * 2 - 6) / 2
  inds.forEach(([label, valor, sub], i) => {
    const x = M + (i % 2) * (iW + 6)
    const row = Math.floor(i / 2)
    const iy = y + row * 20
    doc.setDrawColor(226, 232, 240).setFillColor(255, 255, 255)
    doc.roundedRect(x, iy, iW, 16, 2, 2, 'S')
    doc.setTextColor(...SLATE).setFont('helvetica', 'bold').setFontSize(7)
    doc.text(label.toUpperCase(), x + 4, iy + 5)
    doc.setTextColor(...DARK).setFont('helvetica', 'bold').setFontSize(12)
    doc.text(valor, x + 4, iy + 11.5)
    doc.setTextColor(...SLATE).setFont('helvetica', 'normal').setFontSize(7)
    doc.text(sub, x + iW - 4, iy + 11.5, { align: 'right' })
  })
  y += 44

  // ---- Peso + streak ----
  y = secao(doc, 'Progresso', M, y, W)
  const perdido = p.pesoInicial - p.pesoAtual
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(M, y, W - M * 2, 18, 3, 3, 'F')
  doc.setTextColor(...DARK).setFont('helvetica', 'bold').setFontSize(11)
  doc.text(`Peso: ${p.pesoAtual} kg`, M + 5, y + 8)
  doc.setTextColor(...SLATE).setFont('helvetica', 'normal').setFontSize(9)
  doc.text(`Inicial ${p.pesoInicial} kg  ·  Meta ${p.pesoMeta} kg`, M + 5, y + 14)
  doc.setTextColor(...(perdido > 0 ? TEAL : SLATE)).setFont('helvetica', 'bold').setFontSize(10)
  const perdaTxt = perdido > 0 ? `-${perdido.toFixed(1)} kg alcançados` : 'Registre seu progresso'
  doc.text(perdaTxt, W - M - 5, y + 8, { align: 'right' })
  doc.setTextColor(...VIOLET).setFont('helvetica', 'bold').setFontSize(10)
  doc.text(`Streak: ${streak} ${streak === 1 ? 'dia' : 'dias'}`, W - M - 5, y + 14, { align: 'right' })
  y += 28

  // ---- Fatores de risco ----
  y = secao(doc, 'Nível de cuidado por fator', M, y, W)
  riscos.forEach((r) => {
    if (y > 250) { doc.addPage(); y = 20 }
    const cor = hexToRgb(NIVEL_CUIDADO_COR[r.nivel])
    doc.setTextColor(...DARK).setFont('helvetica', 'bold').setFontSize(10)
    doc.text(r.nome, M, y)
    doc.setTextColor(...cor).setFont('helvetica', 'bold').setFontSize(8)
    doc.text(NIVEL_CUIDADO_LABEL[r.nivel].toUpperCase(), W - M, y, { align: 'right' })
    // barra de nível (0–4)
    const barY = y + 2.5
    const segW = (W - M * 2) / 5 - 2
    for (let n = 0; n < 5; n++) {
      if (n <= r.nivel) doc.setFillColor(...cor)
      else doc.setFillColor(226, 232, 240)
      doc.roundedRect(M + n * (segW + 2), barY, segW, 3, 1, 1, 'F')
    }
    y += 9
    doc.setTextColor(...SLATE).setFont('helvetica', 'normal').setFontSize(8)
    const dica = doc.splitTextToSize(r.dica, W - M * 2)
    doc.text(dica, M, y)
    y += dica.length * 4 + 4
  })

  // ---- Rodapé ----
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    const H = doc.internal.pageSize.getHeight()
    doc.setDrawColor(226, 232, 240).line(M, H - 16, W - M, H - 16)
    doc.setTextColor(...SLATE).setFont('helvetica', 'normal').setFontSize(7)
    doc.text('Indicadores informativos calculados por formulas validadas - nao substituem avaliacao medica.', M, H - 11)
    doc.text('FitLevel · Hackathon Orbita 2026', M, H - 7)
    doc.text(`${i}/${pages}`, W - M, H - 7, { align: 'right' })
  }

  const nomeArquivo = `relatorio-saude-${(p.nome || 'fitlevel').toLowerCase().replace(/\s+/g, '-')}.pdf`
  doc.save(nomeArquivo)
}

function secao(doc: jsPDF, titulo: string, M: number, y: number, W: number): number {
  doc.setFillColor(...TEAL)
  doc.rect(M, y - 3.5, 3, 5, 'F')
  doc.setTextColor(...DARK).setFont('helvetica', 'bold').setFontSize(12)
  doc.text(titulo, M + 6, y)
  y += 7
  doc.setDrawColor(...TEAL).setLineWidth(0.3).line(M, y - 3, W - M, y - 3)
  return y + 2
}
