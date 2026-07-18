import type { Profile, RiskFactor } from '@/types'
import { clamp } from './utils'

export function calcIMC(pesoKg: number, alturaCm: number): number {
  const m = alturaCm / 100
  return +(pesoKg / (m * m)).toFixed(1)
}

export function classificaIMC(imc: number): { rotulo: string; cor: string } {
  if (imc < 18.5) return { rotulo: 'Abaixo do peso', cor: '#06b6d4' }
  if (imc < 25) return { rotulo: 'Peso saudável', cor: '#10b981' }
  if (imc < 30) return { rotulo: 'Sobrepeso', cor: '#f59e0b' }
  if (imc < 35) return { rotulo: 'Obesidade I', cor: '#f97316' }
  if (imc < 40) return { rotulo: 'Obesidade II', cor: '#ef4444' }
  return { rotulo: 'Obesidade III', cor: '#dc2626' }
}

/** TMB por Mifflin-St Jeor — mais precisa que Harris-Benedict */
export function calcTMB(sexo: string, pesoKg: number, alturaCm: number, idade: number): number {
  const base = 10 * pesoKg + 6.25 * alturaCm - 5 * idade
  return Math.round(sexo === 'F' ? base - 161 : base + 5)
}

export function calcGastoCalorico(tmb: number, fatorAtividade: number): number {
  return Math.round(tmb * fatorAtividade)
}

export function calcMetaCalorias(gasto: number, objetivo: string): number {
  if (objetivo === 'perder_peso') return gasto - 400
  if (objetivo === 'ganhar_massa') return gasto + 300
  return gasto
}

/** 35 ml por kg de peso corporal */
export function calcMetaAgua(pesoKg: number): number {
  return Math.round((pesoKg * 35) / 100) * 100
}

/** Score de Saúde inicial (0–100) a partir do onboarding */
export function calcHealthScoreInicial(p: {
  imc: number
  fumante: boolean
  alcool: string
  sonoHoras: number
  nivelAtividade: number
  aguaLitros: number
  habitosAlimentares: string
  pressao: string
  glicemia: string
  colesterol: string
}): number {
  let score = 100
  // IMC: penalidade proporcional à distância da faixa saudável
  if (p.imc >= 25) score -= clamp((p.imc - 25) * 3, 4, 25)
  else if (p.imc < 18.5) score -= clamp((18.5 - p.imc) * 3, 4, 15)
  if (p.fumante) score -= 15
  if (p.alcool === 'frequente') score -= 10
  else if (p.alcool === 'social') score -= 3
  if (p.sonoHoras < 6) score -= 12
  else if (p.sonoHoras < 7) score -= 6
  if (p.nivelAtividade <= 1.3) score -= 12
  else if (p.nivelAtividade <= 1.45) score -= 6
  if (p.aguaLitros < 1.5) score -= 6
  if (p.habitosAlimentares === 'ruim') score -= 10
  else if (p.habitosAlimentares === 'medio') score -= 4
  if (p.pressao === 'alta') score -= 6
  if (p.glicemia === 'alta') score -= 6
  if (p.colesterol === 'alto') score -= 6
  return clamp(Math.round(score), 10, 95)
}

/** Fatores de risco no estilo "nível de cuidado" (0 ótimo → 4 crítico) */
export function calcRiskFactors(p: Profile): RiskFactor[] {
  const out: RiskFactor[] = []
  const imcNivel = p.imc < 25 ? 0 : p.imc < 27.5 ? 1 : p.imc < 30 ? 2 : p.imc < 35 ? 3 : 4
  out.push({
    nome: 'Peso corporal',
    icone: '⚖️',
    nivel: imcNivel,
    dica:
      imcNivel === 0
        ? 'Seu IMC está na faixa saudável. Continue assim!'
        : 'Déficit calórico moderado + atividade regular derrubam esse indicador.',
  })
  out.push({
    nome: 'Tabagismo',
    icone: '🚭',
    nivel: p.fumante ? 4 : 0,
    dica: p.fumante
      ? 'Parar de fumar é a ação de maior impacto na sua saúde. Busque apoio!'
      : 'Livre do cigarro — excelente para coração e pulmões.',
  })
  const sedNivel = p.nivelAtividade <= 1.25 ? 3 : p.nivelAtividade <= 1.45 ? 2 : p.nivelAtividade <= 1.6 ? 1 : 0
  out.push({
    nome: 'Atividade física',
    icone: '🏃',
    nivel: sedNivel,
    dica: sedNivel > 1 ? 'Comece com 20 min de caminhada por dia — as missões vão te guiar.' : 'Bom nível de movimento!',
  })
  const sonoNivel = p.sonoHoras >= 7.5 ? 0 : p.sonoHoras >= 7 ? 1 : p.sonoHoras >= 6 ? 2 : 3
  out.push({
    nome: 'Sono',
    icone: '😴',
    nivel: sonoNivel,
    dica: sonoNivel > 1 ? 'Durma e acorde em horários fixos; evite telas 1h antes de deitar.' : 'Sono em dia!',
  })
  const aguaNivel = p.aguaLitros >= 2 ? 0 : p.aguaLitros >= 1.5 ? 1 : p.aguaLitros >= 1 ? 2 : 3
  out.push({
    nome: 'Hidratação',
    icone: '💧',
    nivel: aguaNivel,
    dica: aguaNivel > 0 ? `Sua meta é ${(p.metaAguaMl / 1000).toFixed(1)}L/dia. Ande com uma garrafa!` : 'Hidratação ótima.',
  })
  const aliNivel = p.habitosAlimentares === 'bom' ? 0 : p.habitosAlimentares === 'medio' ? 2 : 3
  out.push({
    nome: 'Alimentação',
    icone: '🥗',
    nivel: aliNivel,
    dica: aliNivel > 1 ? 'Troque ultraprocessados por comida de verdade. O plano alimentar IA ajuda.' : 'Alimentação equilibrada.',
  })
  const alcNivel = p.alcool === 'frequente' ? 3 : p.alcool === 'social' ? 1 : 0
  out.push({
    nome: 'Álcool',
    icone: '🍺',
    nivel: alcNivel,
    dica: alcNivel > 1 ? 'Reduza a frequência — álcool atrapalha sono, treino e emagrecimento.' : 'Consumo sob controle.',
  })
  return out
}

export const NIVEL_CUIDADO_LABEL = ['Ótimo', 'Atenção leve', 'Precisa melhorar', 'Alto cuidado', 'Crítico']
export const NIVEL_CUIDADO_COR = ['#10b981', '#a3e635', '#f59e0b', '#f97316', '#ef4444']
