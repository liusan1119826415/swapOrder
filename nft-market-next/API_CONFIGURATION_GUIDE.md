# API Configuration Guide

## 📋 Overview

This guide explains how to configure the backend API connection for the NFT Marketplace frontend application.

---

## 🔧 Configuration Files

### 1. `.env.local` (Local Development)

**Location:** `nft-market-next/.env.local`

This file contains your local environment variables and should **NOT** be committed to git.

```env
# Backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:8080

# Default chain ID (1=Ethereum, 10=Optimism, 11155111=Sepolia)
NEXT_PUBLIC_DEFAULT_CHAIN_ID=11155111

# Supported chains (comma-separated chain IDs)
NEXT_PUBLIC_SUPPORTED_CHAINS=1,10,11155111

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_AUCTIONS=true
NEXT_PUBLIC_ENABLE_DROPS=true
```

### 2. `.env.example` (Template)

**Location:** `nft-market-next/.env.example`

This is a template file that should be committed to git. Users copy this to create their own `.env.local`.

---

## 🎯 Configuration Management

### Using the Config Module

The configuration is centralized in `lib/config/index.ts`:

```typescript
import { config } from '@/lib/config';

// Access API configuration
console.log(config.api.baseUrl);      // http://localhost:8080
console.log(config.api.version);      // v1
console.log(config.api.timeout);      // 30000

// Access chain configuration
console.log(config.chains.defaultChainId);     // 11155111
console.log(config.chains.supportedChains);    // [1, 10, 11155111]

// Access feature flags
console.log(config.features.analytics);  // true
console.log(config.features.auctions);   // true
console.log(config.features.drops);      // true

// Helper functions
const endpoint = config.getApiEndpoint('/collections/ranking');
// Returns: http://localhost:8080/api/v1/collections/ranking

const isSupported = config.isChainSupported(11155111);
// Returns: true
```

### API Client Integration

The API client (`lib/api/client.ts`) automatically uses the configuration:

```typescript
import { config } from '@/lib/config';

// Base URL is now from config
const apiClient = axios.create({
  baseURL: `${config.api.baseUrl}/api/${config.api.version}`,
  timeout: config.api.timeout,
  // ...
});
```

---

## 🌍 Environment Examples

### Local Development

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_DEFAULT_CHAIN_ID=11155111
```

### Staging Environment

```env
NEXT_PUBLIC_API_URL=https://staging-api.easyswap.io
NEXT_PUBLIC_DEFAULT_CHAIN_ID=11155111
```

### Production Environment

```env
NEXT_PUBLIC_API_URL=https://api.easyswap.io
NEXT_PUBLIC_DEFAULT_CHAIN_ID=1
NEXT_PUBLIC_SUPPORTED_CHAINS=1,10
```

---

## ⚙️ Available Configuration Options

### API Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8080` | `https://api.easyswap.io` |

### Chain Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_DEFAULT_CHAIN_ID` | Default blockchain network | `11155111` (Sepolia) | `1` (Ethereum) |
| `NEXT_PUBLIC_SUPPORTED_CHAINS` | List of supported chains | `1,10,11155111` | `1,10` |

### Feature Flags

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics features | `true` | `true` / `false` |
| `NEXT_PUBLIC_ENABLE_AUCTIONS` | Enable auction features | `true` | `true` / `false` |
| `NEXT_PUBLIC_ENABLE_DROPS` | Enable drops features | `true` | `true` / `false` |

---

## 🚀 Usage in Components

### Example: Using Configuration in a Component

```typescript
'use client';

import { config } from '@/lib/config';
import { useCollectionsRanking } from '@/lib/hooks/useCollections';

export default function TrendingCollections() {
  // Use configuration
  const defaultChain = config.chains.defaultChainId;
  
  // Fetch data based on configured chain
  const { data } = useCollectionsRanking(10, '1d');
  
  return (
    <div>
      <h2>Trending on {config.chainIdToName[defaultChain]}</h2>
      {/* Render collections */}
    </div>
  );
}
```

### Example: Conditional Features

```typescript
import { config } from '@/lib/config';

export function AuctionsPage() {
  // Check if auctions are enabled
  if (!config.features.auctions) {
    return <div>Auctions are currently disabled</div>;
  }
  
  return <AuctionList />;
}
```

---

## 📝 Best Practices

1. **Never commit `.env.local`** - Add it to `.gitignore`
2. **Always update `.env.example`** when adding new config options
3. **Use the config module** instead of accessing `process.env` directly
4. **Validate configuration** on application startup
5. **Use meaningful defaults** in the config module

---

## 🔒 Security Notes

- All `NEXT_PUBLIC_*` variables are exposed to the browser
- Never store sensitive secrets (API keys, passwords) in `NEXT_PUBLIC_*` variables
- For server-side secrets, use regular environment variables without the `NEXT_PUBLIC_` prefix

---

## 🐛 Troubleshooting

### Issue: Configuration not loading

**Solution:** Restart the development server after changing `.env.local`

```bash
npm run dev
```

### Issue: TypeScript errors

**Solution:** Ensure proper types are defined in `lib/config/index.ts`

### Issue: API calls failing

**Solution:** Verify `NEXT_PUBLIC_API_URL` is correct and backend is running

```bash
# Test backend connection
curl http://localhost:8080/api/v1/collections/ranking?limit=1
```

---

## 📚 Related Files

- `lib/config/index.ts` - Configuration management
- `lib/api/client.ts` - API client using configuration
- `.env.local` - Your local configuration (not in git)
- `.env.example` - Configuration template (in git)

---

## ✅ Quick Setup

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Update values in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

That's it! Your frontend is now configured to connect to the backend.
