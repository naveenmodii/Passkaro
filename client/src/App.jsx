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
        <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col">
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
              background: '#0f172a',
              color: '#fff',
              border: '1px solid #1e293b'
            }
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
