import React, { useState } from 'react';
import AttendanceTab from './studentTabs/AttendanceTab';
import CoursesEnrolledTab from './studentTabs/CoursesEnrolledTab';
import StudentCalendarTab from './studentTabs/StudentCalendarTab';
import AssignmentsTab from './studentTabs/AssignmentsTab';
import GradesTab from './studentTabs/GradesStudentTab';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('attendance');

  const navItems = [
    { id: 'attendance', label: 'ATTENDANCE', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'courses', label: 'COURSES ENROLLED', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'calendar', label: 'ACADEMIC CALENDAR', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'assignment', label: 'ASSIGNMENTS', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0 M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
    { id: 'grades', label: 'GRADES', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'attendance':
        return <AttendanceTab />;
      case 'courses':
        return <CoursesEnrolledTab />;
      case 'calendar':
        return <StudentCalendarTab />;
      case 'assignment':
        return <AssignmentsTab />;
      case 'grades':
        return <GradesTab />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <div className="w-64 bg-purple-800 text-white flex flex-col">

        <div className="p-6 border-b border-purple-700 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-purple-600 flex items-center justify-center font-bold text-white">
            S
          </div>
          <h1 className="text-lg font-semibold">
            STUDENT<span className="text-purple-300">Panel</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                activeTab === item.id
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-100 hover:bg-purple-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-purple-700">
          <button
            onClick={() => (window.location.href = '/login')}
            className="w-full px-3 py-2 rounded-md text-sm text-purple-100 hover:bg-red-100 hover:text-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        <header className="h-14 bg-white flex items-center justify-between px-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {navItems.find(n => n.id === activeTab)?.label}
          </h2>

          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>Welcome, {user?.username || 'Student'}</span>
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium uppercase">
              {user?.username ? user.username.substring(0, 2) : 'ST'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            {renderTab()}
          </div>
        </main>

      </div>
    </div>
  );
}