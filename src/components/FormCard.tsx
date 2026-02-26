import { ReactNode } from 'react'

interface FormCardProps {
  title: string
  children: ReactNode
  onSubmit: (e: React.FormEvent) => void
}

export default function FormCard({ title, children, onSubmit }: FormCardProps) {
  return (
    <div className="card p-4 md:p-6 mb-6">
      <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
      </form>
    </div>
  )
}
