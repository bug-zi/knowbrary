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

function cleanupExpired(list: ArchivedCard[]): ArchivedCard[] {
  const now = Date.now()
  const [valid, expired] = list.reduce(
    (acc, item) => {
      acc[now - item.archivedAt >= EXPIRY_MS ? 1 : 0].push(item)
      return acc
    },
    [[], []] as [ArchivedCard[], ArchivedCard[]]
  )

  if (expired.length > 0) {
    writeList(valid)
    // Fire-and-forget: delete expired AI-generated cards from database
    import('~/utils/cards').then(({ deleteCard, invalidateCardsCache }) => {
      for (const item of expired) {
        if (item.id.startsWith('ai-')) {
          deleteCard(item.id).catch(() => {})
        }
      }
      invalidateCardsCache()
    })
  }

  return valid
}

export function getArchivedCards(): ArchivedCard[] {
  return cleanupExpired(readList())
}

export function getArchivedCardIds(): string[] {
  return getArchivedCards().map(c => c.id)
}

export function archiveCard(card: { id: string; title: string; category: string }) {
  const list = readList()
  if (list.some(c => c.id === card.id)) return
  list.push({
    id: card.id,
    title: card.title,
    category: card.category,
    archivedAt: Date.now(),
  })
  writeList(list)
  invalidateCardsCache()
}

export function unarchiveCard(cardId: string) {
  const list = readList().filter(c => c.id !== cardId)
  writeList(list)
  invalidateCardsCache()
}

export function isArchived(cardId: string): boolean {
  if (import.meta.server) return false
  return readList().some(c => c.id === cardId)
}

export function getRemainingDays(archivedAt: number): number {
  const elapsed = Date.now() - archivedAt
  const remaining = EXPIRY_MS - elapsed
  return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)))
}

export async function permanentlyDeleteCard(cardId: string) {
  const list = readList().filter(c => c.id !== cardId)
  writeList(list)
  if (cardId.startsWith('ai-')) {
    const { deleteCard } = await import('~/utils/cards')
    await deleteCard(cardId)
  }
  invalidateCardsCache()
}

function invalidateCardsCache() {
  import('~/utils/cards').then(({ invalidateCardsCache: inv }) => inv())
}
