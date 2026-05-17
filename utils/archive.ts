const ARCHIVE_KEY = 'wanxiang-archived'
const EXPIRY_MS = 7 * 24 * 60 * 60 * 1000

export interface ArchivedCard {
  id: string
  title: string
  category: string
  archivedAt: number
}

function readList(): ArchivedCard[] {
  if (import.meta.server) return []
  const raw = localStorage.getItem(ARCHIVE_KEY)
  return raw ? JSON.parse(raw) : []
}

function writeList(list: ArchivedCard[]) {
  if (import.meta.server) return
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(list))
}

export function getArchivedCards(): { valid: ArchivedCard[]; expired: ArchivedCard[] } {
  const list = readList()
  const now = Date.now()
  const valid: ArchivedCard[] = []
  const expired: ArchivedCard[] = []
  for (const item of list) {
    if (now - item.archivedAt >= EXPIRY_MS) expired.push(item)
    else valid.push(item)
  }
  if (valid.length !== list.length) writeList(valid)
  return { valid, expired }
}

export function getArchivedCardIds(): string[] {
  return getArchivedCards().valid.map(c => c.id)
}

export function archiveCard(card: { id: string; title: string; category: string }) {
  const list = readList()
  if (list.some(c => c.id === card.id)) return
  list.push({ id: card.id, title: card.title, category: card.category, archivedAt: Date.now() })
  writeList(list)
}

export function unarchiveCard(cardId: string) {
  writeList(readList().filter(c => c.id !== cardId))
}

export function isArchived(cardId: string): boolean {
  if (import.meta.server) return false
  return readList().some(c => c.id === cardId)
}

export function getRemainingDays(archivedAt: number): number {
  const remaining = EXPIRY_MS - (Date.now() - archivedAt)
  return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)))
}

export function removeArchiveEntry(cardId: string) {
  writeList(readList().filter(c => c.id !== cardId))
}
