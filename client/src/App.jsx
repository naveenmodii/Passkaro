import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CollegePage from './pages/CollegePage';
import BranchPage from './pages/BranchPage';
import SubjectPage from './pages/SubjectPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-zinc-50 text-zinc-900 selection:bg-zinc-900 selection:text-white font-sans flex flex-col antialiased">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/college/:slug" element={<CollegePage />} />
              <Route path="/college/:slug/branch/:branchId" element={<BranchPage />} />
              <Route path="/subject/:subjectId" element={<SubjectPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Routes>
          </main>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#18181b',
              color: '#fff',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
