import React, { useState } from 'react';
import AttendanceTab from './professorTabs/AttendanceProfessorTab';
import CourseTab from './professorTabs/CoursesAllotedTab';
import CalendarTab from './professorTabs/ProfessorCalendarTab';
import AssignmentsTab from './professorTabs/AssignmentsProfessorTab';

import GradesTab from './professorTabs/GradesProfessor';
import DashboardTab from './professorTabs/DashboardProfessorTab';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

import {
  HomeIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const navItems = [
  { id: 'dashboard', label: 'DASHBOARD', icon: HomeIcon },
  { id: 'courses', label: 'COURSES', icon: BookOpenIcon },
  { id: 'attendance', label: 'ATTENDANCE', icon: ClipboardDocumentCheckIcon },
  { id: 'assignment', label: 'ASSIGNMENTS', icon: DocumentTextIcon },
  { id: 'grades', label: 'GRADES', icon: ChartBarIcon },
  { id: 'calendar', label: 'CALENDAR', icon: CalendarDaysIcon },
];

export default function ProfessorDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'courses': return <CourseTab />;
      case 'attendance': return <AttendanceTab />;
      case 'assignment': return <AssignmentsTab />;
      case 'grades': return <GradesTab />;
      case 'calendar': return <CalendarTab />;
      default: return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4] flex font-sans">
      
      {/* Sidebar - Premium Emerald Glassmorphism */}
      <div className="w-72 bg-gradient-to-b from-emerald-900 to-emerald-950 text-white flex flex-col shadow-2xl relative z-10">
        
        {/* Logo Area */}
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-400 to-emerald-300 flex items-center justify-center font-black text-emerald-900 text-2xl shadow-lg shadow-emerald-500/30">
            P
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-white">
              PROF<span className="text-emerald-400 font-light">PANEL</span>
            </h1>
            <p className="text-xs text-emerald-500 font-semibold tracking-widest mt-1">ACADEMIC SUITE</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? 'bg-emerald-800 text-white shadow-md' 
                    : 'text-emerald-300 hover:bg-emerald-800/50 hover:text-emerald-100'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 rounded-r-full" />
                )}
                <item.icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110 text-emerald-400' : 'group-hover:scale-110 group-hover:text-emerald-300'}`} />
                <span className={`font-bold tracking-wider text-sm ${isActive ? 'text-white' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-6 border-t border-emerald-800/50">
          <button
            onClick={() => (window.location.href = '/login')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-emerald-200 bg-emerald-900/50 hover:bg-red-500 hover:text-white transition-all duration-300 group shadow-sm hover:shadow-red-500/20"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            SECURE LOGOUT
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl flex items-center justify-between px-10 border-b border-emerald-100/50 shadow-sm z-20 sticky top-0">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-emerald-950 uppercase tracking-tight">
              {navItems.find(n => n.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-900">Dr. {user?.username || 'Professor'}</p>
              <p className="text-xs text-emerald-600 font-semibold tracking-widest">FACULTY</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-800 font-bold border-2 border-white shadow-md shadow-emerald-100 transition-transform hover:scale-105 cursor-pointer uppercase">
              {user?.username ? user.username.substring(0, 2) : 'PR'}
            </div>
          </div>
        </header>

        {/* Main Scrolling Content */}
        <main className="flex-1 overflow-auto p-4 md:p-10 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none z-0"></div>
          <div className="relative z-10 max-w-7xl mx-auto">
            {renderTab()}
          </div>
        </main>
      </div>
    </div>
  );
}