import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Lock, Eye, EyeOff, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface WorkshopInfoFormProps {
  userId: string;
  userName: string;
}

interface PersonalInfo {
  currentSituations: string;
  workshopReasons: string;
  expectedAchievements: string;
  relationshipIn2Years: string;
  relationshipIn5Years: string;
  relationshipIn10Years: string;
  additionalComments: string;
}

export function WorkshopInfoForm({ userId, userName }: WorkshopInfoFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'auth' | 'form' | 'view'>('auth');
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [formData, setFormData] = useState<PersonalInfo>({
    currentSituations: '',
    workshopReasons: '',
    expectedAchievements: '',
    relationshipIn2Years: '',
    relationshipIn5Years: '',
    relationshipIn10Years: '',
    additionalComments: ''
  });
  const [existingInfo, setExistingInfo] = useState<PersonalInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAccessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/workshop/personal-info/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, accessCode })
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('404: Not found');
        } else if (response.status === 401) {
          throw new Error('401: Unauthorized');
        } else {
          throw new Error(`${response.status}: Server error`);
        }
      }

      const data = await response.json();
      
      // Si existe información, mostrar la vista de información guardada
      setExistingInfo(data);
      setFormData(data);
      setStep('view');
      toast({
        title: "Acceso autorizado",
        description: "Información confidencial cargada exitosamente"
      });
    } catch (error: any) {
      if (error.message.includes('404')) {
        // No existing info, ir al formulario en blanco para crear nueva información
        setStep('form');
        // Mantener campos vacíos para nueva información
        setFormData({
          currentSituations: '',
          workshopReasons: '',
          expectedAchievements: '',
          relationshipIn2Years: '',
          relationshipIn5Years: '',
          relationshipIn10Years: '',
          additionalComments: ''
        });
        toast({
          title: "Código válido",
          description: "Completa tu información confidencial del taller"
        });
      } else if (error.message.includes('401')) {
        toast({
          title: "Código de acceso incorrecto",
          description: "Por favor verifica tu código de acceso",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Error al verificar el código de acceso",
          variant: "destructive"
        });
      }
    }
    
    setIsLoading(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/workshop/personal-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          accessCode,
          ...formData
        })
      });

      if (!response.ok) {
        throw new Error(`${response.status}: Error al guardar información`);
      }
      
      toast({
        title: "Información guardada",
        description: "Tu información confidencial ha sido guardada de forma segura"
      });
      
      setStep('view');
      setExistingInfo(formData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar la información",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const resetForm = () => {
    setStep('auth');
    setAccessCode('');
    setFormData({
      currentSituations: '',
      workshopReasons: '',
      expectedAchievements: '',
      relationshipIn2Years: '',
      relationshipIn5Years: '',
      relationshipIn10Years: '',
      additionalComments: ''
    });
    setExistingInfo(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="border-purple-200 text-purple-700 hover:bg-purple-50 px-3 py-1.5 text-sm"
          data-testid="button-workshop-info"
        >
          <Shield className="w-3 h-3 mr-1.5" />
          Completar información
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-600" />
            Información Confidencial del Taller
          </DialogTitle>
          <DialogDescription>
            Esta información es completamente confidencial y solo es accesible con tu código de acceso personal.
          </DialogDescription>
        </DialogHeader>

        {step === 'auth' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Código de Acceso</CardTitle>
              <CardDescription>
                Ingresa tu código de acceso personal. Si es la primera vez, crea un código nuevo para proteger tu información.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="access-code">Código de Acceso</Label>
                  <div className="relative">
                    <Input
                      id="access-code"
                      type={showAccessCode ? "text" : "password"}
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="Ingresa o crea tu código de acceso"
                      required
                      data-testid="input-access-code"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowAccessCode(!showAccessCode)}
                      data-testid="button-toggle-access-code"
                    >
                      {showAccessCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading || !accessCode.trim()}
                  className="w-full"
                  data-testid="button-verify-access"
                >
                  {isLoading ? "Verificando..." : "Acceder"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'form' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información para el Taller</CardTitle>
              <CardDescription>
                Completa esta información confidencial para personalizar tu experiencia en el taller.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="current-situations">
                    1. ¿Cuáles son las situaciones actuales en tu relación madre-hija?
                  </Label>
                  <Textarea
                    id="current-situations"
                    value={formData.currentSituations}
                    onChange={(e) => setFormData({...formData, currentSituations: e.target.value})}
                    placeholder="Describe las situaciones actuales..."
                    required
                    rows={3}
                    data-testid="textarea-current-situations"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workshop-reasons">
                    2. ¿Por qué decidiste participar en este taller?
                  </Label>
                  <Textarea
                    id="workshop-reasons"
                    value={formData.workshopReasons}
                    onChange={(e) => setFormData({...formData, workshopReasons: e.target.value})}
                    placeholder="Comparte tus motivaciones..."
                    required
                    rows={3}
                    data-testid="textarea-workshop-reasons"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expected-achievements">
                    3. ¿Qué esperas lograr con este taller?
                  </Label>
                  <Textarea
                    id="expected-achievements"
                    value={formData.expectedAchievements}
                    onChange={(e) => setFormData({...formData, expectedAchievements: e.target.value})}
                    placeholder="Describe tus expectativas..."
                    required
                    rows={3}
                    data-testid="textarea-expected-achievements"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">Visión de la relación madre-hija:</Label>
                  
                  <div className="space-y-2">
                    <Label htmlFor="relationship-2years">En 2 años:</Label>
                    <Textarea
                      id="relationship-2years"
                      value={formData.relationshipIn2Years}
                      onChange={(e) => setFormData({...formData, relationshipIn2Years: e.target.value})}
                      placeholder="¿Cómo imaginas la relación en 2 años?"
                      required
                      rows={2}
                      data-testid="textarea-relationship-2years"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="relationship-5years">En 5 años:</Label>
                    <Textarea
                      id="relationship-5years"
                      value={formData.relationshipIn5Years}
                      onChange={(e) => setFormData({...formData, relationshipIn5Years: e.target.value})}
                      placeholder="¿Cómo imaginas la relación en 5 años?"
                      required
                      rows={2}
                      data-testid="textarea-relationship-5years"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="relationship-10years">En 10 años:</Label>
                    <Textarea
                      id="relationship-10years"
                      value={formData.relationshipIn10Years}
                      onChange={(e) => setFormData({...formData, relationshipIn10Years: e.target.value})}
                      placeholder="¿Cómo imaginas la relación en 10 años?"
                      required
                      rows={2}
                      data-testid="textarea-relationship-10years"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional-comments">
                    Comentarios adicionales (opcional):
                  </Label>
                  <Textarea
                    id="additional-comments"
                    value={formData.additionalComments}
                    onChange={(e) => setFormData({...formData, additionalComments: e.target.value})}
                    placeholder="Cualquier información adicional que consideres importante..."
                    rows={3}
                    data-testid="textarea-additional-comments"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full"
                  data-testid="button-save-info"
                >
                  {isLoading ? "Guardando..." : "Guardar Información"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'view' && existingInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tu Información del Taller</CardTitle>
              <CardDescription>
                Información confidencial guardada de forma segura.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="font-medium">Situaciones actuales:</Label>
                <p className="text-sm text-gray-600 mt-1" data-testid="text-current-situations">
                  {existingInfo.currentSituations}
                </p>
              </div>

              <div>
                <Label className="font-medium">Razones para el taller:</Label>
                <p className="text-sm text-gray-600 mt-1" data-testid="text-workshop-reasons">
                  {existingInfo.workshopReasons}
                </p>
              </div>

              <div>
                <Label className="font-medium">Expectativas:</Label>
                <p className="text-sm text-gray-600 mt-1" data-testid="text-expected-achievements">
                  {existingInfo.expectedAchievements}
                </p>
              </div>

              <div>
                <Label className="font-medium">Visión en 2 años:</Label>
                <p className="text-sm text-gray-600 mt-1" data-testid="text-relationship-2years">
                  {existingInfo.relationshipIn2Years}
                </p>
              </div>

              <div>
                <Label className="font-medium">Visión en 5 años:</Label>
                <p className="text-sm text-gray-600 mt-1" data-testid="text-relationship-5years">
                  {existingInfo.relationshipIn5Years}
                </p>
              </div>

              <div>
                <Label className="font-medium">Visión en 10 años:</Label>
                <p className="text-sm text-gray-600 mt-1" data-testid="text-relationship-10years">
                  {existingInfo.relationshipIn10Years}
                </p>
              </div>

              {existingInfo.additionalComments && (
                <div>
                  <Label className="font-medium">Comentarios adicionales:</Label>
                  <p className="text-sm text-gray-600 mt-1" data-testid="text-additional-comments">
                    {existingInfo.additionalComments}
                  </p>
                </div>
              )}

              <Button 
                onClick={() => setStep('form')}
                variant="outline"
                className="w-full mt-4"
                data-testid="button-edit-info"
              >
                Editar Información
              </Button>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}