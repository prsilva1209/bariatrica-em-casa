import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Eye, EyeOff, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const user = data.user;

      if (user?.user_metadata?.precisa_trocar_senha) {
        toast({
          title: "Redefinição de senha necessária",
          description: "Você precisa redefinir sua senha antes de continuar.",
          variant: "destructive",
        });
        navigate('/reset');
      } else {
        toast({
          title: "Bem-vindo de volta!",
          description: "Login realizado com sucesso.",
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Email ou senha incorretos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email necessário",
        description: "Por favor, insira seu email para recuperar a senha.",
        variant: "destructive",
      });
      return;
    }

    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      setShowForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header motivacional */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-soft">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Acessar conta</h1>
            <p className="text-muted-foreground">Continue sua jornada de bem-estar</p>
          </div>
        </div>

        <Card className="shadow-medium border-0">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Entre na sua conta</CardTitle>
            <CardDescription>
              Acesse seu programa personalizado de bem-estar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showForgotPassword ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-primary hover:underline transition-colors"
                    disabled={loading}
                  >
                    Esqueci minha senha
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">Recuperar Senha</h3>
                  <p className="text-sm text-muted-foreground">
                    Digite seu email para receber as instruções de recuperação
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-reset">E-mail</Label>
                  <Input
                    id="email-reset"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={resetLoading}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-primary hover:opacity-90 transition-all duration-300"
                    disabled={resetLoading}
                  >
                    {resetLoading ? 'Enviando...' : 'Enviar Email'}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowForgotPassword(false)}
                    disabled={resetLoading}
                  >
                    Voltar
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Links adicionais */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="text-primary hover:underline transition-colors"
            >
              Criar conta
            </button>
          </p>
          <p className="text-xs text-muted-foreground">
            Cuide da sua saúde com carinho ❤️
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;