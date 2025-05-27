'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false); // Toggle between login and signup
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.session) {
        router.push('/dashboard');
      } else {
        setError('Invalid login credentials');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      setError('Check your email for a confirmation link to complete signup.');
      setIsSignup(false); // Switch back to login after signup attempt
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      setError('Google sign-in failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-20 p-6 shadow-lg">
      <CardHeader>
        <CardTitle>{isSignup ? 'Sign Up' : 'Login'}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-destructive mb-4">{error}</p>}
        <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="mt-2"
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
              className="mt-2"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (isSignup ? 'Signing up...' : 'Logging in...') : isSignup ? 'Sign Up' : 'Login'}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => setIsSignup(!isSignup)} className="w-full mb-2">
            {isSignup ? 'Already have an account? Login' : 'Need an account? Sign Up'}
          </Button>
          <Button onClick={signInWithGoogle} className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}