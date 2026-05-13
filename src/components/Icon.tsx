import {
  Home, Edit3, Camera, BarChart3, Settings,
  Droplets, UtensilsCrossed, AlertTriangle,
  Key, Lightbulb, Salad, Microscope, Heart,
  Stethoscope, Candy, Frown, Smile, Meh,
  Save, Download, RefreshCw, Search, ArrowLeft,
  Sun, Moon, Sunrise, Cookie, Plus, Trash2,
  type LucideIcon
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  record: Edit3,
  camera: Camera,
  history: BarChart3,
  settings: Settings,
  blood: Droplets,
  meal: UtensilsCrossed,
  alert: AlertTriangle,
  key: Key,
  tip: Lightbulb,
  salad: Salad,
  microbe: Microscope,
  heart: Heart,
  stethoscope: Stethoscope,
  candy: Candy,
  frown: Frown,
  smile: Smile,
  meh: Meh,
  save: Save,
  download: Download,
  refresh: RefreshCw,
  search: Search,
  arrowLeft: ArrowLeft,
  sun: Sun,
  moon: Moon,
  sunrise: Sunrise,
  cookie: Cookie,
  plus: Plus,
  trash: Trash2,
}

interface Props {
  name: keyof typeof iconMap
  size?: number
  color?: string
  className?: string
}

export default function Icon({ name, size = 24, color, className }: Props) {
  const LucideComp = iconMap[name]
  if (!LucideComp) return null
  return <LucideComp size={size} color={color} className={className} strokeWidth={1.8} />
}

export { iconMap }
