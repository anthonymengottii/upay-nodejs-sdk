/**
 * Exemplo: Criar e gerenciar links de pagamento
 */

import UpayClient from '../src/index';

async function exemploPaymentLink() {
  // Inicializar cliente
  const upay = new UpayClient({
    apiKey: process.env.UPAY_API_KEY || 'sua_api_key_aqui',
  });

  try {
    // 1. Criar um link de pagamento simples
    console.log('📝 Criando link de pagamento...');
    const paymentLink = await upay.paymentLinks.create({
      title: 'Produto Premium',
      description: 'Acesso completo à plataforma',
      amount: 10000, // R$ 100,00
      currency: 'BRL',
      settings: {
        pixEnabled: true,
        creditCardEnabled: true,
        boletoEnabled: true,
        maxInstallments: 12,
        interestFreeInstallments: 3,
        requirePhone: true,
        requireAddress: false,
      },
    });

    console.log('✅ Link criado com sucesso!');
    console.log('ID:', paymentLink.id);
    console.log('Slug:', paymentLink.slug);
    console.log('URL do checkout:', upay.paymentLinks.getCheckoutUrl(paymentLink.slug));

    // 2. Criar link com produtos
    console.log('\n📦 Criando link com produtos...');
    const productLink = await upay.paymentLinks.create({
      title: 'Pacote Completo',
      description: 'Pacote com múltiplos produtos',
      products: [
        { productId: 'produto-id-1', quantity: 2 },
        { productId: 'produto-id-2', quantity: 1 },
      ],
      currency: 'BRL',
      settings: {
        pixEnabled: true,
        creditCardEnabled: true,
      },
    });

    console.log('✅ Link com produtos criado!');
    console.log('Slug:', productLink.slug);

    // 3. Listar links
    console.log('\n📋 Listando links de pagamento...');
    const { data: links, pagination } = await upay.paymentLinks.list({
      page: 1,
      limit: 10,
      status: 'ACTIVE',
    });

    console.log(`Total: ${pagination.total} links`);
    links.forEach(link => {
      console.log(`- ${link.title}: ${link.slug}`);
    });

    // 4. Atualizar link
    console.log('\n✏️ Atualizando link...');
    const updatedLink = await upay.paymentLinks.update(paymentLink.id, {
      description: 'Descrição atualizada',
      amount: 12000, // R$ 120,00 (convertido para amountCents internamente)
    });

    console.log('✅ Link atualizado!');
    console.log('Nova descrição:', updatedLink.description);
    // A API retorna amountCents na resposta, mesmo que usemos 'amount' na requisição
    console.log('Novo valor:', updatedLink.amountCents);

    // 5. Obter link por slug
    console.log('\n🔍 Buscando link por slug...');
    const foundLink = await upay.paymentLinks.getBySlug(paymentLink.slug);
    console.log('Link encontrado:', foundLink.title);

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    if (error.details) {
      console.error('Detalhes:', error.details);
    }
  }
}

// Executar exemplo
if (require.main === module) {
  exemploPaymentLink();
}

export default exemploPaymentLink;
