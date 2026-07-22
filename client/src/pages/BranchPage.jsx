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
      <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <Link to={`/college/${slug}`} className="text-indigo-400 hover:underline text-sm font-semibold">
            ← Back to Branches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Breadcrumb */}
        <div>
          <Link to={`/college/${slug}`} className="text-indigo-400 hover:underline text-sm font-medium">
            ← Back to Branches
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-2 tracking-tight">
            Subjects & Syllabus
          </h1>
        </div>

        {/* Semester Filter Tabs */}
        {semesters.length > 0 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-800">
            <button
              onClick={() => setSelectedSemester('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                selectedSemester === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              All Semesters
            </button>
            {semesters.map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem.toString())}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedSemester === sem.toString()
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Semester {sem}
              </button>
            ))}
          </div>
        )}

        {/* Subjects List Grid */}
        {filteredSubjects.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
            No subjects found for the selected semester.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSubjects.map((subject) => {
              const unlocked = isSubjectUnlocked(subject._id);

              return (
                <Link
                  key={subject._id}
                  to={`/subject/${subject._id}`}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 p-6 rounded-2xl transition-all duration-200 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
                        Sem {subject.semester}
                      </span>

                      {/* Locked/Unlocked Badge */}
                      {unlocked ? (
                        <span className="inline-flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                          ✓ Unlocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                          🔒 Locked
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-xl text-white group-hover:text-indigo-300 transition-colors">
                      {subject.name}
                    </h3>

                    <div className="text-xs text-slate-400 mt-2">
                      📚 {subject.chapterCount || 0} Chapters
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-lg font-bold text-white">
                      ₹{subject.price}
                    </span>
                    <span className="text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
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
