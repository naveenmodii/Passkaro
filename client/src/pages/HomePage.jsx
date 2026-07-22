import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const HomePage = () => {
  const [search, setSearch] = useState('');
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/content/colleges?search=${encodeURIComponent(search.trim())}`);
        setColleges(res.data);
      } catch (err) {
        console.error('Failed to search colleges:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-3xl w-full text-center space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
          ⚡ Exam Night Savior
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
          Pass your semester exams with{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
            targeted videos
          </span>
        </h1>

        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto">
          Short, exam-focused crash courses mapped directly to your college's official syllabus.
        </p>

        {/* Search Box Container */}
        <div className="relative max-w-xl mx-auto mt-8 text-left">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="Search your college (e.g. BIT Mesra)..."
              className="w-full bg-slate-900 border border-slate-700 text-white px-5 py-4 pl-12 rounded-2xl shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg placeholder-slate-500"
            />
            {/* Search Icon */}
            <svg
              className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-20 max-h-80 overflow-y-auto">
              {colleges.length > 0 ? (
                colleges.map((college) => (
                  <button
                    key={college._id}
                    onMouseDown={() => navigate(`/college/${college.slug}`)}
                    className="w-full text-left px-5 py-3.5 hover:bg-indigo-600/20 border-b border-slate-800/50 last:border-0 transition-colors flex justify-between items-center group"
                  >
                    <div>
                      <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        {college.name}
                      </div>
                      {college.city && (
                        <div className="text-xs text-slate-400">
                          {college.city} {college.affiliatingUniversity ? `• ${college.affiliatingUniversity}` : ''}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Select →
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-5 py-4 text-slate-400 text-sm text-center">
                  {loading ? 'Searching...' : 'No colleges found'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
