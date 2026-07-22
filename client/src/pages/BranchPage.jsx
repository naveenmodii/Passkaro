import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const BranchPage = () => {
  const { slug, branchId } = useParams();
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/api/content/branches/${branchId}/subjects`);
        setSubjects(res.data);
      } catch (err) {
        console.error('Failed to load subjects:', err);
        setError(err.response?.data?.error || 'Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [branchId]);

  // Extract unique semesters
  const semesters = useMemo(() => {
    const semSet = new Set(subjects.map((s) => s.semester));
    return Array.from(semSet).sort((a, b) => a - b);
  }, [subjects]);

  // Filtered subjects
  const filteredSubjects = useMemo(() => {
    if (selectedSemester === 'all') return subjects;
    return subjects.filter((s) => s.semester === Number(selectedSemester));
  }, [subjects, selectedSemester]);

  // Check if a subject is unlocked for user
  const isSubjectUnlocked = (subId) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.unlockedSubjects?.some((id) => id === subId || id._id === subId);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 text-zinc-900 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 text-zinc-900 flex items-center justify-center p-4">
        <div className="bg-white border border-zinc-200 p-8 rounded-2xl max-w-md text-center shadow-sm">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-zinc-500 text-sm mb-4 font-medium">{error}</p>
          <Link to={`/college/${slug}`} className="text-xs font-bold bg-zinc-900 text-white px-4 py-2 rounded-xl hover:bg-black transition-all">
            ← Back to Branches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 text-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Breadcrumb */}
        <div>
          <Link to={`/college/${slug}`} className="text-zinc-500 hover:text-zinc-900 text-xs font-semibold tracking-wide uppercase transition-colors">
            ← Back to Branches
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mt-2">
            Subjects & Syllabus
          </h1>
        </div>

        {/* Semester Filter Tabs */}
        {semesters.length > 0 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-zinc-200">
            <button
              onClick={() => setSelectedSemester('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedSemester === 'all'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              All Semesters
            </button>
            {semesters.map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem.toString())}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedSemester === sem.toString()
                    ? 'bg-zinc-900 text-white shadow-2xs'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                Semester {sem}
              </button>
            ))}
          </div>
        )}

        {/* Subjects List Grid */}
        {filteredSubjects.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center text-zinc-500 font-medium">
            No subjects found for the selected semester.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSubjects.map((subject) => {
              const unlocked = isSubjectUnlocked(subject._id);

              return (
                <Link
                  key={subject._id}
                  to={`/subject/${subject._id}`}
                  className="bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-md p-6 rounded-2xl transition-all duration-200 group flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-bold text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-md">
                        Sem {subject.semester}
                      </span>

                      {/* Locked/Unlocked Badge */}
                      {unlocked ? (
                        <span className="inline-flex items-center text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          ✓ Unlocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-semibold text-zinc-700 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-full">
                          🔒 Locked
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-xl text-zinc-900 group-hover:text-black transition-colors">
                      {subject.name}
                    </h3>

                    <div className="text-xs text-zinc-500 font-medium mt-2">
                      📚 {subject.chapterCount || 0} Chapters
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-xl font-extrabold text-zinc-900">
                      ₹{subject.price}
                    </span>
                    <span className="text-xs font-bold text-zinc-900 group-hover:translate-x-1 transition-transform">
                      View Course →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchPage;
