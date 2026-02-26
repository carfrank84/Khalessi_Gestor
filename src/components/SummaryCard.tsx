interface SummaryCardProps {
  title: string
  value: string | number
  icon: string
  color?: 'blue' | 'green' | 'purple' | 'red'
}

export default function SummaryCard({ 
  title, 
  value, 
  icon, 
  color = 'blue' 
}: SummaryCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="card p-4 md:p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 break-all">{value}</p>
        </div>
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xl md:text-2xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
