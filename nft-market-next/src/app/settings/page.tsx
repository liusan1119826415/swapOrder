'use client';

import { useState } from 'react';
import { Settings, Bell, Shield, Globe, Moon, User } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'preferences', label: 'Preferences', icon: Globe },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-headline font-bold tracking-tight mb-2 flex items-center gap-3">
            <Settings className="w-10 h-10 text-primary" />
            Settings
          </h1>
          <p className="text-slate-400">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 overflow-hidden">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary border-r-4 border-primary'
                        : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-headline font-bold">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 p-8">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-headline font-bold">Profile Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Display Name</label>
                      <input
                        type="text"
                        defaultValue="CryptoCollector"
                        className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Bio</label>
                      <textarea
                        rows={4}
                        defaultValue="NFT enthusiast and collector"
                        className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue="user@example.com"
                        className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-headline font-bold">Notification Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl">
                      <div>
                        <p className="font-headline font-bold">Email Notifications</p>
                        <p className="text-sm text-slate-400">Receive updates via email</p>
                      </div>
                      <button
                        onClick={() => setEmailNotifications(!emailNotifications)}
                        className={`w-14 h-7 rounded-full transition-colors relative ${
                          emailNotifications ? 'bg-primary' : 'bg-slate-600'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${
                            emailNotifications ? 'left-8' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl">
                      <div>
                        <p className="font-headline font-bold">Push Notifications</p>
                        <p className="text-sm text-slate-400">Receive push notifications</p>
                      </div>
                      <button
                        onClick={() => setPushNotifications(!pushNotifications)}
                        className={`w-14 h-7 rounded-full transition-colors relative ${
                          pushNotifications ? 'bg-primary' : 'bg-slate-600'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${
                            pushNotifications ? 'left-8' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-headline font-bold">Security Settings</h2>
                  <div className="space-y-4">
                    <button className="w-full p-4 bg-surface-container rounded-xl text-left hover:bg-surface-container-high transition-all">
                      <p className="font-headline font-bold">Change Password</p>
                      <p className="text-sm text-slate-400">Update your account password</p>
                    </button>
                    <button className="w-full p-4 bg-surface-container rounded-xl text-left hover:bg-surface-container-high transition-all">
                      <p className="font-headline font-bold">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-400">Add an extra layer of security</p>
                    </button>
                    <button className="w-full p-4 bg-surface-container rounded-xl text-left hover:bg-surface-container-high transition-all">
                      <p className="font-headline font-bold">Connected Wallets</p>
                      <p className="text-sm text-slate-400">Manage your connected wallets</p>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-headline font-bold">Preferences</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl">
                      <div className="flex items-center gap-3">
                        <Moon className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="font-headline font-bold">Dark Mode</p>
                          <p className="text-sm text-slate-400">Toggle dark/light theme</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`w-14 h-7 rounded-full transition-colors relative ${
                          darkMode ? 'bg-primary' : 'bg-slate-600'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${
                            darkMode ? 'left-8' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Currency</label>
                      <select className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary focus:outline-none">
                        <option>ETH</option>
                        <option>USD</option>
                        <option>EUR</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Language</label>
                      <select className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary focus:outline-none">
                        <option>English</option>
                        <option>中文</option>
                        <option>日本語</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-outline-variant/10 flex justify-end gap-4">
                <button className="px-6 py-3 text-slate-400 font-headline font-bold hover:text-on-surface transition-colors">
                  Cancel
                </button>
                <button className="px-6 py-3 bg-primary text-on-primary font-headline font-bold rounded-full hover:shadow-glow transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
