import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AvatarConfig, CheckinAnswers, ChatMsg, DailyCheckin, EvolucaoFoto, FeedPost, MealPlan, Profile } from '@/types'
import {
  avgScore,
  calcDailyScore,
  calcStreak,
  coinsForXp,
  feedbackLocal,
  healthScore,
  humorFromScore,
  levelFromXp,
  stageFor,
  xpForCheckin,
} from '@/lib/gamification'
import { calcIMC } from '@/lib/health'
import { ACHIEVEMENTS } from '@/data/achievements'
import { SHOP_ITEMS } from '@/data/shop'
import { addDaysISO, diffDays, todayISO, uid } from '@/lib/utils'
import { syncCheckin, syncProfile } from '@/lib/supabase'

export interface CheckinResult {
  score: number
  xpGanho: number
  moedasGanhas: number
  evoluiu: boolean
  novoEstagio: number
  subiumNivel: boolean
  conquistas: string[]
  feedback: string
}

interface GameState {
  userId: string | null
  profile: Profile | null
  avatar: AvatarConfig | null
  xp: number
  moedas: number
  checkins: Record<string, DailyCheckin>
  missoesFeitas: Record<string, string[]> // dataISO -> ids
  conquistas: string[]
  itens: string[]
  demoOffset: number
  roletaUltima: string | null
  chat: ChatMsg[]
  mealPlan: MealPlan | null
  feed: FeedPost[]
  evolucaoFotos: EvolucaoFoto[]

  // helpers
  hoje: () => string
  diaJornada: () => number
  estagioAtual: () => 1 | 2 | 3 | 4 | 5
  scoreSaude: () => number
  streak: () => number

  // actions
  initFor: (userId: string, demo: boolean) => void
  completeOnboarding: (p: Profile, a: AvatarConfig) => void
  submitCheckin: (a: CheckinAnswers) => CheckinResult
  setFeedback: (data: string, feedback: string) => void
  completeMission: (id: string, xp: number, moedas: number, titulo: string) => string[]
  buyItem: (itemId: string) => boolean
  setAvatar: (partial: Partial<AvatarConfig>) => void
  updatePeso: (peso: number) => string[]
  spinRoulette: () => { tipo: string; valor: number; rotulo: string } | null
  timeTravel: (dia: number) => void
  upgradePremium: () => void
  addChat: (m: ChatMsg) => void
  setMealPlan: (p: MealPlan) => void
  addEvolucaoFoto: (f: Omit<EvolucaoFoto, 'id'>) => void
  removeEvolucaoFoto: (id: string) => void
  toggleLike: (postId: string) => void
  addFeed: (tipo: FeedPost['tipo'], texto: string) => void
  resetAll: () => void
}

const fresh = {
  userId: null as string | null,
  profile: null as Profile | null,
  avatar: null as AvatarConfig | null,
  xp: 0,
  moedas: 50,
  checkins: {} as Record<string, DailyCheckin>,
  missoesFeitas: {} as Record<string, string[]>,
  conquistas: [] as string[],
  itens: ['outfit-regata', 'outfit-camiseta'],
  demoOffset: 0,
  roletaUltima: null as string | null,
  chat: [] as ChatMsg[],
  mealPlan: null as MealPlan | null,
  feed: [] as FeedPost[],
  evolucaoFotos: [] as EvolucaoFoto[],
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      ...fresh,

      hoje: () => todayISO(get().demoOffset),

      diaJornada: () => {
        const p = get().profile
        if (!p) return 1
        return Math.min(100, Math.max(1, diffDays(p.jornadaInicio, get().hoje()) + 1))
      },

      estagioAtual: () => {
        const s = get()
        if (!s.profile) return 1
        return stageFor(s.diaJornada(), avgScore(s.checkins, 7, s.hoje()))
      },

      scoreSaude: () => {
        const s = get()
        if (!s.profile) return 0
        return healthScore(s.checkins, s.profile.healthScoreInicial, s.hoje())
      },

      streak: () => calcStreak(get().checkins, get().hoje()),

      initFor: (userId, demo) => {
        const s = get()
        if (s.userId === userId) return
        set({ ...fresh, userId })
        if (demo) seedDemo(set, get)
      },

      completeOnboarding: (p, a) => {
        set({ profile: p, avatar: a })
        pushSync(get)
      },

      submitCheckin: (answers) => {
        const s = get()
        const p = s.profile!
        const data = s.hoje()
        const estagioAntes = s.estagioAtual()
        const nivelAntes = levelFromXp(s.xp)
        const score = calcDailyScore(answers, p.metaAguaMl)
        const checkin: DailyCheckin = { ...answers, data, score, feedback: '' }
        const checkins = { ...s.checkins, [data]: checkin }
        const streakNovo = calcStreak(checkins, data)
        checkin.feedback = feedbackLocal(score, streakNovo, p.nome)
        const xpGanho = xpForCheckin(score)
        const moedasGanhas = coinsForXp(xpGanho)
        const xp = s.xp + xpGanho
        set({
          checkins,
          xp,
          moedas: s.moedas + moedasGanhas,
          avatar: s.avatar ? { ...s.avatar, humor: humorFromScore(score) } : s.avatar,
        })
        const conquistas = unlockAchievements(set, get)
        const estagioDepois = get().estagioAtual()
        if (s.avatar && estagioDepois !== estagioAntes) {
          set({ avatar: { ...get().avatar!, estagio: estagioDepois } })
          get().addFeed('evolucao', `evoluiu para o estágio ${estagioDepois} — ${['', 'Início', 'Despertar', 'Transformação', 'Boa forma', 'Campeão'][estagioDepois]}! 🎉`)
        }
        syncCheckin({ user_id: s.userId, data, ...toSnake(answers), score })
        pushSync(get)
        return {
          score,
          xpGanho,
          moedasGanhas,
          evoluiu: estagioDepois > estagioAntes,
          novoEstagio: estagioDepois,
          subiumNivel: levelFromXp(xp) > nivelAntes,
          conquistas,
          feedback: checkin.feedback,
        }
      },

      setFeedback: (data, feedback) => {
        const s = get()
        if (!s.checkins[data]) return
        set({ checkins: { ...s.checkins, [data]: { ...s.checkins[data], feedback } } })
      },

      completeMission: (id, xp, moedas, titulo) => {
        const s = get()
        const data = s.hoje()
        const doDia = s.missoesFeitas[data] ?? []
        if (doDia.includes(id)) return []
        set({
          missoesFeitas: { ...s.missoesFeitas, [data]: [...doDia, id] },
          xp: s.xp + xp,
          moedas: s.moedas + moedas,
        })
        get().addFeed('checkin', `completou a missão "${titulo}" (+${xp} XP)`)
        const novas = unlockAchievements(set, get)
        pushSync(get)
        return novas
      },

      buyItem: (itemId) => {
        const s = get()
        const item = SHOP_ITEMS.find((i) => i.id === itemId)
        if (!item || s.itens.includes(itemId) || s.moedas < item.preco) return false
        if (item.premium && s.profile?.plano !== 'premium') return false
        set({ moedas: s.moedas - item.preco, itens: [...s.itens, itemId] })
        return true
      },

      setAvatar: (partial) => {
        const s = get()
        if (!s.avatar) return
        set({ avatar: { ...s.avatar, ...partial } })
      },

      updatePeso: (peso) => {
        const s = get()
        if (!s.profile) return []
        const imc = calcIMC(peso, s.profile.alturaCm)
        set({ profile: { ...s.profile, pesoAtual: peso, imc } })
        const novas = unlockAchievements(set, get)
        pushSync(get)
        return novas
      },

      spinRoulette: () => {
        const s = get()
        const hoje = s.hoje()
        if (s.roletaUltima === hoje) return null
        const premios = [
          { tipo: 'moedas', valor: 20, rotulo: '+20 moedas' },
          { tipo: 'moedas', valor: 50, rotulo: '+50 moedas' },
          { tipo: 'xp', valor: 30, rotulo: '+30 XP' },
          { tipo: 'xp', valor: 100, rotulo: '+100 XP' },
          { tipo: 'moedas', valor: 10, rotulo: '+10 moedas' },
          { tipo: 'xp', valor: 250, rotulo: 'JACKPOT +250 XP' },
        ]
        const premio = premios[Math.floor(Math.random() * premios.length)]
        set({
          roletaUltima: hoje,
          xp: premio.tipo === 'xp' ? s.xp + premio.valor : s.xp,
          moedas: premio.tipo === 'moedas' ? s.moedas + premio.valor : s.moedas,
        })
        return premio
      },

      timeTravel: (dia) => {
        const s = get()
        if (!s.profile) return
        const diaAtualReal = diffDays(s.profile.jornadaInicio, todayISO()) + 1
        const offset = dia - diaAtualReal
        // gera check-ins sintéticos para o intervalo viajado (apenas demo)
        const checkins = { ...s.checkins }
        for (let d = 1; d < dia; d++) {
          const dataD = addDaysISO(s.profile.jornadaInicio, d - 1)
          if (!checkins[dataD]) {
            const progresso = d / 100
            const score = Math.round(52 + progresso * 38 + Math.sin(d * 1.7) * 8)
            checkins[dataD] = sinteticCheckin(dataD, Math.min(98, Math.max(35, score)))
          }
        }
        set({ demoOffset: offset, checkins })
        const estagio = get().estagioAtual()
        if (s.avatar) set({ avatar: { ...get().avatar!, estagio } })
      },

      upgradePremium: () => {
        const s = get()
        if (!s.profile) return
        set({ profile: { ...s.profile, plano: 'premium' } })
      },

      addChat: (m) => set({ chat: [...get().chat, m].slice(-60) }),
      setMealPlan: (p) => set({ mealPlan: p }),

      addEvolucaoFoto: (f) => {
        const s = get()
        const fotos = [...s.evolucaoFotos, { ...f, id: uid() }].sort((a, b) => a.data.localeCompare(b.data))
        set({ evolucaoFotos: fotos })
        get().addFeed('checkin', 'registrou uma nova foto de evolução')
      },

      removeEvolucaoFoto: (id) => set({ evolucaoFotos: get().evolucaoFotos.filter((f) => f.id !== id) }),

      toggleLike: (postId) => {
        set({
          feed: get().feed.map((p) =>
            p.id === postId ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p,
          ),
        })
      },

      addFeed: (tipo, texto) => {
        const s = get()
        const nome = s.profile?.nome.split(' ')[0] ?? 'Você'
        set({
          feed: [
            { id: uid(), autor: nome, tipo, texto, likes: 0, liked: false, quando: s.hoje() },
            ...s.feed,
          ].slice(0, 50),
        })
      },

      resetAll: () => set({ ...fresh }),
    }),
    { name: 'fitlevel-game-v1' },
  ),
)

/* ---------- conquistas ---------- */

function unlockAchievements(
  set: (partial: Partial<GameState>) => void,
  get: () => GameState,
): string[] {
  const s = get()
  if (!s.profile) return []
  const has = (id: string) => s.conquistas.includes(id)
  const novas: string[] = []
  const nCheckins = Object.keys(s.checkins).length
  const streak = s.streak()
  const nivel = levelFromXp(s.xp)
  const perdido = s.profile.pesoInicial - s.profile.pesoAtual
  const media7 = avgScore(s.checkins, 7, s.hoje())
  const estagio = s.estagioAtual()
  const dia = s.diaJornada()
  const nMissoes = Object.values(s.missoesFeitas).flat().length
  const scoreHoje = s.checkins[s.hoje()]?.score ?? 0
  const treinosSeguidos = contarTreinosSeguidos(s.checkins, s.hoje())

  const regras: [string, boolean][] = [
    ['primeiro-checkin', nCheckins >= 1],
    ['primeira-missao', nMissoes >= 1],
    ['primeira-semana', dia >= 7],
    ['primeiro-mes', dia >= 30],
    ['streak-3', streak >= 3],
    ['streak-7', streak >= 7],
    ['streak-30', streak >= 30],
    ['streak-100', streak >= 100],
    ['score-100', scoreHoje >= 100],
    ['score-80-7d', media7 >= 80 && nCheckins >= 7],
    ['peso-2kg', perdido >= 2],
    ['peso-5kg', perdido >= 5],
    ['peso-10kg', perdido >= 10],
    ['sono-15', Object.values(s.checkins).filter((c) => c.sonoHoras >= 7.5).length >= 15],
    ['agua-30', Object.values(s.checkins).filter((c) => c.aguaMl >= s.profile!.metaAguaMl).length >= 30],
    ['treino-5-seguidos', treinosSeguidos >= 5],
    ['nivel-5', nivel >= 5],
    ['nivel-10', nivel >= 10],
    ['evolucao-3', estagio >= 3],
    ['evolucao-5', estagio >= 5],
  ]

  let xpBonus = 0
  for (const [id, ok] of regras) {
    if (ok && !has(id)) {
      novas.push(id)
      xpBonus += ACHIEVEMENTS.find((a) => a.id === id)?.xp ?? 0
    }
  }
  if (novas.length) {
    set({ conquistas: [...s.conquistas, ...novas], xp: s.xp + xpBonus })
  }
  return novas
}

function contarTreinosSeguidos(checkins: Record<string, DailyCheckin>, ref: string): number {
  let n = 0
  let cursor = ref
  while (checkins[cursor] && checkins[cursor].exercicioMin >= 20) {
    n++
    cursor = addDaysISO(cursor, -1)
  }
  return n
}

/* ---------- sync supabase (fire and forget) ---------- */

function pushSync(get: () => GameState) {
  const s = get()
  if (!s.profile || !s.userId || s.userId === 'demo') return
  syncProfile({
    id: s.userId,
    nome: s.profile.nome,
    xp: s.xp,
    nivel: levelFromXp(s.xp),
    moedas: s.moedas,
    health_score: s.scoreSaude(),
    peso_atual: s.profile.pesoAtual,
    imc: s.profile.imc,
    plano: s.profile.plano,
    jornada_inicio: s.profile.jornadaInicio,
    estagio: s.estagioAtual(),
    streak: s.streak(),
  })
}

function toSnake(a: CheckinAnswers) {
  return {
    sono_horas: a.sonoHoras,
    sono_qualidade: a.sonoQualidade,
    agua_ml: a.aguaMl,
    exercicio_min: a.exercicioMin,
    exercicio_tipo: a.exercicioTipo,
    refeicoes: a.refeicoesRegistradas,
    frutas: a.comeuFrutas,
    verduras: a.comeuVerduras,
    acucar: a.acucar,
    gordura: a.gordura,
    humor: a.humor,
    estresse: a.estresse,
  }
}

/* ---------- seed do modo demo ---------- */

function sinteticCheckin(data: string, score: number): DailyCheckin {
  const bom = score >= 65
  return {
    data,
    score,
    feedback: '',
    sonoHoras: bom ? 7.5 : 6,
    sonoQualidade: bom ? 4 : 3,
    aguaMl: bom ? 2500 : 1400,
    exercicioMin: bom ? 40 : 10,
    exercicioTipo: bom ? 'musculacao' : 'caminhada',
    refeicoesRegistradas: bom ? 4 : 2,
    comeuFrutas: bom,
    comeuVerduras: bom,
    acucar: !bom,
    gordura: !bom,
    humor: bom ? 4 : 3,
    estresse: bom ? 2 : 3,
  }
}

function seedDemo(set: (p: Partial<GameState>) => void, get: () => GameState) {
  const DIA_DEMO = 47
  const inicio = addDaysISO(todayISO(), -(DIA_DEMO - 1))
  const profile: Profile = {
    id: 'demo',
    nome: 'Alex Demo',
    sexo: 'M',
    idade: 34,
    alturaCm: 178,
    pesoInicial: 96,
    pesoAtual: 89.4,
    pesoMeta: 80,
    circAbdominal: 102,
    objetivo: 'perder_peso',
    nivelAtividade: 1.55,
    freqExercicio: '3-4x por semana',
    tipoTreino: 'Musculação + caminhada',
    sonoHoras: 6.5,
    horarioSono: '23:30',
    aguaLitros: 1.5,
    habitosAlimentares: 'medio',
    alcool: 'social',
    fumante: false,
    historicoFamiliar: ['Diabetes', 'Hipertensão'],
    restricoes: [],
    alergias: [],
    doencas: ['Pré-diabetes'],
    medicamentos: '',
    colesterol: 'alto',
    pressao: 'normal',
    glicemia: 'alta',
    plano: 'premium',
    jornadaInicio: inicio,
    imc: calcIMC(89.4, 178),
    tmb: 1885,
    gastoCalorico: 2922,
    metaCalorias: 2522,
    metaAguaMl: 3100,
    healthScoreInicial: 48,
  }
  const checkins: Record<string, DailyCheckin> = {}
  let xp = 0
  for (let d = 1; d < DIA_DEMO; d++) {
    const data = addDaysISO(inicio, d - 1)
    // progressão realista: começa irregular, consolida hábitos
    const base = 50 + (d / DIA_DEMO) * 32
    const ruido = Math.sin(d * 2.3) * 10
    const pulou = d % 11 === 0 && d < 30 // alguns dias sem check-in no início
    if (pulou) continue
    const score = Math.round(Math.min(97, Math.max(38, base + ruido)))
    checkins[data] = sinteticCheckin(data, score)
    xp += xpForCheckin(score) + 55 // checkin + ~2 missões/dia
  }
  const avatar: AvatarConfig = {
    estagio: 3,
    skinTone: '#c68863',
    hair: 'curto',
    hairColor: '#2f2a26',
    beard: 'cavanhaque',
    eyes: 'padrao',
    outfit: 'treino',
    accessory: 'nenhum',
    humor: 'feliz',
  }
  set({
    profile,
    avatar,
    checkins,
    xp,
    moedas: 340,
    itens: ['outfit-regata', 'outfit-camiseta', 'outfit-treino', 'acc-bone', 'acc-fone'],
    missoesFeitas: {},
    feed: [
      { id: uid(), autor: 'Alex', tipo: 'evolucao', texto: 'evoluiu para o estágio 3 — Transformação! 🦋', likes: 12, liked: false, quando: addDaysISO(todayISO(), -5) },
      { id: uid(), autor: 'Alex', tipo: 'conquista', texto: 'desbloqueou "Menos 5kg" 🏆', likes: 8, liked: false, quando: addDaysISO(todayISO(), -9) },
    ],
  })
  unlockAchievements(set as never, get)
}
