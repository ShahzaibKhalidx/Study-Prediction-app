'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { ArrowRight, Upload, Users, Brain, BarChart, FileText, FilePlus } from 'lucide-react';

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.push('/login');
          return;
        }
        setUser(user);

        const { data, error } = await supabase
          .from('students')
          .select('student_id, student_name, grade, current_score')
          .eq('user_id', user.id);

        if (error) {
          setError(error.message);
        } else {
          setStudents(data);
        }
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const screens = [
    {
      title: 'Upload Data',
      description: 'Upload student data in Excel format to populate your database.',
      href: '/upload',
      icon: Upload,
    },
    {
      title: 'View Students',
      description: 'Browse and search your student list with key details.',
      href: '/students',
      icon: Users,
    },
    {
      title: 'Predict Performance',
      description: 'Use machine learning to predict student outcomes.',
      href: '/predict',
      icon: Brain,
    },
    {
      title: 'Visualizations',
      description: 'Explore interactive charts for student performance insights.',
      href: '/visualization',
      icon: BarChart,
    },
    {
      title: 'Model Analysis',
      description: 'Review the predictive model’s accuracy and metrics.',
      href: '/analysis',
      icon: FileText,
    },
    {
      title: 'Improvement Plans',
      description: 'Generate personalized plans to boost student performance.',
      href: '/improvement',
      icon: FilePlus,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome, {user?.email.split('@')[0] || 'User'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Manage your student data, predict performance, and create improvement plans with EduPredict.
          </p>
          <Link href="/upload">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Screens Overview */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center mb-12">
            Explore EduPredict Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {screens.map((screen) => (
              <Card key={screen.title} className="hover:shadow-lg transition-shadow animate-fade-in">
                <CardContent className="pt-6 text-center">
                  <screen.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">{screen.title}</h3>
                  <p className="text-muted-foreground mb-4">{screen.description}</p>
                  <Link href={screen.href}>
                    <Button variant="outline">
                      Go to {screen.title}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Student Data */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center mb-12">
            Your Students
          </h2>
          {loading && <p className="text-center text-muted-foreground">Loading...</p>}
          {error && <p className="text-center text-destructive">{error}</p>}
          {!loading && !error && students.length === 0 && (
            <p className="text-center text-muted-foreground">
              No students found. <Link href="/upload" className="text-primary hover:underline">Upload data</Link> to get started.
            </p>
          )}
          {!loading && !error && students.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.student_id}>
                        <TableCell>{student.student_id}</TableCell>
                        <TableCell>{student.student_name}</TableCell>
                        <TableCell>{student.grade}</TableCell>
                        <TableCell>{(student.current_score * 100).toFixed(1)}%</TableCell>
                        <TableCell>
                          <Link
                            href={`/improvement?student_id=${student.student_id}`}
                            className="text-primary hover:underline"
                          >
                            View Details
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card text-center text-muted-foreground">
        <p>© {new Date().getFullYear()} EduPredict. All rights reserved.</p>
      </footer>
    </div>
  );
}