/**
 * Exemplo: Criar e gerenciar transações
 */

import UpayClient from '../src/index';

async function exemploTransacao() {
  // Inicializar cliente
  const upay = new UpayClient({
    apiKey: process.env.UPAY_API_KEY || 'sua_api_key_aqui',
  });

  try {
    // 1. Criar uma transação PIX
    console.log('💳 Criando transação PIX...');
    const transaction = await upay.transactions.create({
      product: 'Produto Teste',
      amountCents: 5000, // R$ 50,00
      paymentMethod: 'PIX',
      client: {
        name: 'João Silva',
        email: 'joao@example.com',
        document: '12345678900',
        phone: '11999999999',
      },
      metadata: {
        orderId: '12345',
        source: 'website',
      },
    });

    console.log('✅ Transação criada!');
    console.log('ID:', transaction.id);
    console.log('Status:', transaction.status);
    
    if (transaction.pixQrCode) {
      console.log('QR Code PIX:', transaction.pixQrCode);
    }
    if (transaction.pixCopyPaste) {
      console.log('Código PIX (copiar e colar):', transaction.pixCopyPaste);
    }

    // 2. Consultar transação
    console.log('\n🔍 Consultando transação...');
    const tx = await upay.transactions.get(transaction.id);
    console.log('Status atual:', tx.status);
    console.log('Valor:', `R$ ${(tx.amountCents / 100).toFixed(2)}`);

    // 3. Listar transações
    console.log('\n📋 Listando transações...');
    const { data: transactions, pagination } = await upay.transactions.list({
      page: 1,
      limit: 10,
      status: 'PAID',
    });

    console.log(`Total: ${pagination.total} transações pagas`);
    transactions.forEach(tx => {
      console.log(`- ${tx.product}: R$ ${(tx.amountCents / 100).toFixed(2)} - ${tx.status}`);
    });

    // 4. Criar transação com cupom
    console.log('\n🎟️ Criando transação com cupom...');
    const validation = await upay.coupons.validate({
      code: 'DESCONTO10',
      amountCents: 10000, // R$ 100,00
    });

    if (validation.valid) {
      console.log('Cupom válido!');
      console.log('Desconto:', `R$ ${(validation.discountCents! / 100).toFixed(2)}`);
      console.log('Valor final:', `R$ ${(validation.finalAmountCents! / 100).toFixed(2)}`);

      const txWithCoupon = await upay.transactions.create({
        product: 'Produto com Desconto',
        amountCents: validation.finalAmountCents!,
        paymentMethod: 'PIX',
        couponCode: 'DESCONTO10',
        client: {
          name: 'Maria Santos',
          email: 'maria@example.com',
        },
      });

      console.log('✅ Transação com cupom criada:', txWithCoupon.id);
    }

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    if (error.details) {
      console.error('Detalhes:', error.details);
    }
  }
}

// Executar exemplo quando rodado diretamente
// Suporta tanto CommonJS quanto ES modules
const isMainModule = 
  (typeof require !== 'undefined' && require.main === module) || // CommonJS
  (typeof import.meta !== 'undefined' && import.meta.url && 
   process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]); // ES module

if (isMainModule) {
  exemploTransacao();
}

export default exemploTransacao;
