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
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 text-zinc-900 flex flex-col justify-center items-center px-4 py-16">
      <div className="max-w-3xl w-full text-center space-y-6">
        
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 bg-zinc-200/70 border border-zinc-300 text-zinc-900 px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wide uppercase shadow-2xs">
          <span>Your Last Minute Savior</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-900 leading-[1.1]">
          Pass your semester exams with{' '}
          <span className="bg-zinc-900 text-white px-3.5 py-1 rounded-xl inline-block mt-1 sm:mt-0 shadow-md">
            targeted videos
          </span>
        </h1>

        <p className="text-zinc-600 text-lg sm:text-xl max-w-xl mx-auto font-medium leading-relaxed">
          Short, exam-focused crash courses mapped directly to your college's official syllabus.
        </p>

        {/* Search Box Container */}
        <div className="relative max-w-xl mx-auto mt-10 text-left">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="Search your college (e.g. BIT Mesra)..."
              className="w-full bg-white border border-zinc-300 text-zinc-900 px-5 py-4 pl-12 rounded-2xl shadow-sm hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-base placeholder-zinc-400 transition-all font-semibold"
            />
            {/* Search Icon */}
            <svg
              className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-300 rounded-2xl shadow-2xl overflow-hidden z-30 max-h-80 overflow-y-auto divide-y divide-zinc-100">
              {colleges.length > 0 ? (
                colleges.map((college) => (
                  <button
                    key={college._id}
                    onMouseDown={() => navigate(`/college/${college.slug}`)}
                    className="w-full text-left px-5 py-4 hover:bg-zinc-100/70 transition-colors flex justify-between items-center group"
                  >
                    <div>
                      <div className="font-bold text-zinc-900 group-hover:text-black transition-colors text-base">
                        {college.name}
                      </div>
                      {college.city && (
                        <div className="text-xs font-medium text-zinc-500 mt-0.5">
                          {college.city} {college.affiliatingUniversity ? `• ${college.affiliatingUniversity}` : ''}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold text-white bg-zinc-900 group-hover:bg-black px-3.5 py-1.5 rounded-xl transition-all shadow-sm">
                      Select →
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-5 py-6 text-zinc-500 text-sm text-center font-semibold">
                  {loading ? 'Searching...' : 'No colleges found'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Trust features without emojis */}
        <div className="pt-8 flex flex-wrap justify-center items-center gap-6 text-xs font-bold text-zinc-700">
          <span className="flex items-center space-x-1.5 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="text-zinc-900">•</span>
            <span>Syllabus Aligned</span>
          </span>
          <span className="flex items-center space-x-1.5 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="text-zinc-900">•</span>
            <span>Instant Access</span>
          </span>
          <span className="flex items-center space-x-1.5 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="text-zinc-900">•</span>
            <span>Fixed Length Lectures</span>
          </span>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
