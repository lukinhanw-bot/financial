const Transaction = require('./server/models/Transaction');

async function testRecurringFix() {
  console.log('🧪 Testando correção de duplicação de transações recorrentes...\n');
  
  try {
    // Limpar transações existentes de teste
    console.log('🧹 Limpando transações de teste anteriores...');
    const existingTransactions = await Transaction.findAll('test-user');
    for (const transaction of existingTransactions) {
      if (transaction.description.includes('teste final')) {
        if (transaction.is_recurring) {
          await Transaction.deleteRecurring(transaction.id, 'test-user');
        } else {
          await Transaction.delete(transaction.id, 'test-user');
        }
      }
    }
    
    // Criar transação recorrente de teste
    console.log('📝 Criando transação recorrente de teste...');
    const testTransaction = new Transaction({
      user_id: 'test-user',
      type: 'expense',
      amount: 100.00,
      description: 'teste final',
      category: 'Teste',
      date: '2024-01-15',
      is_recurring: true,
      recurring_type: 'monthly',
      recurring_interval: 1,
      recurring_end_date: '2024-05-15'
    });
    
    // Gerar instâncias
    console.log('🔄 Gerando instâncias recorrentes...');
    const generatedTransactions = await Transaction.generateAllRecurringInstances(testTransaction, new Date(), 'test-user');
    
    console.log(`✅ Geradas ${generatedTransactions.length} transações`);
    
    // Verificar resultados
    console.log('\n📊 Verificando transações geradas:');
    const allTransactions = await Transaction.findAll('test-user');
    const testTransactions = allTransactions.filter(t => t.description.includes('teste final'));
    
    console.log(`\nTotal de transações encontradas: ${testTransactions.length}`);
    
    testTransactions.forEach((transaction, index) => {
      console.log(`${index + 1}. ${transaction.description} - ${transaction.date} - is_recurring: ${transaction.is_recurring}`);
    });
    
    // Verificar se não há duplicação
    const originalCount = testTransactions.filter(t => t.description === 'teste final').length;
    const numberedCount = testTransactions.filter(t => t.description.includes('teste final') && t.description.includes('/')).length;
    
    console.log(`\n🔍 Análise:`);
    console.log(`- Transações originais (sem numeração): ${originalCount}`);
    console.log(`- Transações numeradas: ${numberedCount}`);
    
    if (originalCount === 0 && numberedCount === 5) {
      console.log('✅ SUCESSO: Não há duplicação! Apenas as 5 instâncias numeradas foram criadas.');
    } else if (originalCount > 0) {
      console.log('❌ ERRO: Ainda há transações originais duplicadas!');
    } else {
      console.log('⚠️  AVISO: Número de transações não esperado.');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar teste
testRecurringFix();
