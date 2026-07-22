import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const CollegePage = () => {
  const { slug } = useParams();
  const [college, setCollege] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch college info
        const collegeRes = await api.get(`/api/content/colleges?search=${encodeURIComponent(slug)}`);
        const found = collegeRes.data.find((c) => c.slug === slug);
        if (found) {
          setCollege(found);
        }

        // Fetch branches for slug
        const branchesRes = await api.get(`/api/content/colleges/${slug}/branches`);
        setBranches(branchesRes.data);
      } catch (err) {
        console.error('Failed to load college data:', err);
        setError(err.response?.data?.error || 'Failed to load college details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

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
          <Link to="/" className="text-indigo-400 hover:underline text-sm font-semibold">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Breadcrumbs */}
        <div>
          <Link to="/" className="text-indigo-400 hover:underline text-sm font-medium">
            ← All Colleges
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-2 tracking-tight">
            {college ? college.name : slug.toUpperCase()}
          </h1>
          {college?.city && (
            <p className="text-slate-400 text-sm mt-1">
              📍 {college.city} {college.affiliatingUniversity ? `• ${college.affiliatingUniversity}` : ''}
            </p>
          )}
        </div>

        {/* Branch Selection */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-slate-200">Select Your Branch</h2>

          {branches.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
              No engineering branches uploaded for this college yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {branches.map((branch) => (
                <Link
                  key={branch._id}
                  to={`/college/${slug}/branch/${branch._id}`}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 p-5 rounded-2xl transition-all duration-200 group flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-bold px-2.5 py-1 rounded-md mb-3">
                      {branch.code}
                    </span>
                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">
                      {branch.name}
                    </h3>
                  </div>
                  <div className="mt-4 text-xs font-semibold text-indigo-400 flex items-center space-x-1">
                    <span>View Subjects</span>
                    <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollegePage;
