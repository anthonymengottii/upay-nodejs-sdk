<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="logo/light.png">
    <source media="(prefers-color-scheme: light)" srcset="logo/dark.png">
    <img src="logo/dark.png" alt="Upay" height="60">
  </picture>
</p>

# @upay/upay-js

SDK oficial da Upay para JavaScript/TypeScript. Integre facilmente pagamentos PIX, cartão de crédito e boleto no seu sistema.

## 📦 Instalação

```bash
npm install @upay/upay-js
# ou
yarn add @upay/upay-js
# ou
pnpm add @upay/upay-js
```

## 🚀 Uso Básico

### Inicialização

```typescript
import UpayClient from '@upay/upay-js';

const upay = new UpayClient({
  apiKey: 'sua_api_key_aqui',
  // Opcional: customizar URL base
  // baseUrl: 'https://upay-sistema-api.onrender.com',
  // version: 'v1',
});
```

### Criar um Link de Pagamento

```typescript
const paymentLink = await upay.paymentLinks.create({
  title: 'Produto Premium',
  description: 'Descrição do produto',
  amount: 10000, // R$ 100,00 em centavos
  currency: 'BRL',
  settings: {
    pixEnabled: true,
    creditCardEnabled: true,
    maxInstallments: 12,
    interestFreeInstallments: 3,
  },
});

console.log('Link criado:', paymentLink.slug);
console.log('URL do checkout:', upay.paymentLinks.getCheckoutUrl(paymentLink.slug));
```

### Criar uma Transação

```typescript
const transaction = await upay.transactions.create({
  product: 'Produto Teste',
  amountCents: 5000, // R$ 50,00
  paymentMethod: 'PIX',
  client: {
    name: 'João Silva',
    email: 'joao@example.com',
    document: '12345678900',
  },
});

console.log('Transação criada:', transaction.id);
if (transaction.pixQrCode) {
  console.log('QR Code PIX:', transaction.pixQrCode);
}
```

### Listar Transações

```typescript
const { data: transactions, pagination } = await upay.transactions.list({
  page: 1,
  limit: 20,
  status: 'PAID',
});

console.log(`Total: ${pagination.total} transações`);
transactions.forEach(tx => {
  console.log(`${tx.product}: R$ ${(tx.amountCents / 100).toFixed(2)}`);
});
```

### Gerenciar Produtos

```typescript
// Criar produto
const product = await upay.products.create({
  name: 'Produto Exemplo',
  description: 'Descrição do produto',
  price: 5000, // R$ 50,00
  stock: 100,
  sku: 'PROD-001',
});

// Listar produtos
const { data: products } = await upay.products.list();

// Atualizar produto
await upay.products.update(product.id, {
  price: 4500, // R$ 45,00
  stock: 95,
});
```

### Validar Cupom de Desconto

```typescript
const validation = await upay.coupons.validate({
  code: 'DESCONTO10',
  amountCents: 10000, // R$ 100,00
});

if (validation.valid) {
  console.log(`Desconto: R$ ${(validation.discountCents! / 100).toFixed(2)}`);
  console.log(`Valor final: R$ ${(validation.finalAmountCents! / 100).toFixed(2)}`);
}
```

### Gerenciar Clientes

```typescript
// Criar cliente
const client = await upay.clients.create({
  name: 'João Silva',
  email: 'joao@example.com',
  document: '12345678900',
  phone: '11999999999',
});

// Listar clientes
const { data: clients } = await upay.clients.list();

// Atualizar cliente
await upay.clients.update(client.id, {
  phone: '11988888888',
});
```

## 🔔 Webhooks

### Verificar Assinatura do Webhook

```typescript
import express from 'express';

const app = express();

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = upay.extractWebhookSignature(req.headers);
  const secret = process.env.WEBHOOK_SECRET; // Secret da sua API key
  
  if (!signature || !upay.verifyWebhookSignature(req.body, signature, secret)) {
    return res.status(401).json({ error: 'Assinatura inválida' });
  }

  const event = JSON.parse(req.body.toString());
  
  switch (event.type) {
    case 'transaction.paid':
      console.log('Transação paga:', event.data);
      break;
    case 'transaction.failed':
      console.log('Transação falhou:', event.data);
      break;
  }

  res.json({ received: true });
});
```

## 📚 Recursos Disponíveis

### Payment Links
- `create()` - Criar link de pagamento
- `list()` - Listar links
- `get(id)` - Obter por ID
- `getBySlug(slug)` - Obter por slug
- `update(id, data)` - Atualizar
- `delete(id)` - Deletar
- `getCheckoutUrl(slug)` - Obter URL do checkout

### Transações
- `create()` - Criar transação
- `list()` - Listar transações
- `get(id)` - Obter por ID
- `process(id, data)` - Processar pagamento
- `capture(id)` - Capturar transação autorizada
- `cancel(id)` - Cancelar transação
- `refund(id, amount?)` - Estornar transação

### Produtos
- `create()` - Criar produto
- `list()` - Listar produtos
- `get(id)` - Obter por ID
- `update(id, data)` - Atualizar
- `delete(id)` - Deletar

### Cupons
- `validate(data)` - Validar cupom

### Clientes
- `create()` - Criar cliente
- `list()` - Listar clientes
- `get(id)` - Obter por ID
- `update(id, data)` - Atualizar

## 🔧 Configuração

### Opções do Cliente

```typescript
const upay = new UpayClient({
  apiKey: 'sua_api_key',        // Obrigatório
  baseUrl: 'https://...',        // Opcional (padrão: https://upay-sistema-api.onrender.com)
  version: 'v1',                 // Opcional (padrão: 'v1')
  timeout: 30000,               // Opcional (padrão: 30000ms)
});
```

## 🛠️ Tratamento de Erros

O SDK lança erros específicos que você pode capturar:

```typescript
import { 
  UpayError,
  UpayAuthenticationError,
  UpayValidationError,
  UpayNotFoundError,
  UpayRateLimitError 
} from '@upay/upay-js';

try {
  await upay.paymentLinks.create({ title: 'Test' });
} catch (error) {
  if (error instanceof UpayAuthenticationError) {
    console.error('Erro de autenticação:', error.message);
  } else if (error instanceof UpayValidationError) {
    console.error('Erro de validação:', error.message, error.details);
  } else if (error instanceof UpayRateLimitError) {
    console.error('Limite de requisições excedido');
  } else {
    console.error('Erro desconhecido:', error);
  }
}
```

## 📖 Exemplos Completos

Veja a pasta `examples/` para exemplos mais detalhados:
- `payment-link.ts` - Exemplo completo de link de pagamento
- `transaction.ts` - Exemplo completo de transação
- `webhook.ts` - Exemplo completo de webhook

## 🔗 Links Úteis

- [Documentação da API](https://docs.upaybr.com)
- [Dashboard](https://app.upaybr.com)
- [Suporte](mailto:suporte@upaybr.com)
- [Repositório](https://github.com/anthonymengottii/upay-nodejs-sdk)
- [Issues](https://github.com/anthonymengottii/upay-nodejs-sdk/issues)

## 🤝 Contribuindo

Pull requests são bem-vindos! Veja as [issues abertas](https://github.com/anthonymengottii/upay-nodejs-sdk/issues) para sugestões.

## 📝 Licença

MIT
