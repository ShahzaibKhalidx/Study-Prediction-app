import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';
import * as xlsx from 'xlsx';

export async function POST(request) {
  console.log('Received POST request to /api/upload');
  console.log('Request headers:', Object.fromEntries(request.headers));

  try {
    const supabase = createServerClient(request);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Authenticated user:', user ? user.id : 'No user');
    if (userError) {
      console.error('User fetch error:', userError);
      return NextResponse.json({ error: 'Failed to authenticate: ' + userError.message }, { status: 401 });
    }
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file uploaded or invalid file' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const requiredColumns = [
      'Student_ID', 'Student_Name', 'Gender', 'Age', 'Attendance_%', 'Absences',
      'Grade', 'Current_score', 'Math_Score', 'Science_Score', 'Computer_Score',
      'English_Score', 'Urdu_Score', 'History_Score', 'Study_Hours',
      'Private_Tuition', 'Internet_Access', 'Sleep_Hours', 'Sports_Participation',
    ];

    const missingColumns = requiredColumns.filter(
      (col) => !worksheet[0] || !(col in worksheet[0])
    );
    if (missingColumns.length > 0) {
      return NextResponse.json(
        { error: `Missing required columns: ${missingColumns.join(', ')}` },
        { status: 400 }
      );
    }

    const userId = user.id;
    const studentsData = worksheet.map((row) => ({
      user_id: userId,
      student_id: row.Student_ID,
      student_name: row.Student_Name,
      gender: row.Gender,
      age: row.Age,
      attendance_percentage: row['Attendance_%'],
      absences: row.Absences,
      grade: row.Grade,
      current_score: row.Current_score,
      math_score: row.Math_Score,
      science_score: row.Science_Score,
      computer_score: row.Computer_Score,
      english_score: row.English_Score,
      urdu_score: row.Urdu_Score,
      history_score: row.History_Score,
      study_hours: row.Study_Hours,
      private_tuition: row.Private_Tuition,
      internet_access: row.Internet_Access,
      sleep_hours: row.Sleep_Hours,
      sports_participation: row.Sports_Participation,
    }));

    const { error } = await supabase.from('students').insert(studentsData);
    if (error) {
      console.error('Database insert error:', error);
      return NextResponse.json({ error: 'Failed to insert data: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Data uploaded successfully' }, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Error processing file: ' + error.message }, { status: 500 });
  }
}