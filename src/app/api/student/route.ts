import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractStudentId } from '@/lib/utils'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const studentId = extractStudentId(user.email)
  if (!studentId) {
    return NextResponse.json({ error: 'Invalid email domain' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single()

  if (error) {
    return NextResponse.json({ error: 'Student not found in database' }, { status: 404 })
  }

  return NextResponse.json(data)
}
