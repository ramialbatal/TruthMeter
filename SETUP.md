# TruthMeter Setup Guide

## Quick Start

Follow these steps to get TruthMeter running locally:

### 1. Get API Keys

#### Anthropic Claude API
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-...`)

#### Tavily Search API
1. Go to https://tavily.com/
2. Sign up for a free account
3. Go to your dashboard
4. Copy your API key

### 2. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your keys:
# ANTHROPIC_API_KEY=sk-ant-...
# TAVILY_API_KEY=tvly-...
```

### 3. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Start the Application

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
TruthMeter API server running on http://localhost:3001
Ready to fact-check tweets!
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

### 5. Open the App

Open your browser to: http://localhost:5173

## Testing the App

Try pasting this example tweet:

```
The Earth is flat and scientists have been lying to us for centuries.
```

Click "Analyze Tweet" and watch the magic happen!

## Troubleshooting

### "ANTHROPIC_API_KEY is required"
- Make sure you created `.env` file in the root directory
- Verify the API key is correct and starts with `sk-ant-`

### "TAVILY_API_KEY is required"
- Make sure you added the Tavily API key to `.env`
- Verify the key is correct

### Port already in use
- Backend: Change `PORT=3001` in `.env` to a different port
- Frontend: Change port in `frontend/vite.config.ts`

### Database errors
- Delete `truthmeter.db` file and restart the backend
- The database will be recreated automatically

## Project Structure

```
truthmeter/
├── backend/           # Node.js API server
│   └── src/
│       ├── services/  # Tavily, Claude, FactChecker
│       ├── routes/    # API endpoints
│       └── db/        # SQLite cache
├── frontend/          # React UI
│   └── src/
│       ├── components/ # UI components
│       └── api/       # API client
└── CLAUDE.md         # Full documentation
```

## Next Steps

- Read [CLAUDE.md](./CLAUDE.md) for detailed documentation
- Customize the UI in `frontend/src/components/`
- Adjust fact-checking logic in `backend/src/services/`
- Add more features!

## Common Commands

```bash
# Backend
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Run production build

# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Need Help?

Check the main documentation in [CLAUDE.md](./CLAUDE.md)
