import type { CheckinAnswers, DailyCheckin } from '@/types'
import { clamp } from './utils'

/**
 * SCORE DIÁRIO (0–100) — a lógica central exigida pelo desafio.
 * sono 25 · hidratação 15 · exercício 25 · alimentação 25 · bem-estar 10
 */
export function calcDailyScore(a: CheckinAnswers, metaAguaMl: number): number {
  const sono = 25 * Math.min(a.sonoHoras / 8, 1) * (a.sonoQualidade / 5)
  const agua = 15 * Math.min(a.aguaMl / metaAguaMl, 1)
  const exercicio = 25 * Math.min(a.exercicioMin / 30, 1)
  let alimentacao = 15 // base
  if (a.acucar) alimentacao -= 7
  if (a.gordura) alimentacao -= 7
  if (a.comeuFrutas) alimentacao += 5
  if (a.comeuVerduras) alimentacao += 5
  alimentacao += Math.min(a.refeicoesRegistradas, 4) * 1.25
  alimentacao = clamp(alimentacao, 0, 25)
  const bemEstar = ((a.humor + (6 - a.estresse)) / 10) * 10
  return clamp(Math.round(sono + agua + exercicio + alimentacao + bemEstar), 0, 100)
}

export function xpForCheckin(score: number): number {
  return 50 + Math.round(score / 2)
}

export function coinsForXp(xp: number): number {
  return Math.max(1, Math.round(xp / 3))
}

/** Curva de nível suave: sobe rápido no início (retenção), desacelera depois */
export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

export function xpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100
}

export function levelProgress(xp: number): { level: number; pct: number; toNext: number } {
  const level = levelFromXp(xp)
  const base = xpForLevel(level)
  const next = xpForLevel(level + 1)
  return { level, pct: Math.round(((xp - base) / (next - base)) * 100), toNext: next - xp }
}

/** Média dos últimos N dias de check-in */
export function avgScore(checkins: Record<string, DailyCheckin>, lastNDays: number, refDate: string): number {
  const dates = Object.keys(checkins).filter((d) => d <= refDate).sort().slice(-lastNDays)
  if (!dates.length) return 0
  return Math.round(dates.reduce((s, d) => s + checkins[d].score, 0) / dates.length)
}

/** Health Score global = média dos últimos 14 dias (mede consistência) */
export function healthScore(checkins: Record<string, DailyCheckin>, inicial: number, refDate: string): number {
  const media = avgScore(checkins, 14, refDate)
  if (!media) return inicial
  // converge do score inicial para a média conforme acumula dados
  const n = Math.min(Object.keys(checkins).length, 14)
  return Math.round((inicial * (14 - n) + media * n) / 14)
}

/**
 * ESTÁGIOS DE EVOLUÇÃO DO AVATAR — tempo + consistência.
 * O avatar nunca regride de corpo (empatia retém; vergonha desengaja).
 */
const STAGES: { estagio: 1 | 2 | 3 | 4 | 5; dia: number; media: number }[] = [
  { estagio: 5, dia: 95, media: 75 },
  { estagio: 4, dia: 70, media: 70 },
  { estagio: 3, dia: 40, media: 60 },
  { estagio: 2, dia: 15, media: 50 },
  { estagio: 1, dia: 0, media: 0 },
]

export function stageFor(dia: number, media7: number): 1 | 2 | 3 | 4 | 5 {
  for (const s of STAGES) {
    if (dia >= s.dia && media7 >= s.media) return s.estagio
  }
  return 1
}

export const STAGE_INFO: Record<number, { nome: string; desc: string }> = {
  1: { nome: 'Início', desc: 'Todo herói começa de algum lugar. Vamos juntos!' },
  2: { nome: 'Despertar', desc: 'A postura muda, a energia aparece. Os hábitos estão nascendo.' },
  3: { nome: 'Transformação', desc: 'A mudança já é visível no espelho. Não pare!' },
  4: { nome: 'Boa forma', desc: 'Força, energia e constância. Você virou referência.' },
  5: { nome: 'Campeão', desc: '100 dias de jornada. Você reescreveu seus hábitos! 🏆' },
}

/** Streak: dias consecutivos com check-in, terminando hoje ou ontem */
export function calcStreak(checkins: Record<string, DailyCheckin>, refDate: string): number {
  let streak = 0
  let cursor = refDate
  if (!checkins[cursor]) {
    const d = new Date(cursor + 'T12:00:00')
    d.setDate(d.getDate() - 1)
    cursor = d.toISOString().slice(0, 10)
  }
  while (checkins[cursor]) {
    streak++
    const d = new Date(cursor + 'T12:00:00')
    d.setDate(d.getDate() - 1)
    cursor = d.toISOString().slice(0, 10)
  }
  return streak
}

/** Humor do avatar derivado do último check-in */
export function humorFromScore(score: number): 'feliz' | 'neutro' | 'triste' | 'cansado' | 'energico' {
  if (score >= 85) return 'energico'
  if (score >= 65) return 'feliz'
  if (score >= 45) return 'neutro'
  if (score >= 30) return 'cansado'
  return 'triste'
}

/** Feedback local instantâneo (o n8n substitui por IA quando configurado) */
export function feedbackLocal(score: number, streak: number, nome: string): string {
  const primeiro = nome.split(' ')[0]
  if (score >= 85)
    return `${primeiro}, dia impecável! 🔥 Score ${score} — seu avatar está radiante. Streak de ${streak} ${streak === 1 ? 'dia' : 'dias'}!`
  if (score >= 65)
    return `Ótimo trabalho, ${primeiro}! Score ${score}. Consistência constrói transformação — continue amanhã!`
  if (score >= 45)
    return `Dia ok, ${primeiro}. Score ${score}. Que tal caprichar na água e no sono amanhã? Seu avatar acredita em você!`
  return `${primeiro}, dias difíceis acontecem. 💙 Score ${score}. Amanhã é uma página nova — seu avatar continua ao seu lado.`
}
