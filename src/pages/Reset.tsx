import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Heart, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';

const Reset = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkTokenAndSetSession = async () => {
      try {
        // Verificar se há tokens na URL
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.replace('#', ''));
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          // Definir sessão com os tokens
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) throw error;
          
          setIsTokenValid(true);
        } else {
          // Verificar se há uma sessão ativa ou evento de recuperação
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            setIsTokenValid(true);
          } else {
            throw new Error("Token de recuperação inválido ou expirado");
          }
        }
      } catch (error) {
        console.error('Error validating token:', error);
        toast({
          title: "Link inválido",
          description: "Este link de recuperação de senha é inválido ou expirou.",
          variant: "destructive",
        });
        navigate('/login');
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkTokenAndSetSession();

    // Listener para capturar evento de recuperação de senha
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY' && session) {
          setIsTokenValid(true);
          setIsCheckingToken(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const validatePasswords = () => {
    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "As senhas digitadas não são iguais.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
        data: { 
          precisa_trocar_senha: false 
        }
      });

      if (error) throw error;

      toast({
        title: "Senha alterada com sucesso!",
        description: "Sua nova senha foi definida. Redirecionando para o login...",
      });

      // Aguardar 2 segundos antes de redirecionar
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full" />
          </div>
          <p className="text-muted-foreground">Verificando link de recuperação...</p>
        </div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-medium border-0">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Link Inválido</CardTitle>
            <CardDescription>
              Este link de recuperação de senha é inválido ou expirou.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full bg-gradient-primary hover:opacity-90"
            >
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordValid = password.length >= 6;

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-soft">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Redefinir senha</h1>
            <p className="text-muted-foreground">Defina uma nova senha para sua conta</p>
          </div>
        </div>

        <Card className="shadow-medium border-0">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Nova Senha</CardTitle>
            <CardDescription>
              Digite sua nova senha abaixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
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
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Digite a senha novamente"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Validação visual */}
              {password && confirmPassword && (
                <div className="flex items-center gap-2 text-sm">
                  {passwordsMatch ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-success">Senhas coincidem</span>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 rounded-full bg-destructive flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <span className="text-destructive">Senhas não coincidem</span>
                    </>
                  )}
                </div>
              )}

              {password && (
                <div className="flex items-center gap-2 text-sm">
                  {passwordValid ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-success">Senha válida</span>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 rounded-full bg-warning flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <span className="text-warning">Mínimo 6 caracteres</span>
                    </>
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300"
                disabled={loading || !passwordsMatch || !passwordValid}
              >
                {loading ? 'Salvando nova senha...' : 'Salvar nova senha'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
            disabled={loading}
          >
            Voltar ao login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reset;