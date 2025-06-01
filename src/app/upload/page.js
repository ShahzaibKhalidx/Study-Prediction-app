'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { supabase } from '../../lib/supabase';
import * as XLSX from 'xlsx';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Client session:', session ? 'Exists' : 'Not found');
      if (!session) {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setSuccess(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!file) {
      setError('Please select a file');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError('Not authenticated');
      router.push('/login');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
          throw new Error(errorData.error || `Upload failed with status ${response.status}`);
        } catch {
          throw new Error(`Upload failed with status ${response.status}: ${text || 'No response body'}`);
        }
      }

      const result = await response.json();
      setSuccess(result.message);
      setTimeout(() => router.push('/students'), 2000);
    } catch (err) {
      setError(err.message || 'An error occurred during upload');
      console.error('Upload error:', err);
    }
  };

  const requiredColumns = [
    'Student_ID', 'Student_Name', 'Gender', 'Age', 'Attendance_%', 'Absences',
    'Grade', 'Current_score', 'Math_Score', 'Science_Score', 'Computer_Score',
    'English_Score', 'Urdu_Score', 'History_Score', 'Study_Hours',
    'Private_Tuition', 'Internet_Access', 'Sleep_Hours', 'Sports_Participation',
  ];

  const downloadTemplate = () => {
    // Create a worksheet with the required columns
    const wsData = [
      requiredColumns, // Headers
      // Sample row for guidance
      [
        '123', 'M Shahzaib', 'M', 18, 85, 5, 'B', 80, 85, 90, 88, 82, 84, 86, 15, 'Yes', 'Yes', 7, 'Yes'
      ]
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'EduPredict_Template.xlsx');
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload Student Data</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-destructive mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <Label className="mb-2" htmlFor="file">Excel File (.xlsx)</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
            />
          </div>
          <Button type="submit" className="w-full">
            Upload
          </Button>
          <Button type="button" variant="outline" className="flex-1" onClick={downloadTemplate}>
            Download Template
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          Ensure the Excel file contains: {requiredColumns.join(', ')}
        </p>
      </CardContent>
    </Card>
  );
}