// components/ErrorBoundary.tsx - COMPONENTE DE ERROR BOUNDARY
import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      errorInfo: errorInfo.componentStack || null
    });

    // Log do erro para análise
    this.logError(error, errorInfo);
  }

  logError = async (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      const errorReport = {
        id: this.state.errorId,
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        device: {
          platform: 'react-native',
          appVersion: Application.nativeApplicationVersion,
          buildVersion: Application.nativeBuildVersion
        },
        user: {
          // Não incluir dados pessoais, apenas metadados úteis
          hasProfile: !!(await AsyncStorage.getItem('userProfile')),
          hasCycleData: !!(await AsyncStorage.getItem('cycleData')),
          lastActiveDate: new Date().toISOString()
        }
      };

      // Salvar localmente para análise (máximo 10 reports)
      const existingReports = await AsyncStorage.getItem('errorReports');
      const reports = existingReports ? JSON.parse(existingReports) : [];
      
      reports.unshift(errorReport);
      const limitedReports = reports.slice(0, 10);
      
      await AsyncStorage.setItem('errorReports', JSON.stringify(limitedReports));
      
      console.error('🚨 Erro capturado pelo ErrorBoundary:', errorReport);
    } catch (logError) {
      console.error('Erro ao salvar relatório de erro:', logError);
    }
  };

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  clearAppData = async () => {
    try {
      // Backup dos dados antes de limpar
      const backup = {
        userProfile: await AsyncStorage.getItem('userProfile'),
        cycleData: await AsyncStorage.getItem('cycleData'),
        timestamp: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('emergencyBackup', JSON.stringify(backup));
      
      // Limpar apenas dados que podem estar corrompidos
      const keysToKeep = ['userProfile', 'cycleData', 'emergencyBackup', 'errorReports'];
      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));
      
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
      
      this.resetError();
    } catch (error) {
      console.error('Erro ao limpar dados do app:', error);
    }
  };

  sendErrorReport = async () => {
    try {
      // Em uma implementação real, você enviaria para um serviço de crash reporting
      // como Sentry, Crashlytics, etc.
      
      const errorData = {
        id: this.state.errorId,
        error: this.state.error?.message,
        stack: this.state.error?.stack,
        componentStack: this.state.errorInfo,
        timestamp: new Date().toISOString()
      };
      
      console.log('📤 Relatório de erro preparado para envio:', errorData);
      
      // Simular envio bem-sucedido
      alert('Relatório enviado! Obrigada por ajudar a melhorar o app.');
    } catch (error) {
      console.error('Erro ao enviar relatório:', error);
      alert('Não foi possível enviar o relatório. Tente novamente mais tarde.');
    }
  };

  render() {
    if (this.state.hasError) {
      // Se foi fornecido um fallback customizado, usar ele
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.resetError);
      }

      // Fallback padrão
      return (
        <View style={styles.container}>
          <LinearGradient
            colors={['#FF6B9D', '#E91E63']}
            style={styles.gradient}
          >
            <View style={styles.content}>
              <Text style={styles.emoji}>😔</Text>
              <Text style={styles.title}>Oops! Algo deu errado</Text>
              <Text style={styles.subtitle}>
                Não se preocupe, seus dados estão seguros
              </Text>
              
              <ScrollView style={styles.errorContainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.errorTitle}>Detalhes técnicos:</Text>
                <Text style={styles.errorText}>
                  {this.state.error?.name}: {this.state.error?.message}
                </Text>
                
                {__DEV__ && this.state.errorInfo && (
                  <>
                    <Text style={styles.errorTitle}>Stack trace:</Text>
                    <Text style={styles.errorText}>
                      {this.state.errorInfo}
                    </Text>
                  </>
                )}
                
                <Text style={styles.errorId}>
                  ID do erro: {this.state.errorId}
                </Text>
              </ScrollView>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={this.resetError}
                >
                  <Text style={styles.primaryButtonText}>
                    🔄 Tentar Novamente
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={this.sendErrorReport}
                >
                  <Text style={styles.secondaryButtonText}>
                    📤 Enviar Relatório
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.warningButton]}
                  onPress={this.clearAppData}
                >
                  <Text style={styles.warningButtonText}>
                    🧹 Limpar Cache (Último Recurso)
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.helpText}>
                💡 Se o problema persistir, tente reiniciar o app ou entre em contato com nosso suporte
              </Text>
            </View>
          </LinearGradient>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  errorContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
    maxHeight: 200,
    width: '100%',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    marginTop: 10,
  },
  errorText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  errorId: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 10,
    fontStyle: 'italic',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: 'white',
  },
  primaryButtonText: {
    color: '#E91E63',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  warningButton: {
    backgroundColor: 'rgba(255,152,0,0.8)',
  },
  warningButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
});

// Hook para usar ErrorBoundary funcionalmente
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: any) => {
    console.error('🚨 Erro capturado:', error);
    
    // Log adicional se necessário
    if (errorInfo) {
      console.error('Informações adicionais:', errorInfo);
    }
  };

  return { handleError };
};