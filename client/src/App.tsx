import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Sidebar } from "@/components/layout/Sidebar";

// Pages
import Dashboard from "@/pages/Dashboard";
import Ministries from "@/pages/Ministries";
import Leaders from "@/pages/Leaders";
import PrayerRequests from "@/pages/PrayerRequests";
import EnvelopeLoads from "@/pages/EnvelopeLoads";
import NewPeople from "@/pages/NewPeople";
import HorebInstitute from "@/pages/HorebInstitute";
import ErrorLogs from "@/pages/ErrorLogs";
import AuthPage from "@/pages/auth";

// Auth protection logic
function ProtectedRoute({ component: Component, ...rest }: any) {
  const [location, setLocation] = useLocation();
  const loggedUser = localStorage.getItem("boni_admin_user");

  if (!loggedUser) {
    setLocation("/auth");
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <div className="flex min-h-screen bg-background">
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route>
          <Sidebar />
          <main className="flex-1 md:pl-64 transition-all duration-300">
            <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in duration-500">
              <Switch>
                <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
                <Route path="/institute" component={() => <ProtectedRoute component={HorebInstitute} />} />
                <Route path="/ministries" component={() => <ProtectedRoute component={Ministries} />} />
                <Route path="/leaders" component={() => <ProtectedRoute component={Leaders} />} />
                <Route path="/requests" component={() => <ProtectedRoute component={PrayerRequests} />} />
                <Route path="/new-people" component={() => <ProtectedRoute component={NewPeople} />} />
                <Route path="/error-logs" component={() => <ProtectedRoute component={ErrorLogs} />} />
                <Route component={NotFound} />
              </Switch>
            </div>
          </main>
        </Route>
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
