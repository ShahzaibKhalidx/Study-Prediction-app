'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

// Fallback component for Suspense
const ImprovementFallback = () => (
  <div className="p-4">
    <p>Loading improvement data...</p>
  </div>
);

// Main component that uses useSearchParams
const ImprovementContent = () => {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');
  const [improvementData, setImprovementData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImprovementData = async () => {
      if (!studentId) {
        setError('No student ID provided');
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('Not authenticated');
          return;
        }

        const { data, error } = await supabase
          .from('students')
          .select('student_name, current_score, grade')
          .eq('student_id', studentId)
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          throw new Error('Failed to fetch improvement data: ' + error.message);
        }

        setImprovementData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchImprovementData();
  }, [studentId]);

  return (
    <Card className="max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>Student Improvement</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-destructive mb-4">{error}</p>}
        {improvementData ? (
          <div>
            <p><strong>Name:</strong> {improvementData.student_name}</p>
            <p><strong>Current Score:</strong> {improvementData.current_score}</p>
            <p><strong>Grade:</strong> {improvementData.grade}</p>
          </div>
        ) : !error && <p>Loading...</p>}
      </CardContent>
    </Card>
  );
};

// Default export with Suspense wrapper
export default function ImprovementPage() {
  return (
    <Suspense fallback={<ImprovementFallback />}>
      <ImprovementContent />
    </Suspense>
  );
}