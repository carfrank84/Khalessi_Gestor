interface SummaryCardProps {
  title: string
  value: string | number
  icon: string
  color?: 'blue' | 'green' | 'purple' | 'red' | 'brand' | 'accent' | 'gold'
}

export default function SummaryCard({ 
  title, 
  value, 
  icon, 
  color = 'blue' 
}: SummaryCardProps) {
  const colorClasses = {
    blue: {
      card: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400/40',
      icon: 'bg-white/20 text-white',
    },
    green: {
      card: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-400/40',
      icon: 'bg-white/20 text-white',
    },
    purple: {
      card: 'bg-gradient-to-br from-violet-500 to-violet-700 text-white border-violet-400/40',
      icon: 'bg-white/20 text-white',
    },
    red: {
      card: 'bg-gradient-to-br from-rose-500 to-rose-600 text-white border-rose-400/40',
      icon: 'bg-white/20 text-white',
    },
    brand: {
      card: 'bg-gradient-to-br from-zinc-900 to-violet-900 text-white border-violet-400/40',
      icon: 'bg-white/20 text-white',
    },
    accent: {
      card: 'bg-gradient-to-br from-fuchsia-500 to-pink-600 text-white border-fuchsia-400/40',
      icon: 'bg-white/20 text-white',
    },
    gold: {
      card: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white border-amber-300/50',
      icon: 'bg-white/20 text-white',
    },
  }

  return (
    <div className={`rounded-xl border p-4 md:p-6 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${colorClasses[color].card}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/90 mb-1">{title}</p>
          <p className="text-xl md:text-2xl font-bold text-white break-all">{value}</p>
        </div>
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xl md:text-2xl ${colorClasses[color].icon}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
