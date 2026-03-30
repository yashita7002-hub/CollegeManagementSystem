

export default function CoursesTab() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  
  const [formData, setFormData] = useState({
    courseName: '', courseCode: '', credits: ''
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/v1/courses/all");
      setCourses(res.data.data);
    } catch (err) {
      console.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };
//console.log(setCourses)
 
  useEffect(() => {
  fetchCourses();
  
}, []);

//console.log(fetchUsers)

  const handleDelete = async (courseCode) => {
    if (!window.confirm(`Delete course ${courseCode}? This removes it from all students and professors.`)) return;
    try {
      await axios.delete(`/api/v1/courses/delete/${courseCode}`);
      fetchCourses();
    } catch (err) {
      alert("Failed to delete course");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/v1/courses/create", formData);
      setIsModalOpen(false);
      setFormData({ courseName: '', courseCode: '', credits: '' });
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || "Creation failed");
    }
  };
 

  return (
    <div>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Upload Courses</h2>
          
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
          + Add Course
        </button>
      </div>
      
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading courses...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                <th className="p-4 font-medium">Course Code</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Credits</th>
                <th className="p-4 font-medium text-right">Actions</th>
               
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map(c => (
                <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm font-bold text-slate-800">{c.courseCode}</td>
                  <td className="p-4 text-sm text-gray-600">{c.courseName}</td>
                  <td className="p-4 text-sm">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                      {c.credits} Credits
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(c.courseCode)}
                      className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">No courses available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-[400px] rounded-2xl shadow-2xl p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
               ✕
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Course</h2>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code (e.g., CS101) *</label>
                <input required value={formData.courseCode} onChange={e => setFormData({...formData, courseCode: e.target.value})} type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Name *</label>
                <input required value={formData.courseName} onChange={e => setFormData({...formData, courseName: e.target.value})} type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credits *</label>
                <input required value={formData.credits} onChange={e => setFormData({...formData, credits: e.target.value})} type="number" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium mt-4">
                Create Course
              </button>
            </form>
          </div>
        </div>
      )}
    </div>

   {/* ================= ASSIGN COURSES ================= */}

  
    </div>
  );
}
