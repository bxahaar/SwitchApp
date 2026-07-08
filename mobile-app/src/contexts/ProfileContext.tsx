import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';
import { storage } from '../utils/storage';

interface ProfileContextType {
  profile: UserProfile | null;
  language: 'fa' | 'en';
  theme: 'light' | 'dark';
  setProfile: (profile: UserProfile) => void;
  updateLanguage: (language: 'fa' | 'en') => void;
  updateTheme: (theme: 'light' | 'dark') => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const PROFILE_KEY = 'user_profile';
const LANGUAGE_KEY = 'app_language';
const THEME_KEY = 'app_theme';

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [language, setLanguage] = useState<'fa' | 'en'>('fa');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    loadProfile();
    loadPreferences();
  }, []);

  const loadProfile = async () => {
    const saved = await storage.getObject<UserProfile>(PROFILE_KEY);
    if (saved) {
      setProfileState(saved);
    }
  };

  const loadPreferences = async () => {
    const savedLanguage = await storage.getItem(LANGUAGE_KEY);
    const savedTheme = await storage.getItem(THEME_KEY);
    
    if (savedLanguage) setLanguage(savedLanguage as 'fa' | 'en');
    if (savedTheme) setTheme(savedTheme as 'light' | 'dark');
  };

  const setProfile = async (newProfile: UserProfile) => {
    setProfileState(newProfile);
    await storage.setObject(PROFILE_KEY, newProfile);
    
    if (newProfile.preferredLanguage) {
      updateLanguage(newProfile.preferredLanguage);
    }
    if (newProfile.themePreference) {
      updateTheme(newProfile.themePreference);
    }
  };

  const updateLanguage = async (newLanguage: 'fa' | 'en') => {
    setLanguage(newLanguage);
    await storage.setItem(LANGUAGE_KEY, newLanguage);
  };

  const updateTheme = async (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    await storage.setItem(THEME_KEY, newTheme);
  };

  return (
    <ProfileContext.Provider
      value={{ profile, language, theme, setProfile, updateLanguage, updateTheme }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
}