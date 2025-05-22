'use client';

import { useState } from 'react';
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
  });
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value) || value,
    }));
  };

  const runPrediction = async () => {
    if (!pyodide) return;

    setLoading(true);
    setError(null);
    setPrediction(null);

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
      const clampedResult = Math.min(Math.max(result.toFixed(2), 0), 100);
      setPrediction(clampedResult);
    } catch (err) {
      setError('Prediction failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        onLoad={async () => {
          const pyodideInstance = await loadPyodide();
          await pyodideInstance.loadPackage('numpy');
          setPyodide(pyodideInstance);
        }}
      />
      <Card className="max-w-md mx-auto mt-4">
        <CardHeader>
          <CardTitle>Predict Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-destructive mb-4">{error}</p>}
          {prediction !== null && (
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-green-600">
                Predicted Score: {prediction}%
              </h3>
              <p className="text-sm text-gray-600">Based on your input values</p>
            </div>
          )}
          {prediction !== null && (
            <div className="flex justify-center mb-6">
              <canvas data-type="gauge" data-config='{
                "value": ${prediction},
                "maxValue": 100,
                "minValue": 0,
                "majorTicks": [0, 20, 40, 60, 80, 100],
                "minorTicks": 4,
                "colors": {
                  "needle": "#000000",
                  "arc": ["#FF0000", "#FFFF00", "#00FF00"]
                },
                "label": "Score (%)"
              }'></canvas>
            </div>
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Predicting...' : 'Predict'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}