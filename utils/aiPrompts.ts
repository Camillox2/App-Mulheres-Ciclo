// utils/aiPrompts.ts - Prompts Especializados para IA com Conhecimento Profundo
export const SPECIALIZED_PROMPTS = {
  // Sistema de conhecimento base sobre o app EntreFases
  APP_KNOWLEDGE: `SOBRE O APP ENTREFASES:
O EntreFases é um aplicativo completo de acompanhamento da saúde feminina que oferece:

FUNCIONALIDADES PRINCIPAIS:
- Rastreamento de ciclo menstrual com cálculos personalizados por idade
- Dashboard inteligente com widgets interativos
- Sistema de anotações diárias com humor e energia
- Rastreador de sintomas especializado
- Modo gravidez com acompanhamento semanal
- Módulo completo de menopausa (pré, peri, pós)
- Sistema de insights inteligentes
- Backup e exportação de dados
- Calculadora de período fértil
- Previsões personalizadas

DADOS QUE O APP COLETA:
- Idade (12-55 anos) - fundamental para cálculos
- Duração do ciclo (21-45 dias)
- Duração da menstruação (3-10 dias)
- Data da última menstruação
- Sintomas detalhados por categoria
- Humor diário (péssimo, ruim, neutro, bom, ótimo)
- Nível de energia (1-5)
- Tags personalizadas
- Dados de menopausa (12 sintomas específicos)

CÁLCULOS INTELIGENTES:
- Considera idade para fertilidade (pico aos 20-25 anos, declínio após 35)
- Ajusta previsões para ciclos irregulares
- Calcula probabilidade de gravidez por fase
- Identifica padrões em sintomas e humor
- Prevê TPM baseado em histórico`,

  // Conhecimento completo sobre ciclo menstrual
  CYCLE_COMPLETE_KNOWLEDGE: `CONHECIMENTO COMPLETO SOBRE CICLO MENSTRUAL:

FASES DO CICLO (28 dias padrão, mas varia 21-35 dias):
1. MENSTRUAL (Dias 1-5):
   - Descamação do endométrio
   - Hormônios baixos (estrogênio e progesterona)
   - Pode haver cólicas, fadiga, humor baixo
   - Dicas: calor local, magnésio, descanso

2. FOLICULAR (Dias 1-13):
   - Estrogênio aumenta gradualmente
   - Folículos ovarianos se desenvolvem
   - Energia aumenta, pele melhora
   - Boa para exercícios intensos, novos projetos

3. OVULATÓRIA (Dias 12-16):
   - Pico de LH causa ovulação
   - Estrogênio no máximo
   - Libido alta, muco cervical claro
   - Período mais fértil (6 dias)

4. LÚTEA (Dias 15-28):
   - Progesterona alta
   - Possível TPM nos últimos dias
   - Inchaço, mudanças de humor
   - Corpo prepara para menstruação

VARIAÇÕES POR IDADE:
- Adolescentes (12-18): ciclos irregulares normais
- 20-30 anos: pico de fertilidade
- 30-40 anos: possível encurtamento da fase lútea
- 40+ anos: transição para menopausa

SINAIS DE ALERTA:
- Sangramento excessivo (>80ml por ciclo)
- Ciclos <21 ou >35 dias consistentemente
- Dor incapacitante
- Sangramento entre períodos
- Ausência de menstruação (amenorreia)`,

  // Conhecimento detalhado sobre menopausa
  MENOPAUSE_COMPLETE_KNOWLEDGE: `CONHECIMENTO COMPLETO SOBRE MENOPAUSA:

ESTÁGIOS DA MENOPAUSA:
1. PRÉ-MENOPAUSA (até ~45 anos):
   - Ciclos ainda regulares
   - Fertilidade diminuindo
   - Possíveis sintomas leves ocasionais

2. PERIMENOPAUSA (45-55 anos):
   - Transição ativa
   - Ciclos irregulares
   - Sintomas intensos e variáveis
   - Pode durar 2-10 anos

3. MENOPAUSA (12 meses sem menstruação):
   - Média aos 51 anos no Brasil
   - Diagnóstico retrospectivo
   - Fim da função ovariana

4. PÓS-MENOPAUSA:
   - Período após a menopausa
   - Riscos cardiovasculares aumentam
   - Necessidade de cuidados preventivos

12 SINTOMAS PRINCIPAIS:
1. Ondas de calor (85% das mulheres)
2. Suores noturnos
3. Irregularidade menstrual
4. Secura vaginal
5. Mudanças de humor/irritabilidade
6. Problemas de sono/insônia
7. Fadiga/cansaço
8. Ganho de peso/mudança corporal
9. Perda de libido
10. Dificuldades de concentração
11. Dores articulares
12. Ressecamento da pele

MANEJO NATURAL:
- Fitoestrógenos (soja, linhaça)
- Exercícios regulares
- Técnicas de relaxamento
- Suplementos (cálcio, vitamina D, ômega-3)
- Terapia cognitivo-comportamental

QUANDO BUSCAR AJUDA:
- Sintomas interferindo na qualidade de vida
- Sangramento irregular ou excessivo
- Ondas de calor muito frequentes
- Depressão ou ansiedade severa`,

  // Sintomas detalhados por categoria
  SYMPTOMS_DETAILED_KNOWLEDGE: `CONHECIMENTO DETALHADO SOBRE SINTOMAS:

SINTOMAS FÍSICOS:
- Cólicas: normais se controláveis, preocupantes se incapacitantes
- Dor de cabeça: comum na TPM devido a queda hormonal
- Inchaço: retenção de líquidos por progesterona
- Sensibilidade nos seios: normal na fase lútea
- Fadiga: comum em todas as fases, intensifica na menstrual

SINTOMAS EMOCIONAIS:
- Irritabilidade: pico na fase lútea
- Ansiedade: pode aumentar com flutuações hormonais
- Tristeza/melancolia: normal em pequenos graus
- Mudanças de humor: esperadas, mas não extremas

SINTOMAS DIGESTIVOS:
- Constipação: comum na fase lútea
- Desejos alimentares: chocolate/doces por mudanças na serotonina
- Náuseas: podem ocorrer no início da menstruação

PADRÕES PREOCUPANTES:
- Sintomas que impedem atividades normais
- Intensidade crescente ao longo dos ciclos
- Novos sintomas sem explicação
- Sintomas fora do período esperado`,

  // Prompt para análise de sintomas
  SYMPTOM_ANALYSIS: (symptoms: string[], mood: string, age: number, phase?: string) => `
${SPECIALIZED_PROMPTS.APP_KNOWLEDGE}

${SPECIALIZED_PROMPTS.SYMPTOMS_DETAILED_KNOWLEDGE}

ANÁLISE PERSONALIZADA:
Usuária de ${age} anos${phase ? `, na fase ${phase}` : ''}
Sintomas atuais: ${symptoms.join(', ')}
Humor: ${mood}

Com base no conhecimento do EntreFases e fisiologia feminina:

1. INTERPRETAÇÃO DOS SINTOMAS:
   - Relação com a fase do ciclo
   - Normalidade para a idade
   - Possíveis causas hormonais

2. ESTRATÉGIAS DO APP:
   - Como usar os dados do EntreFases para acompanhar
   - Quais métricas observar no dashboard
   - Configurações recomendadas

3. AUTOCUIDADO PERSONALIZADO:
   - Baseado na idade e sintomas específicos
   - Dicas nutricionais por fase
   - Exercícios adequados

4. SINAIS DE ALERTA:
   - Quando os sintomas são preocupantes
   - Necessidade de acompanhamento médico

Seja específica sobre como usar o EntreFases para melhor acompanhamento.`,

  // Prompt para bem-estar por fase
  WELLNESS_BY_PHASE: (phase: string, day: number, age: number) => `
${SPECIALIZED_PROMPTS.APP_KNOWLEDGE}

${SPECIALIZED_PROMPTS.CYCLE_COMPLETE_KNOWLEDGE}

GUIA PERSONALIZADO PARA FASE ${phase.toUpperCase()} - DIA ${day}:
Usuária de ${age} anos

NESTA FASE NO ENTREFASES:
- Como os dados aparecem no dashboard
- Insights que o app pode gerar
- Padrões esperados nos gráficos

OTIMIZAÇÃO HORMONAL:
1. ALIMENTAÇÃO ESTRATÉGICA:
   ${phase === 'menstrual' ? 
     '- Ferro (carne, espinafre), magnésio (chocolate 70%+)\n   - Anti-inflamatórios naturais (gengibre, açafrão)' :
   phase === 'folicular' ?
     '- Proteínas para construção (ovos, peixe)\n   - Vitaminas do complexo B para energia' :
   phase === 'ovulatória' ?
     '- Antioxidantes para qualidade do óvulo\n   - Fibras para equilíbrio hormonal' :
     '- Magnésio para TPM\n   - Carboidratos complexos para humor'}

2. EXERCÍCIOS IDEAIS:
   ${phase === 'menstrual' ?
     '- Yoga suave, caminhadas leves\n   - Foco na recuperação' :
   phase === 'folicular' ?
     '- Treinos intensos, novos desafios\n   - Energia está aumentando' :
   phase === 'ovulatória' ?
     '- HIIT, treinos de força\n   - Pico de energia e força' :
     '- Treinos moderados, flexibilidade\n   - Preserve energia para TPM'}

3. CUIDADOS EMOCIONAIS:
   - Técnicas específicas para esta fase
   - Como usar as anotações do app
   - Padrões de humor esperados

4. PRÓXIMOS DIAS:
   - O que esperar no dashboard
   - Preparação para próxima fase
   - Alertas do EntreFases`,

  // Prompt para emergências
  RED_FLAGS: (symptom: string, age: number, context: string) => `
${SPECIALIZED_PROMPTS.SYMPTOMS_DETAILED_KNOWLEDGE}

AVALIAÇÃO DE EMERGÊNCIA:
Sintoma relatado: "${symptom}"
Idade: ${age} anos
Contexto: ${context}

PROTOCOLO DE TRIAGEM:

🚨 BUSQUE AJUDA IMEDIATA SE:
- Sangramento muito intenso (encharca absorvente em <1h)
- Dor súbita e intensa no abdômen
- Febre alta com sintomas ginecológicos
- Tontura severa com sangramento
- Sintomas de gravidez ectópica

⚠️ CONSULTE MÉDICO EM BREVE SE:
- Mudança súbita no padrão menstrual
- Dor que interfere nas atividades
- Sintomas novos e intensos
- Sangramento entre períodos

✅ PODE SER NORMAL MAS MONITORE:
- Sintomas leves da TPM
- Pequenas variações no ciclo
- Desconfortos típicos da fase

COMO USAR O ENTREFASES:
- Registre todos os sintomas detalhadamente
- Use as tags para marcar intensidade
- Acompanhe padrões no dashboard
- Exporte dados para levar ao médico

AUTOCUIDADO ENQUANTO MONITORA:
- Medidas de alívio adequadas
- Sinais para observar
- Quando reavaliar`,

  // Apoio emocional
  EMOTIONAL_SUPPORT: (mood: string, age: number, context: string, phase?: string) => `
${SPECIALIZED_PROMPTS.CYCLE_COMPLETE_KNOWLEDGE}

SUPORTE EMOCIONAL ESPECIALIZADO:
Estado emocional: ${mood}
Idade: ${age} anos${phase ? `, fase ${phase}` : ''}
Situação: ${context}

💜 VALIDAÇÃO COMPLETA:
Seus sentimentos são completamente válidos. ${
  phase === 'lútea' ? 'A fase lútea naturalmente causa mudanças emocionais devido à progesterona alta.' :
  phase === 'menstrual' ? 'Durante a menstruação, os hormônios estão baixos, afetando humor e energia.' :
  phase === 'folicular' ? 'Na fase folicular, você deveria estar se sentindo melhor - se não está, há razões.' :
  'As flutuações hormonais do ciclo feminino impactam profundamente nosso bem-estar emocional.'
}

ESTRATÉGIAS NO ENTREFASES:
- Use as anotações diárias para identificar padrões
- Observe correlações no dashboard
- Configure lembretes de autocuidado
- Crie tags personalizadas para emoções

TÉCNICAS IMEDIATAS:
1. Respiração 4-7-8 para acalmar
2. Journaling no app sobre sentimentos
3. Movimento suave (mesmo 5 minutos)
4. Conexão com natureza ou pets

PERSPECTIVA HORMONAL:
${age < 25 ? 'Seus hormônios ainda estão se estabelecendo - variações são normais.' :
  age < 35 ? 'Esta é uma fase de estabilidade hormonal, mudanças merecem atenção.' :
  age < 45 ? 'Possível início de mudanças pré-menopáusicas afetando humor.' :
  'Flutuações hormonais da transição menopáusica podem intensificar emoções.'}

REDE DE APOIO:
- Quando conversar com amigas
- Como explicar para parceiro/família
- Profissionais que podem ajudar

PLANO DE CUIDADO:
- Ações para hoje
- Estratégias para próximos dias
- Sinais para procurar ajuda profissional`,

  // Informações sobre menopausa
  MENOPAUSE_INFO: (age: number, symptoms: string[], lastPeriod?: string) => `
${SPECIALIZED_PROMPTS.MENOPAUSE_COMPLETE_KNOWLEDGE}

AVALIAÇÃO PERSONALIZADA DE MENOPAUSA:
Idade: ${age} anos
Sintomas: ${symptoms.join(', ')}
${lastPeriod ? `Última menstruação: ${lastPeriod}` : ''}

ESTÁGIO PROVÁVEL:
${age < 40 ? 'Muito cedo para menopausa natural - investigar outras causas' :
  age < 45 ? 'Possível menopausa precoce - avaliação médica recomendada' :
  age < 50 ? 'Provável início da perimenopausa' :
  age < 55 ? 'Perimenopausa ou menopausa' :
  'Provável pós-menopausa'}

COMO USAR O MÓDULO MENOPAUSA DO ENTREFASES:
- Registre os 12 sintomas diariamente
- Acompanhe intensidade e frequência
- Use o calculador de estágio integrado
- Monitore padrões no dashboard especializado

ESTRATÉGIAS NATURAIS BASEADAS NOS SEUS SINTOMAS:
${symptoms.includes('ondas de calor') ? '- Fitoestrógenos: soja, linhaça, trevo vermelho\n- Roupas em camadas, ambiente fresco' : ''}
${symptoms.includes('insônia') ? '- Higiene do sono, chá de camomila\n- Evitar cafeína após 14h' : ''}
${symptoms.includes('mood') ? '- Exercícios regulares para endorfinas\n- Técnicas de mindfulness' : ''}

SUPLEMENTAÇÃO CONSIDERADA:
- Cálcio (1200mg) + Vitamina D3 (2000UI)
- Ômega-3 para inflamação e humor
- Magnésio para relaxamento muscular
- Probióticos para saúde digestiva

ACOMPANHAMENTO MÉDICO:
${age < 45 ? 'URGENTE: menopausa precoce requer investigação' :
  'Recomendado ginecologista especializado em menopausa para avaliar TRH e outras opções'}

QUALIDADE DE VIDA:
- Como manter vida sexual satisfatória
- Exercícios para densidade óssea
- Cuidados com pele e cabelo
- Estratégias para ganho de peso`,

  // Educação sobre ciclo
  CYCLE_EDUCATION: (question: string, age?: number) => `
${SPECIALIZED_PROMPTS.CYCLE_COMPLETE_KNOWLEDGE}

${SPECIALIZED_PROMPTS.APP_KNOWLEDGE}

EDUCAÇÃO PERSONALIZADA SOBRE: "${question}"

EXPLICAÇÃO CIENTÍFICA SIMPLES:
[Resposta baseada no conhecimento completo do ciclo, adequada para idade ${age || 'não informada'}]

ANALOGIAS ÚTEIS:
- Ciclo como estações do ano
- Hormônios como maestros de orquestra
- Útero como jardim que se prepara

NO SEU ENTREFASES:
- Como esta informação aparece no app
- Quais dados observar
- Como usar para otimizar saúde

VARIAÇÕES NORMAIS:
- O que é considerado normal
- Quando se preocupar
- Diferenças por idade

DICAS PRÁTICAS:
- Como aplicar no dia a dia
- Mudanças de estilo de vida
- Uso dos recursos do app

PERGUNTAS RELACIONADAS COMUNS:
- Outras dúvidas que usuárias têm
- Links com outros aspectos da saúde`,

  // Novo: Prompt para gravidez e fertilidade
  PREGNANCY_FERTILITY: (age: number, trying: boolean, symptoms: string[]) => `
${SPECIALIZED_PROMPTS.APP_KNOWLEDGE}

ORIENTAÇÃO SOBRE GRAVIDEZ E FERTILIDADE:
Idade: ${age} anos
${trying ? 'Tentando engravidar' : 'Dúvidas sobre gravidez'}
${symptoms.length > 0 ? `Sintomas: ${symptoms.join(', ')}` : ''}

FERTILIDADE POR IDADE:
${age < 25 ? 'Pico da fertilidade - excelente momento biológico' :
  age < 30 ? 'Alta fertilidade - condições ótimas' :
  age < 35 ? 'Boa fertilidade - ainda excelente janela' :
  age < 40 ? 'Fertilidade em declínio - considerar acompanhamento' :
  'Fertilidade reduzida - acompanhamento médico recomendado'}

COMO USAR O ENTREFASES PARA ENGRAVIDAR:
- Mode Dashboard para rastreamento preciso
- Calculadora de período fértil integrada
- Gráficos de temperatura basal (se implementado)
- Registro de sintomas de ovulação
- Exportar dados para médico

SINAIS DE OVULAÇÃO:
- Muco cervical claro e elástico
- Pequeno aumento da temperatura basal
- Leve dor do lado do ovário (mittelschmerz)
- Aumento da libido
- Sensibilidade nos seios

DICAS PARA CONCEPÇÃO:
- Relações nos dias férteis (janela de 6 dias)
- Ácido fólico 400mcg diários
- Estilo de vida saudável
- Reduzir estresse
- Evitar álcool e cigarro

SINTOMAS INICIAIS DE GRAVIDEZ:
- Atraso menstrual
- Implantação (leve sangramento)
- Sensibilidade nos seios
- Enjoo matinal
- Frequência urinária
- Cansaço extremo

QUANDO TESTAR:
- Pelo menos 1 dia de atraso
- Primeiro teste pela manhã
- Repetir se negativo e atraso persistir`,

  // Novo: Prompt para sexualidade
  SEXUALITY_GUIDANCE: (age: number, context: string, concerns: string[]) => `
ORIENTAÇÃO SOBRE SEXUALIDADE FEMININA:
Idade: ${age} anos
Contexto: ${context}
${concerns.length > 0 ? `Preocupações: ${concerns.join(', ')}` : ''}

SEXUALIDADE SAUDÁVEL:
A sexualidade feminina é complexa e varia muito entre mulheres e fases da vida.

INFLUÊNCIA DO CICLO MENSTRUAL:
- Fase folicular: libido gradualmente aumenta
- Ovulação: pico do desejo sexual
- Fase lútea inicial: ainda alta
- TPM: pode diminuir ou aumentar (varia)
- Menstruação: preferências individuais

FATORES QUE AFETAM A LIBIDO:
- Hormônios (estrogênio, testosterona)
- Estresse e cansaço
- Medicamentos (anticoncepcionais, antidepressivos)
- Relacionamento e comunicação
- Autoestima e imagem corporal
- Problemas de saúde

${age > 45 ? `
MUDANÇAS NA MENOPAUSA:
- Ressecamento vaginal por queda de estrogênio
- Possível diminuição da libido
- Mudanças na resposta sexual
- Soluções: lubrificantes, TRH, comunicação
` : ''}

PROBLEMAS COMUNS:
- Dor durante penetração (dispareunia)
- Vaginismo (contração involuntária)
- Dificuldade para atingir orgasmo
- Baixa libido
- Diferenças de desejo no casal

USO DO ENTREFASES:
- Registrar libido nas anotações diárias
- Correlacionar com fases do ciclo
- Identificar padrões e gatilhos
- Tags personalizadas para intimidade

QUANDO BUSCAR AJUDA:
- Dor persistente durante sexo
- Ausência total de desejo
- Problemas afetando relacionamento
- Questões emocionais sobre sexualidade
- Mudanças súbitas sem causa clara

AUTOCONHECIMENTO:
- Exploração corporal é normal e saudável
- Comunicação aberta com parceiro
- Não existe "normalidade" única
- Prazer feminino é multifacetado`,

  // Novo: Prompt para adolescentes
  TEENS_GUIDANCE: (age: number, question: string, parentContext: boolean) => `
ORIENTAÇÃO PARA ADOLESCENTES - SAÚDE FEMININA:
Idade: ${age} anos
${parentContext ? 'Conversa com responsável presente' : 'Conversa direta'}

SOBRE PUBERDADE E DESENVOLVIMENTO:
A puberdade feminina normalmente acontece entre 8-13 anos, mas pode variar.

MUDANÇAS NORMAIS:
- Crescimento dos seios (pode começar aos 8-9 anos)
- Aparecimento de pelos (púbicos e axilares)
- Estirão de crescimento
- Mudanças na pele (oleosidade, espinhas)
- Desenvolvimento dos quadris
- Primeira menstruação (menarca)

PRIMEIRA MENSTRUAÇÃO:
- Normal entre 10-16 anos
- Pode ser irregular nos primeiros 2 anos
- Fluxo e duração variam
- É importante ter produtos de higiene disponíveis

CICLOS IRREGULARES NA ADOLESCÊNCIA:
- Completamente normal nos primeiros anos
- Sistema hormonal ainda está amadurecendo
- Pode variar de 21-45 dias
- Acompanhar mas não se preocupar

USANDO O ENTREFASES NA ADOLESCÊNCIA:
- Ótimo para aprender sobre o corpo
- Registrar sintomas e padrões
- Educação sobre ciclo menstrual
- Preparação para vida adulta

CUIDADOS IMPORTANTES:
- Higiene íntima adequada
- Produtos de higiene menstrual
- Exercícios regulares
- Alimentação balanceada
- Sono adequado (8-9 horas)

SINAIS PARA CONVERSAR COM MÉDICO:
- Menstruação antes dos 8 anos
- Não menstruou até os 16 anos
- Dores muito intensas
- Sangramento excessivo
- Ausência prolongada de menstruação

QUESTÕES EMOCIONAIS:
- Mudanças de humor são normais
- Hormônios afetam as emoções
- Autoestima pode oscilar
- Importante ter rede de apoio
- Conversar com adultos de confiança

EDUCAÇÃO SEXUAL:
- Conhecer o próprio corpo é importante
- Informações corretas sobre sexualidade
- Consentimento e relacionamentos saudáveis
- Prevenção de ISTs e gravidez
- Procurar fontes confiáveis

${parentContext ? `
PARA RESPONSÁVEIS:
- Mantenha conversas abertas e sem julgamento
- Normalize discussões sobre menstruação
- Tenha produtos de higiene sempre disponíveis
- Observe sinais de problemas
- Procure profissionais quando necessário
` : ''}`,

  // Novo: Prompt para uso do app
  APP_USAGE_HELP: (feature: string, userLevel: 'beginner' | 'intermediate' | 'advanced') => `
${SPECIALIZED_PROMPTS.APP_KNOWLEDGE}

AJUDA COM O ENTREFASES - ${feature.toUpperCase()}:
Nível do usuário: ${userLevel}

GUIA PASSO A PASSO:
${userLevel === 'beginner' ? 'Explicações detalhadas para iniciantes' :
  userLevel === 'intermediate' ? 'Instruções diretas com dicas avançadas' :
  'Funcionalidades avançadas e otimizações'}

FUNCIONALIDADES PRINCIPAIS DO APP:
1. DASHBOARD INTELIGENTE:
   - Visão geral do seu ciclo atual
   - Widgets personalizáveis
   - Gráficos e estatísticas
   - Insights automáticos

2. RASTREAMENTO DE CICLO:
   - Configuração inicial (idade, duração)
   - Previsões personalizadas
   - Cálculos de fertilidade
   - Alertas e lembretes

3. SISTEMA DE ANOTAÇÕES:
   - Humor e energia diários
   - Tags personalizadas
   - Histórico completo
   - Correlações automáticas

4. RASTREADOR DE SINTOMAS:
   - Categorias especializadas
   - Intensidade e frequência
   - Padrões identificados
   - Relatórios para médicos

5. MÓDULO MENOPAUSA:
   - 12 sintomas específicos
   - Cálculo de estágio automático
   - Dashboard especializado
   - Acompanhamento longitudinal

6. MODO GRAVIDEZ:
   - Acompanhamento semanal
   - Desenvolvimento do bebê
   - Sintomas de gravidez
   - Preparação para parto

7. INSIGHTS INTELIGENTES:
   - Análises automáticas
   - Padrões identificados
   - Recomendações personalizadas
   - Alertas importantes

8. BACKUP E EXPORTAÇÃO:
   - Dados seguros na nuvem
   - Relatórios em PDF
   - Compartilhamento com médicos
   - Histórico completo

DICAS DE OTIMIZAÇÃO:
- Use diariamente para melhores insights
- Configure notificações importantes
- Personalize tags e categorias
- Exporte dados regularmente
- Mantenha informações atualizadas

RESOLUÇÃO DE PROBLEMAS COMUNS:
- App lento: verifique atualizações
- Dados perdidos: restaurar backup
- Previsões incorretas: ajustar configurações
- Notificações: verificar permissões

RECURSOS AVANÇADOS:
- Correlações automáticas entre dados
- Algoritmos de previsão por idade
- Integração com dados de saúde
- Análises estatísticas detalhadas`,
};

// Detector de contexto avançado para escolher prompt apropriado
export const detectContext = (message: string, userContext: any) => {
  const msg = message.toLowerCase();
  
  // Palavras-chave expandidas e específicas
  const keywords = {
    // Emergências médicas - prioridade máxima
    emergency: [
      'sangramento muito', 'hemorragia', 'sangue demais', 'encharcando',
      'dor insuportável', 'dor terrível', 'não aguento', 'desmaiei',
      'emergência', 'socorro', 'hospital', 'pronto socorro',
      'gravidez ectópica', 'aborto', 'aborto espontâneo'
    ],
    
    // Sintomas físicos detalhados
    symptoms: [
      'dor', 'cólica', 'cólicas', 'doendo', 'dolorido',
      'enjoo', 'náusea', 'vômito', 'tontura',
      'dor de cabeça', 'enxaqueca', 'cefaleia',
      'inchaço', 'inchada', 'retenção',
      'seios doloridos', 'mama dolorida', 'peito doendo',
      'fadiga', 'cansaço', 'exausta', 'sem energia',
      'constipação', 'intestino preso', 'prisão de ventre',
      'diarreia', 'intestino solto',
      'espinhas', 'acne', 'oleosidade', 'pele oleosa'
    ],
    
    // Questões emocionais e psicológicas
    emotional: [
      'triste', 'tristeza', 'chorando', 'choro',
      'ansiosa', 'ansiedade', 'angústia',
      'deprimida', 'depressão', 'para baixo',
      'irritada', 'irritação', 'nervosa',
      'humor', 'mudança de humor', 'instável',
      'estresse', 'estressada', 'tensão',
      'autoestima', 'me sinto feia', 'insegura'
    ],
    
    // Menopausa e transições
    menopause: [
      'menopausa', 'menopausa precoce', 'climatério',
      'perimenopausa', 'pré-menopausa', 'pós-menopausa',
      'ondas de calor', 'fogachos', 'calores',
      'suores noturnos', 'suor excessivo',
      'parou de menstruar', 'não menstruo', 'amenorreia',
      'irregular', 'ciclo irregular', 'atrasada',
      'ressecamento vaginal', 'secura', 'lubrificação',
      'libido baixa', 'sem desejo', 'sexo doloroso',
      'insônia', 'não durmo', 'acordo muito',
      'ganho de peso', 'engordando', 'metabolismo lento',
      'osteoporose', 'densidade óssea', 'fraturas'
    ],
    
    // Educação sobre ciclo menstrual
    cycle: [
      'ciclo', 'ciclo menstrual', 'menstruação',
      'período', 'menstruar', 'regra',
      'ovulação', 'ovular', 'período fértil',
      'tpm', 'tensão pré-menstrual', 'síndrome pré-menstrual',
      'fluxo', 'absorvente', 'coletor', 'calcinha absorvente',
      'primeira menstruação', 'menarca',
      'duração do ciclo', 'quantos dias', 'normal',
      'atraso menstrual', 'atrasou', 'não desceu'
    ],
    
    // Gravidez e fertilidade
    pregnancy: [
      'gravidez', 'grávida', 'gestação', 'gestante',
      'tentar engravidar', 'engravidar', 'bebê',
      'fertilidade', 'fértil', 'infertilidade',
      'teste de gravidez', 'beta hcg', 'positivo',
      'enjoo matinal', 'sintomas gravidez',
      'ovulação', 'período fértil', 'temperatura basal',
      'ácido fólico', 'vitaminas pré-natal'
    ],
    
    // Bem-estar e autocuidado
    wellness: [
      'exercício', 'exercitar', 'academia', 'treino',
      'alimentação', 'dieta', 'nutrição', 'comer',
      'bem-estar', 'autocuidado', 'cuidar de mim',
      'yoga', 'meditação', 'relaxamento',
      'sono', 'dormir', 'descanso',
      'suplementos', 'vitaminas', 'ferro', 'cálcio',
      'hidratação', 'água', 'beber água',
      'peso', 'emagrecer', 'engordar'
    ],
    
    // Sexualidade e relacionamentos
    sexuality: [
      'sexo', 'sexual', 'sexualidade', 'libido',
      'desejo', 'tesão', 'vontade',
      'orgasmo', 'prazer', 'satisfação',
      'dor no sexo', 'dispareunia', 'vaginismo',
      'lubrificação', 'ressecamento', 'secura',
      'parceiro', 'namorado', 'marido',
      'relacionamento', 'intimidade'
    ],
    
    // Funcionalidades do app
    app_usage: [
      'como usar', 'não entendo', 'ajuda com app',
      'dashboard', 'gráfico', 'dados',
      'backup', 'exportar', 'compartilhar',
      'notificação', 'lembrete', 'alerta',
      'configuração', 'settings', 'personalizar'
    ],
    
    // Adolescência
    teens: [
      'primeira vez', 'virgindade', 'menina',
      'adolescente', 'puberdade', 'desenvolvimento',
      'crescimento', 'mudanças corporais',
      'pelos', 'seios crescendo', 'espinhas',
      'conversar com mãe', 'vergonha', 'normal'
    ]
  };
  
  // Detecta contextos com prioridade
  const priorities = ['emergency', 'symptoms', 'menopause', 'pregnancy', 'emotional', 'sexuality', 'teens', 'cycle', 'wellness', 'app_usage'];
  
  for (const context of priorities) {
    if (keywords[context as keyof typeof keywords]?.some((phrase: string) => msg.includes(phrase))) {
      return context;
    }
  }
  
  // Contexto específico baseado na idade
  if (userContext.age) {
    if (userContext.age < 18 && (msg.includes('normal') || msg.includes('primeira'))) {
      return 'teens';
    }
    if (userContext.age > 45 && msg.includes('sintoma')) {
      return 'menopause';
    }
  }
  
  return 'general';
};

// Sistema avançado de geração de prompts contextualizados
export const generateContextualPrompt = (message: string, userContext: any) => {
  const context = detectContext(message, userContext);
  const { age, recentSymptoms, recentMood, currentPhase } = userContext;
  
  // Prefixo base com conhecimento do app sempre incluso
  const basePrompt = `${SPECIALIZED_PROMPTS.APP_KNOWLEDGE}\n\n`;
  
  switch (context) {
    case 'emergency':
      return basePrompt + SPECIALIZED_PROMPTS.RED_FLAGS(
        message, 
        age || 25, 
        `Humor: ${recentMood}, Sintomas recentes: ${recentSymptoms?.join(', ') || 'nenhum'}`
      );
      
    case 'symptoms':
      return basePrompt + SPECIALIZED_PROMPTS.SYMPTOM_ANALYSIS(
        recentSymptoms || [], 
        recentMood || 'neutro', 
        age || 25,
        currentPhase
      ) + `\n\nPergunta específica: ${message}`;
      
    case 'menopause':
      return basePrompt + SPECIALIZED_PROMPTS.MENOPAUSE_INFO(
        age || 45, 
        recentSymptoms || [],
        userContext.lastPeriodDate
      ) + `\n\nPergunta: ${message}`;
      
    case 'pregnancy':
      return basePrompt + SPECIALIZED_PROMPTS.PREGNANCY_FERTILITY(
        age || 28,
        message.includes('tentar') || message.includes('engravidar'),
        recentSymptoms || []
      ) + `\n\nPergunta: ${message}`;
      
    case 'emotional':
      return basePrompt + SPECIALIZED_PROMPTS.EMOTIONAL_SUPPORT(
        recentMood || 'variável', 
        age || 25,
        `Usuária perguntou: ${message}`,
        currentPhase
      );
      
    case 'sexuality':
      return basePrompt + SPECIALIZED_PROMPTS.SEXUALITY_GUIDANCE(
        age || 25,
        message,
        recentSymptoms || []
      ) + `\n\nPergunta específica: ${message}`;
      
    case 'teens':
      return basePrompt + SPECIALIZED_PROMPTS.TEENS_GUIDANCE(
        age || 15,
        message,
        false // Assumindo conversa direta, não com pais
      );
      
    case 'cycle':
      return basePrompt + SPECIALIZED_PROMPTS.CYCLE_EDUCATION(message, age);
      
    case 'wellness':
      if (currentPhase && age) {
        return basePrompt + SPECIALIZED_PROMPTS.WELLNESS_BY_PHASE(
          currentPhase,
          userContext.currentDay || 1,
          age
        ) + `\n\nPergunta específica: ${message}`;
      }
      // Fallback para wellness geral
      return basePrompt + `GUIA DE BEM-ESTAR PERSONALIZADO:
Idade: ${age || 'não informada'} anos
Humor recente: ${recentMood || 'neutro'}

Pergunta: ${message}

Forneça orientações de bem-estar baseadas no conhecimento do EntreFases e saúde feminina:

1. RECOMENDAÇÕES PERSONALIZADAS:
   - Adequadas para a idade e contexto
   - Baseadas no humor e sintomas atuais
   - Considerando o ciclo menstrual

2. USO DO ENTREFASES:
   - Como registrar e acompanhar progresso
   - Métricas importantes para observar
   - Configurações recomendadas

3. ESTRATÉGIAS PRÁTICAS:
   - Implementação no dia a dia
   - Ajustes baseados em resultados
   - Manutenção de hábitos saudáveis

Responda em português brasileiro, máximo 250 palavras.`;
      
    case 'app_usage':
      const detectedFeature = message.includes('dashboard') ? 'dashboard' :
                            message.includes('sintoma') ? 'sintomas' :
                            message.includes('grafico') ? 'gráficos' :
                            message.includes('backup') ? 'backup' :
                            message.includes('exportar') ? 'exportar' : 'geral';
      
      const userLevel = age && age > 40 ? 'beginner' : 
                       recentSymptoms && recentSymptoms.length > 3 ? 'advanced' : 'intermediate';
      
      return SPECIALIZED_PROMPTS.APP_USAGE_HELP(detectedFeature, userLevel) + 
             `\n\nPergunta específica: ${message}`;
      
    default:
      // Prompt geral melhorado com contexto completo
      return basePrompt + `ASSISTENTE ESPECIALIZADA EM SAÚDE FEMININA

CONTEXTO DA USUÁRIA:
- Idade: ${age || 'não informada'} anos
- Humor recente: ${recentMood || 'neutro'}
- Fase do ciclo: ${currentPhase || 'não informada'}
- Sintomas recentes: ${recentSymptoms?.join(', ') || 'nenhum'}

PERGUNTA: "${message}"

DIRETRIZES DE RESPOSTA:
- Use linguagem empática e acolhedora
- Baseie-se em conhecimento científico atualizado
- Considere o contexto específico da usuária
- Mencione como o EntreFases pode ajudar
- Sugira acompanhamento médico quando apropriado
- Normalize experiências femininas comuns
- Ofereça dicas práticas e implementáveis

${age && age < 18 ? 'ATENÇÃO: Usuária adolescente - linguagem e informações adequadas à idade.' : ''}
${age && age > 45 ? 'ATENÇÃO: Considerar possível transição menopáusica nas orientações.' : ''}

RESPOSTA (máximo 250 palavras em português brasileiro):`;
  }
};