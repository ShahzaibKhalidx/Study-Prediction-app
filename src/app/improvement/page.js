'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';

export default function ImprovementPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [improvementData, setImprovementData] = useState(null);
  const [predictedScore, setPredictedScore] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch students on page load
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('students')
          .select('id, student_name, current_score, math_score, science_score, computer_score, english_score, urdu_score, history_score, study_hours, sleep_hours, private_tuition, internet_access, sports_participation')
          .eq('user_id', user.id);

        if (error) {
          throw new Error('Failed to fetch students: ' + error.message);
        }

        setStudents(data);
        if (data.length > 0) {
          setSelectedStudent(data[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [router]);

  // Generate report when the button is clicked
  const generateReport = async () => {
    if (!selectedStudent) return;

    setLoadingReport(true);
    setError(null);
    setImprovementData(null);
    setPredictedScore(null);

    try {
      // Prepare input for prediction
      const input = {
        study_hours: selectedStudent.study_hours || 0,
        private_tuition: selectedStudent.private_tuition || false,
        internet_access: selectedStudent.internet_access || false,
        sleep_hours: selectedStudent.sleep_hours || 0,
        sports_participation: selectedStudent.sports_participation || false,
      };

      // Call the prediction API
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to compute prediction');
      }

      setPredictedScore(result.predictedScore);

      // Set improvement data
      setImprovementData({
        student_name: selectedStudent.student_name,
        current_score: selectedStudent.current_score,
        subject_scores: {
          Math: selectedStudent.math_score || 0,
          Science: selectedStudent.science_score || 0,
          Computer: selectedStudent.computer_score || 0,
          English: selectedStudent.english_score || 0,
          Urdu: selectedStudent.urdu_score || 0,
          History: selectedStudent.history_score || 0,
        },
        factors: {
          study_hours: selectedStudent.study_hours || 0,
          sleep_hours: selectedStudent.sleep_hours || 0,
          private_tuition: selectedStudent.private_tuition || false,
          internet_access: selectedStudent.internet_access || false,
          sports_participation: selectedStudent.sports_participation || false,
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingReport(false);
    }
  };

  // Generate recommendations based on factors
  const generateRecommendations = (factors) => {
    const recommendations = [];
    if (factors.study_hours < 4) {
      recommendations.push('Increase study hours to at least 4 hours per day to improve performance.');
    }
    if (factors.sleep_hours < 6) {
      recommendations.push('Ensure at least 6 hours of sleep per night for better cognitive function.');
    }
    if (!factors.private_tuition) {
      recommendations.push('Consider private tuition for additional academic support.');
    }
    if (!factors.internet_access) {
      recommendations.push('Access to the internet can provide valuable online learning resources.');
    }
    if (!factors.sports_participation) {
      recommendations.push('Participate in sports to improve physical health and reduce stress.');
    }
    return recommendations.length > 0 ? recommendations : ['Keep up the good work! No immediate improvements needed.'];
  };

  // Static model metrics
  const metrics = {
    r2: 87.90,
    mse: 0.00,
    mae: 0.03,
    avg_error: 0.03,
  };

  // Loading and error states
  if (loadingStudents) return <div className="text-center text-muted-foreground">Loading students...</div>;
  if (error) return <div className="text-center text-destructive">{error}</div>;

  return (
    <Card className="max-w-4xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>Student Analysis & Improvement Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="student">Select Student</Label>
          <Select
            value={selectedStudent?.id?.toString() || ''}
            onValueChange={(value) => {
              setSelectedStudent(students.find((s) => s.id === parseInt(value)));
              setImprovementData(null);
              setPredictedScore(null);
            }}
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
        {selectedStudent ? (
          <>
            <Button
              onClick={generateReport}
              disabled={loadingReport}
              className="mb-4"
            >
              {loadingReport ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Generating Report...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
            {improvementData ? (
              <Tabs defaultValue="improvement" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="improvement">Improvement Report</TabsTrigger>
                  <TabsTrigger value="analysis">Model Analysis</TabsTrigger>
                </TabsList>
                <TabsContent value="improvement">
                  <div className="mt-4 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Student Details</h3>
                      <p><strong>Name:</strong> {improvementData.student_name}</p>
                      
                      {predictedScore && (
                        <p><strong>Predicted Score:</strong> {predictedScore}%</p>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Subject-wise Performance</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Score (%)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(improvementData.subject_scores).map(([subject, score]) => (
                            <TableRow key={subject}>
                              <TableCell>{subject}</TableCell>
                              <TableCell>{score}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Key Factors</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Factor</TableHead>
                            <TableHead>Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>Study Hours</TableCell>
                            <TableCell>{improvementData.factors.study_hours} hours</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Sleep Hours</TableCell>
                            <TableCell>{improvementData.factors.sleep_hours} hours</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Private Tuition</TableCell>
                            <TableCell>{improvementData.factors.private_tuition ? 'Yes' : 'No'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Internet Access</TableCell>
                            <TableCell>{improvementData.factors.internet_access ? 'Yes' : 'No'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Sports Participation</TableCell>
                            <TableCell>{improvementData.factors.sports_participation ? 'Yes' : 'No'}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
                      <ul className="list-disc pl-5">
                        {generateRecommendations(improvementData.factors).map((rec, index) => (
                          <li key={index} className="mb-1">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="analysis">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold">Accuracy (R² Score)</h3>
                        <p>{metrics.r2}%</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold">Mean Squared Error</h3>
                        <p>{metrics.mse.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold">Mean Absolute Error</h3>
                        <p>{metrics.mae.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold">Average Prediction Error</h3>
                        <p>±{metrics.avg_error.toFixed(2)}%</p>
                      </CardContent>
                    </Card>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    These metrics reflect the Linear Regression model’s performance on the test set.
                  </p>
                </TabsContent>
              </Tabs>
            ) : (
              <p className="text-center text-muted-foreground mt-4">
                Click "Generate Report" to view the improvement report for the selected student.
              </p>
            )}
          </>
        ) : (
          <p className="text-center text-muted-foreground mt-4">No students available. Please add a student to view improvement data.</p>
        )}
      </CardContent>
    </Card>
  );
}