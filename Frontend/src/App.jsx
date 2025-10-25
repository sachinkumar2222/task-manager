import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'; // Import Outlet here
import { Toaster } from 'react-hot-toast'; // Import Toaster

// Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx'; // Import the real DashboardPage
import WorkspaceSelectionPage from './pages/WorkspaceSelectionPage.jsx'; // Import the new page
// import AcceptInvitePage from './pages/AcceptInvitePage.jsx'; // Not built yet
// import ProjectPage from './pages/ProjectPage.jsx'; // Not built yet
// import NotFoundPage from './pages/NotFoundPage.jsx'; // Not built yet

// Layouts
import PublicLayout from './components/layout/PublicLayout.jsx';
import AppLayout from './components/layout/AppLayout.jsx'; // Import the real AppLayout

// Helpers
import ProtectedRoute from './ProtectedRoute.jsx'; // Import the real ProtectedRoute
import { AuthProvider } from './context/AuthContext.jsx'; // Import the real AuthProvider

/**
 * App Component
 * Added WorkspaceSelectionPage route after login.
 * Dashboard is now within AppLayout.
 * Added missing Outlet import.
 */
function App() {
  // Placeholder components for routes/layouts not yet implemented
  const PlaceholderProjectPage = () => <div>Project Page</div>; // Temporary Placeholder
  const PlaceholderNotFoundPage = () => <div>404 Not Found</div>; // Temporary Placeholder
  const PlaceholderAcceptInvitePage = () => <div>Accept Invite Page</div>; // Temporary Placeholder

  return (
    // Use the real AuthProvider
    <AuthProvider>
      <BrowserRouter>
        {/* Add Toaster for notifications */}
        <Toaster position="top-right" />
        <Routes>
          {/* --- Public Routes WITH Layout (Header/Footer) --- */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            {/* AcceptInvite route uses placeholder */}
            <Route path="accept-invite" element={<PlaceholderAcceptInvitePage />} /> {/* Temp */}
          </Route>

          {/* --- Public Routes WITHOUT Layout (Full Screen) --- */}
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} /> {/* Use the real component */}


          {/* --- Private/Protected Routes --- */}
           <Route
             element={
               // Use the real ProtectedRoute component
               <ProtectedRoute>
                 {/* Outlet will render either WorkspaceSelectionPage or AppLayout based on path */}
                 <Outlet /> 
               </ProtectedRoute>
             }
           >
              {/* Workspace Selection Page (No AppLayout needed here) */}
              <Route path="/workspaces" element={<WorkspaceSelectionPage />} />

              {/* Routes using the AppLayout (Sidebar + Navbar) */}
              <Route element={<AppLayout />}>
                 <Route path="dashboard" element={<DashboardPage />} /> 
                 <Route path="project/:projectId" element={<PlaceholderProjectPage />} /> {/* Still placeholder */}
                 {/* Add other protected routes like /settings here */}
              </Route>
           </Route>

          {/* --- Not Found Route (Using Placeholder) --- */}
           <Route path="*" element={<PlaceholderNotFoundPage />} /> {/* Temp */}

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

