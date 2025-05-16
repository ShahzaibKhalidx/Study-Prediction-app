'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '../../components/ui/table';

export default function Improvement() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student_id');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        if (!studentId) {
          setError('No student ID provided');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', user.id)
          .eq('student_id', parseInt(studentId))
          .single();

        if (error) {
          setError(error.message);
        } else if (!data) {
          setError('Student not found');
        } else {
          setStudent(data);
        }
      } catch (err) {
        setError('Failed to fetch student data');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [router, studentId]);

  const generatePDF = () => {
    if (!student) return;

    const doc = new jsPDF();
    const idealSchedule = {
      Study_Hours: 4.0,
      Sleep_Hours: 8.0,
      Private_Tuition: 1,
      Internet_Access: 1,
      Sports_Participation: 1,
    };

    // Header
    doc.setFontSize(16);
    doc.text('Student Progress Improvement Plan', 105, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`STUDENT PROGRESS REPORT: ${student.student_name.toUpperCase()}`, 105, 25, {
      align: 'center',
    });

    // Student Details Table
    doc.autoTable({
      startY: 35,
      head: [['Field', 'Value']],
      body: [
        ['Student ID', student.student_id.toString()],
        ['Gender/Age', `${student.gender === 'M' ? 'Male' : 'Female'}, ${student.age} years`],
        ['Current Grade', student.grade],
        ['Attendance', `${(student.attendance_percentage * 100).toFixed(1)}%`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
      styles: { textColor: [0, 0, 0] },
    });

    // Academic Performance
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Current Academic Performance', 14, finalY);
    doc.autoTable({
      startY: finalY + 5,
      head: [['Subject', 'Score']],
      body: [
        ['Math', `${student.math_score}%`],
        ['Science', `${student.science_score}%`],
        ['Computer', `${student.computer_score}%`],
        ['English', `${student.english_score}%`],
        ['Urdu', `${student.urdu_score}%`],
        ['History', `${student.history_score}%`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
      styles: { textColor: [0, 0, 0] },
    });

    // Improvement Plan
    finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Recommended Improvement Plan', 14, finalY);

    const currentSchedule = {
      Study_Hours: student.study_hours,
      Sleep_Hours: client.sleep_hours,
      Private_Tuition: student.private_tuition ? 1 : 0,
      Internet_Access: student.internet_access ? 1 : 0,
      Sports_Participation: student.sports_participation ? 1 : 0,
    };

    let effortScore = 0;
    for (const k in idealSchedule) {
      const gap = idealSchedule[k] - currentSchedule[k];
      if (k === 'Study_Hours' || k === 'Sleep_Hours') {
        effortScore += Math.min(Math.max(gap, 0), 2) * 1.5;
      } else {
        effortScore += Math.min(Math.max(gap, 0), 1) * 1.0;
      }
    }

    const currentScore = student.current_score * 100;
    const predictedScore = Math.min(currentScore + effortScore, 100);
    const predictedGrade =
      predictedScore >= 90 ? 'A1' :
      predictedScore >= 85 ? 'A+' :
      predictedScore >= 80 ? 'A' :
      predictedScore >= 75 ? 'B+' :
      predictedScore >= 70 ? 'B' :
      predictedScore >= 65 ? 'C+' :
      predictedScore >= 60 ? 'C' :
      predictedScore >= 55 ? 'D+' :
      predictedScore >= 50 ? 'D' : 'F';

    doc.autoTable({
      startY: finalY + 5,
      body: [
        [`Current Overall Score: ${currentScore.toFixed(1)}% (${student.grade})`],
        [`Predicted Improved Score: ${predictedScore.toFixed(1)}% (${predictedGrade})`],
        [`Potential Improvement: +${(predictedScore - currentScore).toFixed(1)}%`],
      ],
      theme: 'plain',
      styles: { textColor: [0, 0, 0] },
    });

    // Schedule Adjustments
    finalY = doc.lastAutoTable.finalY + 5;
    const scheduleData = Object.keys(idealSchedule).map((key) => {
      const current = currentSchedule[key];
      const recommended = idealSchedule[key];
      let currentLabel, recommendedLabel, action;

      if (['Private_Tuition', 'Internet_Access', 'Sports_Participation'].includes(key)) {
        currentLabel = current ? 'Yes' : 'No';
        recommendedLabel = recommended ? 'Yes' : 'No';
        action =
          key === 'Internet_Access' ? 'Use only (30 mins/day)' :
          key === 'Sports_Participation' ? '(30-45 mins, 3-4 days)' :
          '2-3 sessions per week';
      } else {
        currentLabel = `${current} hours`;
        recommendedLabel = `${recommended} hours`;
        const diff = recommended - current;
        action = diff > 0 ? `Add ${diff.toFixed(1)} hours daily` : diff < 0 ? `Reduce by ${Math.abs(diff).toFixed(1)} hours` : 'Maintain current';
      }

      return [key.replace('_', ' '), currentLabel, recommendedLabel, action];
    });

    doc.autoTable({
      startY: finalY,
      head: [['Activity', 'Current', 'Recommended', 'Action Plan']],
      body: scheduleData,
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
      styles: { textColor: [0, 0, 0] },
    });

    // Recommendations
    finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Key Recommendations:', 14, finalY);
    const recommendations = [
      '1. Create a consistent daily study routine at fixed times',
      '2. Focus on weakest subjects first during study sessions',
      '3. Take short breaks every 45-60 minutes of study',
      '4. Review class notes daily for better retention',
      '5. Get proper sleep to improve memory consolidation',
      '6. Limit recreational screen time to <1 hour/day',
      '7. Practice past papers under timed conditions',
    ];

    doc.autoTable({
      startY: finalY + 5,
      body: recommendations.map((rec) => [rec]),
      theme: 'plain',
      styles: { textColor: [0, 0, 0] },
    });

    // Parent Notes
    finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('For Parents:', 14, finalY);
    const parentNotes = [
      '- Monitor the study schedule implementation',
      '- Provide a quiet study environment at home',
      '- Communicate regularly with teachers about progress',
      '- Encourage balanced activities (study, rest, exercise)',
      '- Celebrate small improvements to maintain motivation',
    ];

    doc.autoTable({
      startY: finalY + 5,
      body: parentNotes.map((note) => [note]),
      theme: 'plain',
      styles: { textColor: [0, 0, 0] },
    });

    // Footer
    doc.setFontSize(8);
    doc.text(
      `Generated on ${format(new Date(), 'yyyy-MM-dd')} - Page ${doc.internal.getNumberOfPages()}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );

    // Save PDF
    doc.save(`Student_Report_${student.student_id}_${student.student_name.replace(/\s+/g, '_')}.pdf`);
  };

  if (loading) return <div className="text-center text-muted-foreground">Loading...</div>;
  if (error) return <div className="text-center text-destructive">{error}</div>;
  if (!student) return <div className="text-center text-muted-foreground">Student not found</div>;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Improvement Plan for {student.student_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={generatePDF} className="w-full mb-6">
          Download PDF Report
        </Button>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Student Details</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">ID</TableCell>
                  <TableCell>{student.student_id}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Grade</TableCell>
                  <TableCell>{student.grade}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Current Score</TableCell>
                  <TableCell>{(student.current_score * 100).toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Attendance</TableCell>
                  <TableCell>{(student.attendance_percentage * 100).toFixed(1)}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}