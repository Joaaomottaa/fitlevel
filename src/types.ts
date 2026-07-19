export type Sexo = 'M' | 'F' | 'outro'
export type Objetivo = 'perder_peso' | 'ganhar_massa' | 'manter_peso' | 'saude_geral'
export type Plano = 'free' | 'premium'
export type Humor = 'feliz' | 'neutro' | 'triste' | 'cansado' | 'energico'

export interface Profile {
  id: string
  nome: string
  sexo: Sexo
  idade: number
  alturaCm: number
  pesoInicial: number
  pesoAtual: number
  pesoMeta: number
  circAbdominal?: number
  objetivo: Objetivo
  nivelAtividade: number // fator 1.2–1.9
  freqExercicio: string
  tipoTreino: string
  sonoHoras: number
  horarioSono: string
  aguaLitros: number
  habitosAlimentares: 'ruim' | 'medio' | 'bom'
  alcool: 'nunca' | 'social' | 'frequente'
  fumante: boolean
  historicoFamiliar: string[]
  restricoes: string[]
  alergias: string[]
  doencas: string[]
  medicamentos: string
  colesterol: 'normal' | 'alto' | 'nao_sei'
  pressao: 'normal' | 'alta' | 'nao_sei'
  glicemia: 'normal' | 'alta' | 'nao_sei'
  pctGordura?: number
  massaMuscular?: number
  plano: Plano
  jornadaInicio: string // ISO yyyy-mm-dd
  // calculados
  imc: number
  tmb: number
  gastoCalorico: number
  metaCalorias: number
  metaAguaMl: number
  healthScoreInicial: number
}

export interface AvatarConfig {
  estagio: 1 | 2 | 3 | 4 | 5
  skinTone: string
  hair: string
  hairColor: string
  beard: string
  eyes: string
  outfit: string
  accessory: string
  humor: Humor
}

export interface CheckinAnswers {
  sonoHoras: number
  sonoQualidade: number // 1-5
  aguaMl: number
  exercicioMin: number
  exercicioTipo: string
  refeicoesRegistradas: number // 0-4
  comeuFrutas: boolean
  comeuVerduras: boolean
  acucar: boolean
  gordura: boolean
  humor: number // 1-5
  estresse: number // 1-5
}

export interface DailyCheckin extends CheckinAnswers {
  data: string
  score: number
  feedback: string
}

export interface Mission {
  id: string
  titulo: string
  desc: string
  icone: string
  categoria: 'agua' | 'sono' | 'exercicio' | 'alimentacao' | 'mental' | 'social' | 'tabagismo' | 'alcool'
  xp: number
  moedas: number
  freq: 'diaria' | 'semanal'
}

export interface EvolucaoFoto {
  id: string
  data: string // ISO yyyy-mm-dd
  foto: string // dataURL comprimida
  peso?: number
  nota?: string
}

export interface Achievement {
  id: string
  titulo: string
  desc: string
  icone: string
  xp: number
}

export interface ShopItem {
  id: string
  nome: string
  tipo: 'outfit' | 'accessory' | 'hair'
  valor: string // valor aplicado no AvatarConfig
  preco: number
  premium?: boolean
  emoji: string
}

export interface Comentario {
  autor: string
  texto: string
}

export interface FeedPost {
  id: string
  autor: string
  avatarEmoji?: string
  tipo: 'evolucao' | 'conquista' | 'checkin' | 'texto'
  texto: string
  likes: number
  liked: boolean
  quando: string
  comentarios?: Comentario[]
  compartilhado?: boolean
}

export interface Amigo {
  id: string
  nome: string
  codigo: string
  emoji: string
  xp: number
  score: number
}

export interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
  imagem?: string // dataURL opcional (ex.: foto do prato)
}

export interface Refeicao {
  nome: string
  horario: string
  itens: { alimento: string; qtd: string; kcal: number; prot: number; carb: number; gord: number }[]
}

export interface MealPlan {
  objetivo: string
  totalKcal: number
  macros: { prot: number; carb: number; gord: number; fibra: number }
  refeicoes: Refeicao[]
  recomendacoes: string[]
}

export interface RiskFactor {
  nome: string
  nivel: number // 0 (ótimo) a 4 (crítico)
  dica: string
  icone: string
}
