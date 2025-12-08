import {
  BookOpen,
  Briefcase,
  ChartBar,
  House,
  Lightning,
  Palette,
  Robot,
  Rocket,
  Sliders,
  User as UserIcon,
} from "@phosphor-icons/react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Layout from "./components/Layout";
import { NetworkGoldWidget } from "./components/NetworkGoldWidget";
import RouteInspector from "./components/RouteInspector";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AgentBuilder from "./pages/AgentBuilder";
import Agents from "./pages/Agents";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import KnowledgeBase from "./pages/KnowledgeBase";
import Personalization from "./pages/Personalization";
import Profile from "./pages/Profile";
import PublicAgentView from "./pages/PublicAgentViewNew";
import Services from "./pages/Services";
import Settings from "./pages/Settings";
import TestDeploy from "./pages/TestDeploy";

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Routes>
        {/* Public routes */}
        <Route element={<RouteInspector />}>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/agent/:agentId"
            element={<PublicAgentView isTesting={false} />}
          />
          <Route
            path="/agent/test/:agentId"
            element={<PublicAgentView isTesting={true} />}
          />
        </Route>

        {/* Protected routes */}
        <Route element={<RouteInspector />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <Layout headerIcon={House} animationType="shake">
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/agents"
            element={
              <Layout headerIcon={Lightning} animationType="shake">
                <Agents />
              </Layout>
            }
          />
          <Route
            path="/knowledge-base"
            element={
              <Layout headerIcon={BookOpen} animationType="shake">
                <KnowledgeBase />
              </Layout>
            }
          />
          <Route
            path="/agent-space"
            element={
              <Layout headerIcon={Robot} animationType="shake">
                <AgentBuilder />
              </Layout>
            }
          />
          <Route
            path="/services"
            element={
              <Layout headerIcon={Briefcase} animationType="shake">
                <Services />
              </Layout>
            }
          />
          <Route
            path="/personalization"
            element={
              <Layout headerIcon={Palette} animationType="shake">
                <Personalization />
              </Layout>
            }
          />
          <Route
            path="/test-deploy"
            element={
              <Layout headerIcon={Rocket} animationType="shake">
                <TestDeploy />
              </Layout>
            }
          />
          <Route
            path="/analytics"
            element={
              <Layout headerIcon={ChartBar} animationType="shake">
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/profile"
            element={
              <Layout headerIcon={UserIcon} animationType="shake">
                <Profile />
              </Layout>
            }
          />
          <Route
            path="/settings"
            element={
              <Layout headerIcon={Sliders} animationType="shake">
                <Settings />
              </Layout>
            }
          />
          <Route path="/netzwerkgold-agent" element={<NetworkGoldWidget />} />
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
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
