import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/stores/auth'
import { useGame } from '@/stores/game'
import { Modal, TopBar, aplicarTema, temaAtual, useToast } from '@/components/ui'
import { celebrar } from '@/components/avatar/EvolutionModal'
import { cn } from '@/lib/utils'

export default function Perfil() {
  const g = useGame()
  const { user, mode, logout } = useAuth()
  const toast = useToast((s) => s.push)
  const nav = useNavigate()
  const [tema, setTema] = useState(temaAtual())
  const [upgrade, setUpgrade] = useState(false)
  if (!g.profile) return null
  const p = g.profile

  return (
    <div className="min-h-screen app-bg">
      <TopBar titulo="⚙️ Perfil e Configurações" voltar />
      <div className="mx-auto max-w-lg px-4 py-4 flex flex-col gap-3 safe-bottom">
        <div className="card">
          <p className="font-black text-lg">{p.nome}</p>
          <p className="text-sm font-bold text-slate-400">{user?.email} {mode === 'demo' && '· 👀 modo demo'}</p>
          <div className="flex gap-2 mt-2 text-xs font-bold text-slate-400">
            <span>{p.idade} anos</span>·<span>{p.alturaCm}cm</span>·<span>{p.pesoAtual}kg</span>·<span>IMC {p.imc}</span>
          </div>
        </div>

        {/* plano */}
        <div className={cn('card', p.plano === 'premium' && 'ring-2 ring-amber-400/60')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black">{p.plano === 'premium' ? '⭐ Plano Premium' : 'Plano Free'}</p>
              <p className="text-xs font-bold text-slate-400">
                {p.plano === 'premium'
                  ? 'Dieta IA ilimitada · chat ilimitado · itens exclusivos · desafios PIX'
                  : 'Jornada completa, missões e avatar grátis para sempre'}
              </p>
            </div>
            {p.plano !== 'premium' && (
              <button className="btn-violet !py-2 !px-4 text-sm" onClick={() => setUpgrade(true)}>Upgrade</button>
            )}
          </div>
        </div>

        {/* tema */}
        <div className="card flex items-center justify-between">
          <div>
            <p className="font-black">Tema</p>
            <p className="text-xs font-bold text-slate-400">Dark ou light, você escolhe</p>
          </div>
          <div className="flex gap-2">
            {(['light', 'dark'] as const).map((t) => (
              <button
                key={t}
                className={cn('chip', tema === t && 'chip-active')}
                onClick={() => {
                  setTema(t)
                  aplicarTema(t)
                }}
              >
                {t === 'light' ? '☀️ Light' : '🌙 Dark'}
              </button>
            ))}
          </div>
        </div>

        {/* notificações (mock visual) */}
        <div className="card">
          <p className="font-black mb-2">Notificações inteligentes</p>
          {['Lembrete de check-in (20h)', 'Alerta de streak em risco', 'Mensagens motivacionais da IA'].map((n) => (
            <label key={n} className="flex items-center justify-between py-1.5">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{n}</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-500" />
            </label>
          ))}
        </div>

        {/* LGPD */}
        <div className="card">
          <p className="font-black mb-1">Seus dados (LGPD)</p>
          <p className="text-xs font-bold text-slate-400 mb-2">Dados de saúde são sensíveis — você tem controle total.</p>
          <div className="flex gap-2">
            <button
              className="btn-ghost flex-1 text-xs !py-2"
              onClick={() => {
                const blob = new Blob([JSON.stringify({ profile: g.profile, checkins: g.checkins }, null, 2)], { type: 'application/json' })
                const a = document.createElement('a')
                a.href = URL.createObjectURL(blob)
                a.download = 'meus-dados-evo.json'
                a.click()
                toast('📦 Dados exportados!')
              }}
            >
              📦 Exportar dados
            </button>
            <button
              className="btn-ghost flex-1 text-xs !py-2 !text-red-500"
              onClick={() => {
                if (confirm('Apagar todos os dados locais? Essa ação não pode ser desfeita.')) {
                  g.resetAll()
                  logout()
                  nav('/')
                }
              }}
            >
              🗑️ Apagar tudo
            </button>
          </div>
        </div>

        <button
          className="btn-ghost !text-red-500"
          onClick={async () => {
            await logout()
            nav('/')
          }}
        >
          Sair da conta
        </button>
        <p className="text-center text-[10px] font-bold text-slate-400">FitLevel v0.1 · Hackathon Órbita 2026 · feito com 💚</p>
      </div>

      <Modal open={upgrade} onClose={() => setUpgrade(false)}>
        <div className="text-center">
          <div className="text-5xl mb-2">⭐</div>
          <h3 className="text-2xl font-black grad-text">FitLevel Premium</h3>
          <p className="font-bold text-slate-400 text-sm mt-1">R$ 19,90/mês</p>
          <div className="text-left my-4 flex flex-col gap-2">
            {['🥗 Plano alimentar IA ilimitado + PDF', '🤖 Chat IA sem limites', '👑 Itens cosméticos exclusivos', '💰 Criar desafios com PIX real', '📊 Relatórios avançados de evolução'].map((b) => (
              <p key={b} className="text-sm font-bold">{b}</p>
            ))}
          </div>
          <button
            className="btn-violet w-full"
            onClick={() => {
              g.upgradePremium()
              setUpgrade(false)
              celebrar()
              toast('⭐ Bem-vindo ao Premium! (checkout simulado)')
            }}
          >
            Assinar agora (demo)
          </button>
          <p className="text-[10px] font-bold text-slate-400 mt-2">Checkout real (Stripe/Mercado Pago) no roadmap pós-hackathon</p>
        </div>
      </Modal>
    </div>
  )
}
