import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import RouteInspector from "./components/RouteInspector";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Auth from "./pages/Auth";
import AgentBuilder from "./pages/AgentBuilder";
import Agents from "./pages/Agents";
import KnowledgeBase from "./pages/KnowledgeBase";
import Personalization from "./pages/Personalization";
import PublicAgentView from "./pages/PublicAgentViewNew";
import Services from "./pages/ServicesNew";
import TestDeploy from "./pages/TestDeploynew";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Routes>
        {/* Public routes */}
        <Route element={<RouteInspector />}>
          <Route path="/auth" element={<Auth />} />
          <Route path="/agent/:agentId" element={<PublicAgentView />} />
        </Route>

        {/* Protected routes */}
        <Route element={<RouteInspector />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/agents"
            element={
              <Layout>
                <Agents />
              </Layout>
            }
          />
          <Route
            path="/knowledge-base"
            element={
              <Layout>
                <KnowledgeBase />
              </Layout>
            }
          />
          <Route
            path="/agent-space"
            element={
              <Layout>
                <AgentBuilder />
              </Layout>
            }
          />
          <Route
            path="/services"
            element={
              <Layout>
                <Services />
              </Layout>
            }
          />
          <Route
            path="/personalization"
            element={
              <Layout>
                <Personalization />
              </Layout>
            }
          />
          <Route
            path="/test-deploy"
            element={
              <Layout>
                <TestDeploy />
              </Layout>
            }
          />
          <Route
            path="/analytics"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/profile"
            element={
              <Layout>
                <Profile />
              </Layout>
            }
          />
          <Route
            path="/settings"
            element={
              <Layout>
                <Settings />
              </Layout>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
