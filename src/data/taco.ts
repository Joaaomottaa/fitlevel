/**
 * Mini base nutricional por 100g — valores da Tabela TACO (UNICAMP) e OpenFoodFacts.
 * Usada pelo chat, pelo plano alimentar local e como contexto para a IA no n8n.
 */
export interface Alimento {
  nome: string
  grupo: 'proteina' | 'carbo' | 'fruta' | 'verdura' | 'gordura' | 'laticinio' | 'lanche'
  kcal: number
  prot: number
  carb: number
  gord: number
  fibra: number
}

export const TACO: Alimento[] = [
  { nome: 'Arroz branco cozido', grupo: 'carbo', kcal: 128, prot: 2.5, carb: 28.1, gord: 0.2, fibra: 1.6 },
  { nome: 'Arroz integral cozido', grupo: 'carbo', kcal: 124, prot: 2.6, carb: 25.8, gord: 1.0, fibra: 2.7 },
  { nome: 'Feijão carioca cozido', grupo: 'carbo', kcal: 76, prot: 4.8, carb: 13.6, gord: 0.5, fibra: 8.5 },
  { nome: 'Batata-doce cozida', grupo: 'carbo', kcal: 77, prot: 0.6, carb: 18.4, gord: 0.1, fibra: 2.2 },
  { nome: 'Mandioca cozida', grupo: 'carbo', kcal: 125, prot: 0.6, carb: 30.1, gord: 0.3, fibra: 1.6 },
  { nome: 'Tapioca', grupo: 'carbo', kcal: 240, prot: 0, carb: 59.4, gord: 0, fibra: 0.4 },
  { nome: 'Pão francês', grupo: 'carbo', kcal: 300, prot: 8.0, carb: 58.6, gord: 3.1, fibra: 2.3 },
  { nome: 'Pão integral', grupo: 'carbo', kcal: 253, prot: 9.4, carb: 49.9, gord: 3.5, fibra: 6.9 },
  { nome: 'Aveia em flocos', grupo: 'carbo', kcal: 394, prot: 13.9, carb: 66.6, gord: 8.5, fibra: 9.1 },
  { nome: 'Macarrão cozido', grupo: 'carbo', kcal: 158, prot: 5.8, carb: 30.9, gord: 0.9, fibra: 1.8 },
  { nome: 'Cuscuz de milho', grupo: 'carbo', kcal: 113, prot: 2.2, carb: 25.3, gord: 0.7, fibra: 2.1 },
  { nome: 'Peito de frango grelhado', grupo: 'proteina', kcal: 159, prot: 32.0, carb: 0, gord: 2.5, fibra: 0 },
  { nome: 'Carne bovina magra (patinho)', grupo: 'proteina', kcal: 219, prot: 35.9, carb: 0, gord: 7.3, fibra: 0 },
  { nome: 'Tilápia grelhada', grupo: 'proteina', kcal: 128, prot: 26.2, carb: 0, gord: 2.7, fibra: 0 },
  { nome: 'Ovo cozido', grupo: 'proteina', kcal: 146, prot: 13.3, carb: 0.6, gord: 9.5, fibra: 0 },
  { nome: 'Atum em lata (água)', grupo: 'proteina', kcal: 108, prot: 24.1, carb: 0, gord: 1.0, fibra: 0 },
  { nome: 'Carne de porco (lombo)', grupo: 'proteina', kcal: 210, prot: 32.1, carb: 0, gord: 8.7, fibra: 0 },
  { nome: 'Tofu', grupo: 'proteina', kcal: 64, prot: 6.6, carb: 2.1, gord: 4.0, fibra: 0.8 },
  { nome: 'Grão-de-bico cozido', grupo: 'proteina', kcal: 130, prot: 8.4, carb: 21.2, gord: 2.1, fibra: 5.1 },
  { nome: 'Lentilha cozida', grupo: 'proteina', kcal: 93, prot: 6.3, carb: 16.3, gord: 0.5, fibra: 7.9 },
  { nome: 'Banana', grupo: 'fruta', kcal: 92, prot: 1.3, carb: 23.8, gord: 0.1, fibra: 1.9 },
  { nome: 'Maçã', grupo: 'fruta', kcal: 56, prot: 0.3, carb: 15.2, gord: 0, fibra: 1.3 },
  { nome: 'Mamão', grupo: 'fruta', kcal: 40, prot: 0.5, carb: 10.4, gord: 0.1, fibra: 1.8 },
  { nome: 'Laranja', grupo: 'fruta', kcal: 37, prot: 1.0, carb: 8.9, gord: 0.1, fibra: 0.8 },
  { nome: 'Morango', grupo: 'fruta', kcal: 30, prot: 0.9, carb: 6.8, gord: 0.3, fibra: 1.7 },
  { nome: 'Abacate', grupo: 'gordura', kcal: 96, prot: 1.2, carb: 6.0, gord: 8.4, fibra: 6.3 },
  { nome: 'Manga', grupo: 'fruta', kcal: 64, prot: 0.4, carb: 16.7, gord: 0.3, fibra: 1.6 },
  { nome: 'Melancia', grupo: 'fruta', kcal: 33, prot: 0.9, carb: 8.1, gord: 0, fibra: 0.1 },
  { nome: 'Brócolis cozido', grupo: 'verdura', kcal: 25, prot: 2.1, carb: 4.4, gord: 0.5, fibra: 3.4 },
  { nome: 'Alface', grupo: 'verdura', kcal: 11, prot: 1.3, carb: 1.7, gord: 0.2, fibra: 2.0 },
  { nome: 'Tomate', grupo: 'verdura', kcal: 15, prot: 1.1, carb: 3.1, gord: 0.2, fibra: 1.2 },
  { nome: 'Cenoura crua', grupo: 'verdura', kcal: 34, prot: 1.3, carb: 7.7, gord: 0.2, fibra: 3.2 },
  { nome: 'Couve refogada', grupo: 'verdura', kcal: 90, prot: 1.7, carb: 8.7, gord: 6.6, fibra: 5.7 },
  { nome: 'Abobrinha cozida', grupo: 'verdura', kcal: 15, prot: 1.1, carb: 3.0, gord: 0.2, fibra: 1.6 },
  { nome: 'Leite desnatado', grupo: 'laticinio', kcal: 35, prot: 3.4, carb: 4.9, gord: 0.2, fibra: 0 },
  { nome: 'Iogurte natural desnatado', grupo: 'laticinio', kcal: 41, prot: 3.8, carb: 5.8, gord: 0.3, fibra: 0 },
  { nome: 'Queijo minas frescal', grupo: 'laticinio', kcal: 264, prot: 17.4, carb: 3.2, gord: 20.2, fibra: 0 },
  { nome: 'Requeijão light', grupo: 'laticinio', kcal: 182, prot: 11.6, carb: 3.0, gord: 14.0, fibra: 0 },
  { nome: 'Azeite de oliva', grupo: 'gordura', kcal: 884, prot: 0, carb: 0, gord: 100, fibra: 0 },
  { nome: 'Castanha-de-caju', grupo: 'gordura', kcal: 570, prot: 18.5, carb: 29.1, gord: 46.3, fibra: 3.7 },
  { nome: 'Amendoim', grupo: 'gordura', kcal: 544, prot: 27.2, carb: 20.3, gord: 43.9, fibra: 8.0 },
  { nome: 'Pasta de amendoim', grupo: 'gordura', kcal: 589, prot: 22.5, carb: 21.6, gord: 49.9, fibra: 6.0 },
  { nome: 'Whey protein (dose 30g)', grupo: 'proteina', kcal: 400, prot: 80.0, carb: 10.0, gord: 5.0, fibra: 0 },
  { nome: 'Granola', grupo: 'lanche', kcal: 421, prot: 10.5, carb: 67.5, gord: 12.2, fibra: 8.7 },
  { nome: 'Mel', grupo: 'lanche', kcal: 309, prot: 0, carb: 84.0, gord: 0, fibra: 0.4 },
]

export function buscarAlimento(termo: string): Alimento | undefined {
  const t = termo.toLowerCase()
  return TACO.find((a) => a.nome.toLowerCase().includes(t))
}
