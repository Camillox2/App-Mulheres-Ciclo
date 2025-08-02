// components/EducationalModal.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface EducationalContent {
  title: string;
  emoji: string;
  sections: Array<{
    subtitle: string;
    content: string;
    tips?: string[];
  }>;
}

interface EducationalModalProps {
  visible: boolean;
  onClose: () => void;
  content: EducationalContent;
  theme: any;
}

const { width, height } = Dimensions.get('window');

export const EducationalModal: React.FC<EducationalModalProps> = ({
  visible,
  onClose,
  content,
  theme,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          {/* Header */}
          <LinearGradient
            colors={theme.colors.gradients}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.emoji}>{content.emoji}</Text>
            <Text style={styles.title}>{content.title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {content.sections.map((section, index) => (
              <View key={index} style={styles.section}>
                <Text style={[styles.subtitle, { color: theme.colors.primary }]}>
                  {section.subtitle}
                </Text>
                <Text style={[styles.text, { color: theme.colors.primary }]}>
                  {section.content}
                </Text>
                
                {section.tips && section.tips.length > 0 && (
                  <View style={[styles.tipsContainer, { backgroundColor: theme.colors.background }]}>
                    <Text style={[styles.tipsTitle, { color: theme.colors.secondary }]}>
                      💡 Dicas:
                    </Text>
                    {section.tips.map((tip, tipIndex) => (
                      <Text key={tipIndex} style={[styles.tip, { color: theme.colors.secondary }]}>
                        • {tip}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              onPress={onClose}
            >
              <Text style={styles.actionButtonText}>Entendi!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Conteúdo educativo pré-definido
export const EDUCATIONAL_CONTENT = {
  menstrualPhase: {
    title: 'Fase Menstrual',
    emoji: '🌸',
    sections: [
      {
        subtitle: 'O que acontece?',
        content: 'Durante a menstruação, o endométrio (revestimento do útero) é eliminado, causando o sangramento menstrual. Esta fase marca o início de um novo ciclo.',
        tips: [
          'Use absorventes ou coletores menstruais conforme sua preferência',
          'Mantenha-se hidratada',
          'Pratique atividades relaxantes como yoga suave',
          'É normal sentir cólicas leves'
        ]
      },
      {
        subtitle: 'Sintomas comuns',
        content: 'Você pode sentir cólicas, dor nas costas, mudanças de humor, sensibilidade nos seios e fadiga. Estes sintomas são normais e variam de pessoa para pessoa.',
      },
      {
        subtitle: 'Cuidados especiais',
        content: 'Este é um momento de renovação. Seja gentil consigo mesma, descanse quando necessário e alimente-se bem. Evite exercícios muito intensos se não se sentir confortável.',
      }
    ]
  },

  postMenstrualPhase: {
    title: 'Fase Pós-Menstrual',
    emoji: '🌱',
    sections: [
      {
        subtitle: 'Energia renovada',
        content: 'Após a menstruação, os níveis de estrogênio começam a subir, trazendo mais energia e disposição. É um ótimo momento para novos projetos e atividades.',
        tips: [
          'Aproveite a energia extra para exercícios',
          'Inicie novos projetos ou hobbies',
          'Foque em atividades sociais',
          'É um bom momento para decisões importantes'
        ]
      },
      {
        subtitle: 'O que esperar',
        content: 'Você provavelmente se sentirá mais confiante, com melhor humor e maior clareza mental. A libido também pode começar a aumentar gradualmente.',
      }
    ]
  },

  fertilePhase: {
    title: 'Período Fértil',
    emoji: '🔥',
    sections: [
      {
        subtitle: 'Pico de fertilidade',
        content: 'Este é o período quando você tem maior chance de engravidar. O estrogênio está em alta, aumentando a energia, criatividade e libido.',
        tips: [
          'Use proteção se não desejar engravidar',
          'Aproveite a energia criativa',
          'É normal sentir-se mais atraente',
          'Observe mudanças no muco cervical'
        ]
      },
      {
        subtitle: 'Sinais de fertilidade',
        content: 'O muco cervical fica mais transparente e elástico, semelhante à clara de ovo. A temperatura corporal pode estar ligeiramente elevada.',
      }
    ]
  },

  ovulationPhase: {
    title: 'Ovulação',
    emoji: '⭐',
    sections: [
      {
        subtitle: 'O momento da ovulação',
        content: 'O óvulo é liberado do ovário e está pronto para fertilização. Este é o pico absoluto da fertilidade e geralmente ocorre no meio do ciclo.',
        tips: [
          'Maior chance de gravidez neste período',
          'Energia e libido no máximo',
          'Possível dor leve no ovário (mittelschmerz)',
          'Momento ideal para relações se deseja engravidar'
        ]
      },
      {
        subtitle: 'Sintomas da ovulação',
        content: 'Algumas mulheres sentem uma dor leve de um lado do abdômen, aumento da libido, e mudanças no muco cervical.',
      }
    ]
  },

  preMenstrualPhase: {
    title: 'Fase Pré-Menstrual',
    emoji: '💜',
    sections: [
      {
        subtitle: 'Preparação para o próximo ciclo',
        content: 'Os níveis hormonais começam a cair, preparando o corpo para a próxima menstruação. É um período de introspecção e pode trazer alguns desconfortos.',
        tips: [
          'Pratique autocuidado extra',
          'Evite decisões importantes se estiver muito sensível',
          'Mantenha uma dieta equilibrada',
          'Exercícios leves podem ajudar com sintomas'
        ]
      },
      {
        subtitle: 'TPM - Tensão Pré-Menstrual',
        content: 'É normal sentir mudanças de humor, inchaço, sensibilidade nos seios e desejos alimentares. Estes sintomas são temporários e fazem parte do ciclo natural.',
      },
      {
        subtitle: 'Como lidar',
        content: 'Seja paciente consigo mesma. Este é um momento natural de menor energia. Foque em atividades relaxantes e evite estresse desnecessário.',
      }
    ]
  },

  pregnancyChances: {
    title: 'Entendendo as Chances de Gravidez',
    emoji: '🎯',
    sections: [
      {
        subtitle: 'Como calculamos',
        content: 'As chances de gravidez variam ao longo do ciclo baseadas na proximidade da ovulação e na janela fértil. O espermatozoide pode sobreviver até 5 dias no corpo.',
        tips: [
          'Janela fértil: 5 dias antes + dia da ovulação + 1 dia depois',
          'Chances máximas durante a ovulação',
          'Chances mínimas durante a menstruação',
          'Lembre-se: nenhum método é 100% preciso'
        ]
      },
      {
        subtitle: 'Fatores que influenciam',
        content: 'Idade, estresse, medicamentos, condições de saúde e irregularidades no ciclo podem afetar a fertilidade e as chances de gravidez.',
      },
      {
        subtitle: 'Importante lembrar',
        content: 'Este app é apenas educativo. Para planejamento familiar ou contracepção, sempre consulte um profissional de saúde e use métodos contraceptivos adequados.',
      }
    ]
  },

  cycleVariations: {
    title: 'Variações do Ciclo',
    emoji: '🔄',
    sections: [
      {
        subtitle: 'Ciclos normais',
        content: 'Ciclos entre 21 e 35 dias são considerados normais. Pequenas variações são comuns e podem ser causadas por estresse, mudanças na dieta, exercícios ou outros fatores.',
      },
      {
        subtitle: 'Quando se preocupar',
        content: 'Consulte um médico se seus ciclos forem muito irregulares, muito longos (mais de 35 dias) ou muito curtos (menos de 21 dias), ou se você tiver sangramento intenso.',
        tips: [
          'Mantenha um registro dos seus ciclos',
          'Note mudanças significativas',
          'Consulte um ginecologista anualmente',
          'Não hesite em buscar ajuda médica'
        ]
      }
    ]
  }
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 25,
    alignItems: 'center',
    position: 'relative',
  },
  emoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 25,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 15,
  },
  tipsContainer: {
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tip: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  footer: {
    padding: 25,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});