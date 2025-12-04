'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

/**
 * Send magic link to user's email
 * This function combines login and signup - if the email doesn't exist, it creates a new account
 */
export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get('email') as string;
  const redirect = formData.get('redirect') as string;

  if (!email) {
    return { error: 'Email is required' };
  }

  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get('origin') || 'http://localhost:3000';

  // Build callback URL with redirect parameter if provided
  let callbackUrl = `${origin}/auth/callback`;
  if (redirect) {
    callbackUrl += `?next=${encodeURIComponent(redirect)}`;
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

/**
 * Get the current user session
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
