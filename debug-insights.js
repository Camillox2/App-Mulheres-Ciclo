// debug-insights.js - Teste rápido dos insights
console.log('🧠 Testando sistema de insights...');

// Simula dados do ciclo
const testCycleData = {
  lastPeriodDate: '2024-01-15',
  averageCycleLength: 28,
  averagePeriodLength: 5,
  age: 32,
  irregularCycle: false
};

// Simula dados de anotações
const testNotesData = [
  { date: '2024-01-20', mood: 'happy', energy: 4 },
  { date: '2024-01-21', mood: 'calm', energy: 3 },
  { date: '2024-01-22', mood: 'tired', energy: 2 },
];

// Simula dados de sintomas
const testSymptomsData = [
  { date: '2024-01-20', symptoms: { cramps: 3, headache: 2 } },
  { date: '2024-01-21', symptoms: { bloating: 2, fatigue: 3 } },
];

// Simula dados de menopausa
const testMenopauseData = {
  age: 48,
  symptoms: ['hot_flashes', 'night_sweats'],
  stage: 'perimenopausa'
};

console.log('✅ Dados de teste criados');
console.log('📊 CycleData:', testCycleData);
console.log('📝 NotesData:', testNotesData.length, 'registros');
console.log('🌡️ SymptomsData:', testSymptomsData.length, 'registros');
console.log('🌸 MenopauseData:', testMenopauseData);

console.log('\n🎯 Para testar:');
console.log('1. Abra a página de Insights');
console.log('2. Verifique se aparecem insights básicos');
console.log('3. Teste a página de Menopausa');
console.log('4. Selecione sintomas e veja se o estágio muda');
console.log('5. Verifique os logs no console');