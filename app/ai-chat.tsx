// app/ai-chat.tsx - Chatbot com Gemini AI
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_CONFIG, HEALTH_PROMPTS, isApiConfigured } from '../config/api';
import { useThemeSystem } from '../hooks/useThemeSystem';
import { generateContextualPrompt } from '../utils/aiPrompts';
import { testGeminiSimple } from '../utils/testGeminiSimple';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface UserContext {
  age?: number;
  currentPhase?: string;
  recentSymptoms: string[];
  recentMood?: string;
}

let lastRequestAt = 0;
let pendingController: AbortController | null = null;

export default function AIChatScreen() {
  const { theme } = useThemeSystem();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userContext, setUserContext] = useState<UserContext>({ recentSymptoms: [] });
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    initializeChat();
    loadUserContext();
  }, []);

  const loadUserContext = async () => {
    try {
      const [cycleData, notesData, symptomsData] = await Promise.all([
        AsyncStorage.getItem('cycleData'),
        AsyncStorage.getItem('dailyNotes'),
        AsyncStorage.getItem('symptomTracker'),
      ]);

      let context: UserContext = { recentSymptoms: [] };

      // Dados do ciclo
      if (cycleData) {
        const cycle = JSON.parse(cycleData);
        context.age = cycle.age;
        // context.currentPhase = cycle.phase; // Calcular se necessário
      }

      // Humor recente
      if (notesData) {
        const notes = JSON.parse(notesData);
        const recentNote = notes
          .filter((note: any) => moment().diff(moment(note.date), 'days') <= 3)
          .sort((a: any, b: any) => moment(b.date).diff(moment(a.date)))[0];
        
        if (recentNote) {
          context.recentMood = recentNote.mood;
        }
      }

      // Sintomas recentes
      if (symptomsData) {
        const symptoms = JSON.parse(symptomsData);
        const recentSymptoms = symptoms
          .filter((symptom: any) => moment().diff(moment(symptom.date), 'days') <= 7)
          .flatMap((symptom: any) => Object.keys(symptom.symptoms))
          .slice(0, 5); // Máximo 5 sintomas
        
        context.recentSymptoms = [...new Set(recentSymptoms)] as string[]; // Remove duplicatas
      }

      setUserContext(context);
    } catch (error) {
      console.error('Erro ao carregar contexto:', error);
    }
  };

  const initializeChat = () => {
    const welcomeMessage: Message = {
      id: '1',
      text: `Olá! 🌸 Sou Luna, sua assistente especializada em saúde feminina.

Posso te ajudar com ciclo menstrual, sintomas, bem-estar e todas as funcionalidades do EntreFases.

Como posso te ajudar hoje? 💜`,
      isUser: false,
      timestamp: moment().toISOString(),
    };
    setMessages([welcomeMessage]);
  };

  const buildContextPrompt = (userMessage: string): string => {
    // Verifica se é emergência primeiro
    const isEmergency = HEALTH_PROMPTS.EMERGENCY_KEYWORDS.some((keyword: string) => 
      userMessage.toLowerCase().includes(keyword)
    );
    
    if (isEmergency) {
      return HEALTH_PROMPTS.EMERGENCY_RESPONSE;
    }
    
    // Para debug: usar prompt mais simples
    if (__DEV__) {
      return `Você é Luna, uma assistente especializada em saúde feminina. 
      
Responda de forma empática e informativa em português brasileiro.
      
Pergunta: ${userMessage}
      
Responda em máximo 200 palavras.`;
    }
    
    // Use o prompt contextual inteligente expandido
    return generateContextualPrompt(userMessage, userContext);
  };

  const waitIfNeeded = async () => {
    const now = Date.now();
    const diff = now - lastRequestAt;
    if (diff < API_CONFIG.MIN_INTERVAL_MS) {
      const wait = API_CONFIG.MIN_INTERVAL_MS - diff;
      await new Promise(r => setTimeout(r, wait));
    }
    lastRequestAt = Date.now();
  };

  const buildLocalFallback = (original: string) => {
    // Fallback simples quando quota estoura ou sem chave.
    return `No momento atingi o limite de requisições da API externa 🤖⏳\n\nPergunta: "${original}"\n\nResumo rápido baseado em conhecimento interno do app:\n- Sou uma assistente local e não consegui consultar a IA completa agora.\n- Verifique sua conexão ou tente novamente em alguns minutos.\n- Use o registro de sintomas e humor para enriquecer suas próximas perguntas.\n\nDica: faça perguntas mais específicas para respostas melhores quando a IA voltar. 💜`;
  };

  const performFetch = async (requestBody: any, attempt = 0): Promise<Response> => {
    await waitIfNeeded();
    if (pendingController) {
      pendingController.abort();
    }
    pendingController = new AbortController();
    const controller = pendingController;
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(API_CONFIG.GEMINI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_CONFIG.GEMINI_API_KEY,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (response.status === 429 && attempt < API_CONFIG.MAX_RETRIES_429) {
        const backoff = (attempt + 1) * 3000;
        console.warn(`⚠️ 429 recebido. Retentativa ${attempt + 1} em ${backoff}ms`);
        await new Promise(r => setTimeout(r, backoff));
        return performFetch(requestBody, attempt + 1);
      }
      return response;
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === 'AbortError') {
        if (attempt < 1) {
          console.warn('⏱️ Timeout/Abort - tentando novamente...');
          return performFetch(requestBody, attempt + 1);
        }
      }
      throw err;
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: moment().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Verifica se API está configurada
    if (!isApiConfigured()) {
      Alert.alert(
        'API Key Necessária',
        'Configure sua chave da API do Google Gemini para usar o chatbot.\n\n1. Acesse: makersuite.google.com\n2. Crie uma API key gratuita\n3. Configure no arquivo config/api.ts',
        [{ text: 'Entendi' }]
      );
      setIsLoading(false);
      return;
    }

    try {
      console.log('🚀 Enviando requisição para:', API_CONFIG.GEMINI_URL);
      console.log('🔑 API Key (primeiros 10 chars):', API_CONFIG.GEMINI_API_KEY.substring(0, 10) + '...');
      
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: buildContextPrompt(userMessage.text)
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          topK: 50,
          topP: 0.95,
          maxOutputTokens: 400,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

  const response = await performFetch(requestBody);

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      let data: any = null;
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        if (response.status === 429) {
          // Fallback local amigável
            const fallbackMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: buildLocalFallback(userMessage.text),
              isUser: false,
              timestamp: moment().toISOString(),
            };
            setMessages(prev => [...prev, fallbackMessage]);
            return;
        }
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      } else {
        data = await response.json();
      }
      console.log('📥 Response data:', JSON.stringify(data, null, 2));

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: data.candidates[0].content.parts[0].text,
          isUser: false,
          timestamp: moment().toISOString(),
        };
        setMessages(prev => [...prev, aiResponse]);
        console.log('✅ Resposta da IA processada com sucesso');
      } else if (data.candidates && data.candidates[0]?.finishReason) {
        // Tratar casos de conteúdo bloqueado
        const finishReason = data.candidates[0].finishReason;
        console.log('⚠️ Finish reason:', finishReason);
        
        let errorText = 'Desculpe, não consegui processar sua pergunta. ';
        if (finishReason === 'SAFETY') {
          errorText += 'Tente reformular sua pergunta de forma mais específica sobre saúde feminina. 🌸';
        } else {
          errorText += 'Tente novamente com uma pergunta mais simples. 💜';
        }
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: errorText,
          isUser: false,
          timestamp: moment().toISOString(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        console.error('❌ Formato de resposta inesperado:', data);
        throw new Error('Formato de resposta inválido da API');
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      
    let errorText = 'Desculpe, ocorreu um erro de conexão. ';
      if (error instanceof Error) {
        if (error.message.includes('403')) {
          errorText += 'Problema com a chave da API. Verifique as configurações. 🔑';
        } else if (error.message.includes('429')) {
      errorText += 'Muitas requisições. Use perguntas curtas e aguarde alguns minutos. ⏰';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorText += 'Verifique sua conexão com a internet. 📶';
        } else {
          errorText += 'Tente novamente em alguns instantes. 😔';
        }
      }

    // Acrescenta sugestão de fallback local
    errorText += '\n\nModo fallback: sua pergunta será processada localmente em breve.';
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        isUser: false,
        timestamp: moment().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    Alert.alert(
      'Limpar Conversa',
      'Deseja limpar toda a conversa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          onPress: () => {
            setMessages([]);
            setTimeout(initializeChat, 100);
          },
        },
      ]
    );
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      {!message.isUser && (
        <View style={styles.aiAvatar}>
          <Image 
            source={require('../assets/images/logoluna.png')} 
            style={styles.aiAvatarImage}
            resizeMode="cover"
          />
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          message.isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.isUser ? styles.userText : styles.aiText,
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.messageTime,
            message.isUser ? styles.userTime : styles.aiTime,
          ]}
        >
          {moment(message.timestamp).format('HH:mm')}
        </Text>
      </View>
      {message.isUser && (
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarEmoji}>👩</Text>
        </View>
      )}
    </View>
  );

  if (!theme) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Image 
              source={require('../assets/images/logoluna.png')} 
              style={styles.lunaImage}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.title}>Luna IA</Text>
              <Text style={styles.subtitle}>Sua assistente em saúde</Text>
            </View>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              onPress={async () => {
                const result = await testGeminiSimple();
                Alert.alert(
                  'Teste da API',
                  result.success ? `✅ Sucesso: ${result.response}` : `❌ Erro: ${result.error}`,
                  [{ text: 'OK' }]
                );
              }} 
              style={styles.testButton}
            >
              <Text style={styles.testButtonText}>🧪</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✨</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sugestões rápidas compactas */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionsContainer}
        >
          {['TPM', 'Período fértil', 'Sintomas', 'Menopausa'].map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionChip}
              onPress={() => setInputText(`O que é ${suggestion.toLowerCase()}?`)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(renderMessage)}
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.typingIndicator}>
                <View style={styles.typingContent}>
                  <Image 
                    source={require('../assets/images/logoluna.png')} 
                    style={styles.typingLunaImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.typingText}>Luna digitando...</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={90}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Pergunte à Luna..."
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={300}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { opacity: inputText.trim() ? 1 : 0.5 }
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Text style={styles.sendButtonText}>➤</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lunaImage: {
    width: 24,
    height: 24,
    marginRight: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  testButtonText: {
    fontSize: 14,
  },
  clearButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  clearButtonText: {
    fontSize: 16,
  },
  suggestionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    maxHeight: 40,
  },
  suggestionChip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  suggestionText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingBottom: 16,
    paddingTop: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  aiAvatarImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  aiAvatarEmoji: {
    fontSize: 14,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  userAvatarEmoji: {
    fontSize: 14,
  },
  messageBubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  userBubble: {
    backgroundColor: 'white',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  userText: {
    color: '#FF6B9D',
    fontWeight: '500',
  },
  aiText: {
    color: 'white',
  },
  messageTime: {
    fontSize: 9,
    marginTop: 3,
    fontWeight: '400',
  },
  userTime: {
    color: '#FF6B9D',
    opacity: 0.6,
    textAlign: 'right',
  },
  aiTime: {
    color: 'white',
    opacity: 0.5,
  },
  loadingContainer: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  typingIndicator: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  typingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingLunaImage: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  typingText: {
    color: 'white',
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.9,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: 'white',
    fontSize: 13,
    maxHeight: 80,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sendButtonText: {
    color: '#FF6B9D',
    fontSize: 16,
    fontWeight: 'bold',
  },
});