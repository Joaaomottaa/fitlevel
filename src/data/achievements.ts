import type { Achievement } from '@/types'

/** icone = chave do mapa lucide em components/icons.tsx */
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'primeiro-checkin', titulo: 'Primeiro passo', desc: 'Fez o primeiro check-in diário', icone: 'passos', xp: 100 },
  { id: 'primeira-missao', titulo: 'Missão dada é missão cumprida', desc: 'Completou a primeira missão', icone: 'check', xp: 100 },
  { id: 'primeira-semana', titulo: 'Primeira semana', desc: '7 dias de jornada', icone: 'calendario', xp: 150 },
  { id: 'primeiro-mes', titulo: 'Primeiro mês', desc: '30 dias de jornada', icone: 'calendario', xp: 300 },
  { id: 'streak-3', titulo: 'Pegando ritmo', desc: 'Streak de 3 dias', icone: 'chama', xp: 100 },
  { id: 'streak-7', titulo: 'Semana perfeita', desc: 'Streak de 7 dias', icone: 'chama', xp: 200 },
  { id: 'streak-30', titulo: 'Imparável', desc: 'Streak de 30 dias', icone: 'raio', xp: 500 },
  { id: 'streak-100', titulo: 'Lendário', desc: 'Streak de 100 dias', icone: 'coroa', xp: 1000 },
  { id: 'score-100', titulo: 'Dia perfeito', desc: 'Score diário de 100 pontos', icone: 'estrela', xp: 300 },
  { id: 'score-80-7d', titulo: 'Semana de elite', desc: 'Média semanal acima de 80', icone: 'brilho', xp: 300 },
  { id: 'peso-2kg', titulo: 'Menos 2kg', desc: 'Perdeu 2kg desde o início', icone: 'trofeu', xp: 300 },
  { id: 'peso-5kg', titulo: 'Menos 5kg', desc: 'Perdeu 5kg desde o início', icone: 'trofeu', xp: 500 },
  { id: 'peso-10kg', titulo: 'Menos 10kg', desc: 'Perdeu 10kg - transformação real', icone: 'coroa', xp: 1000 },
  { id: 'agua-30', titulo: 'Hidratação máxima', desc: 'Meta de água batida 30 dias', icone: 'agua', xp: 400 },
  { id: 'sono-15', titulo: 'Sono em dia', desc: 'Dormiu bem 15 dias', icone: 'sono', xp: 300 },
  { id: 'treino-5-seguidos', titulo: 'Força total', desc: 'Exercício 5 dias seguidos', icone: 'musculacao', xp: 350 },
  { id: 'nivel-5', titulo: 'Veterano', desc: 'Alcançou o nível 5', icone: 'estrela', xp: 200 },
  { id: 'nivel-10', titulo: 'Mestre FitLevel', desc: 'Alcançou o nível 10', icone: 'medalha', xp: 400 },
  { id: 'evolucao-3', titulo: 'Metamorfose', desc: 'Avatar chegou ao estágio 3', icone: 'brilho', xp: 300 },
  { id: 'evolucao-5', titulo: 'Campeão da jornada', desc: 'Avatar no estágio final - 100 dias!', icone: 'premio', xp: 1000 },
]
