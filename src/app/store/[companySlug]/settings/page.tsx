'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';

export default function SettingsPage() {
  const { company, profile, isOwner } = useStore();
  const { signOut } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Company form state
  const [companyName, setCompanyName] = useState(company?.name || '');
  const [country, setCountry] = useState(company?.country || '');
  const [currency, setCurrency] = useState(company?.currency || 'USD');
  
  // Profile form state
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');

  const handleSaveCompany = async () => {
    if (!company?.id || !isOwner) return;
    
    setIsSaving(true);
    setMessage(null);
    
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: companyName,
          country,
          currency,
        })
        .eq('id', company.id);

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Company settings saved successfully!' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving company:', error);
      setMessage({ type: 'error', text: 'Failed to save company settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    
    setIsSaving(true);
    setMessage(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone,
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Failed to save profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (!company || !profile) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Settings" />

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Settings */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Company Settings
            </h2>
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label>Company Name</Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              ) : (
                <p className="text-gray-800 dark:text-white">{company.name}</p>
              )}
            </div>

            <div>
              <Label>Store URL</Label>
              <p className="text-gray-600 dark:text-gray-400">
                soursync.com/store/<span className="font-medium">{company.slug}</span>
              </p>
            </div>

            <div>
              <Label>Country</Label>
              {isEditing ? (
                <Input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g., United States"
                />
              ) : (
                <p className="text-gray-800 dark:text-white">{company.country || '-'}</p>
              )}
            </div>

            <div>
              <Label>Currency</Label>
              {isEditing ? (
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CNY">CNY - Chinese Yuan</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                </select>
              ) : (
                <p className="text-gray-800 dark:text-white">{company.currency}</p>
              )}
            </div>

            <div>
              <Label>Plan</Label>
              <p className="text-gray-800 dark:text-white capitalize">{company.plan}</p>
            </div>

            <div>
              <Label>Status</Label>
              <span
                className={`inline-flex px-2 py-1 text-sm rounded-full ${
                  company.status === 'active'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {company.status}
              </span>
            </div>

            {isEditing && isOwner && (
              <Button
                className="w-full"
                onClick={handleSaveCompany}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Company Settings'}
              </Button>
            )}
          </div>
        </div>

        {/* Profile Settings */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
            Profile Settings
          </h2>

          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <Label>Email</Label>
              <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your phone number"
              />
            </div>

            <div>
              <Label>Role</Label>
              <p className="text-gray-800 dark:text-white capitalize">{profile.role}</p>
            </div>

            <Button
              className="w-full"
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </div>

      {/* Sign Out Section */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Account
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Sign out of your account on this device.
        </p>
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </>
  );
}





