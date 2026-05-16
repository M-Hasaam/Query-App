'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Lock, User, ArrowRight, Loader2, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (res.ok) {
        router.push('/admin')
      } else {
        const data = await res.json()
        setError(data.error || 'Invalid credentials')
      }
    } catch (err) {
      setError('Connection failed. Please check your .env settings.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden p-6">
      {/* Back Button - Top Left */}
      <button 
        onClick={() => router.push('/login')}
        className="absolute top-6 left-6 z-20 group flex items-center gap-2 text-slate-500 hover:text-white transition-all font-bold text-xs uppercase tracking-widest"
      >
        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </div>
        <span className="hidden sm:inline">Back to Portal</span>
      </button>

      {/* Premium Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-blob" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md"
      >


        <div className="text-center mb-8 md:mb-10">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 mx-auto mb-6 md:mb-8"
          >
            <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">TA Access</h1>
          <p className="text-sm md:text-base text-slate-500 font-medium">Internal Management Control</p>
        </div>

        <div className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-[2rem] md:rounded-[2.5rem] pointer-events-none" />
          
          <form onSubmit={handleLogin} className="space-y-6 md:space-y-8">

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <input
                  required
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pl-12"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-500 text-xs font-bold text-center flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full h-14"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                <>
                  Enter Dashboard
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>

      {/* Grid Noise */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] pointer-events-none brightness-150 contrast-150 mix-blend-overlay" />
    </div>
  )
}

function AlertTriangle({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
  )
}
