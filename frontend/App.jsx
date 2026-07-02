import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

// ── Lazy-loaded pages ──────────────────────────────────────────────────────
// Each page is code-split so the initial bundle stays lean.
const Home           = lazy(() => import('./pages/Home'));
const SymptomChecker = lazy(() => import('./pages/SymptomChecker'));
const Specialists    = lazy(() => import('./pages/Specialists'));
const Hospitals      = lazy(() => import('./pages/Hospitals'));
const TherapyGuide   = lazy(() => import('./pages/TherapyGuide'));
const About          = lazy(() => import('./pages/About'));
const Contact        = lazy(() => import('./pages/Contact'));
const Login          = lazy(() => import('./pages/Login'));
const Signup         = lazy(() => import('./pages/Signup'));
const Chat           = lazy(() => import('./pages/Chat'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// ── Page loading fallback ──────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="page-loader" aria-label="Loading page…">
      <div className="spinner" />
    </div>
  );
}

// ── App shell ──────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Skip-to-content for keyboard/screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 btn btn-primary z-50"
        >
          Skip to content
        </a>

        <NavBar />

        <main id="main-content">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Public pages ── */}
              <Route path="/"              element={<Home />} />
              <Route path="/symptoms"      element={<SymptomChecker />} />
              <Route path="/specialists"   element={<Specialists />} />
              <Route path="/hospitals"     element={<Hospitals />} />
              <Route path="/therapy-guide" element={<TherapyGuide />} />
              <Route path="/about"         element={<About />} />
              <Route path="/contact"       element={<Contact />} />

              {/* ── Auth pages (redirect to home if already logged in) ── */}
              <Route path="/login"  element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* ── Authenticated-only pages ── */}
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />

              {/* ── Admin-only pages ── */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* ── Fallback ── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
        <WhatsAppButton />
      </AuthProvider>
    </BrowserRouter>
  );
}
