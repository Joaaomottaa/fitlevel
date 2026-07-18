import type { ShopItem } from '@/types'

/** emoji = chave do mapa lucide em components/icons.tsx */
export const SHOP_ITEMS: ShopItem[] = [
  { id: 'outfit-regata', nome: 'Regata de treino', tipo: 'outfit', valor: 'regata', preco: 0, emoji: 'camiseta' },
  { id: 'outfit-camiseta', nome: 'Camiseta clássica', tipo: 'outfit', valor: 'camiseta', preco: 0, emoji: 'camiseta' },
  { id: 'outfit-treino', nome: 'Conjunto fitness', tipo: 'outfit', valor: 'treino', preco: 120, emoji: 'musculacao' },
  { id: 'outfit-social', nome: 'Look social', tipo: 'outfit', valor: 'social', preco: 200, emoji: 'camiseta' },
  { id: 'outfit-campeao', nome: 'Manto do Campeão', tipo: 'outfit', valor: 'campeao', preco: 500, premium: true, emoji: 'coroa' },
  { id: 'acc-bandana', nome: 'Bandana', tipo: 'accessory', valor: 'bandana', preco: 80, emoji: 'brilho' },
  { id: 'acc-oculos', nome: 'Óculos esportivo', tipo: 'accessory', valor: 'oculos', preco: 100, emoji: 'oculos' },
  { id: 'acc-bone', nome: 'Boné', tipo: 'accessory', valor: 'bone', preco: 90, emoji: 'estrela' },
  { id: 'acc-medalha', nome: 'Medalha de ouro', tipo: 'accessory', valor: 'medalha', preco: 250, emoji: 'medalha' },
  { id: 'acc-coroa', nome: 'Coroa real', tipo: 'accessory', valor: 'coroa', preco: 600, premium: true, emoji: 'coroa' },
  { id: 'acc-fone', nome: 'Fone de ouvido', tipo: 'accessory', valor: 'fone', preco: 110, emoji: 'fone' },
]
