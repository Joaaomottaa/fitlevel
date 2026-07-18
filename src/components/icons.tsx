import type { LucideIcon } from 'lucide-react'
import {
  Apple,
  Award,
  BedDouble,
  Bot,
  Brain,
  Camera,
  CalendarCheck,
  Check,
  CigaretteOff,
  ClipboardCheck,
  Coins,
  Crown,
  CupSoda,
  Droplets,
  Dumbbell,
  Flame,
  Footprints,
  Gift,
  Glasses,
  Headphones,
  Heart,
  HeartPulse,
  House,
  LayoutGrid,
  Lock,
  Map,
  Medal,
  Moon,
  NotebookPen,
  PersonStanding,
  Rocket,
  Salad,
  Scale,
  Settings,
  Shirt,
  ShoppingBag,
  Sparkles,
  Star,
  Swords,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  Users,
  Wine,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/** Mapa central de ícones - as data files guardam apenas a chave (string) */
export const ICONS: Record<string, LucideIcon> = {
  agua: Droplets,
  sono: BedDouble,
  passos: Footprints,
  musculacao: Dumbbell,
  fruta: Apple,
  refri: CupSoda,
  verdura: Salad,
  registrar: NotebookPen,
  alongar: PersonStanding,
  meditar: Brain,
  semtela: Moon,
  escada: Footprints,
  cigarro: CigaretteOff,
  alcool: Wine,
  peso: Scale,
  amigo: Users,
  calendario: CalendarCheck,
  timer: Timer,
  coracao: HeartPulse,
  trofeu: Trophy,
  medalha: Medal,
  estrela: Star,
  coroa: Crown,
  raio: Zap,
  chama: Flame,
  alvo: Target,
  brilho: Sparkles,
  presente: Gift,
  premio: Award,
  foguete: Rocket,
  check: Check,
  cadeado: Lock,
  camiseta: Shirt,
  oculos: Glasses,
  fone: Headphones,
  bolsa: ShoppingBag,
  tendencia: TrendingUp,
  camera: Camera,
}

export function Icon({
  name,
  className,
  size = 20,
}: {
  name: string
  className?: string
  size?: number
}) {
  const C = ICONS[name] ?? Sparkles
  return <C size={size} className={cn('shrink-0', className)} strokeWidth={2.4} />
}

// re-export dos mais usados para import direto nas páginas
export {
  Apple, Award, BedDouble, Bot, Brain, Camera, CalendarCheck, Check, CigaretteOff,
  ClipboardCheck, Coins, Crown, Droplets, Dumbbell, Flame, Footprints, Gift, Heart,
  HeartPulse, House, LayoutGrid, Lock, Map, Medal, Moon, NotebookPen, Rocket, Salad,
  Scale, Settings, Shirt, ShoppingBag, Sparkles, Star, Swords, Target, Timer,
  TrendingUp, Trophy, Users, Zap,
}
