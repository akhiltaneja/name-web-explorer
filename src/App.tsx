
import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import NotFound from "@/pages/NotFound";

// Dynamically import page components
const Index = lazy(() => import("@/pages/Index"));
const Auth = lazy(() => import("@/pages/Auth"));
const Profile = lazy(() => import("@/pages/Profile"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const Cart = lazy(() => import("@/pages/Cart"));
const KnowledgeBase = lazy(() => import("@/pages/KnowledgeBase"));
const Contact = lazy(() => import("@/pages/Contact"));
const Settings = lazy(() => import("@/pages/Settings"));

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/search/:query" element={<Index />} />
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
