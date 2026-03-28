import React, { useState } from 'react';
import AttendanceTab from './professorTabs/AttendanceProfessorTab';
import CourseTab from './professorTabs/CoursesAllotedTab';
import CalendarTab from './professorTabs/ProfessorCalendarTab';
import AssignmentsTab from './professorTabs/AssignmentsProfessorTab';
import DashboardTab from './professorTabs/DashboardProfessor';
import GradesTab from './professorTabs/GradesProfessor';
import TestsTab from './professorTabs/TestsProfessor';
import { HomeIcon as HomeSolid } from '@heroicons/react/24/solid';

import {
  HomeIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

export default function ProfessorDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

const navItems = [
  { id: 'dashboard', label: 'DASHBOARD', icon: HomeIcon },
  { id: 'courses', label: 'COURSES', icon: BookOpenIcon },
  { id: 'attendance', label: 'ATTENDANCE', icon: ClipboardDocumentCheckIcon },
  { id: 'assignment', label: 'ASSIGNMENTS', icon: DocumentTextIcon },
  { id: 'tests', label: 'TESTS', icon: AcademicCapIcon },
  { id: 'grades', label: 'GRADES', icon: ChartBarIcon },
  { id: 'calendar', label: 'CALENDAR', icon: CalendarDaysIcon },
];
  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'courses':
        return <CourseTab />;
      case 'attendance':
        return <AttendanceTab />;
      case 'assignment':
        return <AssignmentsTab />;
      case 'grades':
        return <GradesTab />;
      case 'tests':
        return <TestsTab />;
      case 'calendar':
        return <CalendarTab />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <div className="w-64 bg-emerald-800 text-white flex flex-col">

        <div className="p-6 border-b border-emerald-700 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center font-bold text-white">
            P
          </div>
          <h1 className="text-lg font-semibold">
            PROFESSOR<span className="text-emerald-300">Panel</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                activeTab === item.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-100 hover:bg-emerald-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-emerald-700">
          <button
            onClick={() => (window.location.href = '/login')}
            className="w-full px-3 py-2 rounded-md text-sm text-emerald-100 hover:bg-red-100 hover:text-red-600 transition-colors"
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
            <span>Welcome, Professor</span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium">
              PR
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