import { motion } from 'framer-motion'
import type { AvatarConfig } from '@/types'

/** Avatar vetorial com uma linguagem editorial: mais alto, proporcional e menos infantil. */
export const SKIN_TONES = ['#fbd7b5', '#eab98c', '#c68863', '#9c6644', '#6f4a2f']
export const HAIR_STYLES = ['nenhum', 'curto', 'medio', 'longo', 'coque', 'moicano', 'cacheado'] as const
export const HAIR_COLORS = ['#2f2a26', '#5b4633', '#8a6b47', '#c98d3c', '#b45309', '#94a3b8', '#e11d48', '#7c3aed']
export const BEARDS = ['nenhuma', 'bigode', 'cavanhaque', 'cheia'] as const
export const OUTFITS: Record<string, { nome: string; corpo: string; detalhe: string; calca: string }> = {
  camiseta: { nome: 'Camiseta', corpo: '#2563eb', detalhe: '#1d4ed8', calca: '#25354d' },
  regata: { nome: 'Regata', corpo: '#e8eef7', detalhe: '#cbd5e1', calca: '#25354d' },
  treino: { nome: 'Fitness', corpo: '#059669', detalhe: '#047857', calca: '#172033' },
  social: { nome: 'Social', corpo: '#1e293b', detalhe: '#0f172a', calca: '#475569' },
  campeao: { nome: 'Campeão', corpo: '#d97706', detalhe: '#b45309', calca: '#4c1d0b' },
}
export const ACCESSORIES = ['nenhum', 'bone', 'bandana', 'oculos', 'medalha', 'coroa', 'fone'] as const

const CX = 110
type Body = { shoulder: number; waist: number; hip: number; arm: number; posture: number }

const BODIES: Record<number, Body> = {
  1: { shoulder: 31, waist: 37, hip: 33, arm: 8, posture: 5 },
  2: { shoulder: 32, waist: 34, hip: 32, arm: 8, posture: 3 },
  3: { shoulder: 34, waist: 30, hip: 31, arm: 9, posture: 1 },
  4: { shoulder: 38, waist: 29, hip: 31, arm: 10, posture: 0 },
  5: { shoulder: 41, waist: 28, hip: 32, arm: 11, posture: 0 },
}

function shirtPath(b: Body) {
  const top = 123 + b.posture
  return `M ${CX - b.shoulder} ${top}
    Q ${CX - 22} ${top - 8} ${CX} ${top - 7}
    Q ${CX + 22} ${top - 8} ${CX + b.shoulder} ${top}
    L ${CX + b.waist} 184
    Q ${CX + b.hip} 199 ${CX + b.hip - 2} 211
    Q ${CX} 216 ${CX - b.hip + 2} 211
    Q ${CX - b.hip} 199 ${CX - b.waist} 184 Z`
}

function Hair({ style, color, headY }: { style: string; color: string; headY: number }) {
  if (style === 'nenhum') return null
  if (style === 'cacheado') return <g fill={color}>{[-24, -12, 0, 12, 24].map((x, i) => <circle key={x} cx={CX + x} cy={headY - 25 + (i % 2) * 3} r={i === 2 ? 15 : 13} />)}</g>
  if (style === 'coque') return <><circle cx={CX + 17} cy={headY - 38} r={12} fill={color} /><path d={`M ${CX - 29} ${headY - 8} Q ${CX - 26} ${headY - 35} ${CX} ${headY - 35} Q ${CX + 28} ${headY - 34} ${CX + 30} ${headY - 8} Q ${CX} ${headY - 20} ${CX - 29} ${headY - 8} Z`} fill={color} /></>
  if (style === 'moicano') return <path d={`M ${CX - 10} ${headY - 7} L ${CX - 6} ${headY - 43} Q ${CX} ${headY - 52} ${CX + 6} ${headY - 43} L ${CX + 10} ${headY - 7} Z`} fill={color} />
  if (style === 'longo') return <path d={`M ${CX - 29} ${headY - 10} Q ${CX - 36} ${headY + 26} ${CX - 25} ${headY + 53} L ${CX + 26} ${headY + 53} Q ${CX + 36} ${headY + 25} ${CX + 29} ${headY - 10} Q ${CX} ${headY - 40} ${CX - 29} ${headY - 10} Z`} fill={color} />
  if (style === 'medio') return <path d={`M ${CX - 30} ${headY + 13} Q ${CX - 35} ${headY - 32} ${CX} ${headY - 38} Q ${CX + 35} ${headY - 32} ${CX + 30} ${headY + 16} L ${CX + 20} ${headY + 8} Q ${CX} ${headY - 15} ${CX - 22} ${headY + 8} Z`} fill={color} />
  return <path d={`M ${CX - 29} ${headY - 5} Q ${CX - 26} ${headY - 35} ${CX} ${headY - 37} Q ${CX + 27} ${headY - 35} ${CX + 30} ${headY - 5} Q ${CX + 17} ${headY - 19} ${CX + 3} ${headY - 16} Q ${CX - 14} ${headY - 22} ${CX - 29} ${headY - 5} Z`} fill={color} />
}

function Face({ humor, headY }: { humor: AvatarConfig['humor']; headY: number }) {
  const sad = humor === 'triste' || humor === 'cansado'
  return <g>
    <path d={`M ${CX - 20} ${headY - 10} Q ${CX - 13} ${headY - 14} ${CX - 7} ${headY - 10}`} fill="none" stroke="#334155" strokeWidth="2.4" strokeLinecap="round" />
    <path d={`M ${CX + 7} ${headY - 10} Q ${CX + 13} ${headY - 14} ${CX + 20} ${headY - 10}`} fill="none" stroke="#334155" strokeWidth="2.4" strokeLinecap="round" />
    <ellipse cx={CX - 13} cy={headY - 2} rx="5.4" ry="6.2" fill="#fff" />
    <ellipse cx={CX + 13} cy={headY - 2} rx="5.4" ry="6.2" fill="#fff" />
    <circle cx={CX - 12} cy={headY - 1} r="2.7" fill="#263548" />
    <circle cx={CX + 14} cy={headY - 1} r="2.7" fill="#263548" />
    <path d={`M ${CX} ${headY} L ${CX - 2} ${headY + 10} L ${CX + 3} ${headY + 10}`} fill="none" stroke="#b7795d" strokeWidth="1.3" strokeLinecap="round" />
    {sad ? <path d={`M ${CX - 8} ${headY + 20} Q ${CX} ${headY + 14} ${CX + 8} ${headY + 20}`} fill="none" stroke="#7f1d1d" strokeWidth="2.4" strokeLinecap="round" /> : <path d={`M ${CX - 9} ${headY + 16} Q ${CX} ${headY + 24} ${CX + 9} ${headY + 16}`} fill="none" stroke="#7f1d1d" strokeWidth="2.5" strokeLinecap="round" />}
    {(humor === 'feliz' || humor === 'energico') && <><circle cx={CX - 22} cy={headY + 9} r="3.5" fill="#ef8f84" opacity=".35" /><circle cx={CX + 22} cy={headY + 9} r="3.5" fill="#ef8f84" opacity=".35" /></>}
  </g>
}

export function AvatarEngine({ config, size = 240, animado = true }: { config: AvatarConfig; size?: number; animado?: boolean }) {
  const body = BODIES[config.estagio] ?? BODIES[1]
  const outfit = OUTFITS[config.outfit] ?? OUTFITS.camiseta
  const headY = 75 + body.posture
  const champion = config.estagio === 5
  const armY = 139 + body.posture

  return <motion.svg viewBox="0 0 220 310" width={size} height={(size / 220) * 310} initial={false} animate={animado ? { y: [0, -2, 0] } : undefined} transition={animado ? { repeat: Infinity, duration: 3.2, ease: 'easeInOut' } : undefined}>
    <defs>
      <radialGradient id="avatar-aura"><stop stopColor="#fbbf24" stopOpacity=".38" /><stop offset="1" stopColor="#fbbf24" stopOpacity="0" /></radialGradient>
      <linearGradient id="avatar-shirt" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fff" stopOpacity=".16" /><stop offset=".45" stopColor="#fff" stopOpacity="0" /></linearGradient>
    </defs>
    {champion && <circle cx={CX} cy="156" r="103" fill="url(#avatar-aura)" />}
    {config.outfit === 'campeao' && <path d={`M ${CX - body.shoulder + 2} ${armY} Q ${CX - 56} 210 ${CX - 39} 260 L ${CX + 39} 260 Q ${CX + 56} 210 ${CX + body.shoulder - 2} ${armY} Z`} fill="#b91c1c" opacity=".9" />}
    {config.hair === 'longo' && <Hair style="longo" color={config.hairColor} headY={headY} />}

    {/* pernas e sapatos */}
    <path d={`M ${CX - 28} 207 L ${CX - 7} 207 L ${CX - 9} 267 Q ${CX - 20} 271 ${CX - 31} 266 Z`} fill={outfit.calca} />
    <path d={`M ${CX + 28} 207 L ${CX + 7} 207 L ${CX + 9} 267 Q ${CX + 20} 271 ${CX + 31} 266 Z`} fill={outfit.calca} />
    <path d={`M ${CX - 32} 265 Q ${CX - 17} 260 ${CX - 8} 269 L ${CX - 8} 276 Q ${CX - 26} 281 ${CX - 40} 274 Q ${CX - 40} 267 ${CX - 32} 265 Z`} fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.7" />
    <path d={`M ${CX + 32} 265 Q ${CX + 17} 260 ${CX + 8} 269 L ${CX + 8} 276 Q ${CX + 26} 281 ${CX + 40} 274 Q ${CX + 40} 267 ${CX + 32} 265 Z`} fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.7" />

    {/* braços, mãos e pescoço */}
    <path d={`M ${CX - body.shoulder + 2} ${armY} Q ${CX - body.shoulder - 12} 165 ${CX - body.shoulder - 8} 194`} fill="none" stroke={config.skinTone} strokeWidth={body.arm * 2} strokeLinecap="round" />
    <path d={`M ${CX + body.shoulder - 2} ${armY} Q ${CX + body.shoulder + 12} 165 ${CX + body.shoulder + 8} 194`} fill="none" stroke={config.skinTone} strokeWidth={body.arm * 2} strokeLinecap="round" />
    <circle cx={CX - body.shoulder - 8} cy="195" r={body.arm} fill={config.skinTone} />
    <circle cx={CX + body.shoulder + 8} cy="195" r={body.arm} fill={config.skinTone} />
    <path d={`M ${CX - 8} ${headY + 25} L ${CX + 8} ${headY + 25} L ${CX + 8} ${headY + 44} Q ${CX} ${headY + 48} ${CX - 8} ${headY + 44} Z`} fill={config.skinTone} />

    {/* roupa */}
    <motion.path animate={{ d: shirtPath(body) }} transition={{ duration: .65, ease: 'easeInOut' }} fill={outfit.corpo} />
    <motion.path animate={{ d: shirtPath(body) }} transition={{ duration: .65, ease: 'easeInOut' }} fill="url(#avatar-shirt)" />
    {config.outfit !== 'regata' && <><path d={`M ${CX - body.shoulder} ${armY} L ${CX - body.shoulder - 4} 158`} stroke={outfit.detalhe} strokeWidth={body.arm * 2 + 4} strokeLinecap="round" /><path d={`M ${CX + body.shoulder} ${armY} L ${CX + body.shoulder + 4} 158`} stroke={outfit.detalhe} strokeWidth={body.arm * 2 + 4} strokeLinecap="round" /></>}
    <path d={`M ${CX - 12} ${122 + body.posture} Q ${CX} ${137 + body.posture} ${CX + 12} ${122 + body.posture}`} fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="2" />
    {config.outfit === 'social' && <path d={`M ${CX - 15} ${123 + body.posture} L ${CX} ${145 + body.posture} L ${CX + 15} ${123 + body.posture} L ${CX + 8} ${122 + body.posture} L ${CX} ${133 + body.posture} L ${CX - 8} ${122 + body.posture} Z`} fill="#f8fafc" />}
    {config.outfit === 'treino' && <path d={`M ${CX - body.hip + 7} 190 L ${CX - body.hip + 10} 207 M ${CX + body.hip - 7} 190 L ${CX + body.hip - 10} 207`} stroke="#6ee7b7" strokeWidth="2.5" strokeLinecap="round" />}

    {/* rosto e cabelo */}
    <circle cx={CX - 30} cy={headY + 1} r="5" fill={config.skinTone} />
    <circle cx={CX + 30} cy={headY + 1} r="5" fill={config.skinTone} />
    <path d={`M ${CX - 29} ${headY - 8} Q ${CX - 27} ${headY - 34} ${CX} ${headY - 35} Q ${CX + 27} ${headY - 34} ${CX + 29} ${headY - 8} L ${CX + 25} ${headY + 14} Q ${CX + 16} ${headY + 31} ${CX} ${headY + 33} Q ${CX - 16} ${headY + 31} ${CX - 25} ${headY + 14} Z`} fill={config.skinTone} />
    {config.beard === 'cheia' && <path d={`M ${CX - 24} ${headY + 8} Q ${CX - 20} ${headY + 34} ${CX} ${headY + 35} Q ${CX + 20} ${headY + 34} ${CX + 24} ${headY + 8} Q ${CX} ${headY + 22} ${CX - 24} ${headY + 8} Z`} fill={config.hairColor} />}
    <Face humor={config.humor} headY={headY} />
    {config.hair !== 'longo' && <Hair style={config.hair} color={config.hairColor} headY={headY} />}
    {config.beard === 'bigode' && <path d={`M ${CX - 11} ${headY + 15} Q ${CX} ${headY + 10} ${CX + 11} ${headY + 15}`} fill="none" stroke={config.hairColor} strokeWidth="4" strokeLinecap="round" />}
    {config.beard === 'cavanhaque' && <path d={`M ${CX - 7} ${headY + 21} Q ${CX} ${headY + 32} ${CX + 7} ${headY + 21} Z`} fill={config.hairColor} />}

    {/* acessórios */}
    {config.accessory === 'bone' && <><path d={`M ${CX - 28} ${headY - 12} Q ${CX} ${headY - 42} ${CX + 28} ${headY - 12} Z`} fill="#ef4444" /><path d={`M ${CX + 10} ${headY - 12} Q ${CX + 35} ${headY - 12} ${CX + 43} ${headY - 5}`} stroke="#b91c1c" strokeWidth="6" strokeLinecap="round" /></>}
    {config.accessory === 'bandana' && <path d={`M ${CX - 30} ${headY - 16} L ${CX + 30} ${headY - 16} L ${CX + 26} ${headY - 6} L ${CX - 30} ${headY - 6} Z`} fill="#8b5cf6" />}
    {config.accessory === 'oculos' && <g fill="none" stroke="#182235" strokeWidth="3"><rect x={CX - 27} y={headY - 8} width="21" height="15" rx="6" /><rect x={CX + 6} y={headY - 8} width="21" height="15" rx="6" /><path d={`M ${CX - 6} ${headY - 1} H ${CX + 6}`} /></g>}
    {config.accessory === 'fone' && <><path d={`M ${CX - 34} ${headY + 2} Q ${CX} ${headY - 44} ${CX + 34} ${headY + 2}`} fill="none" stroke="#25354d" strokeWidth="5" /><rect x={CX - 39} y={headY - 3} width="10" height="19" rx="4" fill="#172033" /><rect x={CX + 29} y={headY - 3} width="10" height="19" rx="4" fill="#172033" /></>}
    {config.accessory === 'coroa' && <path d={`M ${CX - 22} ${headY - 31} L ${CX - 22} ${headY - 49} L ${CX - 8} ${headY - 38} L ${CX} ${headY - 53} L ${CX + 8} ${headY - 38} L ${CX + 22} ${headY - 49} L ${CX + 22} ${headY - 31} Z`} fill="#fbbf24" stroke="#d97706" strokeWidth="2" />}
    {config.accessory === 'medalha' && <><path d={`M ${CX - 12} ${123 + body.posture} L ${CX} 153 L ${CX + 12} ${123 + body.posture}`} fill="none" stroke="#dc2626" strokeWidth="5" /><circle cx={CX} cy="156" r="10" fill="#fbbf24" stroke="#b45309" strokeWidth="2" /><path d={`M ${CX} 150 L ${CX + 2} 155 L ${CX + 7} 155 L ${CX + 3} 158 L ${CX + 5} 163 L ${CX} 160 L ${CX - 5} 163 L ${CX - 3} 158 L ${CX - 7} 155 L ${CX - 2} 155 Z`} fill="#fff" /></>}
  </motion.svg>
}

export const DEFAULT_AVATAR = (estagio: 1 | 2 | 3 | 4 | 5 = 1): AvatarConfig => ({
  estagio,
  skinTone: SKIN_TONES[1],
  hair: 'curto',
  hairColor: HAIR_COLORS[0],
  beard: 'nenhuma',
  eyes: 'padrao',
  outfit: 'camiseta',
  accessory: 'nenhum',
  humor: 'neutro',
})
