# Velox - AI-Powered Finance News Hub

Velox is a modern finance web application that combines real-time market news with AI-powered summarization and interactive chat capabilities. Built as a unified platform to help users stay informed about financial markets without jumping between multiple services.

## Features

- **Real-time Finance News** - Get the latest market news across categories (general, forex, crypto, merger)
- **AI Summarization** - Automatically generate concise summaries with sentiment analysis for any article
- **Interactive AI Chat** - Ask questions about specific articles and get AI-powered responses
- **Company News** - Search news by stock ticker symbol
- **Sentiment Analysis** - AI-powered bullish/bearish sentiment detection on articles

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Backend | Hono.js, AWS Lambda |
| Database | PostgreSQL, Prisma ORM |
| AI | Google Gemini API |
| Data Provider | Finnhub API |
| Infrastructure | AWS CDK |
| Package Manager | Bun |
| Monorepo | Turborepo |

## Project Structure

```
velox/
├── apps/
│   └── web/                 # Next.js frontend application
│       ├── app/             # App Router pages
│       │   └── (landing)/  # Landing page routes
│       ├── components/     # React components
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Utility functions
│       └── providers/      # React context providers
├── packages/
│   ├── server/             # Backend API (AWS Lambda)
│   │   ├── prisma/        # Database schema
│   │   ├── src/
│   │   │   ├── routes/    # API route handlers
│   │   │   │   ├── news/  # News endpoints
│   │   │   │   └── chat/  # AI chat endpoints
│   │   │   ├── services/  # Business logic
│   │   │   │   ├── cache.ts
│   │   │   │   └── gemini.ts
│   │   │   └── lib/        # Shared utilities
│   │   ├── infra/         # AWS CDK infrastructure
│   │   └── lambda/        # Lambda entry point
│   ├── eslint-config/     # ESLint configuration
│   └── typescript-config/ # TypeScript configuration
└── turbo.json              # Turborepo configuration
```

## API Documentation

### News Endpoints

#### Get Market News
```
GET /news?category=general&page=1&limit=10
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| category | string | "general" | News category: general, forex, crypto, merger |
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |

**Response:**
```json
{
  "data": [
    {
      "id": "12345678",
      "headline": "Market Update: Stocks Rise",
      "summary": "...",
      "source": "Reuters",
      "url": "https://...",
      "image": "https://...",
      "datetime": 1699900000,
      "category": "general",
      "related": "AAPL,GOOGL"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### Get Article Details
```
GET /news/:id
```

#### Get Company News
```
GET /ticker/AAPL?days=7
```

| Parameter | Type | Description |
|-----------|------|-------------|
| symbol | path | Stock ticker symbol (e.g., AAPL, GOOGL) |
| days | query | Number of days to look back (default: 7) |

### AI Chat Endpoints

#### Chat About Article
```
POST /chat
Content-Type: application/json

{
  "article": { ... },
  "message": [
    { "role": "user", "content": "What does this article mean?" }
  ]
}
```

Returns a streaming text response.

#### Summarize Article
```
POST /summarize
Content-Type: application/json

{
  "articleId": "12345678",
  "headline": "Market Update",
  "summary": "Full article summary...",
  "url": "https://..."
}
```

**Response:**
```json
{
  "bullets": [
    "Key point 1",
    "Key point 2"
  ],
  "sentiment": "bullish",
  "sentimentReason": "The article discusses positive market trends...",
  "keyTickers": ["AAPL", "MSFT"],
  "oneLineSummary": "Markets show positive momentum amid earnings reports"
}
```

## Environment Variables

Create a `.env` file in `packages/server/` with the following variables:

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Environment (development, production) |
| `PORT` | Server port (default: 4000) |
| `FRONTEND_URL` | Frontend URL for CORS |
| `FINNHUB_API_KEY` | API key from [Finnhub.io](https://finnhub.io/) |
| `GEMINI_API_KEY` | API key from [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `DATABASE_URL` | PostgreSQL connection string |
| `DIRECT_URL` | Direct database connection for Prisma |
| `LOG_LEVEL` | Logging level (debug, info, warn, error, silent) |

## Development Setup

### Prerequisites

- Node.js 18+
- [Bun](https://bun.sh/) package manager
- PostgreSQL database
- Finnhub API key (free tier available)
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd velox
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp packages/server/.env.example packages/server/.env
   # Edit .env with your API keys and database URL
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   bun run db:generate

   # Run migrations
   bun run db:migrate:dev

   # (Optional) Seed database
   bun run db:seed
   ```

5. **Start development servers**
   ```bash
   # Run all apps in development mode
   bun run dev

   # Or run specific apps:
   bun run dev --filter=web     # Frontend only
   bun run dev --filter=server  # Backend only
   ```

### Running the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000

### Running Tests

```bash
# Run all tests
bun test

# Run tests for server package
cd packages/server && bun test
```

## Deployment

The backend is deployed as an AWS Lambda function using AWS CDK. For detailed deployment instructions, see [packages/server/deploy.md](packages/server/deploy.md).

### Quick Deploy

```bash
cd packages/server

# Build the project
bun run build

# Deploy to AWS
cdk deploy
```

## Contributing

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration (run `bun run lint` before committing)
- Use Prettier for formatting (run `bun run format` before committing)

### Commit Messages

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Adding/updating tests

### Testing

All new features should include tests. Run tests before submitting a PR:

```bash
bun run lint
bun run check-types
bun test
```

## License

MIT
