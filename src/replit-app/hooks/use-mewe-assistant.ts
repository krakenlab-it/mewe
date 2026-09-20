import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';

interface MeWeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface MeWeResponse {
  message: string;
  metadata?: {
    model: string;
    timestamp: string;
    enrichedTopics?: string[];
  };
  fallback?: boolean;
}

interface DailyActivity {
  title: string;
  description: string;
  duration: string;
  benefit: string;
}

export function useMeWeAssistant() {
  const [conversationHistory, setConversationHistory] = useState<MeWeMessage[]>([]);

  // Mutation para enviar mensajes al asistente mejorado
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/mewe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: conversationHistory.slice(-10) // Mantener contexto de últimos 10 mensajes
        }),
      });

      if (!response.ok) {
        throw new Error('Error al comunicarse con el asistente');
      }

      return await response.json() as MeWeResponse;
    },
    onSuccess: (data, message) => {
      // Actualizar historial de conversación
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: data.message }
      ]);
    }
  });

  // Obtener sugerencias temáticas
  const getSuggestions = useCallback(async () => {
    try {
      const response = await fetch('/api/mewe/suggestions');
      if (!response.ok) throw new Error('Error obteniendo sugerencias');
      const data = await response.json();
      return data.suggestions as string[];
    } catch (error) {
      console.error('Error obteniendo sugerencias:', error);
      return [];
    }
  }, []);

  // Obtener actividad del día
  const getDailyActivity = useCallback(async () => {
    try {
      const response = await fetch('/api/mewe/daily-activity');
      if (!response.ok) throw new Error('Error obteniendo actividad del día');
      const data = await response.json();
      return data.activity as DailyActivity;
    } catch (error) {
      console.error('Error obteniendo actividad del día:', error);
      return null;
    }
  }, []);

  // Limpiar historial
  const clearHistory = useCallback(() => {
    setConversationHistory([]);
  }, []);

  return {
    sendMessage: sendMessage.mutate,
    isLoading: sendMessage.isPending,
    error: sendMessage.error,
    lastResponse: sendMessage.data,
    conversationHistory,
    getSuggestions,
    getDailyActivity,
    clearHistory
  };
}