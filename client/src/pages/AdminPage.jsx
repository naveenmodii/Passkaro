import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'colleges', label: 'Colleges' },
  { id: 'branches', label: 'Branches' },
  { id: 'subjects', label: 'Subjects' },
  { id: 'chapters', label: 'Chapters' },
  { id: 'videos', label: 'Videos' }
];

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('colleges');

  // Master data state
  const [colleges, setColleges] = useState([]);
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [videos, setVideos] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Client-side role protection
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        toast.error('Access denied. Admin rights required.');
        navigate('/');
      }
    }
  }, [user, authLoading, navigate]);

  // Fetch all admin data
  const fetchAllData = async () => {
    try {
      setDataLoading(true);
      const [colRes, branchRes, subRes, chapRes, vidRes] = await Promise.all([
        api.get('/api/admin/colleges'),
        api.get('/api/admin/branches'),
        api.get('/api/admin/subjects'),
        api.get('/api/admin/chapters'),
        api.get('/api/admin/videos')
      ]);
      setColleges(colRes.data || []);
      setBranches(branchRes.data || []);
      setSubjects(subRes.data || []);
      setChapters(chapRes.data || []);
      setVideos(vidRes.data || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      toast.error('Failed to load admin records');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAllData();
    }
  }, [user]);

  // Handle Delete
  const handleDelete = async (entityName, endpoint, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${entityName}?`)) return;
    try {
      await api.delete(`${endpoint}/${id}`);
      toast.success(`${entityName} deleted successfully`);
      fetchAllData();
    } catch (err) {
      const errMsg = err.response?.data?.error || `Failed to delete ${entityName}`;
      toast.error(errMsg);
    }
  };

  if (authLoading || (user && user.role === 'admin' && dataLoading)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-zinc-900 border-t-transparent"></div>
        <p className="mt-4 text-sm font-semibold text-zinc-600">Loading admin panel...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500 font-medium">
            Manage colleges, branches, subjects, chapters, and video streams.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            Admin Mode Active
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-zinc-200 mb-8 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'colleges' && (
        <CollegeSection colleges={colleges} onRefresh={fetchAllData} onDelete={handleDelete} />
      )}
      {activeTab === 'branches' && (
        <BranchSection branches={branches} colleges={colleges} onRefresh={fetchAllData} onDelete={handleDelete} />
      )}
      {activeTab === 'subjects' && (
        <SubjectSection subjects={subjects} branches={branches} onRefresh={fetchAllData} onDelete={handleDelete} />
      )}
      {activeTab === 'chapters' && (
        <ChapterSection chapters={chapters} subjects={subjects} onRefresh={fetchAllData} onDelete={handleDelete} />
      )}
      {activeTab === 'videos' && (
        <VideoSection videos={videos} chapters={chapters} onRefresh={fetchAllData} onDelete={handleDelete} />
      )}
    </div>
  );
}

/* ========================================================================== */
/* COLLEGE SECTION                                                           */
/* ========================================================================== */
function CollegeSection({ colleges, onRefresh, onDelete }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post('/api/admin/colleges', data);
      toast.success('College created successfully!');
      reset();
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create college');
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Form */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs">
        <h2 className="text-xl font-black text-zinc-900 mb-4">Add New College</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              College Name *
            </label>
            <input
              type="text"
              placeholder="e.g. BIT Mesra"
              {...register('name', { required: 'College name is required' })}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:bg-white focus:outline-none transition-all"
            />
            {errors.name && <p className="mt-1 text-xs font-semibold text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Slug *
            </label>
            <input
              type="text"
              placeholder="e.g. bit-mesra"
              {...register('slug', { required: 'Slug is required' })}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:bg-white focus:outline-none transition-all"
            />
            {errors.slug && <p className="mt-1 text-xs font-semibold text-red-600">{errors.slug.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              City
            </label>
            <input
              type="text"
              placeholder="e.g. Ranchi"
              {...register('city')}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Affiliating University
            </label>
            <input
              type="text"
              placeholder="e.g. Deemed University"
              {...register('affiliatingUniversity')}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-zinc-900 hover:bg-black text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create College'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs">
        <h2 className="text-xl font-black text-zinc-900 mb-4">Existing Colleges ({colleges.length})</h2>
        {colleges.length === 0 ? (
          <p className="text-sm text-zinc-500 font-medium italic">No colleges created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-700 border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 font-bold bg-zinc-50/50">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">University</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {colleges.map((col) => (
                  <tr key={col._id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-zinc-900">{col.name}</td>
                    <td className="py-3 px-4 font-mono text-xs">{col.slug}</td>
                    <td className="py-3 px-4">{col.city || '-'}</td>
                    <td className="py-3 px-4">{col.affiliatingUniversity || '-'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDelete('College', '/api/admin/colleges', col._id)}
                        className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* BRANCH SECTION                                                             */
/* ========================================================================== */
function BranchSection({ branches, colleges, onRefresh, onDelete }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post('/api/admin/branches', data);
      toast.success('Branch created successfully!');
      reset();
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create branch');
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Form */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs">
        <h2 className="text-xl font-black text-zinc-900 mb-4">Add New Branch</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Select College *
            </label>
            <select
              {...register('college', { required: 'College selection is required' })}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:bg-white focus:outline-none transition-all"
            >
              <option value="">-- Choose College --</option>
              {colleges.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.college && <p className="mt-1 text-xs font-semibold text-red-600">{errors.college.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Branch Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Computer Science Engineering"
              {...register('name', { required: 'Branch name is required' })}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:bg-white focus:outline-none transition-all"
            />
            {errors.name && <p className="mt-1 text-xs font-semibold text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Branch Code *
            </label>
            <input
              type="text"
              placeholder="e.g. CSE"
              {...register('code', { required: 'Branch code is required' })}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:bg-white focus:outline-none transition-all"
            />
            {errors.code && <p className="mt-1 text-xs font-semibold text-red-600">{errors.code.message}</p>}
          </div>

          <div className="md:col-span-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-zinc-900 hover:bg-black text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Branch'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs">
        <h2 className="text-xl font-black text-zinc-900 mb-4">Existing Branches ({branches.length})</h2>
        {branches.length === 0 ? (
          <p className="text-sm text-zinc-500 font-medium italic">No branches created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-700 border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 font-bold bg-zinc-50/50">
                  <th className="py-3 px-4">College</th>
                  <th className="py-3 px-4">Branch Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {branches.map((b) => (
                  <tr key={b._id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3 px-4 text-zinc-600 font-medium">{b.college?.name || 'Unknown'}</td>
                    <td className="py-3 px-4 font-bold text-zinc-900">{b.name}</td>
                    <td className="py-3 px-4 font-mono text-xs font-semibold">{b.code}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDelete('Branch', '/api/admin/branches', b._id)}
                        className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* SUBJECT SECTION                                                            */
/* ========================================================================== */
function SubjectSection({ subjects, branches, onRefresh, onDelete }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        semester: Number(data.semester),
        price: data.price ? Number(data.price) : 0
      };
      await api.post('/api/admin/subjects', payload);
      toast.success('Subject created successfully!');
      reset();
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create subject');
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Form */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs">
        <h2 className="text-xl font-black text-zinc-900 mb-4">Add New Subject</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Select Branch *
            </label>
            <select
              {...register('branch', { required: 'Branch selection is required' })}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:bg-white focus:outline-none transition-all"
            >
              <option value="">-- Choose Branch --</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.college?.name} - {b.code} ({b.name})
                </option>
              ))}
            </select>
            {errors.branch && <p className="mt-1 text-xs font-semibold text-red-600">{errors.branch.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Subject Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Data Structures"
              {...register('name', { required: 'Subject name is required' })}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:bg-white focus:outline-none transition-all"
            />
            {errors.name && <p className="mt-1 text-xs font-semibold text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Semester Number *
            </label>
            <input
              type="number"
              min="1"
              max="10"
              placeholder="e.g. 3"
              {...register('semester', { required: 'Semester is required', min: 1 })}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:bg-white focus:outline-none transition-all"
            />
            {errors.semester && <p className="mt-1 text-xs font-semibold text-red-600">{errors.semester.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Price (₹)
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 499"
              {...register('price')}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div className="md:col-span-4 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-zinc-900 hover:bg-black text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs">
        <h2 className="text-xl font-black text-zinc-900 mb-4">Existing Subjects ({subjects.length})</h2>
        {subjects.length === 0 ? (
          <p className="text-sm text-zinc-500 font-medium italic">No subjects created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-700 border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 font-bold bg-zinc-50/50">
                  <th className="py-3 px-4">College / Branch</th>
                  <th className="py-3 px-4">Subject Name</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {subjects.map((s) => (
                  <tr key={s._id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3 px-4 text-zinc-600 font-medium">
                      {s.branch?.college?.name ? `${s.branch.college.name} - ` : ''}{s.branch?.name || 'Unknown'}
                    </td>
                    <td className="py-3 px-4 font-bold text-zinc-900">{s.name}</td>
                    <td className="py-3 px-4 font-semibold">Sem {s.semester}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600">₹{s.price || 0}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDelete('Subject', '/api/admin/subjects', s._id)}
                        className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* CHAPTER SECTION                                                            */
/* ========================================================================== */
function ChapterSection({ chapters, subjects, onRefresh, onDelete }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        order: Number(data.order)
      };
      await api.post('/api/admin/chapters', payload);
      toast.success('Chapter created successfully!');
      reset();
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create chapter');
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Form */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs">
        <h2 className="text-xl font-black text-zinc-900 mb-4">Add New Chapter</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Select Subject *
            </label>
            <select
              {...register('subject', { required: 'Subject selection is required' })}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:bg-white focus:outline-none transition-all"
            >
              <option value="">-- Choose Subject --</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} (Sem {s.semester})
                </option>
              ))}
            </select>
            {errors.subject && <p className="mt-1 text-xs font-semibold text-red-600">{errors.subject.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Chapter Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Module 1: Trees"
              {...register('title', { required: 'Chapter title is required' })}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:bg-white focus:outline-none transition-all"
            />
            {errors.title && <p className="mt-1 text-xs font-semibold text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Display Order *
            </label>
            <input
              type="number"
              placeholder="e.g. 1"
              {...register('order', { required: 'Order is required' })}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:bg-white focus:outline-none transition-all"
            />
            {errors.order && <p className="mt-1 text-xs font-semibold text-red-600">{errors.order.message}</p>}
          </div>

          <div className="md:col-span-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-zinc-900 hover:bg-black text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Chapter'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs">
        <h2 className="text-xl font-black text-zinc-900 mb-4">Existing Chapters ({chapters.length})</h2>
        {chapters.length === 0 ? (
          <p className="text-sm text-zinc-500 font-medium italic">No chapters created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-700 border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 font-bold bg-zinc-50/50">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Chapter Title</th>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {chapters.map((ch) => (
                  <tr key={ch._id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3 px-4 text-zinc-600 font-medium">{ch.subject?.name || 'Unknown'}</td>
                    <td className="py-3 px-4 font-bold text-zinc-900">{ch.title}</td>
                    <td className="py-3 px-4 font-mono font-semibold">{ch.order}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDelete('Chapter', '/api/admin/chapters', ch._id)}
                        className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* VIDEO SECTION                                                              */
/* ========================================================================== */
function VideoSection({ videos, chapters, onRefresh, onDelete }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        durationMinutes: data.durationMinutes ? Number(data.durationMinutes) : undefined
      };
      await api.post('/api/admin/videos', payload);
      toast.success('Video created successfully!');
      reset();
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create video');
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Form */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs">
        <h2 className="text-xl font-black text-zinc-900 mb-4">Add New Video</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Select Chapter *
            </label>
            <select
              {...register('chapter', { required: 'Chapter selection is required' })}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:bg-white focus:outline-none transition-all"
            >
              <option value="">-- Choose Chapter --</option>
              {chapters.map((ch) => (
                <option key={ch._id} value={ch._id}>
                  {ch.subject?.name} - {ch.title}
                </option>
              ))}
            </select>
            {errors.chapter && <p className="mt-1 text-xs font-semibold text-red-600">{errors.chapter.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Video Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Introduction to Binary Search Trees"
              {...register('title', { required: 'Video title is required' })}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:bg-white focus:outline-none transition-all"
            />
            {errors.title && <p className="mt-1 text-xs font-semibold text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Bunny Video ID * (Paste from Bunny Stream dashboard)
            </label>
            <input
              type="text"
              placeholder="e.g. 8b67f1a3-294d-4952-b883-..."
              {...register('bunnyVideoId', { required: 'Bunny Video ID is required' })}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-mono font-medium focus:ring-2 focus:ring-zinc-900 focus:bg-white focus:outline-none transition-all"
            />
            {errors.bunnyVideoId && (
              <p className="mt-1 text-xs font-semibold text-red-600">{errors.bunnyVideoId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
              Duration (Minutes)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="e.g. 18.5"
              {...register('durationMinutes')}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-zinc-900 hover:bg-black text-white text-sm font-bold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Video'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs">
        <h2 className="text-xl font-black text-zinc-900 mb-4">Existing Videos ({videos.length})</h2>
        {videos.length === 0 ? (
          <p className="text-sm text-zinc-500 font-medium italic">No videos created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-700 border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 font-bold bg-zinc-50/50">
                  <th className="py-3 px-4">Chapter</th>
                  <th className="py-3 px-4">Video Title</th>
                  <th className="py-3 px-4">Bunny Video ID</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {videos.map((v) => (
                  <tr key={v._id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3 px-4 text-zinc-600 font-medium">{v.chapter?.title || 'Unknown'}</td>
                    <td className="py-3 px-4 font-bold text-zinc-900">{v.title}</td>
                    <td className="py-3 px-4 font-mono text-xs text-zinc-600">{v.bunnyVideoId}</td>
                    <td className="py-3 px-4 font-semibold">{v.durationMinutes ? `${v.durationMinutes} mins` : '-'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDelete('Video', '/api/admin/videos', v._id)}
                        className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
