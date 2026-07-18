import { motion } from 'framer-motion'
import type { AvatarConfig } from '@/types'

/**
 * AvatarEngine — avatar vetorial em camadas, 100% paramétrico.
 * O corpo tem 5 morfologias (estágios da jornada de 100 dias) e a
 * transição entre elas é animada por interpolação de path (framer-motion).
 * A IA (via n8n) devolve apenas PARÂMETROS — nunca imagens — por isso o
 * avatar anima, troca de roupa e evolui sem custo de geração.
 */

export const SKIN_TONES = ['#fbd7b5', '#eab98c', '#c68863', '#9c6644', '#6f4a2f']
export const HAIR_STYLES = ['nenhum', 'curto', 'medio', 'longo', 'coque', 'moicano', 'cacheado'] as const
export const HAIR_COLORS = ['#2f2a26', '#5b4633', '#8a6b47', '#c98d3c', '#b45309', '#94a3b8', '#e11d48', '#7c3aed']
export const BEARDS = ['nenhuma', 'bigode', 'cavanhaque', 'cheia'] as const
export const OUTFITS: Record<string, { nome: string; corpo: string; detalhe: string; calca: string }> = {
  camiseta: { nome: 'Camiseta', corpo: '#3b82f6', detalhe: '#2563eb', calca: '#334155' },
  regata: { nome: 'Regata', corpo: '#e2e8f0', detalhe: '#cbd5e1', calca: '#334155' },
  treino: { nome: 'Fitness', corpo: '#10b981', detalhe: '#059669', calca: '#0f172a' },
  social: { nome: 'Social', corpo: '#1e293b', detalhe: '#0f172a', calca: '#475569' },
  campeao: { nome: 'Campeão', corpo: '#f59e0b', detalhe: '#d97706', calca: '#7c2d12' },
}
export const ACCESSORIES = ['nenhum', 'bone', 'bandana', 'oculos', 'medalha', 'coroa', 'fone'] as const

interface Body {
  ombro: number // meia-largura do ombro
  cintura: number // meia-largura na altura da barriga
  quadril: number
  braco: number // espessura do braço
  perna: number
  curvado: number // quanto a postura cai (px)
}

const BODIES: Record<number, Body> = {
  1: { ombro: 27, cintura: 54, quadril: 46, braco: 11, perna: 15, curvado: 9 },
  2: { ombro: 29, cintura: 47, quadril: 41, braco: 11, perna: 14, curvado: 6 },
  3: { ombro: 31, cintura: 39, quadril: 35, braco: 11, perna: 13, curvado: 2 },
  4: { ombro: 35, cintura: 32, quadril: 31, braco: 13, perna: 12, curvado: 0 },
  5: { ombro: 39, cintura: 28, quadril: 30, braco: 15, perna: 12, curvado: 0 },
}

const CX = 110

function torsoPath(b: Body): string {
  const top = 120 + b.curvado
  const waistY = b.cintura > b.ombro ? 176 : 168
  const hipY = 206
  return [
    `M ${CX - b.ombro} ${top}`,
    `C ${CX - b.cintura - 6} ${waistY - 22} ${CX - b.cintura} ${waistY + 14} ${CX - b.quadril} ${hipY}`,
    `Q ${CX} ${hipY + 10} ${CX + b.quadril} ${hipY}`,
    `C ${CX + b.cintura} ${waistY + 14} ${CX + b.cintura + 6} ${waistY - 22} ${CX + b.ombro} ${top}`,
    `Q ${CX} ${top - 8} ${CX - b.ombro} ${top}`,
    'Z',
  ].join(' ')
}

export function AvatarEngine({
  config,
  size = 240,
  animado = true,
}: {
  config: AvatarConfig
  size?: number
  animado?: boolean
}) {
  const b = BODIES[config.estagio] ?? BODIES[1]
  const outfit = OUTFITS[config.outfit] ?? OUTFITS.camiseta
  const skin = config.skinTone
  const headY = 74 + b.curvado
  const campeao = config.estagio === 5

  return (
    <motion.svg
      viewBox="0 0 220 300"
      width={size}
      height={(size / 220) * 300}
      initial={false}
      animate={animado ? { y: [0, -3, 0] } : undefined}
      transition={animado ? { repeat: Infinity, duration: 3, ease: 'easeInOut' } : undefined}
    >
      <defs>
        <radialGradient id="aura" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#fbbf24" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="capa" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
      </defs>

      {/* aura do campeão */}
      {campeao && (
        <>
          <circle cx={CX} cy={150} r={100} fill="url(#aura)" />
          {[
            [30, 60],
            [190, 80],
            [40, 200],
            [185, 190],
          ].map(([x, y], i) => (
            <motion.text
              key={i}
              x={x}
              y={y}
              fontSize="14"
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.15, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.4 }}
            >
              ✨
            </motion.text>
          ))}
        </>
      )}

      {/* capa do manto do campeão */}
      {config.outfit === 'campeao' && (
        <path
          d={`M ${CX - b.ombro - 2} ${122 + b.curvado} Q ${CX - b.ombro - 26} 200 ${CX - b.ombro - 14} 246 L ${CX + b.ombro + 14} 246 Q ${CX + b.ombro + 26} 200 ${CX + b.ombro + 2} ${122 + b.curvado} Z`}
          fill="url(#capa)"
        />
      )}

      {/* cabelo longo (atrás da cabeça) */}
      {config.hair === 'longo' && (
        <path
          d={`M ${CX - 36} ${headY - 10} Q ${CX - 44} ${headY + 44} ${CX - 30} ${headY + 52} L ${CX + 30} ${headY + 52} Q ${CX + 44} ${headY + 44} ${CX + 36} ${headY - 10} Z`}
          fill={config.hairColor}
        />
      )}

      {/* pernas */}
      <line x1={CX - 15} y1={205} x2={CX - 16} y2={254} stroke={outfit.calca} strokeWidth={b.perna * 2} strokeLinecap="round" />
      <line x1={CX + 15} y1={205} x2={CX + 16} y2={254} stroke={outfit.calca} strokeWidth={b.perna * 2} strokeLinecap="round" />
      {/* tênis */}
      <ellipse cx={CX - 18} cy={262} rx={14} ry={7} fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
      <ellipse cx={CX + 18} cy={262} rx={14} ry={7} fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />

      {/* braços */}
      <motion.line
        x1={CX - b.ombro + 3}
        y1={128 + b.curvado}
        x2={CX - b.ombro - 8}
        y2={192}
        stroke={skin}
        strokeLinecap="round"
        animate={{ strokeWidth: b.braco * 2 }}
      />
      <motion.line
        x1={CX + b.ombro - 3}
        y1={128 + b.curvado}
        x2={CX + b.ombro + 8}
        y2={192}
        stroke={skin}
        strokeLinecap="round"
        animate={{ strokeWidth: b.braco * 2 }}
      />
      {/* mangas (exceto regata) */}
      {config.outfit !== 'regata' && (
        <>
          <motion.line
            x1={CX - b.ombro + 3}
            y1={128 + b.curvado}
            x2={CX - b.ombro - 2}
            y2={152}
            stroke={outfit.detalhe}
            strokeLinecap="round"
            animate={{ strokeWidth: b.braco * 2 + 4 }}
          />
          <motion.line
            x1={CX + b.ombro - 3}
            y1={128 + b.curvado}
            x2={CX + b.ombro + 2}
            y2={152}
            stroke={outfit.detalhe}
            strokeLinecap="round"
            animate={{ strokeWidth: b.braco * 2 + 4 }}
          />
        </>
      )}

      {/* pescoço */}
      <rect x={CX - 8} y={headY + 26} width={16} height={18} rx={6} fill={skin} />

      {/* torso (morfologia animada por estágio) */}
      <motion.path animate={{ d: torsoPath(b) }} transition={{ duration: 0.9, ease: 'easeInOut' }} fill={outfit.corpo} />
      {/* faixa lateral do look fitness */}
      {config.outfit === 'treino' && (
        <motion.path
          animate={{ d: torsoPath({ ...b, ombro: b.ombro - 6, cintura: b.cintura - 6, quadril: b.quadril - 6 }) }}
          transition={{ duration: 0.9 }}
          fill="none"
          stroke={outfit.detalhe}
          strokeWidth="4"
          strokeDasharray="2 8"
        />
      )}
      {/* colarinho social */}
      {config.outfit === 'social' && <path d={`M ${CX - 12} ${118 + b.curvado} L ${CX} ${134 + b.curvado} L ${CX + 12} ${118 + b.curvado} Z`} fill="#f8fafc" />}
      {/* linha do peito nos estágios fortes */}
      {config.estagio >= 4 && (
        <path
          d={`M ${CX - 16} ${148 + b.curvado} Q ${CX} ${156 + b.curvado} ${CX + 16} ${148 + b.curvado}`}
          fill="none"
          stroke={outfit.detalhe}
          strokeWidth="3"
          strokeLinecap="round"
          opacity={0.7}
        />
      )}

      {/* medalha */}
      {config.accessory === 'medalha' && (
        <>
          <path d={`M ${CX - 14} ${122 + b.curvado} L ${CX} 152 L ${CX + 14} ${122 + b.curvado}`} fill="none" stroke="#dc2626" strokeWidth="6" />
          <circle cx={CX} cy={156} r={11} fill="#fbbf24" stroke="#d97706" strokeWidth="3" />
          <text x={CX} y={161} textAnchor="middle" fontSize="12">⭐</text>
        </>
      )}

      {/* cabeça */}
      <circle cx={CX} cy={headY} r={34} fill={skin} />
      {/* orelhas */}
      <circle cx={CX - 33} cy={headY + 2} r={6} fill={skin} />
      <circle cx={CX + 33} cy={headY + 2} r={6} fill={skin} />

      {/* barba */}
      {config.beard === 'cheia' && (
        <path
          d={`M ${CX - 32} ${headY - 2} Q ${CX - 34} ${headY + 34} ${CX} ${headY + 36} Q ${CX + 34} ${headY + 34} ${CX + 32} ${headY - 2} Q ${CX + 26} ${headY + 16} ${CX} ${headY + 16} Q ${CX - 26} ${headY + 16} ${CX - 32} ${headY - 2} Z`}
          fill={config.hairColor}
        />
      )}
      {config.beard === 'cavanhaque' && <ellipse cx={CX} cy={headY + 28} rx={10} ry={7} fill={config.hairColor} />}
      {config.beard === 'bigode' && (
        <path d={`M ${CX - 12} ${headY + 17} Q ${CX} ${headY + 12} ${CX + 12} ${headY + 17}`} fill="none" stroke={config.hairColor} strokeWidth="5" strokeLinecap="round" />
      )}

      {/* rosto */}
      <Face humor={config.humor} headY={headY} />

      {/* cabelos */}
      {config.hair === 'curto' && (
        <path d={`M ${CX - 34} ${headY - 6} Q ${CX - 30} ${headY - 40} ${CX} ${headY - 38} Q ${CX + 30} ${headY - 40} ${CX + 34} ${headY - 6} Q ${CX + 20} ${headY - 22} ${CX} ${headY - 24} Q ${CX - 20} ${headY - 22} ${CX - 34} ${headY - 6} Z`} fill={config.hairColor} />
      )}
      {(config.hair === 'medio' || config.hair === 'longo') && (
        <path d={`M ${CX - 35} ${headY + 8} Q ${CX - 40} ${headY - 36} ${CX} ${headY - 40} Q ${CX + 40} ${headY - 36} ${CX + 35} ${headY + 8} Q ${CX + 32} ${headY - 16} ${CX + 14} ${headY - 22} Q ${CX - 8} ${headY - 26} ${CX - 26} ${headY - 12} Q ${CX - 33} ${headY - 6} ${CX - 35} ${headY + 8} Z`} fill={config.hairColor} />
      )}
      {config.hair === 'coque' && (
        <>
          <path d={`M ${CX - 34} ${headY - 6} Q ${CX - 30} ${headY - 38} ${CX} ${headY - 36} Q ${CX + 30} ${headY - 38} ${CX + 34} ${headY - 6} Q ${CX} ${headY - 26} ${CX - 34} ${headY - 6} Z`} fill={config.hairColor} />
          <circle cx={CX} cy={headY - 40} r={11} fill={config.hairColor} />
        </>
      )}
      {config.hair === 'moicano' && <path d={`M ${CX - 8} ${headY - 26} Q ${CX} ${headY - 56} ${CX + 8} ${headY - 26} Z`} fill={config.hairColor} />}
      {config.hair === 'cacheado' && (
        <g fill={config.hairColor}>
          <circle cx={CX - 22} cy={headY - 22} r={13} />
          <circle cx={CX} cy={headY - 30} r={15} />
          <circle cx={CX + 22} cy={headY - 22} r={13} />
          <circle cx={CX - 32} cy={headY - 8} r={9} />
          <circle cx={CX + 32} cy={headY - 8} r={9} />
        </g>
      )}

      {/* acessórios */}
      {config.accessory === 'bone' && (
        <>
          <path d={`M ${CX - 32} ${headY - 12} Q ${CX} ${headY - 52} ${CX + 32} ${headY - 12} Z`} fill="#ef4444" />
          <ellipse cx={CX + 24} cy={headY - 12} rx={22} ry={5} fill="#b91c1c" />
        </>
      )}
      {config.accessory === 'bandana' && (
        <>
          <rect x={CX - 34} y={headY - 22} width={68} height={10} rx={5} fill="#8b5cf6" />
          <circle cx={CX + 34} cy={headY - 16} r={5} fill="#7c3aed" />
        </>
      )}
      {config.accessory === 'oculos' && (
        <g opacity={0.85}>
          <rect x={CX - 26} y={headY - 8} width={20} height={14} rx={6} fill="#0f172a" />
          <rect x={CX + 6} y={headY - 8} width={20} height={14} rx={6} fill="#0f172a" />
          <line x1={CX - 6} y1={headY - 2} x2={CX + 6} y2={headY - 2} stroke="#0f172a" strokeWidth="3" />
        </g>
      )}
      {config.accessory === 'coroa' && (
        <path d={`M ${CX - 24} ${headY - 30} L ${CX - 24} ${headY - 48} L ${CX - 12} ${headY - 38} L ${CX} ${headY - 52} L ${CX + 12} ${headY - 38} L ${CX + 24} ${headY - 48} L ${CX + 24} ${headY - 30} Z`} fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
      )}
      {config.accessory === 'fone' && (
        <>
          <path d={`M ${CX - 36} ${headY} Q ${CX} ${headY - 52} ${CX + 36} ${headY}`} fill="none" stroke="#334155" strokeWidth="6" />
          <rect x={CX - 42} y={headY - 8} width={12} height={18} rx={5} fill="#0f172a" />
          <rect x={CX + 30} y={headY - 8} width={12} height={18} rx={5} fill="#0f172a" />
        </>
      )}

      {/* extras de humor */}
      {config.humor === 'cansado' && <text x={CX + 38} y={headY - 18} fontSize="16">💧</text>}
      {config.humor === 'energico' && <text x={CX - 52} y={headY - 24} fontSize="16">⚡</text>}
    </motion.svg>
  )
}

function Face({ humor, headY }: { humor: AvatarConfig['humor']; headY: number }) {
  const eyeY = headY - 4
  const cansado = humor === 'cansado'
  const triste = humor === 'triste'
  return (
    <g>
      {/* olhos */}
      <ellipse cx={CX - 13} cy={eyeY} rx={6} ry={cansado ? 4 : 7} fill="#fff" />
      <ellipse cx={CX + 13} cy={eyeY} rx={6} ry={cansado ? 4 : 7} fill="#fff" />
      <circle cx={CX - 12} cy={eyeY + 1} r={3} fill="#1e293b" />
      <circle cx={CX + 14} cy={eyeY + 1} r={3} fill="#1e293b" />
      <circle cx={CX - 11} cy={eyeY - 1} r={1} fill="#fff" />
      <circle cx={CX + 15} cy={eyeY - 1} r={1} fill="#fff" />
      {/* sobrancelhas */}
      <line
        x1={CX - 19} y1={triste ? eyeY - 9 : eyeY - 12}
        x2={CX - 7} y2={triste ? eyeY - 12 : eyeY - 11}
        stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"
      />
      <line
        x1={CX + 7} y1={triste ? eyeY - 12 : eyeY - 11}
        x2={CX + 19} y2={triste ? eyeY - 9 : eyeY - 12}
        stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"
      />
      {/* bochechas */}
      {(humor === 'feliz' || humor === 'energico') && (
        <>
          <circle cx={CX - 22} cy={headY + 8} r={4} fill="#f87171" opacity={0.35} />
          <circle cx={CX + 22} cy={headY + 8} r={4} fill="#f87171" opacity={0.35} />
        </>
      )}
      {/* boca */}
      {humor === 'energico' && (
        <path d={`M ${CX - 11} ${headY + 12} Q ${CX} ${headY + 26} ${CX + 11} ${headY + 12} Q ${CX} ${headY + 17} ${CX - 11} ${headY + 12} Z`} fill="#7f1d1d" />
      )}
      {humor === 'feliz' && (
        <path d={`M ${CX - 10} ${headY + 13} Q ${CX} ${headY + 22} ${CX + 10} ${headY + 13}`} fill="none" stroke="#7f1d1d" strokeWidth="3" strokeLinecap="round" />
      )}
      {humor === 'neutro' && <line x1={CX - 8} y1={headY + 16} x2={CX + 8} y2={headY + 16} stroke="#7f1d1d" strokeWidth="3" strokeLinecap="round" />}
      {cansado && <line x1={CX - 8} y1={headY + 17} x2={CX + 8} y2={headY + 16} stroke="#7f1d1d" strokeWidth="3" strokeLinecap="round" />}
      {triste && (
        <path d={`M ${CX - 9} ${headY + 19} Q ${CX} ${headY + 12} ${CX + 9} ${headY + 19}`} fill="none" stroke="#7f1d1d" strokeWidth="3" strokeLinecap="round" />
      )}
    </g>
  )
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
