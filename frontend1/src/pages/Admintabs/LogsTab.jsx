import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function LogsTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/users/all");
      const allUsers = res.data.data;
      
      // Flatten all login logs into a single array
      const allLogs = [];
      allUsers.forEach(user => {
        if (user.loginLogs && Array.isArray(user.loginLogs)) {
          user.loginLogs.forEach(time => {
            allLogs.push({
              time: new Date(time),
              username: user.username,
              role: user.role,
              email: user.email
            });
          });
        }
      });
      
      // Sort newest to oldest
      allLogs.sort((a, b) => b.time - a.time);
      setLogs(allLogs);
    } catch (err) {
      console.error("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-slate-900 text-white rounded-t-xl">
        <div>
          <h2 className="text-lg font-semibold">Security & Login Logs</h2>
          <p className="text-sm text-slate-400 mt-1">Global tracking of identity authentications via OTP.</p>
        </div>
        <button onClick={fetchLogs} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          ↻ Refresh Logs
        </button>
      </div>
      
      {loading ? (
        <div className="p-8 text-center text-gray-500">Analyzing security records...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600 uppercase tracking-wider">
                <th className="p-4 font-semibold">Timestamp</th>
                <th className="p-4 font-semibold">User Ident</th>
                <th className="p-4 font-semibold">Email Anchor</th>
                <th className="p-4 font-semibold">Access Role</th>
                <th className="p-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm font-medium text-slate-800">
                    {log.time.toLocaleString()}
                  </td>
                  <td className="p-4 text-sm font-mono text-slate-600">@{log.username}</td>
                  <td className="p-4 text-sm text-gray-500">{log.email}</td>
                  <td className="p-4 text-sm">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                      {log.role}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      Authorized
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No login activity captured yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
