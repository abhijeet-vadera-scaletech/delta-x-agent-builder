import {
  Book,
  ChartBar,
  Gear,
  Lightning,
  Palette,
  Robot,
  Rocket,
  Sliders,
  User as UserIcon,
} from "phosphor-react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Layout from "./components/Layout";
import { NetworkGoldWidget } from "./components/NetworkGoldWidget";
import RouteInspector from "./components/RouteInspector";
import { AppProvider } from "./context/AppContext";
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
import Services from "./pages/ServicesNew";
import Settings from "./pages/Settings";
import TestDeploy from "./pages/TestDeploynew";

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
              <Layout
                headerIcon={<Lightning size={85} weight="duotone" />}
                animationType="shake"
              >
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/agents"
            element={
              <Layout
                headerIcon={<Robot size={85} weight="duotone" />}
                animationType="rotate"
              >
                <Agents />
              </Layout>
            }
          />
          <Route
            path="/knowledge-base"
            element={
              <Layout
                headerIcon={<Book size={85} weight="duotone" />}
                animationType="wobble"
              >
                <KnowledgeBase />
              </Layout>
            }
          />
          <Route
            path="/agent-space"
            element={
              <Layout
                headerIcon={<Rocket size={85} weight="duotone" />}
                animationType="fly"
              >
                <AgentBuilder />
              </Layout>
            }
          />
          <Route
            path="/services"
            element={
              <Layout
                headerIcon={<Gear size={85} weight="duotone" />}
                animationType="pulse"
              >
                <Services />
              </Layout>
            }
          />
          <Route
            path="/personalization"
            element={
              <Layout
                headerIcon={<Palette size={85} weight="duotone" />}
                animationType="flip"
              >
                <Personalization />
              </Layout>
            }
          />
          <Route
            path="/test-deploy"
            element={
              <Layout
                headerIcon={<Rocket size={85} weight="duotone" />}
                animationType="wobble"
              >
                <TestDeploy />
              </Layout>
            }
          />
          <Route
            path="/analytics"
            element={
              <Layout
                headerIcon={<ChartBar size={85} weight="duotone" />}
                animationType="wobble"
              >
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/profile"
            element={
              <Layout
                headerIcon={<UserIcon size={85} weight="duotone" />}
                animationType="wobble"
              >
                <Profile />
              </Layout>
            }
          />
          <Route
            path="/settings"
            element={
              <Layout
                headerIcon={<Sliders size={85} weight="duotone" />}
                animationType="wobble"
              >
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
          <AppProvider>
            <AppContent />
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
