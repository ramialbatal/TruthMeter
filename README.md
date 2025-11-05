# TruthMeter 🔍

**A Twitter/X post fact-checker that analyzes claims against credible web sources using AI.**

TruthMeter helps you verify the accuracy of social media posts by automatically searching credible sources and providing an AI-powered analysis with factual accuracy scores, supporting evidence, and source citations.

---

## ✨ Features

- **Automated Fact-Checking**: Paste any tweet text and get instant fact-check results
- **AI-Powered Analysis**: Uses GPT-4 to analyze claims against credible sources
- **Source Citations**: View all sources used in the analysis with direct links
- **Accuracy Scoring**: Get clear metrics including:
  - Overall factual accuracy score (0-100)
  - Agreement percentage (sources supporting the claim)
  - Disagreement percentage (sources contradicting the claim)
- **Smart Caching**: Results are cached for 7 days to speed up repeated queries
- **Clean UI**: Simple, intuitive interface built with React and Tailwind CSS

---

## 🚀 Quick Start

### Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))
- **Tavily Search API Key** ([Get one here](https://tavily.com/))

### Installation & Setup

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/TruthMeter.git
cd TruthMeter
```

#### 2️⃣ Set Up Environment Variables

Create a `.env` file in the **root directory**:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Backend Configuration
PORT=3001
OPENAI_API_KEY=sk-your-openai-api-key-here
TAVILY_API_KEY=tvly-your-tavily-api-key-here
DATABASE_PATH=./truthmeter.db
```

> **💡 How to get API keys:**
>
> **OpenAI API Key:**
> 1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
> 2. Sign up or log in
> 3. Click "Create new secret key"
> 4. Copy the key (starts with `sk-`)
>
> **Tavily API Key:**
> 1. Go to [tavily.com](https://tavily.com/)
> 2. Sign up for a free account
> 3. Find your API key in the dashboard
> 4. Copy the key (starts with `tvly-`)

#### 3️⃣ Install Dependencies

**For the Backend:**
```bash
cd backend
npm install
```

**For the Frontend:**
```bash
cd ../frontend
npm install
```

#### 4️⃣ Start the Application

You'll need **two terminal windows/tabs**:

**Terminal 1 - Start Backend Server:**
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3001
✅ Database initialized
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v6.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

#### 5️⃣ Open in Browser

Navigate to **http://localhost:5173** in your web browser.

---

## 📖 How to Use

1. **Paste Tweet Text**: Copy any tweet/post text and paste it into the input field
2. **Click "Check Facts"**: The system will analyze the content (takes 10-30 seconds)
3. **View Results**: See the accuracy score, analysis summary, and source citations
4. **Explore Sources**: Click on source links to verify information yourself

### Example

Try pasting this sample tweet:
```
"Breaking: Scientists discover that drinking 8 glasses of water a day is actually a myth with no scientific backing."
```

The system will search for credible sources, analyze them, and provide:
- An accuracy score
- Percentage of sources agreeing/disagreeing
- A summary of findings
- Links to all sources used

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Query** for API state management
- **React Hook Form** for form handling

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **SQLite** with Better-SQLite3 for caching
- **OpenAI GPT-4** for AI analysis
- **Tavily Search API** for finding credible sources

---

## 📁 Project Structure

```
TruthMeter/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── api/          # API client
│   │   └── types/        # TypeScript types
│   └── package.json
│
├── backend/              # Express backend
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   ├── db/          # Database layer
│   │   └── types/       # TypeScript types
│   └── package.json
│
├── .env                 # Your API keys (don't commit!)
├── .env.example         # Template for environment variables
└── README.md           # This file
```

---

## 🔧 Troubleshooting

### Backend won't start

**Error: "OPENAI_API_KEY is required"**
- Make sure you have a `.env` file in the root directory
- Verify your OpenAI API key is correctly set in `.env`
- The key should start with `sk-`

**Error: "EADDRINUSE: address already in use :::3001"**
- Port 3001 is already in use
- Either stop the other process or change the PORT in `.env`

### Frontend can't connect to backend

**Error: "Failed to fetch" or "Network Error"**
- Make sure the backend is running on port 3001
- Check that `VITE_API_URL` in `frontend/.env` is set to `http://localhost:3001`
- Verify CORS is enabled (it should be by default)

### API Errors

**Error: "Failed to analyze tweet"**
- Check your OpenAI API key is valid and has credits
- Verify your Tavily API key is correct
- Check the backend console for detailed error messages

**Error: "Rate limit exceeded"**
- You've hit the OpenAI or Tavily API rate limits
- Wait a few minutes and try again
- Consider upgrading your API plan

### Database Issues

**Error: "Database locked"**
- Close any other instances of the backend
- Delete `truthmeter.db` and restart (will clear cache)

---

## 🧪 Development Commands

### Backend

```bash
cd backend
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Run production server
npm run type-check   # Check TypeScript types
```

### Frontend

```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Check TypeScript types
```

---

## 🌐 API Endpoints

### POST /api/analyze
Analyzes a tweet for factual accuracy.

**Request:**
```json
{
  "tweetText": "Your tweet text here..."
}
```

**Response:**
```json
{
  "id": "uuid",
  "tweetText": "Your tweet text here...",
  "accuracyScore": 75,
  "agreementScore": 60,
  "disagreementScore": 20,
  "summary": "Analysis summary...",
  "sources": [
    {
      "url": "https://example.com/article",
      "title": "Article Title",
      "snippet": "Relevant excerpt...",
      "relevance": "supporting"
    }
  ],
  "analyzedAt": "2025-11-05T10:30:00Z",
  "cached": false
}
```

---

## 📚 Additional Documentation

See [CLAUDE.md](./CLAUDE.md) for:
- Detailed architecture documentation
- Implementation strategy
- Database schema
- API integration details
- Future enhancement ideas

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - feel free to use this project for any purpose.

---

## 💡 Tips

- **First run**: The first analysis takes longer as it downloads AI models
- **Caching**: Identical tweets return cached results instantly
- **Cost**: Each analysis uses OpenAI API credits (~$0.01-0.05 per check)
- **Accuracy**: Results are as good as the sources found - always verify yourself!

---

## 🆘 Need Help?

- Check the [Troubleshooting](#-troubleshooting) section above
- Review [CLAUDE.md](./CLAUDE.md) for detailed documentation
- Open an issue on GitHub if you encounter bugs

---

**Happy fact-checking! 🎯**
