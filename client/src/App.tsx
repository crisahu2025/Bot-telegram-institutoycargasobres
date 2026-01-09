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

function Router() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 md:pl-64 transition-all duration-300">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in duration-500">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/institute" component={HorebInstitute} />
            <Route path="/ministries" component={Ministries} />
            <Route path="/leaders" component={Leaders} />
            <Route path="/requests" component={PrayerRequests} />
            <Route path="/new-people" component={NewPeople} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
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
