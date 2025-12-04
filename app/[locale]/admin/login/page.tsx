'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Alert } from '@/components/ui';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    console.log('Login attempt with:', email);

    try {
      const supabase = createClient();

      console.log('Supabase client created');

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Auth response:', { data, error: authError });

      if (authError) {
        console.error('Auth error:', authError);
        setError(authError.message);
        setLoading(false);
        return;
      }

      console.log('Login successful, redirecting to admin dashboard');
      setSuccess('Login successful! Redirecting...');

      // Small delay to ensure session is set
      await new Promise(resolve => setTimeout(resolve, 500));

      router.push(`/${locale}/admin`);
      router.refresh();
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setError('');
    setSuccess('');
    try {
      console.log('Testing Supabase connection...');
      const supabase = createClient();
      const { data, error } = await supabase.from('properties').select('count');
      console.log('Connection test result:', { data, error });
      if (error) {
        setError(`Connection error: ${error.message}`);
      } else {
        setSuccess('Connection successful!');
      }
    } catch (err) {
      console.error('Connection test failed:', err);
      setError(`Connection failed: ${err}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold mb-2">Loftly Apartment</h1>
        <p className="text-neutral-600 mb-8">Admin Dashboard</p>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />

          <Button
            type="submit"
            fullWidth
            loading={loading}
            size="lg"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-neutral-200">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={testConnection}
          >
            Test Connection
          </Button>
        </div>
      </div>
    </div>
  );
}
