import type { ShopItem } from '@/types'

/** emoji = chave do mapa lucide em components/icons.tsx */
export const SHOP_ITEMS: ShopItem[] = [
  // ---- Roupas ----
  { id: 'outfit-regata', nome: 'Regata de treino', tipo: 'outfit', valor: 'regata', preco: 0, emoji: 'camiseta' },
  { id: 'outfit-camiseta', nome: 'Camiseta clássica', tipo: 'outfit', valor: 'camiseta', preco: 0, emoji: 'camiseta' },
  { id: 'outfit-treino', nome: 'Conjunto fitness', tipo: 'outfit', valor: 'treino', preco: 120, emoji: 'musculacao' },
  { id: 'outfit-jaqueta', nome: 'Jaqueta urbana', tipo: 'outfit', valor: 'jaqueta', preco: 160, emoji: 'camiseta' },
  { id: 'outfit-time', nome: 'Camisa de time', tipo: 'outfit', valor: 'time', preco: 180, emoji: 'camiseta' },
  { id: 'outfit-social', nome: 'Look social', tipo: 'outfit', valor: 'social', preco: 200, emoji: 'camiseta' },
  { id: 'outfit-ninja', nome: 'Traje ninja', tipo: 'outfit', valor: 'ninja', preco: 320, emoji: 'brilho' },
  { id: 'outfit-heroi', nome: 'Uniforme de herói', tipo: 'outfit', valor: 'heroi', preco: 450, premium: true, emoji: 'raio' },
  { id: 'outfit-campeao', nome: 'Manto do Campeão', tipo: 'outfit', valor: 'campeao', preco: 500, premium: true, emoji: 'coroa' },
  { id: 'outfit-galaxia', nome: 'Armadura Galáxia', tipo: 'outfit', valor: 'galaxia', preco: 700, premium: true, emoji: 'brilho' },
  // ---- Acessórios ----
  { id: 'acc-bandana', nome: 'Bandana', tipo: 'accessory', valor: 'bandana', preco: 80, emoji: 'brilho' },
  { id: 'acc-bone', nome: 'Boné', tipo: 'accessory', valor: 'bone', preco: 90, emoji: 'estrela' },
  { id: 'acc-oculos', nome: 'Óculos esportivo', tipo: 'accessory', valor: 'oculos', preco: 100, emoji: 'oculos' },
  { id: 'acc-fone', nome: 'Fone de ouvido', tipo: 'accessory', valor: 'fone', preco: 110, emoji: 'fone' },
  { id: 'acc-tiara', nome: 'Tiara de joia', tipo: 'accessory', valor: 'tiara', preco: 140, emoji: 'brilho' },
  { id: 'acc-mascara', nome: 'Máscara de herói', tipo: 'accessory', valor: 'mascara', preco: 170, emoji: 'oculos' },
  { id: 'acc-medalha', nome: 'Medalha de ouro', tipo: 'accessory', valor: 'medalha', preco: 250, emoji: 'medalha' },
  { id: 'acc-aureola', nome: 'Auréola dourada', tipo: 'accessory', valor: 'aureola', preco: 400, premium: true, emoji: 'brilho' },
  { id: 'acc-coroa', nome: 'Coroa real', tipo: 'accessory', valor: 'coroa', preco: 600, premium: true, emoji: 'coroa' },
  { id: 'acc-asas', nome: 'Asas celestiais', tipo: 'accessory', valor: 'asas', preco: 800, premium: true, emoji: 'brilho' },
]
