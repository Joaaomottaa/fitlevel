export function cn(...cls: (string | false | null | undefined)[]) {
  return cls.filter(Boolean).join(' ')
}

export function todayISO(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function diffDays(fromISO: string, toISO: string): number {
  const a = new Date(fromISO + 'T12:00:00').getTime()
  const b = new Date(toISO + 'T12:00:00').getTime()
  return Math.round((b - a) / 86_400_000)
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

export function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export function fmtNum(n: number, digits = 0) {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: digits, minimumFractionDigits: digits })
}

export function saudacao() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}
