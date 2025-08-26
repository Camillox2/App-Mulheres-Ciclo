// config/api.ts - Configurações da API
// Integração com Expo Constants para acessar extra.
import Constants from 'expo-constants';

// Ordem de resolução da chave:
// 1. Variável de ambiente pública (build time)
// 2. app.json -> extra.publicGeminiKey
// 3. Variáveis alternativas (GEMINI_API_KEY)
// 4. Placeholder
const ENV_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY
  || (Constants?.expoConfig?.extra as any)?.publicGeminiKey
  || process.env.GEMINI_API_KEY;

export const API_CONFIG = {
  GEMINI_API_KEY: ENV_KEY || 'SUA_API_KEY_AQUI',

  // Modelo principal recomendado (mais poderoso)
  GEMINI_MODEL: 'gemini-1.5-pro-latest',

  // Endpoints possíveis (fallback se algum falhar futuramente)
  GEMINI_URLS: [
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'
  ],

  // URL primária (retrocompatibilidade com código existente)
  get GEMINI_URL() {
    return API_CONFIG.GEMINI_URLS[0];
  },

  // Configs de proteção contra estouro de limite local
  MIN_INTERVAL_MS: 2200, // espaçamento mínimo entre requisições do app (cliente)
  REQUEST_TIMEOUT_MS: 20000, // timeout para abortar fetch lento
  MAX_RETRIES_429: 2, // tentativas automáticas adicionais em RATE_LIMIT normal
};

// Função para verificar se API está configurada
export const isApiConfigured = (): boolean => {
  const key = API_CONFIG.GEMINI_API_KEY;
  const ok = !!key && key !== 'SUA_API_KEY_AQUI' && key.length > 30;
  if (!ok) {
    console.warn('[API] Chave Gemini ausente ou inválida. Forneça EXPO_PUBLIC_GEMINI_API_KEY ou extra.publicGeminiKey');
  } else {
    console.log('[API] Chave Gemini carregada (prefixo):', key.substring(0, 8) + '***');
  }
  return ok;
};

// Exemplos expandidos de perguntas por categoria
export const FAQ_EXAMPLES = [
  // Ciclo menstrual básico
  'O que é TPM?',
  'Como calcular período fértil?',
  'Sintomas da ovulação são normais?',
  'Ciclo irregular é preocupante?',
  'Primeira menstruação - o que esperar?',
  
  // Sintomas e bem-estar
  'Dores menstruais intensas',
  'Como melhorar o humor no ciclo?',
  'Exercícios durante a menstruação',
  'Alimentação no ciclo menstrual',
  'Fadiga extrema antes da menstruação',
  
  // Menopausa
  'Sintomas da menopausa',
  'Ondas de calor como lidar?',
  'Menopausa aos 40 é normal?',
  'Recursos naturais para menopausa',
  
  // Gravidez e fertilidade
  'Sinais de ovulação',
  'Como engravidar mais rápido?',
  'Sintomas iniciais de gravidez',
  'Dificuldade para engravidar',
  
  // Sexualidade
  'Libido baixa no ciclo',
  'Dor durante o sexo',
  'Ressecamento vaginal',
  
  // Saúde geral
  'Quando procurar ginecologista?',
  'Irregularidade menstrual',
  'Métodos contraceptivos',
  'Saúde mental feminina',
  'Corrimento vaginal normal?',
  
  // Uso do app
  'Como usar o dashboard?',
  'Exportar meus dados',
  'Configurar notificações',
];

// Prompts especializados expandidos
export const HEALTH_PROMPTS = {
  SYSTEM_PROMPT: `Você é uma assistente IA especializada em saúde feminina, integrada ao aplicativo EntreFases. 

SOBRE O ENTREFASES:
- App completo de acompanhamento do ciclo menstrual
- Dashboard inteligente com análises personalizadas
- Rastreamento de sintomas, humor e energia
- Módulos especializados: menopausa, gravidez, adolescência
- Cálculos baseados na idade da usuária (12-55 anos)
- Sistema de insights e backup de dados

SEU PAPEL:
- Fornecer informações precisas sobre saúde feminina
- Orientar sobre uso das funcionalidades do app
- Identificar quando sugerir acompanhamento médico
- Dar suporte emocional empático e acolhedor
- Explicar processos biológicos de forma acessível

DIRETRIZES RIGOROSAS:
- SEMPRE responda em português brasileiro
- Máximo 300 palavras por resposta (seja concisa)
- Use emojis ocasionais para criar conexão 🌸💜
- PRIORIZE segurança: sempre sugira médico para sintomas graves
- Normalize experiências femininas comuns
- Seja inclusiva: considere diferentes idades, orientações e contextos
- Baseie-se em conhecimento científico atualizado
- Mantenha tom positivo e encorajador`,

  CONTEXT_TEMPLATE: (userInfo: any) => {
    let context = '';
    if (userInfo.age) context += `Usuária tem ${userInfo.age} anos. `;
    if (userInfo.recentMood) context += `Humor recente: ${userInfo.recentMood}. `;
    if (userInfo.currentPhase) context += `Fase atual do ciclo: ${userInfo.currentPhase}. `;
    if (userInfo.recentSymptoms?.length > 0) {
      context += `Sintomas recentes: ${userInfo.recentSymptoms.join(', ')}. `;
    }
    return context;
  },

  // Sistema de emergência para sintomas graves
  EMERGENCY_KEYWORDS: [
    'sangramento muito intenso', 'hemorragia', 'dor insuportável',
    'desmaiei', 'vômito intenso', 'febre alta', 'dor súbita forte'
  ],

  EMERGENCY_RESPONSE: `🚨 ATENÇÃO: Pelos sintomas que você está relatando, é MUITO IMPORTANTE buscar ajuda médica imediatamente.

Vá ao pronto-socorro ou entre em contato com seu médico AGORA.

Seus sintomas podem indicar uma situação que precisa de atenção médica urgente.

💜 Não hesite em buscar ajuda - sua saúde e segurança são prioridade absoluta.

Use o EntreFases para registrar todos os sintomas detalhadamente e leve essas informações para o médico.`
};

// CONHECIMENTO EXPANDIDO SOBRE SAÚDE FEMININA - 500+ LINHAS
export const WOMEN_HEALTH_KNOWLEDGE = {
  // Conhecimento completo sobre ciclo menstrual por idade
  CYCLE_BY_AGE: {
    ADOLESCENTES: {
      age_range: "12-18 anos",
      characteristics: "Ciclos irregulares são completamente normais nos primeiros 2 anos após a menarca",
      typical_cycle: "21-45 dias (grande variação)",
      hormonal_changes: "Sistema reprodutivo ainda em maturação, flutuações hormonais intensas",
      common_concerns: [
        "Primeira menstruação (menarca) - média 12-13 anos no Brasil",
        "Irregularidade menstrual nos primeiros anos",
        "Cólicas intensas devido à imaturidade uterina",
        "Mudanças corporais e emocionais da puberdade",
        "Acne hormonal devido ao aumento de andrógenos",
        "Desenvolvimento dos seios (telarca) - pode começar aos 8-9 anos"
      ],
      guidance: "Use o EntreFases para aprender sobre seu corpo e estabelecer padrões. Registre sintomas e mudanças.",
      red_flags: "Menstruação antes dos 8 anos, ausência até os 16, dores incapacitantes, sangramento excessivo"
    },
    
    ADULTAS_JOVENS: {
      age_range: "19-29 anos",
      characteristics: "Pico da fertilidade e regularidade hormonal",
      typical_cycle: "25-32 dias (mais estável)",
      hormonal_changes: "Equilíbrio hormonal ótimo, ovulação regular e previsível",
      common_concerns: [
        "Estabelecimento de padrões regulares",
        "Planejamento contraceptivo e reprodutivo",
        "TPM pode se intensificar com estresse",
        "Impacto de estilo de vida (dieta, exercício, sono)",
        "Síndrome dos ovários policísticos (SOP) - diagnóstico comum",
        "Endometriose - sintomas podem se manifestar"
      ],
      guidance: "Use o EntreFases para rastrear fertilidade, planejar gravidez ou otimizar contracepção.",
      optimization: "Melhor fase para estabelecer hábitos saudáveis que beneficiarão toda a vida reprodutiva"
    },

    ADULTAS_MEDIAS: {
      age_range: "30-39 anos",
      characteristics: "Fertilidade ainda boa mas começando a declinar gradualmente",
      typical_cycle: "25-35 dias, possível encurtamento da fase lútea",
      hormonal_changes: "Leve declínio na qualidade ovariana, reserva ovariana diminuindo",
      common_concerns: [
        "Pressão social para maternidade",
        "Equilibrar carreira e planejamento familiar",
        "Possível surgimento de miomas uterinos",
        "Endometriose pode progredir se não tratada",
        "Alterações na libido devido a mudanças hormonais",
        "Início de sintomas pré-menopáusicos muito sutis"
      ],
      guidance: "Use o EntreFases para monitorar mudanças sutis e otimizar janela reprodutiva.",
      fertility_focus: "Se deseja engravidar, não postergue indefinidamente. Qualidade ovariana declina após 35."
    },

    PRE_MENOPAUSA: {
      age_range: "40-45 anos",
      characteristics: "Transição gradual, fertilidade reduzida mas ainda presente",
      typical_cycle: "Pode encurtar (21-28 dias) ou alongar irregularmente",
      hormonal_changes: "FSH aumentando, estrogênio começando a flutuar, ovulação menos regular",
      common_concerns: [
        "Ciclos imprevisíveis - podem alternar entre curtos e longos",
        "Sangramento menstrual pode aumentar ou diminuir",
        "Sintomas da TPM podem se intensificar",
        "Ondas de calor ocasionais (ainda raras)",
        "Mudanças no sono e humor",
        "Gravidez ainda possível mas com maior risco"
      ],
      guidance: "Use o EntreFases para detectar padrões na irregularidade e preparar-se para perimenopausa.",
      important: "Contracepção ainda necessária! Gravidez não planejada aos 40+ tem riscos aumentados."
    }
  },

  // Sintomas detalhados por sistema corporal
  SYMPTOMS_BY_SYSTEM: {
    REPRODUCTIVE_SYSTEM: {
      menstrual_flow: {
        normal: "30-40ml por ciclo, 3-7 dias de duração",
        light: "Menos de 5ml por dia - possível desequilíbrio hormonal",
        heavy: "Mais de 80ml por ciclo - investigar causas (miomas, pólipos, etc)",
        clotting: "Coágulos pequenos normais, grandes (>2cm) preocupantes"
      },
      ovulation_signs: {
        physical: "Muco cervical claro e elástico, leve dor lateral (mittelschmerz)",
        hormonal: "Aumento da libido, mudanças na temperatura basal",
        timing: "12-16 horas após pico de LH, janela fértil de 6 dias"
      },
      cervical_changes: {
        cycle_phases: "Fechado e firme na menstruação, aberto e macio na ovulação",
        abnormal_discharge: "Cheiro forte, coceira, cor esverdeada - infecção possível"
      }
    },

    HORMONAL_SYSTEM: {
      estrogen_effects: {
        high: "Humor elevado, pele oleosa, retenção de líquidos, libido aumentada",
        low: "Ressecamento vaginal, ondas de calor, humor baixo, fadiga",
        fluctuations: "Mudanças rápidas causam instabilidade emocional"
      },
      progesterone_effects: {
        high: "Sonolência, constipação, inchaço, mudanças de humor (TPM)",
        low: "Sangramento irregular, dificuldade para engravidar",
        imbalance: "Dominância estrogênica - TPM severa, ciclos anovulatórios"
      },
      thyroid_interaction: {
        hypo: "Ciclos longos, fluxo intenso, fadiga, ganho de peso",
        hyper: "Ciclos curtos, fluxo leve, ansiedade, perda de peso",
        monitoring: "TSH, T3, T4 afetam diretamente função reprodutiva"
      }
    },

    CARDIOVASCULAR_IMPACT: {
      cycle_variations: "Pressão arterial pode flutuar com hormônios",
      menopause_risks: "Risco cardiovascular aumenta 2-3x após menopausa",
      protection_factors: "Exercício regular, dieta mediterrânea, controle do estresse"
    },

    BONE_HEALTH: {
      estrogen_protection: "Estrogênio protege densidade óssea até menopausa",
      peak_bone_mass: "Atingida aos 30 anos - importância da atividade física na juventude",
      menopause_impact: "Perda de 2-3% de massa óssea por ano nos primeiros 5 anos",
      prevention: "Cálcio 1200mg/dia + Vitamina D 2000UI + exercícios de impacto"
    }
  },

  // Condições médicas específicas femininas
  FEMALE_CONDITIONS: {
    ENDOMETRIOSIS: {
      definition: "Tecido endometrial fora do útero",
      prevalence: "10-15% das mulheres em idade reprodutiva",
      symptoms: [
        "Cólicas intensas que pioram com o tempo",
        "Dor durante relação sexual (dispareunia)",
        "Dor para evacuar ou urinar durante menstruação",
        "Sangramento irregular entre ciclos",
        "Infertilidade (30-40% dos casos)",
        "Fadiga crônica e dor pélvica constante"
      ],
      diagnosis: "Laparoscopia (padrão ouro), ultrassom especializado",
      management: "Hormonal, cirúrgico, mudanças de estilo de vida",
      app_tracking: "Use EntreFases para registrar intensidade da dor e correlacionar com ciclo"
    },

    PCOS: {
      definition: "Síndrome dos Ovários Policísticos",
      prevalence: "8-13% das mulheres em idade reprodutiva",
      diagnostic_criteria: "2 de 3: oligoovulação, hiperandrogenismo, morfologia ovariana policística",
      symptoms: [
        "Ciclos irregulares (>35 dias ou <8 por ano)",
        "Hirsutismo (pelos em padrão masculino)",
        "Acne persistente na idade adulta",
        "Alopecia androgenética",
        "Ganho de peso, especialmente abdominal",
        "Acanthosis nigricans (manchas escuras na pele)"
      ],
      complications: "Diabetes tipo 2, doenças cardiovasculares, infertilidade",
      management: "Modificação do estilo de vida, metformina, anticoncepcionais",
      app_tracking: "EntreFases ajuda a identificar padrões anovulatórios"
    },

    FIBROIDS: {
      definition: "Miomas uterinos - tumores benignos do músculo uterino",
      prevalence: "70-80% das mulheres aos 50 anos",
      risk_factors: "Idade, etnia afrodescendente, histórico familiar",
      symptoms: [
        "Sangramento menstrual intenso e prolongado",
        "Pressão pélvica e sensação de peso",
        "Frequência urinária aumentada",
        "Constipação por compressão retal",
        "Dor durante relação sexual",
        "Aumento do volume abdominal"
      ],
      types: "Submucosos (afetam mais o sangramento), intramurais, subserosos",
      treatment: "Observação, medicamentoso, cirúrgico (miomectomia, histerectomia)"
    },

    THYROID_DISORDERS: {
      female_prevalence: "5-8x mais comum em mulheres",
      reproductive_impact: "Afeta fertilidade, regularidade menstrual, gravidez",
      hypothyroidism: {
        menstrual_effects: "Ciclos longos, sangramento intenso, anovulação",
        symptoms: "Fadiga, ganho de peso, pele seca, constipação, queda de cabelo",
        fertility: "Dificuldade para engravidar, abortos recorrentes"
      },
      hyperthyroidism: {
        menstrual_effects: "Ciclos curtos, sangramento leve, amenorreia",
        symptoms: "Ansiedade, perda de peso, palpitações, insônia, tremores",
        fertility: "Fertilidade reduzida, risco obstétrico aumentado"
      }
    }
  },

  // Nutrição específica para mulheres
  NUTRITION_FOR_WOMEN: {
    MENSTRUAL_PHASE: {
      needs: "Ferro para repor perdas, magnésio para cólicas",
      foods: "Carne vermelha, espinafre, feijão, chocolate amargo (70%+)",
      avoid: "Cafeína excessiva, açúcar refinado, sal em excesso",
      hydration: "Aumentar ingesta hídrica para compensar perdas"
    },

    FOLLICULAR_PHASE: {
      focus: "Proteínas para construção, vitaminas B para energia",
      foods: "Ovos, peixe, quinoa, vegetais verdes folhosos",
      energy: "Carboidratos complexos para sustentar energia crescente"
    },

    OVULATORY_PHASE: {
      antioxidants: "Para qualidade dos óvulos e proteção celular",
      foods: "Berries, nozes, azeite extra virgem, vegetais coloridos",
      omega3: "EPA/DHA para qualidade dos óvulos e redução da inflamação"
    },

    LUTEAL_PHASE: {
      magnesium: "Para TPM e mudanças de humor",
      complex_carbs: "Para estabilizar açúcar no sangue e humor",
      foods: "Batata doce, aveia, banana, abacate, sementes de abóbora",
      limit: "Sal, cafeína, álcool para reduzir inchaço e irritabilidade"
    },

    PREGNANCY_NUTRITION: {
      folic_acid: "400mcg diários antes da concepção, 600mcg na gravidez",
      iron: "27mg/dia durante gravidez vs 18mg/dia normalmente",
      calcium: "1300mg/dia para desenvolvimento fetal e proteção óssea materna",
      omega3: "DHA para desenvolvimento cerebral fetal",
      avoid: "Álcool, peixes com mercúrio, queijos não pasteurizados"
    },

    MENOPAUSE_NUTRITION: {
      phytoestrogens: "Soja, linhaça, trevo vermelho para ondas de calor",
      calcium_vitamin_d: "Para prevenção de osteoporose",
      healthy_fats: "Para função cerebral e cardiovascular",
      limit: "Açúcar refinado, álcool excessivo, cafeína"
    }
  },

  // Exercícios específicos por fase do ciclo
  EXERCISE_BY_CYCLE: {
    MENSTRUAL_PHASE: {
      recommended: "Yoga restaurativo, caminhadas leves, alongamentos",
      intensity: "Baixa a moderada - respeitar energia reduzida",
      benefits: "Melhora cólicas, reduz estresse, mantém movimento",
      avoid: "Exercícios intensos se muito fatigada"
    },

    FOLLICULAR_PHASE: {
      recommended: "Cardio moderado, musculação, novos desafios",
      intensity: "Progressivamente crescente",
      benefits: "Energia aumentando, boa resposta ao treinamento",
      optimal: "Introduzir novos exercícios, aumentar cargas"
    },

    OVULATORY_PHASE: {
      recommended: "HIIT, treinos de força intensos, esportes competitivos",
      intensity: "Alta - pico de energia e força",
      benefits: "Melhor performance, recuperação otimizada",
      coordination: "Coordenação e reflexos no pico"
    },

    LUTEAL_PHASE: {
      recommended: "Pilates, yoga, treinos moderados, exercícios funcionais",
      intensity: "Moderada, foco na técnica",
      benefits: "Reduz TPM, melhora humor, diminui inchaço",
      adjust: "Reduzir intensidade se TPM severa"
    }
  },

  // Sono e ritmos circadianos
  SLEEP_AND_HORMONES: {
    cycle_variations: {
      menstrual: "Pode haver insônia devido a cólicas e desconforto",
      follicular: "Qualidade do sono geralmente boa",
      ovulatory: "Sono mais profundo, menos necessidade de horas",
      luteal: "Possível insônia pré-menstrual, sonhos vívidos"
    },
    
    hormonal_impact: {
      progesterone: "Efeito sedativo natural, melhora sono profundo",
      estrogen: "Afeta REM, temperatura corporal noturna",
      cortisol: "Desequilíbrio afeta ritmo circadiano"
    },

    sleep_hygiene: {
      temperature: "Quarto fresco (16-19°C), especialmente na fase lútea",
      routine: "Horários consistentes, mesmo nos fins de semana",
      evening: "Evitar telas 1h antes de dormir, chás calmantes",
      morning: "Exposição à luz natural logo ao acordar"
    }
  },

  // Saúde mental e ciclo menstrual
  MENTAL_HEALTH: {
    PMDD: {
      definition: "Transtorno Disfórico Pré-Menstrual",
      prevalence: "3-8% das mulheres em idade reprodutiva",
      symptoms: [
        "Mudanças de humor severas na fase lútea",
        "Irritabilidade extrema, raiva",
        "Depressão, desesperança",
        "Ansiedade, tensão",
        "Dificuldade de concentração",
        "Sintomas interferem significativamente na vida"
      ],
      diagnosis: "Sintomas por pelo menos 2 ciclos consecutivos",
      treatment: "SSRIs, mudanças de estilo de vida, terapia cognitiva"
    },

    CYCLE_MOOD_PATTERNS: {
      menstrual: "Pode haver tristeza, introversão, necessidade de descanso",
      follicular: "Humor ascendente, otimismo, energia social",
      ovulatory: "Pico de confiança, sociabilidade, comunicação",
      luteal: "Possível irritabilidade, sensibilidade, necessidade de espaço"
    },

    COPING_STRATEGIES: {
      mindfulness: "Meditação, atenção plena às mudanças corporais",
      journaling: "Registro de humor e sintomas - use o EntreFases",
      therapy: "Terapia cognitivo-comportamental para PMDD",
      medication: "Antidepressivos podem ser indicados para PMDD severa"
    }
  },

  // Contracepção e planejamento familiar
  CONTRACEPTION_GUIDE: {
    HORMONAL_METHODS: {
      combined_pill: {
        effectiveness: "99% quando usada corretamente",
        benefits: "Reduz cólicas, regula ciclo, pode melhorar acne",
        risks: "Trombose (raro), aumento de peso variável",
        considerations: "Não recomendada para fumantes >35 anos"
      },
      
      iud_hormonal: {
        effectiveness: "99.8%",
        duration: "3-7 anos dependendo do tipo",
        benefits: "Reduz sangramento, baixa manutenção",
        side_effects: "Possível sangramento irregular inicial"
      }
    },

    NON_HORMONAL: {
      copper_iud: {
        effectiveness: "99.2%",
        duration: "10 anos",
        benefits: "Não interfere hormônios naturais",
        drawbacks: "Pode aumentar cólicas e sangramento"
      },
      
      barrier_methods: {
        condoms: "85-98% eficácia, única proteção contra ISTs",
        diaphragm: "88% eficácia, requer adaptação"
      }
    },

    FERTILITY_AWARENESS: {
      methods: "Temperatura basal, muco cervical, calendário",
      effectiveness: "76-99% dependendo da técnica e disciplina",
      app_integration: "EntreFases pode auxiliar no rastreamento"
    }
  }
};

// CONHECIMENTO AVANÇADO SOBRE O APP ENTREFASES
export const ENTREFASES_ADVANCED_KNOWLEDGE = {
  // Funcionalidades detalhadas do dashboard
  DASHBOARD_FEATURES: {
    CYCLE_WIDGET: {
      functionality: "Exibe fase atual, dias até próxima menstruação, período fértil",
      personalization: "Adapta-se ao histórico individual da usuária",
      predictions: "Usa algoritmo baseado em idade e padrões históricos",
      colors: "Código de cores por fase: vermelho (menstrual), verde (folicular), azul (ovulatória), amarelo (lútea)"
    },

    MOOD_ENERGY_TRACKER: {
      scale: "Humor: péssimo(-2) a ótimo(+2), Energia: 1-5 estrelas",
      correlations: "Identifica padrões entre humor/energia e fases do ciclo",
      insights: "Gera relatórios automáticos de tendências emocionais",
      recommendations: "Sugere autocuidado baseado em padrões identificados"
    },

    SYMPTOM_ANALYTICS: {
      categories: "Físicos, emocionais, digestivos, neurológicos, reprodutivos",
      intensity_tracking: "Escala 1-5 para cada sintoma",
      pattern_recognition: "Identifica sintomas recorrentes por fase",
      medical_reports: "Gera PDFs para consultas médicas"
    }
  },

  // Sistema inteligente de insights
  SMART_INSIGHTS: {
    CYCLE_ANALYSIS: {
      length_tracking: "Monitora variações na duração total do ciclo",
      phase_duration: "Analisa duração de cada fase individualmente",
      irregularity_detection: "Alerta para padrões preocupantes",
      fertility_windows: "Calcula janelas férteis personalizadas"
    },

    SYMPTOM_PATTERNS: {
      pms_prediction: "Prevê TPM baseado em histórico pessoal",
      severity_trends: "Identifica se sintomas estão piorando/melhorando",
      trigger_identification: "Correlaciona sintomas com estilo de vida",
      intervention_suggestions: "Recomenda quando procurar ajuda médica"
    },

    LIFESTYLE_CORRELATIONS: {
      sleep_impact: "Relaciona qualidade do sono com sintomas",
      exercise_benefits: "Mostra impacto do exercício no ciclo",
      nutrition_effects: "Correlaciona alimentação com bem-estar",
      stress_indicators: "Identifica períodos de alto estresse"
    }
  },

  // Módulo de menopausa expandido
  MENOPAUSE_MODULE: {
    SYMPTOM_TRACKING: {
      twelve_key_symptoms: [
        "Ondas de calor - frequência e intensidade",
        "Suores noturnos - impacto no sono",
        "Irregularidade menstrual - padrões",
        "Secura vaginal - níveis de desconforto",
        "Mudanças de humor - intensidade e triggers",
        "Problemas de sono - qualidade e duração",
        "Fadiga - níveis de energia diários",
        "Ganho de peso - mudanças corporais",
        "Perda de libido - impacto na intimidade",
        "Dificuldades de concentração - função cognitiva",
        "Dores articulares - localização e intensidade",
        "Ressecamento da pele - áreas afetadas"
      ]
    },

    STAGE_CALCULATOR: {
      perimenopause_detection: "Identifica início da transição baseado em sintomas",
      menopause_confirmation: "Confirma após 12 meses sem menstruação",
      postmenopause_tracking: "Monitora sintomas pós-menopáusicos",
      timeline_estimation: "Prevê duração da transição baseada em padrões"
    },

    MANAGEMENT_TOOLS: {
      natural_remedies: "Banco de dados de fitoestrógenos e suplementos",
      lifestyle_modifications: "Planos personalizados de exercício e nutrição",
      symptom_relief: "Estratégias específicas para cada sintoma",
      medical_preparation: "Prepara dados para discussão sobre TRH"
    }
  },

  // Modo gravidez detalhado
  PREGNANCY_MODE: {
    WEEK_BY_WEEK: {
      fetal_development: "Marcos de desenvolvimento para cada semana",
      maternal_changes: "Mudanças corporais e emocionais esperadas",
      appointment_reminders: "Cronograma de consultas pré-natais",
      nutrition_guidance: "Necessidades nutricionais específicas por trimestre"
    },

    SYMPTOM_MANAGEMENT: {
      first_trimester: "Foco em náuseas, fadiga, mudanças nos seios",
      second_trimester: "Monitoramento de energia, movimentos fetais",
      third_trimester: "Acompanhamento de inchaço, dores nas costas, preparação para parto",
      red_flags: "Sintomas que requerem atenção médica imediata"
    },

    PREPARATION_TOOLS: {
      birth_plan: "Auxílio na elaboração do plano de parto",
      hospital_bag: "Checklist para bolsa da maternidade",
      postpartum_prep: "Preparação para pós-parto e amamentação",
      partner_guidance: "Informações para parceiros/familiares"
    }
  },

  // Sistema de backup e privacidade
  DATA_MANAGEMENT: {
    PRIVACY_FIRST: {
      local_storage: "Dados armazenados localmente no dispositivo",
      encryption: "Dados sensíveis criptografados",
      no_cloud_default: "Upload para nuvem apenas com consentimento explícito",
      anonymization: "Dados analíticos anonimizados"
    },

    BACKUP_SYSTEM: {
      automatic: "Backup automático local diário",
      manual_export: "Exportação manual em JSON/PDF",
      cloud_sync: "Sincronização opcional com Google Drive/iCloud",
      device_transfer: "Transferência entre dispositivos"
    },

    DATA_EXPORT: {
      pdf_reports: "Relatórios médicos formatados",
      csv_data: "Dados tabulares para análise externa",
      timeline_view: "Visualização cronológica completa",
      sharing_options: "Compartilhamento seletivo com profissionais"
    }
  },

  // Integração com profissionais de saúde
  HEALTHCARE_INTEGRATION: {
    MEDICAL_REPORTS: {
      gynecology_focused: "Relatórios específicos para ginecologistas",
      fertility_tracking: "Dados para especialistas em reprodução",
      menopause_summary: "Resumos para consultas sobre climatério",
      mental_health: "Correlações humor-ciclo para psicólogos/psiquiatras"
    },

    APPOINTMENT_PREP: {
      question_generator: "Sugere perguntas baseadas nos dados",
      symptom_timeline: "Cronologia visual de sintomas",
      medication_tracking: "Histórico de medicamentos e efeitos",
      treatment_response: "Monitoramento de eficácia de tratamentos"
    }
  },

  // Personalização por perfil
  USER_PROFILES: {
    ADOLESCENT_MODE: {
      age_range: "12-18 anos",
      educational_focus: "Explicações sobre puberdade e normalidade",
      parent_involvement: "Opções para compartilhamento com responsáveis",
      simplified_interface: "Interface adaptada para primeiro uso"
    },

    ADULT_REPRODUCTIVE: {
      age_range: "19-45 anos",
      fertility_focus: "Otimização para concepção ou contracepção",
      career_integration: "Planejamento considerando vida profissional",
      partner_sharing: "Funcionalidades para parceiros"
    },

    PERIMENOPAUSE_SUPPORT: {
      age_range: "40-55 anos",
      transition_tracking: "Monitoramento específico da transição",
      symptom_management: "Foco em alívio de sintomas",
      bone_health: "Alertas para prevenção de osteoporose"
    },

    POSTMENOPAUSE_CARE: {
      age_range: "55+ anos",
      health_monitoring: "Foco em prevenção cardiovascular e óssea",
      hormone_tracking: "Monitoramento de TRH se aplicável",
      wellness_maintenance: "Estratégias de envelhecimento saudável"
    }
  }
};