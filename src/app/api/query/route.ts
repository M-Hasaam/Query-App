import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractStudentId } from '@/lib/utils'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('queries')
    .select('*')
    .eq('email', user.email)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { assignment_no, title, description } = body

  if (!assignment_no || !title) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const studentId = extractStudentId(user.email)

  // Optional: Prevent duplicate queries per assignment
  const { data: existing } = await supabase
    .from('queries')
    .select('id')
    .eq('email', user.email)
    .eq('assignment_no', assignment_no)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Query already submitted for this assignment' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('queries')
    .insert({
      email: user.email,
      roll_no: studentId,
      assignment_no,
      title,
      description,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
