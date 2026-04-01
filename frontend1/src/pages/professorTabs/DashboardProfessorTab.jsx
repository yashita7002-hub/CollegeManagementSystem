import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DashboardProfessorTab() {
  const [stats, setStats] = useState({
    courseCount: 0,
    assignmentsCount: 0,
    pendingSubmissionsCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/v1/users/professor/dashboard-stats');
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching professor stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-emerald-700 p-8">Loading overview...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex flex-col justify-between hover:shadow-md transition">
          <h3 className="text-emerald-800 text-lg font-semibold mb-2">My Courses</h3>
          <p className="text-4xl font-black text-gray-800">{stats.courseCount}</p>
          <div className="mt-4 text-sm text-gray-500">Currently assigned to you</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex flex-col justify-between hover:shadow-md transition">
          <h3 className="text-emerald-800 text-lg font-semibold mb-2">Total Assignments</h3>
          <p className="text-4xl font-black text-gray-800">{stats.assignmentsCount}</p>
          <div className="mt-4 text-sm text-gray-500">Created across all courses</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex flex-col justify-between hover:shadow-md transition">
          <h3 className="text-emerald-800 text-lg font-semibold mb-2">Pending Grads</h3>
          <p className="text-4xl font-black text-gray-800">{stats.pendingSubmissionsCount}</p>
          <div className="mt-4 text-sm text-gray-500">Submissions awaiting review</div>
        </div>

      </div>
    </div>
  );
}
