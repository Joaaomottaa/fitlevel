import { useState } from 'react'
import { useGame } from '@/stores/game'
import { TopBar, useToast } from '@/components/ui'
import { ACCESSORIES, AvatarEngine, BEARDS, HAIR_COLORS, HAIR_STYLES, OUTFITS, SKIN_TONES } from '@/components/avatar/AvatarEngine'
import { SHOP_ITEMS } from '@/data/shop'
import { STAGE_INFO } from '@/lib/gamification'
import { cn } from '@/lib/utils'

const ABAS = ['Pele', 'Cabelo', 'Barba', 'Roupa', 'Extras'] as const

export default function AvatarPage() {
  const g = useGame()
  const toast = useToast((s) => s.push)
  const [aba, setAba] = useState<(typeof ABAS)[number]>('Pele')
  if (!g.avatar || !g.profile) return null
  const a = g.avatar

  const outfitsLiberados = ['camiseta', 'regata', ...SHOP_ITEMS.filter((i) => i.tipo === 'outfit' && g.itens.includes(i.id)).map((i) => i.valor)]
  const accLiberados = ['nenhum', ...SHOP_ITEMS.filter((i) => i.tipo === 'accessory' && g.itens.includes(i.id)).map((i) => i.valor)]

  return (
    <div className="min-h-screen app-bg">
      <TopBar titulo="🧬 Meu Avatar" voltar />
      <div className="mx-auto max-w-lg px-4 py-4 safe-bottom">
        <div className="card text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/20 to-emerald-400/10" />
          <div className="relative">
            <AvatarEngine config={a} size={210} />
            <p className="font-black grad-text">Estágio {a.estagio} — {STAGE_INFO[a.estagio].nome}</p>
            <p className="text-xs font-bold text-slate-400">O corpo evolui com seus hábitos — o estilo é todo seu.</p>
          </div>
        </div>

        <div className="flex gap-2 my-4 overflow-x-auto pb-1">
          {ABAS.map((t) => (
            <button key={t} className={cn('chip shrink-0', aba === t && 'chip-active')} onClick={() => setAba(t)}>{t}</button>
          ))}
        </div>

        {aba === 'Pele' && (
          <div className="card">
            <span className="label">Tom de pele</span>
            <div className="flex gap-3 flex-wrap">
              {SKIN_TONES.map((t) => (
                <button key={t} className={cn('w-12 h-12 rounded-full border-4 transition-transform', a.skinTone === t ? 'border-emerald-400 scale-110' : 'border-transparent')} style={{ background: t }} onClick={() => g.setAvatar({ skinTone: t })} />
              ))}
            </div>
          </div>
        )}

        {aba === 'Cabelo' && (
          <div className="card flex flex-col gap-4">
            <div>
              <span className="label">Estilo</span>
              <div className="flex flex-wrap gap-2">
                {HAIR_STYLES.map((h) => (
                  <button key={h} className={cn('chip', a.hair === h && 'chip-active')} onClick={() => g.setAvatar({ hair: h })}>{h}</button>
                ))}
              </div>
            </div>
            <div>
              <span className="label">Cor</span>
              <div className="flex gap-2 flex-wrap">
                {HAIR_COLORS.map((c) => (
                  <button key={c} className={cn('w-10 h-10 rounded-full border-4', a.hairColor === c ? 'border-emerald-400 scale-110' : 'border-transparent')} style={{ background: c }} onClick={() => g.setAvatar({ hairColor: c })} />
                ))}
              </div>
            </div>
          </div>
        )}

        {aba === 'Barba' && (
          <div className="card">
            <span className="label">Estilo de barba</span>
            <div className="flex flex-wrap gap-2">
              {BEARDS.map((b) => (
                <button key={b} className={cn('chip', a.beard === b && 'chip-active')} onClick={() => g.setAvatar({ beard: b })}>{b}</button>
              ))}
            </div>
          </div>
        )}

        {aba === 'Roupa' && (
          <div className="card">
            <span className="label">Visual (compre mais na Loja 🛍️)</span>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(OUTFITS).map(([id, o]) => {
                const liberado = outfitsLiberados.includes(id)
                return (
                  <button
                    key={id}
                    className={cn('chip justify-center', a.outfit === id && 'chip-active', !liberado && 'opacity-40')}
                    onClick={() => (liberado ? g.setAvatar({ outfit: id }) : toast('Item bloqueado — compre na Loja! 🛍️', 'info'))}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ background: o.corpo }} />
                    {o.nome} {!liberado && '🔒'}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {aba === 'Extras' && (
          <div className="card">
            <span className="label">Acessórios (compre mais na Loja 🛍️)</span>
            <div className="grid grid-cols-2 gap-2">
              {ACCESSORIES.map((acc) => {
                const liberado = accLiberados.includes(acc)
                const item = SHOP_ITEMS.find((i) => i.valor === acc)
                return (
                  <button
                    key={acc}
                    className={cn('chip justify-center', a.accessory === acc && 'chip-active', !liberado && 'opacity-40')}
                    onClick={() => (liberado ? g.setAvatar({ accessory: acc }) : toast('Item bloqueado — compre na Loja! 🛍️', 'info'))}
                  >
                    {item?.emoji ?? '❌'} {acc} {!liberado && '🔒'}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
