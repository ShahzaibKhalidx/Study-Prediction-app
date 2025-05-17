import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';

export async function GET(request) {
  console.log('Received GET request to /api/students');

  try {
    const supabase = createServerClient(request);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase.from('students').select('*').eq('user_id', user.id);
    if (error) {
      console.error('Fetch students error:', error);
      return NextResponse.json({ error: 'Failed to fetch students: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Students API error:', error);
    return NextResponse.json({ error: 'Error fetching students: ' + error.message }, { status: 500 });
  }
}