'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AuthCodeErrorPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center"
      >
        <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Authentication Failed</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Something went wrong during sign-in. This can happen if the link expired or was already used.
          Please try signing in again.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
      </motion.div>
    </div>
  )
}
