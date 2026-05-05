type FontFamily = 'sans' | 'serif' | 'mono'
type FontSize = 'sm' | 'base' | 'lg' | 'xl'
type FontWeight = '300' | '400' | '500' | '600'

interface ReadingSettings {
  fontFamily: FontFamily
  fontSize: FontSize
  fontWeight: FontWeight
}

const DEFAULTS: ReadingSettings = {
  fontFamily: 'sans',
  fontSize: 'base',
  fontWeight: '400',
}

const FONT_FAMILY_MAP: Record<FontFamily, string> = {
  sans: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
  serif: "'Noto Serif SC', 'Crimson Pro', serif",
  mono: "'JetBrains Mono', 'Noto Sans SC', monospace",
}

const FONT_SIZE_MAP: Record<FontSize, string> = {
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
}

const STORAGE_KEY = 'wanxiang-reading-settings'

export function useReadingSettings() {
  const settings = useState<ReadingSettings>('reading-settings', () => ({ ...DEFAULTS }))
  const savedSettings = useState<ReadingSettings>('reading-settings-saved', () => ({ ...DEFAULTS }))

  function applyCSS(s: ReadingSettings) {
    if (!import.meta.client) return
    const root = document.documentElement.style
    root.setProperty('--reading-font-family', FONT_FAMILY_MAP[s.fontFamily])
    root.setProperty('--reading-font-size', FONT_SIZE_MAP[s.fontSize])
    root.setProperty('--reading-font-weight', s.fontWeight)
  }

  function loadFromStorage() {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        settings.value = { ...DEFAULTS, ...parsed }
      }
    }
    catch {}
    savedSettings.value = { ...settings.value }
    applyCSS(settings.value)
  }

  function updateSetting<K extends keyof ReadingSettings>(key: K, value: ReadingSettings[K]) {
    settings.value[key] = value
    applyCSS(settings.value)
  }

  function save() {
    if (!import.meta.client) return false
    savedSettings.value = { ...settings.value }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
    return true
  }

  function reset() {
    settings.value = { ...DEFAULTS }
    applyCSS(settings.value)
  }

  const hasChanges = computed(() => {
    return JSON.stringify(settings.value) !== JSON.stringify(savedSettings.value)
  })

  // Auto-apply on client
  if (import.meta.client) {
    onMounted(() => {
      loadFromStorage()
    })
  }

  return {
    settings: readonly(settings),
    hasChanges,
    updateSetting,
    save,
    reset,
    fontFamilyOptions: Object.keys(FONT_FAMILY_MAP) as FontFamily[],
    fontSizeOptions: Object.keys(FONT_SIZE_MAP) as FontSize[],
    fontWeightOptions: ['300', '400', '500', '600'] as FontWeight[],
    fontFamilyLabels: { sans: '默认无衬线', serif: '衬线体', mono: '等宽体' } as Record<FontFamily, string>,
    fontSizeLabels: { sm: '小', base: '标准', lg: '大', xl: '特大' } as Record<FontSize, string>,
    fontWeightLabels: { '300': '轻', '400': '常规', '500': '中等', '600': '粗' } as Record<FontWeight, string>,
  }
}
