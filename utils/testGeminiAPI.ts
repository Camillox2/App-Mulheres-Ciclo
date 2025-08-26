// utils/testGeminiAPI.ts - Teste da API Gemini
import { API_CONFIG } from '../config/api';

export const testGeminiAPI = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🧪 Testando API Gemini...');
    
    const response = await fetch(API_CONFIG.GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': API_CONFIG.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Responda apenas 'Olá! Sistema funcionando.' para testar a conexão."
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 20,
        }
      }),
    });

    console.log('📡 Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API:', errorText);
      return {
        success: false,
        message: `Erro HTTP ${response.status}: ${errorText}`
      };
    }

    const data = await response.json();
    console.log('📥 Resposta completa:', JSON.stringify(data, null, 2));

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const responseText = data.candidates[0].content.parts[0].text;
      console.log('✅ Resposta da IA:', responseText);
      return {
        success: true,
        message: `API funcionando! Resposta: "${responseText}"`
      };
    } else {
      console.error('❌ Formato de resposta inválido:', data);
      return {
        success: false,
        message: 'Formato de resposta inválido da API'
      };
    }
  } catch (error) {
    console.error('❌ Erro ao testar API:', error);
    return {
      success: false,
      message: `Erro de conexão: ${error}`
    };
  }
};

// Função para testar no console
export const runAPITest = () => {
  console.log('🚀 Iniciando teste da API Gemini...');
  testGeminiAPI().then(result => {
    if (result.success) {
      console.log('🎉 SUCESSO!', result.message);
    } else {
      console.log('💥 FALHOU!', result.message);
    }
  });
};