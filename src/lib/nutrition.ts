import type { MealPlan, Profile, Refeicao } from '@/types'
import { TACO, type Alimento } from '@/data/taco'

/**
 * Gerador local de plano alimentar (fallback quando o n8n/IA está offline).
 * Distribui a meta calórica em refeições com alimentos da TACO,
 * respeitando exclusões (não gosta / alergias / restrições).
 */
export function gerarPlanoLocal(
  perfil: Profile,
  opts: { naoGosta: string[]; refeicoesDia: number },
): MealPlan {
  const excluir = opts.naoGosta.map((s) => s.toLowerCase())
  const permitidos = TACO.filter((a) => !excluir.some((e) => e && a.nome.toLowerCase().includes(e)))
  const pick = (grupo: Alimento['grupo'], idx: number): Alimento => {
    const doGrupo = permitidos.filter((a) => a.grupo === grupo)
    return doGrupo[idx % doGrupo.length] ?? permitidos[0]
  }

  const meta = perfil.metaCalorias
  const fator = (kcalAlvo: number, alimento: Alimento) => Math.round((kcalAlvo / alimento.kcal) * 100)

  const montar = (nome: string, horario: string, kcalAlvo: number, grupos: Alimento['grupo'][], seed: number): Refeicao => {
    const porItem = kcalAlvo / grupos.length
    return {
      nome,
      horario,
      itens: grupos.map((g, i) => {
        const a = pick(g, seed + i)
        const g100 = fator(porItem, a)
        const m = g100 / 100
        return {
          alimento: a.nome,
          qtd: `${g100}g`,
          kcal: Math.round(a.kcal * m),
          prot: +(a.prot * m).toFixed(1),
          carb: +(a.carb * m).toFixed(1),
          gord: +(a.gord * m).toFixed(1),
        }
      }),
    }
  }

  const refeicoes: Refeicao[] = [
    montar('Café da manhã', '07:00', meta * 0.25, ['carbo', 'laticinio', 'fruta'], 1),
    montar('Almoço', '12:30', meta * 0.35, ['proteina', 'carbo', 'verdura'], 2),
    montar('Jantar', '19:30', meta * 0.25, ['proteina', 'verdura', 'carbo'], 5),
  ]
  if (opts.refeicoesDia >= 4) refeicoes.splice(2, 0, montar('Lanche da tarde', '16:00', meta * 0.15, ['fruta', 'gordura'], 3))
  if (opts.refeicoesDia >= 5) refeicoes.splice(1, 0, montar('Lanche da manhã', '10:00', meta * 0.1, ['fruta', 'laticinio'], 4))

  const soma = (k: 'kcal' | 'prot' | 'carb' | 'gord') =>
    Math.round(refeicoes.reduce((s, r) => s + r.itens.reduce((si, i) => si + (i[k] as number), 0), 0))

  return {
    objetivo: perfil.objetivo,
    totalKcal: soma('kcal'),
    macros: { prot: soma('prot'), carb: soma('carb'), gord: soma('gord'), fibra: 25 },
    refeicoes,
    recomendacoes: [
      `Beba ${(perfil.metaAguaMl / 1000).toFixed(1)}L de água por dia.`,
      'Priorize comida de verdade; deixe ultraprocessados para exceções.',
      perfil.objetivo === 'perder_peso'
        ? 'Mantenha o déficit de ~400 kcal — perda saudável de 0,5kg/semana.'
        : 'Proteína distribuída ao longo do dia otimiza a síntese muscular.',
      'Este plano é uma sugestão gerada por algoritmo e não substitui um nutricionista.',
    ],
  }
}

/** Troca um item da refeição por outro do mesmo grupo */
export function substituirItem(plano: MealPlan, refIdx: number, itemIdx: number): MealPlan {
  const item = plano.refeicoes[refIdx].itens[itemIdx]
  const atual = TACO.find((a) => a.nome === item.alimento)
  if (!atual) return plano
  const opcoes = TACO.filter((a) => a.grupo === atual.grupo && a.nome !== atual.nome)
  if (!opcoes.length) return plano
  const novo = opcoes[Math.floor(Math.random() * opcoes.length)]
  const g = parseInt(item.qtd) || 100
  const kcalAlvo = item.kcal
  const g100 = Math.round((kcalAlvo / novo.kcal) * 100) || g
  const m = g100 / 100
  const clone: MealPlan = JSON.parse(JSON.stringify(plano))
  clone.refeicoes[refIdx].itens[itemIdx] = {
    alimento: novo.nome,
    qtd: `${g100}g`,
    kcal: Math.round(novo.kcal * m),
    prot: +(novo.prot * m).toFixed(1),
    carb: +(novo.carb * m).toFixed(1),
    gord: +(novo.gord * m).toFixed(1),
  }
  return clone
}
