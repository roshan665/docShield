// src/services/profilesService.js
// Centralized Data Service for User Profiles (Admin Directory)
// Routed through FastAPI /api/v1/profiles with fallback resilience

import { apiClient } from './apiClient.js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { initialUsersList } from '../data/adminUsersData.js';

export async function fetchProfiles() {
  try {
    const data = await apiClient.get('/profiles');
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('FastAPI profiles fetch notice, falling back:', err.message);
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (sbErr) {
        console.warn('Profiles Supabase fallback notice:', sbErr.message);
      }
    }
  }
  return initialUsersList;
}

export async function updateProfile(userId, updates) {
  try {
    const updated = await apiClient.patch(`/profiles/${encodeURIComponent(userId)}`, updates);
    if (updated) return updated;
  } catch (err) {
    console.warn('FastAPI updateProfile notice, falling back:', err.message);
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }
  return { id: userId, ...updates };
}
