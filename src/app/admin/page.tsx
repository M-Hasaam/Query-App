'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  LogOut, 
  ChevronDown,
  ChevronUp,
  User,
  Hash,
  AlertTriangle,
  Loader2,
  Calendar,
  Send
} from 'lucide-react'

interface Query {
  id: string
  email: string
  roll_no: string
  assignment_no: string
  title: string
  description: string
  status: 'pending' | 'approved' | 'rejected'
  admin_reply: string
  created_at: string
  student?: { name: string }
}


export default function AdminDashboard() {
  const [queries, setQueries] = useState<Query[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({})
  const [expandedQuery, setExpandedQuery] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchQueries()
  }, [])

  const fetchQueries = async () => {
    try {
      const res = await fetch('/api/admin/query')
      if (res.ok) {
        setQueries(await res.json())
      } else if (res.status === 401) {
        router.push('/admin/login')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.push('/admin/login')
  }

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setUpdatingId(id)
    try {
      const res = await fetch('/api/admin/query', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status,
          admin_reply: replyText[id] || ''
        })
      })

      if (res.ok) {
        fetchQueries()
        setExpandedQuery(null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredQueries = queries.filter(q => {
    const matchesSearch = 
      q.roll_no.toLowerCase().includes(search.toLowerCase()) ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.student?.name.toLowerCase().includes(search.toLowerCase())

    const matchesFilter = filter === 'all' || q.status === filter
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-outfit">
      {/* Header */}
      <nav className="glass-panel sticky top-0 z-50 px-4 md:px-8 py-4 md:py-5 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-5">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-bold tracking-tight">TA Panel</h1>
            <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] leading-none mt-1">Management Hub</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl font-bold text-xs md:text-sm hover:bg-rose-500 hover:text-white transition-all active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Filters Area */}
        <div className="flex flex-col gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
            <input 
              className="input-field pl-12 h-12 md:h-14"
              placeholder="Search by Roll No..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 p-1.5 bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl">
            {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 md:px-6 py-2.5 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all ${
                  filter === f 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>


        {/* Queries List */}
        <div className="space-y-4">
          {filteredQueries.length === 0 ? (
            <div className="glass-card p-20 rounded-[3rem] text-center border-dashed">
              <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <AlertTriangle className="w-10 h-10 text-slate-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-300 mb-2">No queries found</h3>
              <p className="text-slate-500 max-w-sm mx-auto">Try adjusting your filters or search terms to find what you are looking for.</p>
            </div>
          ) : (
            filteredQueries.map((q, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={q.id} 
                className={`glass-card rounded-[2rem] overflow-hidden transition-all duration-300 ${
                  expandedQuery === q.id ? 'ring-2 ring-indigo-500/50' : 'hover:border-slate-700'
                }`}
              >
                <div 
                  onClick={() => setExpandedQuery(expandedQuery === q.id ? null : q.id)}
                  className="p-5 md:p-6 cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start md:items-center gap-4 md:gap-6">
                      <div className="flex flex-col items-center justify-center min-w-[56px] h-14 md:w-16 md:h-16 bg-slate-950 rounded-xl md:rounded-2xl border border-slate-800 shrink-0">
                        <span className="text-[8px] md:text-[10px] font-bold text-indigo-400 uppercase leading-none mb-1">ASG</span>
                        <span className="text-base md:text-lg font-black text-white leading-none">{q.assignment_no}</span>
                      </div>
                      
                      <div className="min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-1 overflow-hidden">
                          <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                            {q.student?.name || 'Unknown Student'}
                          </span>
                          <div className="hidden md:block w-1 h-1 bg-slate-800 rounded-full shrink-0" />
                          <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                            <Hash className="w-3 h-3" /> {q.roll_no}
                          </span>
                          <div className="w-1 h-1 bg-slate-800 rounded-full shrink-0" />
                          <span className="text-[10px] md:text-xs font-bold text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
                            <Calendar className="w-3 h-3" /> {new Date(q.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-indigo-400 truncate pr-2">{q.title}</h3>

                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-800/50 pt-4 md:pt-0">
                      <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${
                        q.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        q.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                        'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                      }`}>
                        {q.status}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-600 md:hidden uppercase tracking-widest">Details</span>
                        {expandedQuery === q.id ? <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-slate-700" /> : <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-slate-700" />}
                      </div>
                    </div>
                  </div>
                </div>


                <AnimatePresence>
                  {expandedQuery === q.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-800/50 bg-slate-950/30"
                    >
                      <div className="p-8 space-y-8">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-4">Student Description</label>
                          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50 text-slate-300 text-sm leading-relaxed">
                            {q.description}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-4">TA Response</label>
                          <textarea
                            className="input-field min-h-[120px] py-4 resize-none"
                            placeholder="Provide feedback or explanation for your decision..."
                            value={replyText[q.id] ?? q.admin_reply ?? ''}
                            onChange={e => setReplyText({ ...replyText, [q.id]: e.target.value })}
                          />
                          
                          <div className="flex gap-4 pt-4">
                            <button
                              disabled={updatingId === q.id}
                              onClick={() => handleAction(q.id, 'approved')}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/10 transition-all active:scale-[0.98]"
                            >
                              {updatingId === q.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                              Approve Query
                            </button>
                            <button
                              disabled={updatingId === q.id}
                              onClick={() => handleAction(q.id, 'rejected')}
                              className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-500/10 transition-all active:scale-[0.98]"
                            >
                              {updatingId === q.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                              Reject Query
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* Decorative Glows */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none -mr-64 -mt-64" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -ml-64 -mb-64" />
    </div>
  )
}
