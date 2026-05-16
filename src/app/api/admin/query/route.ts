import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

import { createServerClient } from '@supabase/ssr'
import { sendPushNotification } from '@/lib/push'
import { verifyAdminToken } from '@/lib/admin-session'

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin-session')?.value
  return verifyAdminToken(token, process.env.ADMIN_SECRET)
}

function makeSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll() { return [] }, setAll() {} } }
  )
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = makeSupabaseAdmin()
  const { data: queries, error } = await supabase
    .from('queries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch students directly to avoid join issues
  const rollNos = [...new Set(queries.map(q => q.roll_no))]
  const { data: students } = await supabase
    .from('students')
    .select('id, name, a1, a2, a3')
    .in('id', rollNos)

  const studentMap: Record<string, any> = {}
  if (students) {
    students.forEach(s => {
      studentMap[s.id] = s
    })
  }

  const enrichedQueries = queries.map(q => ({
    ...q,
    student: studentMap[q.roll_no] || null
  }))

  return NextResponse.json(enrichedQueries)

}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = makeSupabaseAdmin()
  const body = await request.json()
  const { id, status, admin_reply } = body

  if (!id || !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data: currentQuery } = await supabase
    .from('queries')
    .select('email, assignment_no')
    .eq('id', id)
    .single()

  const { data, error } = await supabase
    .from('queries')
    .update({ status, admin_reply: admin_reply ?? null })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (currentQuery) {
    const { data: subData } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('email', currentQuery.email)
      .single()

    if (subData?.subscription) {
      const replyPreview = admin_reply
        ? `Reply: "${admin_reply.length > 50 ? admin_reply.slice(0, 50) + '…' : admin_reply}"`
        : `Your query has been marked as ${status.toUpperCase()}.`

      sendPushNotification(subData.subscription, {
        title: `Query Update: ${currentQuery.assignment_no}`,
        body: `Status: ${status.toUpperCase()}. ${replyPreview}`,
      }).catch(err => console.error('Push failed:', err))
    }
  }

  return NextResponse.json(data)
}
