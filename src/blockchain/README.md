# Blockchain Module

Этот модуль содержит сервисы для работы с блокчейном и получения цен токенов.

## CoingeckoService

Сервис для получения цен токенов через CoinGecko API.

### Основные методы:

#### `getTokenPrice(tokenAddress, platform?, currency?)`
Получить цену токена по адресу контракта.

```typescript
// Пример использования
const price = await coingeckoService.getTokenPrice(
  '0xA0b86a33E6441c8C06DD2c2b4b2B0B2B2B2B2B2B', // USDC
  'ethereum',
  'usd'
);
console.log(price); // { address: '0xa0b8...', price: 1.00, currency: 'usd', lastUpdated: Date }
```

#### `getMultipleTokenPrices(tokenAddresses[], platform?, currency?)`
Получить цены нескольких токенов одновременно.

```typescript
const prices = await coingeckoService.getMultipleTokenPrices([
  '0xA0b86a33E6441c8C06DD2c2b4b2B0B2B2B2B2B2B', // USDC
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
]);
```

#### `getEthPrice(currency?)`
Получить цену ETH.

```typescript
const ethPrice = await coingeckoService.getEthPrice('usd');
console.log(ethPrice); // 2500.50
```

### API Endpoints

Модуль также предоставляет REST API для получения цен:

- `GET /prices/token/:address` - цена токена по адресу
- `GET /prices/eth` - цена ETH
- `GET /prices/cache/info` - информация о кэше
- `GET /prices/cache/clear` - очистить кэш

### Примеры запросов:

```bash
# Получить цену USDC
curl "http://localhost:3000/prices/token/0xA0b86a33E6441c8C06DD2c2b4b2B0B2B2B2B2B2B"

# Получить цену ETH в EUR
curl "http://localhost:3000/prices/eth?currency=eur"

# Получить цену токена на Polygon
curl "http://localhost:3000/prices/token/0x2791bca1f2de4661ed88a30c99a7a9449aa84174?platform=polygon-pos"
```

### Кэширование

Сервис автоматически кэширует цены на 5 минут для оптимизации производительности и снижения нагрузки на CoinGecko API.

### Поддерживаемые платформы:

- `ethereum` (по умолчанию)
- `polygon-pos`
- `binance-smart-chain`
- `avalanche`
- `arbitrum-one`
- `optimistic-ethereum`

### Поддерживаемые валюты:

- `usd` (по умолчанию)
- `eur`
- `btc`
- `eth`
- И многие другие...
