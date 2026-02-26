import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Mail, Lock, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Definición de roles permitidos
const ALLOWED_USERS = {
  "cris.ahu777@gmail.com": "Teamodios26",
  "programacioniglesiagranrey@gmail.com": "Dios2026",
  "programaciongranrey@gmail.com": "master" // Este usuario dará autorizaciones si se requieren a futuro
};

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Verificar si ya hay una sesión iniciada simple
  useEffect(() => {
    const loggedUser = localStorage.getItem("boni_admin_user");
    if (loggedUser) {
      setLocation("/");
    }
  }, [setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simular tiempo de validación
      await new Promise(resolve => setTimeout(resolve, 800));

      const validEmail = email.trim().toLowerCase();
      // Verificación directa y segura
      const storedPassword = ALLOWED_USERS[validEmail as keyof typeof ALLOWED_USERS];

      if (storedPassword && storedPassword === password) {
        localStorage.setItem("boni_admin_user", validEmail);
        toast({
          title: "Acceso Permitido",
          description: `Bienvenido al Panel de Administración, ${validEmail}`,
        });
        setLocation("/");
      } else {
        toast({
          variant: "destructive",
          title: "Acceso Denegado",
          description: "Credenciales incorrectas o usuario no autorizado.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Solicitud enviada",
      description: "Tu solicitud de creación de usuario fue enviada a programaciongranrey@gmail.com para autorización.",
    });
    setShowRegister(false);
    setEmail("");
    setPassword("");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="p-8 pb-6 border-b border-border/50 bg-gradient-to-b from-primary/5 to-transparent text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 shadow-inner">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Panel BONI
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {showRegister ? "Solicita acceso al panel administrador" : "Ingresá tus credenciales para administrar el sistema Boni"}
          </p>
        </div>

        <div className="p-8 pt-6">
          <form className="space-y-6" onSubmit={showRegister ? handleRegister : handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@iglesia.com"
                  className="pl-10 pb-2 h-12 bg-background/50 border-input/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-12 bg-background/50 border-input/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-md font-semibold mt-2 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Verificando credenciales...
                </>
              ) : showRegister ? (
                "Solicitar Acceso"
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
            
            <div className="text-center pt-2">
              <button 
                type="button" 
                onClick={() => setShowRegister(!showRegister)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
              >
                {showRegister ? "¿Ya tenés un usuario? Iniciá sesión" : "Solicitar creación de una cuenta nueva"}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <p className="mt-8 text-sm text-muted-foreground/60 text-center relative z-10 max-w-sm">
        Sistema protegido. El acceso no autorizado está estrictamente prohibido.
      </p>
    </div>
  );
}
