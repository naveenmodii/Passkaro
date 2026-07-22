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
          <Link to="/" className="text-xs font-bold bg-zinc-900 text-white px-4 py-2 rounded-xl hover:bg-black transition-all">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 text-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Breadcrumbs */}
        <div>
          <Link to="/" className="text-zinc-500 hover:text-zinc-900 text-xs font-semibold tracking-wide uppercase transition-colors">
            ← All Colleges
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mt-2">
            {college ? college.name : slug.toUpperCase()}
          </h1>
          {college?.city && (
            <p className="text-zinc-500 text-sm font-medium mt-1">
              📍 {college.city} {college.affiliatingUniversity ? `• ${college.affiliatingUniversity}` : ''}
            </p>
          )}
        </div>

        {/* Branch Selection */}
        <div>
          <h2 className="text-lg font-bold mb-4 text-zinc-800 uppercase tracking-wider text-xs">
            Select Your Branch
          </h2>

          {branches.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center text-zinc-500 font-medium">
              No engineering branches uploaded for this college yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {branches.map((branch) => (
                <Link
                  key={branch._id}
                  to={`/college/${slug}/branch/${branch._id}`}
                  className="bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-md p-6 rounded-2xl transition-all duration-200 group flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <span className="bg-zinc-900 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-md tracking-wider inline-block">
                      {branch.code}
                    </span>
                    <h3 className="font-bold text-lg text-zinc-900 group-hover:text-black transition-colors mt-3">
                      {branch.name}
                    </h3>
                  </div>
                  <div className="mt-6 pt-3 border-t border-zinc-100 text-xs font-bold text-zinc-900 flex items-center justify-between">
                    <span>Explore Subjects</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
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
