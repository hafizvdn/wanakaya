import { Landmark, Banknote, Smartphone, CreditCard } from 'lucide-react'

export default function AccountIcon({ type, className = "w-6 h-6" }) {
  switch (type) {
    case 'BANK': return <Landmark className={className} />
    case 'CASH': return <Banknote className={className} />
    case 'EWALLET': return <Smartphone className={className} />
    default: return <CreditCard className={className} />
  }
}