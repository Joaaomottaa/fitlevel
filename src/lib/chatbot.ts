import type { Profile } from '@/types'
import { buscarAlimento, TACO } from '@/data/taco'
import { classificaIMC } from './health'

/**
 * Chatbot local (fallback) - responde com base na TACO e no perfil.
 * Quando o n8n está configurado, a resposta vem da IA com este mesmo contexto.
 */
export function respostaLocal(pergunta: string, perfil: Profile | null): string {
  const q = pergunta.toLowerCase()

  // caloria de alimento
  if (q.includes('caloria') || q.includes('kcal') || q.includes('quanto tem')) {
    for (const a of TACO) {
      const chave = a.nome.toLowerCase().split(' ')[0]
      if (chave.length > 3 && q.includes(chave)) {
        return `${a.nome} tem ${a.kcal} kcal por 100g - ${a.prot}g de proteína, ${a.carb}g de carboidratos, ${a.gord}g de gorduras e ${a.fibra}g de fibras (fonte: Tabela TACO/UNICAMP). 🍽️`
      }
    }
  }

  if (q.includes('fibra')) {
    const top = [...TACO].sort((x, y) => y.fibra - x.fibra).slice(0, 3)
    return `Os campeões de fibra da nossa base são: ${top.map((a) => `${a.nome} (${a.fibra}g/100g)`).join(', ')}. Fibras melhoram saciedade, intestino e glicemia! 🌾`
  }

  if (q.includes('proteína') || q.includes('proteina')) {
    const meta = perfil ? Math.round(perfil.pesoAtual * 1.8) : null
    return meta
      ? `Para o seu peso (${perfil!.pesoAtual}kg) e objetivo, a recomendação geral é de 1,6 a 2,2g de proteína por kg - cerca de ${meta}g/dia. Boas fontes: frango, ovos, tilápia, whey e leguminosas. 💪`
      : 'A recomendação geral é de 1,6 a 2,2g de proteína por kg de peso corporal para quem treina. Complete seu perfil para eu personalizar!'
  }

  if (q.includes('imc')) {
    if (perfil) {
      const c = classificaIMC(perfil.imc)
      return `IMC = peso ÷ altura². O seu é ${perfil.imc} (${c.rotulo}). Ele é um indicador de triagem - massa muscular e circunferência abdominal completam a foto. 📏`
    }
    return 'IMC = peso (kg) ÷ altura² (m). Ex.: 80kg e 1,75m → 80 ÷ 3,06 = 26,1 (sobrepeso leve).'
  }

  if (q.includes('sono') || q.includes('dormir')) {
    return 'Para melhorar o sono: horários fixos (mesmo no fim de semana), zero telas 1h antes, quarto escuro e fresco, cafeína só até 14h e exercício regular - mas não perto da hora de deitar. 😴'
  }

  if (q.includes('emagrecer') || q.includes('perder peso') || q.includes('treino')) {
    return 'Para emagrecer, o que manda é o déficit calórico sustentado. O treino ideal combina musculação 3-4x/semana (preserva músculo e acelera metabolismo) + cardio 2-3x (caminhada rápida, corrida leve, bike). Constância > intensidade! 🏃'
  }

  if (q.includes('água') || q.includes('agua') || q.includes('hidrat')) {
    const meta = perfil ? (perfil.metaAguaMl / 1000).toFixed(1) : '2 a 3'
    return `Sua meta é de ${meta}L por dia (35ml por kg de peso). Dica: uma garrafa de 1L sempre à vista dobra sua chance de bater a meta. 💧`
  }

  const alimento = buscarAlimento(q.replace(/[?.,!]/g, '').split(' ').filter((w) => w.length > 4).pop() ?? '')
  if (alimento) {
    return `${alimento.nome}: ${alimento.kcal} kcal, ${alimento.prot}g proteína, ${alimento.carb}g carboidrato, ${alimento.gord}g gordura por 100g (TACO/UNICAMP).`
  }

  return 'Posso te ajudar com calorias de alimentos, metas de proteína e água, IMC, sono, treino e hábitos! Experimente: "Quantas calorias tem 100g de arroz?" 🤖\n\n⚠️ Sou um assistente informativo - não substituo médico ou nutricionista.'
}

export const SUGESTOES_CHAT = [
  'Quantas calorias tem arroz branco?',
  'Quanta proteína devo comer?',
  'Como melhorar meu sono?',
  'Qual treino ajuda a emagrecer?',
  'Qual alimento tem mais fibras?',
]
