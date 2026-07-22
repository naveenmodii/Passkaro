import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SubjectPage = () => {
  const { subjectId } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Track active video playback state { videoId, playUrl, title }
  const [activeVideo, setActiveVideo] = useState(null);
  const [loadingVideoId, setLoadingVideoId] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchChapters = async () => {
    try {
      const res = await api.get(`/api/content/subjects/${subjectId}/chapters`);
      setChapters(res.data);
    } catch (err) {
      console.error('Failed to load chapters:', err);
      setError(err.response?.data?.error || 'Failed to load subject content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, [subjectId]);

  // Handle Video Play Click
  const handlePlayVideo = async (video) => {
    if (!user) {
      toast.error('Please log in to watch videos');
      navigate('/login');
      return;
    }

    setLoadingVideoId(video._id);
    try {
      const res = await api.get(`/api/videos/${video._id}/play-url`);
      setActiveVideo({
        videoId: video._id,
        playUrl: res.data.playUrl,
        title: video.title
      });
      toast.success('Video loaded');
    } catch (err) {
      console.error('Failed to get video play URL:', err);
      toast.error(err.response?.data?.error || 'Failed to load video playback URL');
    } finally {
      setLoadingVideoId(null);
    }
  };

  // Handle Razorpay Payment Flow
  const handleBuyAccess = async () => {
    if (!user) {
      toast.error('Please log in to purchase subject access');
      navigate('/login');
      return;
    }

    setPaymentLoading(true);
    try {
      // 1. Create order
      const orderRes = await api.post('/api/payments/create-order', { subjectId });
      const { orderId, amount, keyId } = orderRes.data;

      // 2. Open Razorpay modal
      const options = {
        key: keyId,
        amount: amount,
        currency: 'INR',
        name: 'PassKaro',
        description: 'Unlock Exam Prep Subject Access',
        order_id: orderId,
        handler: async (response) => {
          try {
            // 3. Verify Payment
            const verifyRes = await api.post('/api/payments/verify', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              subjectId
            });

            if (verifyRes.data.success) {
              toast.success('Subject unlocked successfully!');
              await refreshUser();
              await fetchChapters(); // Refresh unlocked status in list
            }
          } catch (verifyErr) {
            console.error('Payment verification failed:', verifyErr);
            toast.error(verifyErr.response?.data?.error || 'Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email
        },
        theme: {
          color: '#4f46e5'
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', (resp) => {
        toast.error('Payment failed: ' + (resp.error.description || 'Unknown error'));
      });
      razorpayInstance.open();

    } catch (err) {
      console.error('Payment initiation error:', err);
      toast.error(err.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setPaymentLoading(false);
    }
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
          <button onClick={() => navigate(-1)} className="text-indigo-400 hover:underline text-sm font-semibold">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check if all videos in this subject are locked for user
  const isSubjectFullyLocked = chapters.length > 0 && chapters.every(ch => ch.videos.every(v => !v.unlocked));

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Bar / Buy Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
              Exam Crash Course
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
              Chapters & Video Lectures
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Watch fixed-length recorded videos tailored to your syllabus.
            </p>
          </div>

          {isSubjectFullyLocked && (
            <button
              onClick={handleBuyAccess}
              disabled={paymentLoading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 shrink-0"
            >
              <span>🔒 Buy Full Access</span>
            </button>
          )}
        </div>

        {/* Video Player Section (Rendered on demand when a video is clicked) */}
        {activeVideo && (
          <div className="bg-slate-900 border border-indigo-500/30 p-4 sm:p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-bold text-lg text-indigo-300 flex items-center space-x-2">
                <span>▶</span>
                <span>Playing: {activeVideo.title}</span>
              </h2>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 bg-slate-800 rounded-md"
              >
                Close Player ✕
              </button>
            </div>
            
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-inner">
              <video
                src={activeVideo.playUrl}
                controls
                autoPlay
                controlsList="nodownload"
                className="w-full h-full object-contain"
              >
                Your browser does not support HTML5 video playback.
              </video>
            </div>
          </div>
        )}

        {/* Chapters Accordion / List */}
        {chapters.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
            No chapters uploaded for this subject yet.
          </div>
        ) : (
          <div className="space-y-6">
            {chapters.map((chapter) => (
              <div key={chapter._id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="bg-slate-800/60 px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-100 flex items-center space-x-2">
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded">
                      Ch #{chapter.order}
                    </span>
                    <span>{chapter.title}</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    {chapter.videos?.length || 0} videos
                  </span>
                </div>

                <div className="divide-y divide-slate-800/50">
                  {chapter.videos && chapter.videos.length > 0 ? (
                    chapter.videos.map((video) => (
                      <div
                        key={video._id}
                        className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-sm font-bold shrink-0">
                            {video.unlocked ? '▶' : '🔒'}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-slate-200">
                              {video.title}
                            </div>
                            {video.durationMinutes && (
                              <div className="text-xs text-slate-500">
                                ⏱ {video.durationMinutes} mins
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <div>
                          {video.unlocked ? (
                            <button
                              onClick={() => handlePlayVideo(video)}
                              disabled={loadingVideoId === video._id}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center space-x-1"
                            >
                              {loadingVideoId === video._id ? (
                                <span>Loading...</span>
                              ) : (
                                <span>Watch Video</span>
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={handleBuyAccess}
                              disabled={paymentLoading}
                              className="bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center space-x-1"
                            >
                              <span>Buy Access</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-xs text-slate-500 italic">
                      No video lectures uploaded in this chapter yet.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default SubjectPage;
