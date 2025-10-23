import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import PublicLayout from './components/layout/PublicLayout.jsx';
// Placeholder pages (taaki routes kaam karein)
const LoginPage = () => <div>Login Page</div>;
const SignupPage = () => <div>Signup Page</div>;
const DashboardPage = () => <div>Dashboard Page</div>;
const NotFoundPage = () => <div>404 Not Found</div>;

/**
 * App Component
 * Yeh application ka main entry point hai.
 * Abhi ke liye, hum sirf public routes setup kar rahe hain.
 */
function App() {
  return (
    // <AuthProvider> - Hum ise baad mein add karenge
      <BrowserRouter>
        <Routes>
          {/* --- Public Routes --- */}
          {/* Yeh routes PublicLayout ka istemaal karte hain (simple navbar/footer) */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
          </Route>

          {/* --- Private/Protected Routes (Placeholder) --- */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* --- Not Found Route --- */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    // </AuthProvider>
  );
}

export default App;

