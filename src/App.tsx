import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/DashboardLayout";
import AlgorithmLab from "./pages/AlgorithmLab";
import ScriptEngine from "./pages/ScriptEngine";
import NexusBridge from "./pages/NexusBridge";
import ConnectPlatforms from "./pages/ConnectPlatforms";
import Billing from "./pages/Billing";
import Auth from "./pages/Auth";
import { Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import DataDeletion from "./pages/DataDeletion";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import AuthCallback from "./pages/AuthCallback";
import PaymentSuccess from "./pages/PaymentSuccess";
import AdminSystemStatus from "./pages/AdminSystemStatus";
import Landing from "./pages/Landing";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/data-deletion" element={<DataDeletion />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />

              {/* Dashboard (auth required) */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<AlgorithmLab />} />
                <Route path="/dashboard/script-engine" element={<ScriptEngine />} />
                <Route path="/dashboard/nexus-bridge" element={<NexusBridge />} />
                <Route path="/dashboard/connect-platforms" element={<ConnectPlatforms />} />
                <Route path="/dashboard/billing" element={<Billing />} />
              </Route>

              <Route path="/admin/system-status" element={<AdminSystemStatus />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;