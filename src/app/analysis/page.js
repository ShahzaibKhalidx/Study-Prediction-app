'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function Analysis() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      }
    };
    checkUser();
  }, [router]);

  const metrics = {
    r2: 87.90,
    mse: 0.00,
    mae: 0.03,
    avg_error: 0.03,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
      </CardContent>
    </Card>
  );
}