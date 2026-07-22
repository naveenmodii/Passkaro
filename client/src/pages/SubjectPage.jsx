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
          color: '#18181b'
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
      <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 text-zinc-900 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 text-zinc-900 flex items-center justify-center p-4">
        <div className="bg-white border border-zinc-300 p-8 rounded-2xl max-w-md text-center shadow-sm">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-zinc-600 text-sm mb-4 font-semibold">{error}</p>
          <button onClick={() => navigate(-1)} className="text-xs font-bold bg-zinc-900 text-white px-4.5 py-2.5 rounded-xl hover:bg-black transition-all shadow-sm">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check if all videos in this subject are locked for user
  const isSubjectFullyLocked = chapters.length > 0 && chapters.every(ch => ch.videos.every(v => !v.unlocked));

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 text-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Bar / Buy Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-zinc-300 p-6 sm:p-8 rounded-2xl shadow-2xs gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-zinc-800 uppercase tracking-wider bg-zinc-100 border border-zinc-300 px-3 py-1 rounded-full">
              Exam Crash Course
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 text-zinc-900 tracking-tight">
              Chapters & Video Lectures
            </h1>
            <p className="text-zinc-600 text-sm mt-1 font-medium">
              Watch fixed-length recorded videos tailored to your syllabus.
            </p>
          </div>

          {isSubjectFullyLocked && (
            <button
              onClick={handleBuyAccess}
              disabled={paymentLoading}
              className="bg-zinc-900 hover:bg-black disabled:opacity-50 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] shrink-0 flex items-center justify-center space-x-2 ring-1 ring-zinc-900/10"
            >
              <span>Buy Full Access</span>
            </button>
          )}
        </div>

        {/* Video Player Section (Rendered on demand when a video is clicked) */}
        {activeVideo && (
          <div className="bg-white border border-zinc-300 p-5 rounded-2xl shadow-xl space-y-4 ring-1 ring-zinc-900/10">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h2 className="font-bold text-base text-zinc-900 flex items-center space-x-2">
                <span>Playing: {activeVideo.title}</span>
              </h2>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-zinc-700 hover:text-zinc-900 text-xs font-bold px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-lg transition-colors"
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
          <div className="bg-white border border-zinc-300 rounded-2xl p-10 text-center text-zinc-600 font-semibold shadow-2xs">
            No chapters uploaded for this subject yet.
          </div>
        ) : (
          <div className="space-y-6">
            {chapters.map((chapter) => (
              <div key={chapter._id} className="bg-white border border-zinc-300 rounded-2xl overflow-hidden shadow-2xs">
                <div className="bg-zinc-100/80 px-6 py-4 border-b border-zinc-300 flex items-center justify-between">
                  <h3 className="font-bold text-base text-zinc-900 flex items-center space-x-2">
                    <span className="text-xs bg-zinc-900 text-white font-mono font-bold px-2 py-0.5 rounded">
                      Ch #{chapter.order}
                    </span>
                    <span>{chapter.title}</span>
                  </h3>
                  <span className="text-xs font-bold text-zinc-600">
                    {chapter.videos?.length || 0} videos
                  </span>
                </div>

                <div className="divide-y divide-zinc-200">
                  {chapter.videos && chapter.videos.length > 0 ? (
                    chapter.videos.map((video) => (
                      <div
                        key={video._id}
                        className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs">
                            {video.unlocked ? '✓' : '•'}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-zinc-900">
                              {video.title}
                            </div>
                            {video.durationMinutes && (
                              <div className="text-xs text-zinc-600 font-medium">
                                {video.durationMinutes} mins
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
                              className="bg-zinc-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"
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
                              className="bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-2xs active:scale-95"
                            >
                              <span>Buy Access</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-xs text-zinc-500 italic">
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
