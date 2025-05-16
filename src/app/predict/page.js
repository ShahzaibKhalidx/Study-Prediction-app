'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Script from 'next/script';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function Predict() {
  const [formData, setFormData] = useState({
    study_hours: 2.5,
    private_tuition: true,
    internet_access: true,
    sleep_hours: 7,
    sports_participation: true,
    math_score: 80,
    science_score: 80,
    computer_score: 80,
    english_score: 80,
    urdu_score: 80,
    history_score: 80,
  });
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [pyodide, setPyodide] = useState(null);
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value) || value,
    }));
  };

  const runPrediction = async () => {
    if (!pyodide) return;

    try {
      const coefficients = [0.11198438, 0.0, 0.0, 0.05257882, 0.0];
      const intercept = 0.15002077015743787;

      const input = [
        formData.study_hours,
        formData.private_tuition ? 1 : 0,
        formData.internet_access ? 1 : 0,
        formData.sleep_hours,
        formData.sports_participation ? 1 : 0,
      ];

      await pyodide.runPythonAsync(`
        import numpy as np
        coefficients = np.array(${JSON.stringify(coefficients)})
        input_data = np.array(${JSON.stringify(input)})
        prediction = np.dot(input_data, coefficients) + ${intercept}
      `);

      const result = pyodide.globals.get('prediction') * 100;
      setPrediction(result.toFixed(2));
    } catch (err) {
      setError('Prediction failed: ' + err.message);
    }
  };

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        onLoad={async () => {
          if (typeof loadPyodide === 'function') {
            const pyodideInstance = await loadPyodide();
            await pyodideInstance.loadPackage('numpy');
            setPyodide(pyodideInstance);
          } else {
            setError('Pyodide failed to load');
          }
        }}
      />
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Predict Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-destructive mb-4">{error}</p>}
          {prediction && (
            <p className="text-green-500 mb-4">Predicted Score: {prediction}%</p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runPrediction();
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="study_hours">Study Hours</Label>
              <Input
                id="study_hours"
                type="number"
                name="study_hours"
                value={formData.study_hours}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                max="10"
                required
              />
            </div>
            <div>
              <Label>
                <input
                  type="checkbox"
                  name="private_tuition"
                  checked={formData.private_tuition}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Private Tuition
              </Label>
            </div>
            <div>
              <Label>
                <input
                  type="checkbox"
                  name="internet_access"
                  checked={formData.internet_access}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Internet Access
              </Label>
            </div>
            <div>
              <Label htmlFor="sleep_hours">Sleep Hours</Label>
              <Input
                id="sleep_hours"
                type="number"
                name="sleep_hours"
                value={formData.sleep_hours}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                max="12"
                required
              />
            </div>
            <div>
              <Label>
                <input
                  type="checkbox"
                  name="sports_participation"
                  checked={formData.sports_participation}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Sports Participation
              </Label>
            </div>
            <div>
              <Label htmlFor="math_score">Math Score</Label>
              <Input
                id="math_score"
                type="number"
                name="math_score"
                value={formData.math_score}
                onChange={handleInputChange}
                min="0"
                max="100"
                required
              />
            </div>
            <div>
              <Label htmlFor="science_score">Science Score</Label>
              <Input
                id="science_score"
                type="number"
                name="science_score"
                value={formData.science_score}
                onChange={handleInputChange}
                min="0"
                max="100"
                required
              />
            </div>
            <div>
              <Label htmlFor="computer_score">Computer Score</Label>
              <Input
                id="computer_score"
                type="number"
                name="computer_score"
                value={formData.computer_score}
                onChange={handleInputChange}
                min="0"
                max="100"
                required
              />
            </div>
            <div>
              <Label htmlFor="english_score">English Score</Label>
              <Input
                id="english_score"
                type="number"
                name="english_score"
                value={formData.english_score}
                onChange={handleInputChange}
                min="0"
                max="100"
                required
              />
            </div>
            <div>
              <Label htmlFor="urdu_score">Urdu Score</Label>
              <Input
                id="urdu_score"
                type="number"
                name="urdu_score"
                value={formData.urdu_score}
                onChange={handleInputChange}
                min="0"
                max="100"
                required
              />
            </div>
            <div>
              <Label htmlFor="history_score">History Score</Label>
              <Input
                id="history_score"
                type="number"
                name="history_score"
                value={formData.history_score}
                onChange={handleInputChange}
                min="0"
                max="100"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Predict
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}