'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setphone] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Basic validation
    if (!displayName.trim()) {
      setError('Display name is required');
      setLoading(false);
      return;
    }
    if (phone && !/^\+?\d{1,4}[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}$/.test(phone)) {
      setError('Invalid phone number format (e.g., +1-123-456-7890)');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            displayName,
            phone: phone || null, // Store as null if empty
          },
        },
      });

      if (error) throw error;
      if (data.user) {
        setSuccess('Signup successful! Please check your email to confirm.');
        setTimeout(() => router.push('/login'), 3000);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Signup</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-destructive mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your name"
              className={'mt-2'}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your email"
              className={'mt-2'}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your password"
              className={'mt-2'}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setphone(e.target.value)}
              disabled={loading}
              placeholder="Enter phone number (e.g., +92-123-456-7890)"
              className={'mt-2'}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing up...' : 'Signup'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}