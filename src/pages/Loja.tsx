import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Dices, Gift, Star } from 'lucide-react'
import { useGame } from '@/stores/game'
import { CoinBadge, Modal, TopBar, useToast } from '@/components/ui'
import { Icon } from '@/components/icons'
import { SHOP_ITEMS } from '@/data/shop'
import { celebrar } from '@/components/avatar/EvolutionModal'
import { cn } from '@/lib/utils'

export default function Loja() {
  const g = useGame()
  const toast = useToast((s) => s.push)
  const [premio, setPremio] = useState<string | null>(null)
  if (!g.profile) return null
  const roletaDisponivel = g.roletaUltima !== g.hoje()

  return (
    <div className="min-h-screen app-bg">
      <TopBar titulo="🛍️ Loja" voltar />
      <div className="mx-auto max-w-lg px-4 py-4 safe-bottom">
        {/* roleta diária */}
        <motion.button
          className={cn(
            'w-full rounded-3xl p-4 mb-4 text-white text-left shadow-xl flex items-center justify-between',
            roletaDisponivel ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-violet-500/30' : 'bg-slate-400 dark:bg-slate-700 opacity-70',
          )}
          whileTap={{ scale: 0.97 }}
          disabled={!roletaDisponivel}
          onClick={() => {
            const p = g.spinRoulette()
            if (p) {
              celebrar()
              setPremio(p.rotulo)
            }
          }}
        >
          <div>
            <p className="font-black text-lg">Roleta diária {roletaDisponivel ? '' : '(amanhã!)'}</p>
            <p className="text-sm font-bold text-white/80">{roletaDisponivel ? 'Gire e ganhe um prêmio surpresa!' : 'Você já girou hoje ✓'}</p>
          </div>
          <motion.div
            animate={roletaDisponivel ? { rotate: 360 } : undefined}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
          >
            <Dices size={38} />
          </motion.div>
        </motion.button>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black">Itens para o avatar</h2>
          <CoinBadge />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {SHOP_ITEMS.map((item) => {
            const tem = g.itens.includes(item.id)
            const bloqueadoPremium = item.premium && g.profile!.plano !== 'premium'
            return (
              <div key={item.id} className={cn('card !p-4 text-center', tem && 'ring-1 ring-teal-400/50')}>
                <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-teal-400/15 to-sky-400/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Icon name={item.emoji} size={24} />
                </div>
                <p className="font-black text-sm mt-1.5 leading-tight">{item.nome}</p>
                {item.premium && <p className="text-[10px] font-black text-amber-500 flex items-center justify-center gap-0.5"><Star size={10} fill="currentColor" /> PREMIUM</p>}
                {tem ? (
                  <p className="text-xs font-black text-teal-500 mt-2 flex items-center justify-center gap-1"><Check size={13} strokeWidth={3} /> Adquirido</p>
                ) : (
                  <button
                    className="btn-primary !py-1.5 !px-4 text-xs mt-2 w-full"
                    onClick={() => {
                      if (bloqueadoPremium) {
                        toast('Item exclusivo do plano Premium', 'info')
                        return
                      }
                      if (g.buyItem(item.id)) {
                        toast(`${item.nome} comprado!`)
                      } else {
                        toast('Moedas insuficientes - complete missões!', 'erro')
                      }
                    }}
                  >
                    {item.preco === 0 ? 'Grátis' : `${item.preco} moedas`}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <Modal open={Boolean(premio)} onClose={() => setPremio(null)}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-violet-400 to-fuchsia-400 text-white flex items-center justify-center mb-3">
            <Gift size={32} />
          </div>
          <h3 className="text-2xl font-black grad-text">{premio}</h3>
          <p className="font-bold text-slate-400 mt-1">Volte amanhã para girar de novo!</p>
          <button className="btn-primary w-full mt-4" onClick={() => setPremio(null)}>Aproveitar</button>
        </div>
      </Modal>
    </div>
  )
}
