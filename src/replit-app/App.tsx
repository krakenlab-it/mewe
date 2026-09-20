import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Activities from "@/pages/activities";
import Progress from "@/pages/progress";
import Profile from "@/pages/profile";
import Onboarding from "@/pages/onboarding";
import ChatPage from "@/pages/chat";
import TestProfiles from "@/pages/test-profiles";
import Connection from "@/pages/connection-fixed";
import AdminPanel from "@/pages/admin-panel";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import AuthLogin from "@/pages/auth-login";
import FileUploadDemo from "@/pages/file-upload-demo";
import PhotoUploadDemo from "@/pages/photo-upload-demo";
import UniversalUploadDemo from "@/pages/universal-upload-demo";

function Router() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route>
          <AuthLogin />
        </Route>
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={Home} />
      <Route path="/auth" component={Home} />
      <Route path="/" component={Home} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/activities" component={Activities} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/connection" component={Connection} />
      <Route path="/test-profiles" component={TestProfiles} />
      <Route path="/progress" component={Progress} />
      <Route path="/profile" component={Profile} />
      <Route path="/file-upload-demo" component={FileUploadDemo} />
      <Route path="/photo-upload-demo" component={PhotoUploadDemo} />
      <Route path="/universal-upload-demo" component={UniversalUploadDemo} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin" component={AdminPanel} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="mobile-container">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
