import React, { useState } from 'react';
import UsersTab from './Admintabs/UsersTab';
import CoursesTab from './Admintabs/CoursesTab';
import CalendarTab from './Admintabs/CalendarTab';
import LogsTab from './Admintabs/LogsTab';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');

  const navItems = [
    { id: 'users', label: 'Users & Roles', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'courses', label: 'Manage Courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'calendar', label: 'Academic Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'logs', label: 'Login Logs', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-100 flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center font-bold text-white">
            A
          </div>
          <h1 className="text-xl font-bold tracking-tight">Admin<span className="text-blue-500">Panel</span></h1>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => window.location.href = '/login'}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">
            {navItems.find(n => n.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
            <span>Welcome back, System Admin</span>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm">
              AD
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="flex-1 overflow-auto p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'courses' && <CoursesTab />}
            {activeTab === 'calendar' && <CalendarTab />}
            {activeTab === 'logs' && <LogsTab />}
          </div>
        </main>
      </div>
    </div>
  );
}