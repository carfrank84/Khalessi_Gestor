import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('Por favor, ingrese usuario y contraseña')
      return
    }

    const success = login(username, password)
    if (success) {
      navigate('/dashboard')
    } else {
      setError('Credenciales incorrectas')
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-violet-900 to-amber-600 p-4 overflow-hidden">
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-violet-500/30 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-amber-300/30 blur-3xl" />

      <div className="relative z-10 w-full max-w-md rounded-3xl p-[1px] bg-gradient-to-r from-violet-400 via-fuchsia-300 to-amber-300 shadow-2xl">
        <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-violet-950 p-6 md:p-8 rounded-3xl border border-violet-400/30">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-violet-300/40 mx-auto mb-4 flex items-center justify-center shadow-sm">
              <img src="/favicon.ico" alt="Khalessi" className="w-10 h-10" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-300 bg-clip-text text-transparent mb-2">Khalessi Gestor</h1>
            <p className="text-zinc-300">Sistema de Gestión Empresarial</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-violet-300/40 rounded-lg bg-zinc-800/80 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all duration-200"
                placeholder="Ingrese su usuario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-violet-300/40 rounded-lg bg-zinc-800/80 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all duration-200"
                placeholder="Ingrese su contraseña"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            <button type="submit" className="w-full py-3 text-base md:text-lg rounded-lg font-semibold text-black bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 hover:from-amber-200 hover:via-amber-300 hover:to-yellow-400 transition-all duration-200 shadow-lg shadow-amber-500/30 border border-amber-200">
              Ingresar
            </button>
          </form>

          <p className="text-center text-sm text-zinc-400 mt-6">
            v1.0.0 - 2026
          </p>
        </div>
      </div>
    </div>
  )
}
