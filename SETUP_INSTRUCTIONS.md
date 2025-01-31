# InboxZero Setup Instructions

This guide details how to set up a local development environment for InboxZero (https://github.com/elie222/inbox-zero).

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.6.12
- Docker desktop (optional)

## 1. Required Services

### 1.1 PostgreSQL Database

Default configuration expects:

- Host: localhost:5432
- Database name: inboxzero
- Username: postgres
- Password: password

### 1.2 Google OAuth Credentials

1. Go to https://console.cloud.google.com
2. Create a new project or use existing one
3. Enable Gmail API and Google OAuth2 API
4. Create OAuth 2.0 credentials
5. Set authorized redirect URI to http://localhost:3000/api/auth/callback/google
6. Add CLIENT_ID and CLIENT_SECRET to environment variables

### 1.3 Redis

For local development:

- Can be run via Docker
- Expected on http://localhost:8079

## 2. Environment Variables

### 2.1 Required Secret Keys

Generate the following using https://generate-secret.vercel.app/32:

- NEXTAUTH_SECRET
- UPSTASH_REDIS_TOKEN
- API_KEY_SALT
- ENCRYPT_SECRET
- ENCRYPT_SALT

### 2.2 API Keys

OpenAI API Key:

- Get from https://platform.openai.com/account/api-keys
- Set as OPENAI_API_KEY in .env

## 3. Optional Components

The following services are optional but recommended for full functionality:

- **Tinybird**: For analytics
- **Google PubSub**: For real-time updates
- **Sentry**: For error tracking
- **PostHog**: For analytics
- **Resend**: For email sending

## Development Setup Steps

1. Clone the repository:

```bash
git clone https://github.com/elie222/inbox-zero.git
```

2. Install dependencies:

```bash
cd inbox-zero
pnpm install
```

3. Copy example environment file:

```bash
cp apps/web/.env.example apps/web/.env
```

4. Configure all required environment variables in the .env file

5. Start the development server (after all services are set up):

```bash
pnpm dev
```
