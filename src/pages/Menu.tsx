import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Bot, Camera, ChevronRight, Dna, HeartPulse, Salad, Settings, ShoppingBag, Swords, Target, Trophy, Users } from 'lucide-react'
import { useGame } from '@/stores/game'
import { TopBar } from '@/components/ui'
import { AvatarEngine } from '@/components/avatar/AvatarEngine'
import { levelFromXp } from '@/lib/gamification'

const ITENS: { to: string; icone: LucideIcon; cor: string; titulo: string; desc: string }[] = [
  { to: '/evolucao', icone: Camera, cor: 'from-teal-400 to-emerald-400', titulo: 'Minha Evolução', desc: 'Fotos do antes e depois da jornada' },
  { to: '/saude', icone: HeartPulse, cor: 'from-rose-400 to-pink-400', titulo: 'Minha Saúde', desc: 'Indicadores, IMC, fatores de risco' },
  { to: '/avatar', icone: Dna, cor: 'from-sky-400 to-cyan-400', titulo: 'Meu Avatar', desc: 'Personalize seu personagem' },
  { to: '/missoes', icone: Target, cor: 'from-amber-400 to-orange-400', titulo: 'Missões', desc: 'Diárias e semanais, feitas para você' },
  { to: '/nutricao', icone: Salad, cor: 'from-lime-400 to-green-400', titulo: 'Plano Alimentar IA', desc: 'Dieta personalizada + PDF' },
  { to: '/chat', icone: Bot, cor: 'from-violet-400 to-purple-400', titulo: 'FitLevel IA', desc: 'Dúvidas e análise de pratos por foto' },
  { to: '/social', icone: Users, cor: 'from-fuchsia-400 to-pink-400', titulo: 'Social', desc: 'Ranking, feed e amigos' },
  { to: '/competicoes', icone: Swords, cor: 'from-red-400 to-rose-400', titulo: 'Competições', desc: 'Desafie amigos (até com PIX!)' },
  { to: '/loja', icone: ShoppingBag, cor: 'from-indigo-400 to-blue-400', titulo: 'Loja + Roleta', desc: 'Itens cosméticos e prêmios diários' },
  { to: '/conquistas', icone: Trophy, cor: 'from-yellow-400 to-amber-400', titulo: 'Conquistas', desc: 'Sua sala de troféus' },
  { to: '/perfil', icone: Settings, cor: 'from-slate-400 to-slate-500', titulo: 'Perfil e Configurações', desc: 'Conta, plano e tema' },
]

export default function Menu() {
  const g = useGame()
  if (!g.profile || !g.avatar) return null
  return (
    <div className="min-h-screen app-bg">
      <TopBar titulo="Mais" />
      <div className="mx-auto max-w-lg px-4 py-4 safe-bottom">
        <Link to="/perfil" className="card flex items-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-sky-300/25 to-teal-300/25 flex items-center justify-center">
            <AvatarEngine config={g.avatar} size={64} animado={false} />
          </div>
          <div className="flex-1">
            <p className="font-black">{g.profile.nome}</p>
            <p className="text-xs font-bold text-slate-400">Nível {levelFromXp(g.xp)} · {g.profile.plano === 'premium' ? '⭐ Premium' : 'Plano Free'}</p>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </Link>
        <div className="flex flex-col gap-2">
          {ITENS.map((i) => {
            const I = i.icone
            return (
              <Link key={i.to} to={i.to} className="card flex items-center gap-3 !p-3 active:scale-[0.98] transition-transform">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${i.cor} text-white flex items-center justify-center shadow-md`}>
                  <I size={21} strokeWidth={2.4} />
                </div>
                <div className="flex-1">
                  <p className="font-black text-sm">{i.titulo}</p>
                  <p className="text-[11px] font-bold text-slate-400">{i.desc}</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
