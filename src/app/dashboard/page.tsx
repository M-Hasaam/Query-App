'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  LogOut, 
  LayoutDashboard,
  ClipboardList,
  AlertCircle,
  Loader2,
  ChevronRight,
  TrendingUp,
  History
} from 'lucide-react'
import { subscribeToPush } from '@/lib/notifications'

interface Student {
  id: string
  name: string
  roll_number: string
  a1: number
  a2: number
  a3: number
}

interface Query {
  id: string
  assignment_no: string
  title: string
  description: string
  status: 'pending' | 'approved' | 'rejected'
  admin_reply: string
  created_at: string
}

export default function Dashboard() {
  const [student, setStudent] = useState<Student | null>(null)
  const [queries, setQueries] = useState<Query[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showQueryForm, setShowQueryForm] = useState<string | null>(null)
  const [formData, setFormData] = useState({ title: '', description: '' })
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchData()
    subscribeToPush()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [studentRes, queriesRes] = await Promise.all([
        fetch('/api/student'),
        fetch('/api/query')
      ])

      if (studentRes.ok) setStudent(await studentRes.json())
      if (queriesRes.ok) setQueries(await queriesRes.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showQueryForm) return
    
    setSubmitting(true)
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_no: showQueryForm,
          ...formData
        })
      })
      
      if (res.ok) {
        setFormData({ title: '', description: '' })
        setShowQueryForm(null)
        fetchData()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar / Top Nav */}
      <nav className="glass-panel sticky top-0 z-50 px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-9 h-9 md:w-10 md:w-10 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <LayoutDashboard className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight">Student Portal</h1>
            <p className="text-[9px] md:text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none">Academic Year 2024-25</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold">{student?.name}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{student?.roll_number}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2.5 md:p-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-500 transition-all"
          >
            <LogOut className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">

        {/* Left Column: Marks & Query Form */}
        <div className="lg:col-span-7 space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-6 h-6 text-indigo-500" />
              <h2 className="text-2xl font-bold tracking-tight">Academic <span className="text-gradient">Performance</span></h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Assignment 1', key: 'a1', max: 175 },
                { label: 'Assignment 2', key: 'a2', max: 100 },

                { label: 'Assignment 3', key: 'a3', max: 200 }
              ].map((item, idx) => {
                const score = student?.[item.key as keyof Student] as number || 0;
                const percentage = (score / item.max) * 100;
                const assignmentId = `A${idx + 1}`;
                const hasQuery = queries.some(q => q.assignment_no === assignmentId);

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={item.key} 
                    className="glass-card p-6 rounded-3xl relative overflow-hidden group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                      <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] font-bold">
                        {assignmentId}
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex items-end gap-2 mb-2">
                        <span className="text-4xl font-black text-white leading-none">{score}</span>
                        <span className="text-slate-600 font-bold mb-1">/ {item.max}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full"
                        />
                      </div>
                    </div>

                    <button
                      disabled={hasQuery}
                      onClick={() => setShowQueryForm(assignmentId)}
                      className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        hasQuery 
                          ? 'bg-slate-950 text-slate-600 cursor-not-allowed border border-slate-900' 
                          : 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white'
                      }`}
                    >
                      {hasQuery ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {hasQuery ? 'Query Raised' : 'Raise Query'}
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </section>

          {/* Important Notice */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-8 rounded-[2.5rem] border-amber-500/20 bg-amber-500/5"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-500 mb-2">Important Notice</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  If the marks displayed here differ from your <strong>Flex Student Portal</strong>, please contact 
                  <span className="text-white font-bold mx-1">Ms. Mahnoor Ayaz</span> via email at 
                  <a href="mailto:mahnoor.ayaz@isb.nu.edu.pk" className="text-indigo-400 hover:underline font-bold ml-1">
                    mahnoor.ayaz@isb.nu.edu.pk
                  </a>
                </p>
              </div>
            </div>
          </motion.section>

          <AnimatePresence>
            {showQueryForm && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowQueryForm(null)}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="glass-card w-full max-w-xl p-8 md:p-10 rounded-[2.5rem] relative z-10 border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.2)]"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      Assignment {showQueryForm} Query
                    </h3>
                    <button 
                      onClick={() => setShowQueryForm(null)} 
                      className="w-10 h-10 flex items-center justify-center bg-slate-900 rounded-full text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmitQuery} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Title</label>
                      <input
                        required
                        className="input-field h-14"
                        placeholder="e.g. Total marks calculation error"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Detailed Description</label>
                      <textarea
                        required
                        rows={5}
                        className="input-field resize-none py-4"
                        placeholder="Please describe why you think your marks should be reviewed..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <button disabled={submitting} type="submit" className="btn-primary w-full h-14 text-lg">
                      {submitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Submit Query'}
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-5">
          <div className="flex items-center gap-3 mb-8">
            <History className="w-6 h-6 text-indigo-500" />
            <h2 className="text-2xl font-bold tracking-tight">Recent <span className="text-gradient">Activity</span></h2>
          </div>

          <div className="space-y-6">
            {queries.length === 0 ? (
              <div className="glass-card p-12 rounded-[2.5rem] text-center">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ClipboardList className="w-8 h-8 text-slate-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-300 mb-2">No queries raised yet</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-[200px] mx-auto">
                  Your query history will appear here once you submit one.
                </p>
              </div>
            ) : (
              queries.map((q, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={q.id} 
                  className="glass-card p-6 rounded-3xl border-l-4 overflow-hidden relative"
                  style={{ 
                    borderLeftColor: q.status === 'approved' ? '#10b981' : q.status === 'rejected' ? '#f43f5e' : '#6366f1' 
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Assignment {q.assignment_no}</span>
                        <ChevronRight className="w-3 h-3 text-slate-700" />
                      </div>
                      <h3 className="font-bold text-white text-lg">{q.title}</h3>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${
                      q.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                      q.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' :
                      'bg-indigo-500/10 text-indigo-500'
                    }`}>
                      {q.status === 'approved' ? <CheckCircle2 className="w-3 h-3" /> :
                       q.status === 'rejected' ? <XCircle className="w-3 h-3" /> :
                       <Clock className="w-3 h-3" />}
                      {q.status}
                    </div>
                  </div>
                  
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">{q.description}</p>
                  
                  {q.admin_reply && (
                    <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
                          <AlertCircle className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">TA Response</span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">{q.admin_reply}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex items-center justify-end">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                      {new Date(q.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>
      
      {/* Background Glows */}
      <div className="fixed top-0 right-0 w-[50vw] h-[50vw] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none -mr-32 -mt-32" />
      <div className="fixed bottom-0 left-0 w-[50vw] h-[50vw] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -ml-32 -mb-32" />
    </div>
  )
}
