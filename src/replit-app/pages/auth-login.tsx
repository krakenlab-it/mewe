import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, LogIn, UserPlus, Mail, Lock, User, Calendar, Info, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

const DEMO_CREDENTIALS = {
  email: "demo@mewe.test",
  password: "MeWeDemo2026!"
};

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'madre' | 'hija' | '';
  edad: number;
  acceptTerms: boolean;
  requestUnsubscribe?: boolean;
}

export default function AuthLogin() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState("");
  
  const [loginForm, setLoginForm] = useState<LoginForm>({
    ...DEMO_CREDENTIALS
  });
  
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    firstName: "",
    lastName: "",
    email: DEMO_CREDENTIALS.email,
    password: DEMO_CREDENTIALS.password,
    confirmPassword: DEMO_CREDENTIALS.password,
    role: '',
    edad: 0,
    acceptTerms: false
  });

  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      setError("");
      setLocation('/');
    },
    onError: (error: any) => {
      // Handle specific error cases
      if (error.message?.includes('desuscrita') || error.isDeactivated) {
        setError("Su cuenta fue desuscrita. Debe crear una nueva cuenta con un correo diferente.");
      } else {
        setError(error.message || "Error al iniciar sesión");
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: Omit<RegisterForm, "confirmPassword" | "acceptTerms">) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      // If user requested unsubscribe, show confirmation message and don't login
      if (data.unsubscribed) {
        setError(""); // Clear any errors
        setActiveTab("login");
        alert("Su solicitud de desuscripción ha sido procesada. Su cuenta ha sido desactivada.");
        return;
      }
      
      // Normal registration flow
     if (data.user && data.token) {
        login(data.user, data.token);
        setError("");
        setLocation('/');
      }
    },
    onError: (error: any) => {
      // Handle specific error cases
      if (error.message?.includes('cuenta desactivada') || error.isDeactivatedEmail) {
        setError("Este correo fue usado previamente en una cuenta desactivada. Debe usar un correo diferente.");
      } else {
        setError(error.message || "Error al registrarse");
      }
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
   if (!loginForm.email || !loginForm.password) {
      setError("Por favor completa todos los campos");
      return;
    }

    loginMutation.mutate(loginForm);
  };

  const handleDemoLogin = () => {
    setError("");
    loginMutation.mutate(DEMO_CREDENTIALS);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!registerForm.acceptTerms) {
      setError("Debes aceptar los términos y condiciones de protección de datos");
      return;
    }

    // Seeded demo email cannot be registered again — continue into the demo session.
    if (registerForm.email === DEMO_CREDENTIALS.email) {
      handleDemoLogin();
      return;
    }

   if (!registerForm.firstName || !registerForm.lastName || !registerForm.email || !registerForm.password || 
        !registerForm.confirmPassword || !registerForm.role || !registerForm.edad) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (registerForm.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (registerForm.edad < 9 || registerForm.edad > 60) {
      setError("La edad debe estar entre 9 y 60 años");
      return;
    }

    if (!registerForm.acceptTerms) {
      setError("Debes aceptar los términos y condiciones de protección de datos");
      return;
    }

    const { confirmPassword, acceptTerms, ...registerData } = registerForm;
    registerMutation.mutate(registerData);
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Me We</h1>
          <p className="text-gray-600">Juntas en Conexión, Fuertes en Confianza</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Bienvenida</CardTitle>
            <CardDescription className="text-center">
              Accede a tu cuenta para continuar fortaleciendo tu vínculo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" data-testid="tab-login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">Crear Cuenta</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        autoComplete="username"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="tu@email.com"
                        className="pl-10"
                        disabled
                        data-testid="input-login-email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type="password"
                        autoComplete="current-password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Tu contraseña"
                        className="pl-10"
                        disabled
                        data-testid="input-login-password"
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert className="border-red-200 bg-red-50" data-testid="error-message">
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-login">
                    {isLoading ? "Iniciando..." : "Iniciar Sesión"}
                    <LogIn className="ml-2 h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                    onClick={handleDemoLogin}
                    disabled={isLoading}
                    data-testid="button-demo-login"
                  >
                    Entrar al demo automáticamente
                  </Button>
                </form>

                <div className="text-center text-sm text-gray-600">
                  <p>Para probar la app, puedes usar:</p>
                  <p className="text-purple-600 font-medium">{DEMO_CREDENTIALS.email}</p>
                  <p className="text-purple-600 font-medium">Contraseña: {DEMO_CREDENTIALS.password}</p>
                </div>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-firstName">Nombre</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="register-firstName"
                          type="text"
                          value={registerForm.firstName}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="Tu nombre"
                          className="pl-10"
                          disabled={isLoading}
                          data-testid="input-register-firstName"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-lastName">Apellido</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="register-lastName"
                          type="text"
                          value={registerForm.lastName}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Tu apellido"
                          className="pl-10"
                          disabled={isLoading}
                          data-testid="input-register-lastName"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="tu@email.com"
                        className="pl-10"
                        disabled
                        data-testid="input-register-email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-role">Soy</Label>
                      <Select 
                        value={registerForm.role} 
                        onValueChange={(value: 'madre' | 'hija') => setRegisterForm(prev => ({ ...prev, role: value }))}
                        disabled={isLoading}
                      >
                        <SelectTrigger data-testid="select-register-role">
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="madre">Madre</SelectItem>
                          <SelectItem value="hija">Hija</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-edad">Edad</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="register-edad"
                          type="number"
                          value={registerForm.edad || ''}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, edad: parseInt(e.target.value) || 0 }))}
                          placeholder="Edad"
                          className="pl-10"
                          min="9"
                          max="60"
                          disabled={isLoading}
                          data-testid="input-register-edad"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-password"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Mínimo 6 caracteres"
                        className="pl-10"
                        disabled
                        data-testid="input-register-password"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirmar Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-confirm-password"
                        type="password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Repite tu contraseña"
                        className="pl-10"
                        disabled
                        data-testid="input-register-confirm-password"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="acceptTerms"
                        checked={registerForm.acceptTerms}
                        onCheckedChange={(checked) => 
                          setRegisterForm(prev => ({ ...prev, acceptTerms: !!checked }))
                        }
                        disabled={isLoading}
                        data-testid="checkbox-accept-terms"
                        className="mt-1 h-5 w-5 border-2 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <div className="flex-1">
                        <Label 
                          htmlFor="acceptTerms" 
                          className="text-sm text-gray-800 cursor-pointer leading-relaxed font-medium"
                        >
                          Para brindarte todos los servicios de esta app, necesitamos tratar tus datos personales de forma segura conforme a la Ley de Protección de Datos de Ecuador. Aceptas recibir notificaciones, publicidad, usar agentes IA y entender que puedes revocar este consentimiento en cualquier momento. Pulsa 'ACEPTAR' para continuar.
                        </Label>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            type="button"
                            data-testid="button-view-terms"
                          >
                            <Info className="h-4 w-4 mr-2" />
                            Ver detalles completos
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] scroll-smooth">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Info className="h-5 w-5 text-blue-600" />
                              Acuerdo de Consentimiento – Aplicación Me We
                            </DialogTitle>
                          </DialogHeader>
                          <div className="max-h-96 overflow-y-auto space-y-4 text-sm">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">1. Responsable del Tratamiento</h4>
                              <p>Me We, con domicilio en Ecuador, como responsable del tratamiento de tus datos personales.</p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">2. Finalidad del Tratamiento</h4>
                              <p className="mb-2">Al aceptar este Acuerdo, autorizas expresamente que tus datos personales sean utilizados para:</p>
                              <ul className="list-disc pl-4 space-y-1">
                                <li>Proveer funcionalidades de la app, incluyendo transmisión de información en tiempo real.</li>
                                <li>Envío de notificaciones, avisos y alertas.</li>
                                <li>Uso de agentes con inteligencia artificial (IA) para asistencia, procesamiento y recomendaciones.</li>
                                <li>Dirección de publicidad personalizada y servicios adicionales dentro de la app.</li>
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">3. Consentimiento Libre, Específico, Informado e Inequívoco</h4>
                              <p className="mb-2">Este consentimiento es:</p>
                              <ul className="list-disc pl-4 space-y-1">
                                <li><strong>Libre:</strong> sin presión o coacción.</li>
                                <li><strong>Específico:</strong> cubre únicamente las finalidades antes descritas.</li>
                                <li><strong>Informado:</strong> se te ha explicado claramente qué datos se recogen, por qué, y cómo se usan.</li>
                                <li><strong>Inequívoco:</strong> tu aceptación al hacer click en el botón de esta app Me We, constituye una manifestación afirmativa de tu voluntad para aceptar estos términos y condiciones.</li>
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">4. Tipos de Datos Recogidos</h4>
                              <ul className="list-disc pl-4 space-y-1">
                                <li>Datos de contacto (nombres y apellidos, correo, teléfono, género, madre o hija).</li>
                                <li>Datos de uso, navegación, preferencias.</li>
                                <li>Interacciones con agentes IA.</li>
                                <li>Datos derivados de los talleres realizados, tus respuestas o transmisiones e información dentro de la app.</li>
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">5. Tiempo de Conservación</h4>
                              <p>Guardaremos tus datos solo por el tiempo necesario para cumplir con las finalidades señaladas y según lo exigido por la normativa. Luego serán eliminados o anonimizados.</p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">6. Seguridad y Medidas Técnicas</h4>
                              <p>Aplicamos medidas organizativas y técnicas (cifrado, acceso restringido, control interno) para garantizar confidencialidad, integridad y disponibilidad de los datos.</p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">7. Revocabilidad</h4>
                              <p>Puedes revocar tu consentimiento en cualquier momento sin tener que justificarlo. Para ello, puedes dirigirte a nuestro correo de asistencia o acceder a la sección de configuración dentro de la app.</p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">8. Derechos del Titular</h4>
                              <p className="mb-2">De acuerdo con la LOPDP, tienes el derecho a:</p>
                              <ul className="list-disc pl-4 space-y-1">
                                <li>Acceder a tus datos.</li>
                                <li>Rectificarlos o actualizarlos si son incorrectos.</li>
                                <li>Cancelar su tratamiento o eliminación.</li>
                                <li>Oponerte a que se realice un tratamiento específico.</li>
                              </ul>
                              <p className="mt-2">Serás informado si uno de tus derechos es ejercido por un representante legal, en caso de menores de edad o personas incapaces.</p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">9. Transferencias Internacionales</h4>
                              <p>Si tus datos se transfieren a servidores fuera del Ecuador, garantizamos que se aplique un nivel de protección equivalente al normado en la LOPDP o que existan mecanismos jurídicos adecuados.</p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">10. Mecanismos de Contacto</h4>
                              <div className="space-y-1">
                                         <p>Para ejercer tus derechos o presentar una queja:</p>
                    <p><strong>Delegado de Protección de Datos:</strong> Me We Support</p>
                    <p><strong>Correo electrónico:</strong> privacy@mewe.ec</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">11. Aceptación del Consentimiento</h4>
                  <p>Al presionar "ACEPTAR" al iniciar la app, confirmas que:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Has leído cuidadosamente este Acuerdo.</li>
                    <li>Comprendes cómo se tratan tus datos y para qué fines se usan.</li>
                    <li>Otorgas tu consentimiento explícito para el tratamiento detallado.</li>
                  </ul>
                </div>

                <div className="border-t pt-4 mt-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Desuscripción y Eliminación de Cuenta
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="unsubscribe"
                          checked={registerForm.requestUnsubscribe || false}
                          onCheckedChange={(checked) => 
                            setRegisterForm(prev => ({ ...prev, requestUnsubscribe: !!checked }))
                          }
                          className="mt-1 h-4 w-4 border-2 border-red-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        />
                        <Label 
                          htmlFor="unsubscribe" 
                          className="text-sm text-red-800 cursor-pointer leading-relaxed"
                        >
                          Deseo desuscribirme y eliminar mi contraseña de la base de datos (manteniendo mi información personal para cumplimiento legal)
                        </Label>
                      </div>
                      <p className="text-xs text-red-600">
                        Si marcas esta opción, tu cuenta será desactivada y deberás crear una nueva cuenta con un correo diferente si deseas volver a usar la aplicación.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Entendido
                  </Button>
                </DialogTrigger>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50" data-testid="error-message">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || !registerForm.acceptTerms} 
        data-testid="button-register"
      >
        {isLoading ? "Creando cuenta..." : "ACEPTAR"}
        <UserPlus className="ml-2 h-4 w-4" />
      </Button>
    </form>
    </TabsContent>
    </Tabs>
    </CardContent>
  </Card>
  </div>
  </div>
  );
}