import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'; // Import Outlet here
import { Toaster } from 'react-hot-toast'; // Import Toaster

// Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx'; 
import WorkspaceSelectionPage from './pages/WorkspaceSelectionPage.jsx'; 
import AcceptInvitePage from './pages/AcceptInvitePage.jsx';
import ProjectPage from './pages/ProjectPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import TasksPage from './pages/TasksPage.jsx'; 
import CalendarPage from './pages/CalendarPage.jsx'; 
import NotificationPage from './pages/NotificationPage.jsx'; 
import SettingsPage from './pages/SettingsPage.jsx'; 
// import NotFoundPage from './pages/NotFoundPage.jsx'; // Not built yet

// Layouts
import PublicLayout from './components/layout/PublicLayout.jsx';
import AppLayout from './components/layout/AppLayout.jsx'; // Import the real AppLayout

// Helpers
import ProtectedRoute from './ProtectedRoute.jsx'; // Import the real ProtectedRoute
import { AuthProvider } from './context/AuthContext.jsx';
import { ProjectProvider } from './context/ProjectContext.jsx'; // Import ProjectProvider

function App() {

  const PlaceholderNotFoundPage = () => <div>404 Not Found</div>; // Temporary Placeholder

  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Add Toaster for notifications */}
        <Toaster position="top-right" />
        <Routes>
          {/* ... Routes ... */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="accept-invite" element={<AcceptInvitePage />} />
          </Route>

          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />

          <Route
            element={
              <ProtectedRoute>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="/workspaces" element={<WorkspaceSelectionPage />} />

            <Route element={
              <ProjectProvider>
                <AppLayout />
              </ProjectProvider>
            }>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="project/:projectId" element={<ProjectPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="tasks" element={<TasksPage />} /> {/* Add Tasks Route */}
              <Route path="calendar" element={<CalendarPage />} /> {/* Add Calendar Route */}
              <Route path="notifications" element={<NotificationPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<PlaceholderNotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

