const FAVORITES_KEY = 'wanxiang-favorites'

export function getFavorites(): string[] {
  if (import.meta.server) return []
  const stored = localStorage.getItem(FAVORITES_KEY)
  return stored ? JSON.parse(stored) : []
}

export function toggleFavorite(cardId: string): boolean {
  const favorites = getFavorites()
  const index = favorites.indexOf(cardId)
  if (index > -1) {
    favorites.splice(index, 1)
  } else {
    favorites.push(cardId)
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  return index === -1 // returns true if added, false if removed
}

export function isFavorite(cardId: string): boolean {
  return getFavorites().includes(cardId)
}
