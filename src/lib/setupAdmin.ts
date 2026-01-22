import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://diqzjpqpsxgrqyomcxpl.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpcXpqcHFwc3hncnF5b21jeHBsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDcwNDI0OCwiZXhwIjoxNzYyMjQwMjQ4fQ.VrKh5R6LqHhH0z51RR7dKnwvYIzGv-4Bf_bwDrSLxRU'

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function setupAdminUser() {
  try {
    console.log('Creating admin user...')
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'kes2004ag@gmail.com',
      password: '123Admin1.',
      email_confirm: true,
    })

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('Admin user already exists')
      } else {
        throw error
      }
    } else {
      console.log('Admin user created:', data.user?.email)
    }
  } catch (err: any) {
    console.error('Error:', err.message)
  }
}

setupAdminUser()
