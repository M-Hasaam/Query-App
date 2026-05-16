'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { GraduationCap, LogIn } from 'lucide-react'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          hd: 'isb.nu.edu.pk'
        }
      },
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px] animate-blob animation-delay-4000" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 w-full max-w-lg p-6 md:p-8 text-center"
      >
        <div className="mb-8 md:mb-12 relative">
          <motion.div 
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-2xl md:rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/40 mx-auto mb-6 md:mb-8 relative z-10"
          >
            <GraduationCap className="w-8 h-8 md:w-12 md:h-12 text-white" />
          </motion.div>
          <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150" />
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 md:mb-6 tracking-tight">
          Student <span className="text-gradient">Portal</span>
        </h1>
        
        <p className="text-slate-400 text-sm md:text-lg mb-8 md:mb-12 font-medium leading-relaxed max-w-xs md:max-w-sm mx-auto">
          Access your assignment marks and resolve queries with ease.
        </p>

        <div className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-[2rem] md:rounded-[2.5rem] pointer-events-none" />
          
          <button
            onClick={handleLogin}
            className="w-full bg-white text-slate-950 px-4 md:px-8 py-3.5 md:py-5 rounded-xl md:rounded-2xl font-bold text-base md:text-lg flex items-center justify-center gap-3 md:gap-4 transition-all hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-white/10"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 md:w-6 md:h-6" />
            Continue with Google
          </button>

          
          <p className="mt-8 text-xs text-slate-500 font-semibold uppercase tracking-[0.2em]">
            Official NU-FAST Account Required
          </p>
        </div>

        <motion.button 
          whileHover={{ x: 5 }}
          onClick={() => router.push('/admin/login')}
          className="mt-12 flex items-center gap-2 text-slate-500 hover:text-indigo-400 font-bold text-sm tracking-widest uppercase transition-all mx-auto"
        >
          <LogIn className="w-4 h-4" />
          TA Access
        </motion.button>
      </motion.div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none brightness-150 contrast-150 mix-blend-overlay" />
    </div>
  )
}
