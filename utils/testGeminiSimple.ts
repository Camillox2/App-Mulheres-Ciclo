// utils/testGeminiSimple.ts - Teste Simplificado da API Gemini
import { API_CONFIG } from '../config/api';

export const testGeminiSimple = async () => {
  console.log('🧪 Iniciando teste simplificado da API Gemini...');
  
  try {
    // Teste mais simples possível
    const response = await fetch(API_CONFIG.GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_CONFIG.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Responda apenas 'Olá! Teste funcionando.' para testar a conexão."
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 50,
        }
      }),
    });

    console.log('📡 Status:', response.status);
    console.log('📡 Status Text:', response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro HTTP:', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`
      };
    }

    const data = await response.json();
    console.log('📥 Resposta completa:', JSON.stringify(data, null, 2));

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      console.log('✅ SUCESSO! Resposta:', data.candidates[0].content.parts[0].text);
      return {
        success: true,
        response: data.candidates[0].content.parts[0].text
      };
    } else if (data.candidates && data.candidates[0]?.finishReason) {
      console.log('⚠️ Bloqueado:', data.candidates[0].finishReason);
      return {
        success: false,
        error: `Bloqueado: ${data.candidates[0].finishReason}`
      };
    } else {
      console.error('❌ Formato inesperado:', data);
      return {
        success: false,
        error: 'Formato de resposta inválido'
      };
    }

  } catch (error) {
    console.error('❌ Erro de conexão:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};

// Função para testar no console do React Native
export const runSimpleTest = () => {
  console.log('🚀 Executando teste da API...');
  testGeminiSimple().then(result => {
    if (result.success) {
      console.log('🎉 TESTE PASSOU!', result.response);
    } else {
      console.log('💥 TESTE FALHOU!', result.error);
    }
  });
};