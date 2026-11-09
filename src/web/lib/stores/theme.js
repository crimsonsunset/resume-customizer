import { writable } from 'svelte/store'
import { browser } from '$app/env'

// DaisyUI 5 built-in themes (34 themes for even grid)
export const DAISY_THEMES = [
  'light',
  'dark', 
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
  'dim',
  'nord',
  'sunset',
  'caramellatte',
  'abyss',
]

// Get initial theme from localStorage or default to 'light'
const getInitialTheme = () => {
  if (browser) {
    const stored = localStorage.getItem('daisy-theme') || 'light'
    return stored
  }
  return 'light'
}

// Create the theme store
export const currentTheme = writable(getInitialTheme())

// Subscribe to theme changes and persist to localStorage
if (browser) {
  currentTheme.subscribe((theme) => {
    localStorage.setItem('daisy-theme', theme)
    // Apply theme to document
    document.documentElement.dataset.theme = theme
  })
}

// Helper function to set theme
export const setTheme = (theme) => {
  if (DAISY_THEMES.includes(theme)) {
    currentTheme.set(theme)
  }
}

// Helper function to get theme info
export const getThemeInfo = (theme) => {
  const themeNames = {
    light: '☀️ Light',
    dark: '🌙 Dark',
    cupcake: '🧁 Cupcake',
    bumblebee: '🐝 Bumblebee', 
    emerald: '💚 Emerald',
    corporate: '🏢 Corporate',
    synthwave: '🌆 Synthwave',
    retro: '📻 Retro',
    cyberpunk: '🤖 Cyberpunk',
    valentine: '💝 Valentine',
    halloween: '🎃 Halloween',
    garden: '🌸 Garden',
    forest: '🌲 Forest',
    aqua: '🌊 Aqua',
    lofi: '🎵 Lo-Fi',
    pastel: '🎨 Pastel',
    fantasy: '🦄 Fantasy',
    wireframe: '📐 Wireframe',
    black: '⚫ Black',
    luxury: '💎 Luxury',
    dracula: '🧛 Dracula',
    cmyk: '🖨️ CMYK',
    autumn: '🍂 Autumn',
    business: '💼 Business',
    acid: '🧪 Acid',
    lemonade: '🍋 Lemonade',
    night: '🌃 Night',
    coffee: '☕ Coffee',
    winter: '❄️ Winter',
    dim: '🔅 Dim',
    nord: '🏔️ Nord',
    sunset: '🌅 Sunset',
    caramellatte: '🍮 Caramel Latte',
    abyss: '🌊 Abyss',
  }
  
  return themeNames[theme] || theme
} 