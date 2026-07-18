import type { Mission, Profile } from '@/types'

/**
 * Pool de missões - os ícones são chaves do mapa lucide em components/icons.tsx.
 * As missões do dia são sorteadas priorizando os PONTOS FRACOS detectados
 * no onboarding (água, sono, exercício, alimentação, tabagismo, álcool...).
 */
export const MISSIONS: Mission[] = [
  // água
  { id: 'agua-2l', titulo: 'Beber 2L de água', desc: 'Hidratação completa hoje', icone: 'agua', categoria: 'agua', xp: 30, moedas: 10, freq: 'diaria' },
  { id: 'agua-acordar', titulo: 'Copo de água ao acordar', desc: 'Comece o dia hidratado', icone: 'agua', categoria: 'agua', xp: 15, moedas: 5, freq: 'diaria' },
  { id: 'agua-garrafa', titulo: 'Andar com garrafa de água', desc: 'Deixe a água sempre à vista', icone: 'agua', categoria: 'agua', xp: 20, moedas: 6, freq: 'diaria' },
  // sono
  { id: 'sono-8h', titulo: 'Dormir 8 horas', desc: 'Uma noite completa de sono', icone: 'sono', categoria: 'sono', xp: 40, moedas: 12, freq: 'diaria' },
  { id: 'sem-tela', titulo: 'Sem telas 1h antes de dormir', desc: 'Desconexão noturna', icone: 'semtela', categoria: 'sono', xp: 30, moedas: 10, freq: 'diaria' },
  { id: 'sono-horario', titulo: 'Deitar no horário planejado', desc: 'Rotina fixa regula o sono', icone: 'calendario', categoria: 'sono', xp: 25, moedas: 8, freq: 'diaria' },
  { id: 'sem-cafeina', titulo: 'Zero cafeína após as 15h', desc: 'Proteja seu sono profundo', icone: 'timer', categoria: 'sono', xp: 20, moedas: 7, freq: 'diaria' },
  // exercício
  { id: 'passos-5k', titulo: 'Caminhar 5 mil passos', desc: 'Movimente-se ao longo do dia', icone: 'passos', categoria: 'exercicio', xp: 40, moedas: 12, freq: 'diaria' },
  { id: 'musculacao', titulo: 'Fazer musculação', desc: 'Treino de força de 30+ min', icone: 'musculacao', categoria: 'exercicio', xp: 60, moedas: 20, freq: 'diaria' },
  { id: 'alongar', titulo: 'Alongar por 10 min', desc: 'Mobilidade e postura', icone: 'alongar', categoria: 'exercicio', xp: 25, moedas: 8, freq: 'diaria' },
  { id: 'escada', titulo: 'Usar escadas hoje', desc: 'Troque o elevador pela escada', icone: 'escada', categoria: 'exercicio', xp: 20, moedas: 6, freq: 'diaria' },
  { id: 'cardio-20', titulo: '20 min de cardio', desc: 'Corrida, bike ou caminhada rápida', icone: 'coracao', categoria: 'exercicio', xp: 45, moedas: 14, freq: 'diaria' },
  { id: 'pausa-ativa', titulo: 'Pausa ativa no trabalho', desc: 'Levante a cada 1h sentado', icone: 'timer', categoria: 'exercicio', xp: 15, moedas: 5, freq: 'diaria' },
  // alimentação
  { id: 'frutas', titulo: 'Comer 2 frutas', desc: 'Vitaminas e fibras naturais', icone: 'fruta', categoria: 'alimentacao', xp: 25, moedas: 8, freq: 'diaria' },
  { id: 'sem-refri', titulo: 'Zero refrigerante', desc: 'Um dia sem açúcar líquido', icone: 'refri', categoria: 'alimentacao', xp: 35, moedas: 10, freq: 'diaria' },
  { id: 'verduras', titulo: 'Salada em 1 refeição', desc: 'Verduras no prato', icone: 'verdura', categoria: 'alimentacao', xp: 25, moedas: 8, freq: 'diaria' },
  { id: 'registrar', titulo: 'Registrar as refeições', desc: 'Anote tudo o que comeu', icone: 'registrar', categoria: 'alimentacao', xp: 20, moedas: 6, freq: 'diaria' },
  { id: 'sem-doce', titulo: 'Dia sem doces', desc: 'Vença a vontade de açúcar', icone: 'refri', categoria: 'alimentacao', xp: 35, moedas: 12, freq: 'diaria' },
  { id: 'proteina-cafe', titulo: 'Proteína no café da manhã', desc: 'Ovos, iogurte ou whey', icone: 'fruta', categoria: 'alimentacao', xp: 25, moedas: 8, freq: 'diaria' },
  { id: 'sem-fritura', titulo: 'Zero frituras hoje', desc: 'Prefira assado ou grelhado', icone: 'verdura', categoria: 'alimentacao', xp: 30, moedas: 10, freq: 'diaria' },
  // mental
  { id: 'meditar', titulo: 'Meditar 10 min', desc: 'Cuide da mente', icone: 'meditar', categoria: 'mental', xp: 30, moedas: 10, freq: 'diaria' },
  { id: 'gratidao', titulo: 'Anotar 3 gratidões', desc: 'Treino de positividade', icone: 'registrar', categoria: 'mental', xp: 20, moedas: 7, freq: 'diaria' },
  { id: 'respiracao', titulo: '5 min de respiração profunda', desc: 'Reduza o estresse agora', icone: 'meditar', categoria: 'mental', xp: 15, moedas: 5, freq: 'diaria' },
  // hábitos específicos (entram quando detectados no onboarding)
  { id: 'sem-cigarro', titulo: 'Dia sem cigarro', desc: 'A missão mais valiosa de todas', icone: 'cigarro', categoria: 'tabagismo', xp: 80, moedas: 25, freq: 'diaria' },
  { id: 'sem-alcool', titulo: 'Dia sem álcool', desc: 'Seu fígado e seu sono agradecem', icone: 'alcool', categoria: 'alcool', xp: 50, moedas: 15, freq: 'diaria' },
  // semanais
  { id: 'treino-3x', titulo: 'Treinar 3x na semana', desc: 'Constância vence intensidade', icone: 'calendario', categoria: 'exercicio', xp: 120, moedas: 40, freq: 'semanal' },
  { id: 'peso-semana', titulo: 'Registrar o peso da semana', desc: 'Acompanhe sua evolução', icone: 'peso', categoria: 'alimentacao', xp: 50, moedas: 15, freq: 'semanal' },
  { id: 'foto-evolucao', titulo: 'Foto de evolução da semana', desc: 'Registre a transformação', icone: 'camera', categoria: 'social', xp: 60, moedas: 20, freq: 'semanal' },
  { id: 'amigo-desafio', titulo: 'Desafiar um amigo', desc: 'Convide alguém para competir', icone: 'amigo', categoria: 'social', xp: 80, moedas: 25, freq: 'semanal' },
  { id: 'meal-prep', titulo: 'Preparar marmitas da semana', desc: 'Planejamento é 80% da dieta', icone: 'verdura', categoria: 'alimentacao', xp: 90, moedas: 30, freq: 'semanal' },
  { id: 'streak-7', titulo: 'Check-in todos os dias', desc: '7 de 7 check-ins na semana', icone: 'chama', categoria: 'mental', xp: 150, moedas: 50, freq: 'semanal' },
]

/**
 * Detecta os pontos fracos do usuário a partir do ONBOARDING.
 * Retorna categorias ordenadas por prioridade de impacto em saúde.
 */
export function categoriasFracas(p: Profile): string[] {
  const fracas: string[] = []
  if (p.fumante) fracas.push('tabagismo')
  if (p.nivelAtividade <= 1.45) fracas.push('exercicio')
  if (p.habitosAlimentares !== 'bom') fracas.push('alimentacao')
  if (p.sonoHoras < 7) fracas.push('sono')
  if (p.aguaLitros < 2) fracas.push('agua')
  if (p.alcool === 'frequente') fracas.push('alcool')
  if (fracas.length < 2) fracas.push('mental')
  return fracas
}

/** Sorteia 4 missões diárias: 2+ dos pontos fracos, o resto do pool geral */
export function missoesDoDia(seed: string, perfil: Profile): Mission[] {
  const fracas = categoriasFracas(perfil)
  const diarias = MISSIONS.filter((m) => m.freq === 'diaria')
  // categorias condicionais só aparecem para quem precisa
  const elegiveis = diarias.filter((m) => {
    if (m.categoria === 'tabagismo') return perfil.fumante
    if (m.categoria === 'alcool') return perfil.alcool === 'frequente'
    return true
  })
  let h = 0
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0

  const escolhidas: Mission[] = []
  const usados = new Set<string>()
  const pegar = (pool: Mission[], n: number, offset: number) => {
    for (let i = 0; i < pool.length * 2 && n > 0; i++) {
      const m = pool[(h + offset + i * 7) % pool.length]
      if (!usados.has(m.id)) {
        usados.add(m.id)
        escolhidas.push(m)
        n--
      }
    }
  }
  // fumante sempre recebe a missão do cigarro
  if (perfil.fumante) {
    const cig = elegiveis.find((m) => m.id === 'sem-cigarro')!
    usados.add(cig.id)
    escolhidas.push(cig)
  }
  const prioritarias = elegiveis.filter((m) => fracas.slice(0, 3).includes(m.categoria) && !usados.has(m.id))
  const outras = elegiveis.filter((m) => !fracas.includes(m.categoria))
  pegar(prioritarias, perfil.fumante ? 1 : 2, 0)
  pegar(outras, 2, 13)
  pegar(elegiveis.filter((m) => !usados.has(m.id)), 4 - escolhidas.length, 29)
  return escolhidas.slice(0, 4)
}

/** Missões semanais relevantes para o perfil */
export function missoesDaSemana(perfil: Profile): Mission[] {
  return MISSIONS.filter((m) => m.freq === 'semanal').filter((m) => {
    if (m.id === 'treino-3x') return perfil.nivelAtividade <= 1.725
    return true
  })
}

export const CATEGORIA_LABEL: Record<string, string> = {
  agua: 'hidratação',
  sono: 'sono',
  exercicio: 'movimento',
  alimentacao: 'alimentação',
  mental: 'saúde mental',
  tabagismo: 'parar de fumar',
  alcool: 'reduzir álcool',
  social: 'social',
}
