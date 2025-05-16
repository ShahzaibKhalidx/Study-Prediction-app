'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Bar, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function Visualization() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStudents = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        setError(error.message);
      } else {
        setStudents(data);
        setSelectedStudent(data[0] || null);
      }
      setLoading(false);
    };

    fetchStudents();
  }, [router]);

  if (loading) return <div className="text-center text-muted-foreground">Loading...</div>;
  if (error) return <div className="text-center text-destructive">{error}</div>;

  const barData = selectedStudent
    ? {
        labels: ['Math', 'Science', 'Computer', 'English', 'Urdu', 'History'],
        datasets: [
          {
            label: 'Scores',
            data: [
              selectedStudent.math_score,
              selectedStudent.science_score,
              selectedStudent.computer_score,
              selectedStudent.english_score,
              selectedStudent.urdu_score,
              selectedStudent.history_score,
            ],
            backgroundColor: 'hsl(var(--primary) / 0.5)',
          },
        ],
      }
    : {};

  const scatterData = {
    datasets: [
      {
        label: 'Study Hours vs Score',
        data: students.map((student) => ({
          x: student.study_hours,
          y: student.current_score * 100,
        })),
        backgroundColor: 'hsl(var(--destructive) / 0.5)',
      },
      {
        label: 'Sleep Hours vs Score',
        data: students.map((student) => ({
          x: student.sleep_hours,
          y: student.current_score * 100,
        })),
        backgroundColor: 'hsl(var(--accent) / 0.5)',
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualizations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="student">Select Student</Label>
          <Select
            value={selectedStudent?.id?.toString() || ''}
            onValueChange={(value) => setSelectedStudent(students.find((s) => s.id === parseInt(value)))}
          >
            <SelectTrigger id="student">
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id.toString()}>
                  {student.student_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedStudent && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Subject Scores</h3>
            <Bar
              data={barData}
              options={{
                scales: { y: { beginAtZero: true, max: 100 } },
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold mb-2">Correlations</h3>
          <Scatter
            data={scatterData}
            options={{
              scales: {
                x: { title: { display: true, text: 'Hours' } },
                y: { title: { display: true, text: 'Score (%)' }, beginAtZero: true, max: 100 },
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}