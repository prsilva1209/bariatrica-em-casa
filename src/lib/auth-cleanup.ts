// Authentication state cleanup utility to prevent limbo states
// This helps prevent situations where users cannot log out or switch accounts

import { supabase } from '@/integrations/supabase/client';

/**
 * Cleans up all authentication-related data from browser storage
 * This should be called before sign-in/sign-up operations to ensure clean state
 */
export const cleanupAuthState = () => {
  try {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });

    // Remove from sessionStorage if in use
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  } catch (error) {
    console.warn('Error cleaning auth state:', error);
  }
};

/**
 * Performs a complete auth cleanup and signs out globally
 * Use this for robust logout functionality
 */
export const performCompleteSignOut = async (): Promise<void> => {
  try {
    // Clean up auth state first
    cleanupAuthState();
    
    // Attempt global sign out (ignore errors)
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.warn('Sign out error (continuing anyway):', err);
    }
    
    // Force page reload for completely clean state
    window.location.href = '/auth';
  } catch (error) {
    console.error('Error during complete sign out:', error);
    // Force redirect even if there are errors
    window.location.href = '/auth';
  }
};

/**
 * Prepares for sign-in by cleaning state and attempting sign-out
 * Use this before sign-in operations to prevent conflicts
 */
export const prepareForSignIn = async (): Promise<void> => {
  try {
    // Clean up existing state
    cleanupAuthState();
    
    // Attempt global sign out (ignore errors)
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Continue even if this fails
      console.warn('Pre-signin cleanup error (continuing):', err);
    }
  } catch (error) {
    console.warn('Error preparing for sign in:', error);
  }
};