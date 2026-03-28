import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Registration form state
  const [formData, setFormData] = useState({
    username: '', email: '', role: 'student', fullName: '', department: '', qualification: '', year: '', branch: ''
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/users/all");
      setUsers(res.data.data);
    } catch (err) {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (username) => {
    if (!window.confirm(`Are you sure you want to delete ${username}?`)) return;
    try {
      await axios.delete("/api/v1/users/delete", { data: { username } });
      fetchUsers();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/v1/users/register", formData);
      setIsModalOpen(false);
      fetchUsers();
      alert("User registered successfully. An email has been sent to set their password.");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage students, professors, and administrators.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
          + Add New User
        </button>
      </div>
      
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading users...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Username</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm font-medium text-gray-900">
                    {u.profile?.fullName || 'N/A'}
                  </td>
                  <td className="p-4 text-sm text-gray-600">{u.username}</td>
                  <td className="p-4 text-sm text-gray-600">{u.email}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'professor' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(u.username)}
                      className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-[500px] rounded-2xl shadow-2xl p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
               ✕
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Register New User</h2>
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="student">Student</option>
                    <option value="professor">Professor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>

              {(formData.role === 'student' || formData.role === 'professor') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              )}

              {formData.role === 'student' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                    <input required value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} type="number" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
                    <input required value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              )}

              {formData.role === 'professor' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <input required value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualification *</label>
                    <input required value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              )}

              <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium mt-4">
                Register & Send Setup Email
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
