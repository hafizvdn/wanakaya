// src/components/ui/CategoryIcon.jsx
import { 
  Utensils, Car, Home, Pill, Gamepad2, Shirt, Book, 
  Plane, Coins, Briefcase, Gift, Zap, Smartphone, Dumbbell, PawPrint, Tags
} from 'lucide-react'

const iconMap = {
  Utensils, Car, Home, Pill, Gamepad2, Shirt, Book, 
  Plane, Coins, Briefcase, Gift, Zap, Smartphone, Dumbbell, PawPrint
}

export default function CategoryIcon({ name, className = "w-6 h-6" }) {
  // 1. If the name matches one of our Lucide icons, render it
  const IconComponent = iconMap[name]
  if (IconComponent) {
    return <IconComponent className={className} />
  }

  // 2. If it's an old emoji from your previous database entries, render it as text
  if (name && /[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/.test(name)) {
    return <span className="text-2xl leading-none">{name}</span>
  }

  // 3. Fallback if no icon is set
  return <Tags className={className} />
}