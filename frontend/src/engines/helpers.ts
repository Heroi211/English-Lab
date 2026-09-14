export function normalizeAnswer(value: unknown): string | boolean {
  if (typeof value === 'boolean') return value
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/^['"]|['"]$/g, '')
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

export function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
