
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import AdminRoute from "./components/AdminRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Reset from "./pages/Reset";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import ExerciseDay from "./pages/ExerciseDay";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import BlogList from "./pages/blog/index"; // Importe a página principal do blog
import BlogPost1 from "./pages/blog/o-guia-do-iniciante"; // Importe o primeiro artigo
import BlogPost2 from "./pages/blog/superando-a-obesidade-com-cuidado"; // Importe o segundo artigo
import BlogPost3 from "./pages/blog/nao-pude-fazer-bariatrica"; // Importe o terceiro artigo
import BlogPost4 from "./pages/blog/saindo-do-sedentarismo"; // Importe o quarto artigo

const queryClient = new QueryClient();

// Componente para rotas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full" />
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Componente para redirecionar usuários logados
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full" />
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route 
              path="/" 
              element={
                <PublicRoute>
                  <Index />
                </PublicRoute>
              } 
            />
            <Route 
              path="/auth" 
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              } 
            />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/reset" 
              element={<Reset />} 
            />
            <Route 
              path="/reset-password" 
              element={<ResetPassword />} 
            />
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/exercises/:day" 
              element={
                <ProtectedRoute>
                  <ExerciseDay />
                </ProtectedRoute>
              } 
            />
            {/* Admin Routes - accessible by admin and instrutor */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } 
            />
            {/* INÍCIO: ADICIONE AS ROTAS DO BLOG AQUI */}
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/o-guia-do-iniciante" element={<BlogPost1 />} />
            <Route path="/blog/superando-a-obesidade-com-cuidado" element={<BlogPost2 />} />
            <Route path="/blog/nao-pude-fazer-bariatrica" element={<BlogPost3 />} />
            <Route path="/blog/saindo-do-sedentarismo" element={<BlogPost4 />} />
            {/* FIM: ROTAS DO BLOG */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
