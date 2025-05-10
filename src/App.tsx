
import { Suspense, lazy, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import NotFound from "@/pages/NotFound";

import Index from "@/pages/Index";

const Auth = lazy(() => import("@/pages/Auth"));
const Profile = lazy(() => import("@/pages/Profile"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const Cart = lazy(() => import("@/pages/Cart"));
const KnowledgeBase = lazy(() => import("@/pages/KnowledgeBase"));
const Contact = lazy(() => import("@/pages/Contact"));
const Settings = lazy(() => import("@/pages/Settings"));

const BlogIndex = lazy(() => import("@/pages/blog/BlogIndex"));
const BlogPost = lazy(() => import("@/pages/blog/BlogPost"));

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setLoadError("Loading is taking longer than expected. You may need to refresh the page.");
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isLoading]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-xl font-bold mb-4">Error Loading Application</h1>
        <p className="text-red-600 mb-4">{loadError}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>
    );
  }

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
            <Route path="/cart" element={<Cart />} />
            <Route path="/search/:query" element={<Index />} />
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
