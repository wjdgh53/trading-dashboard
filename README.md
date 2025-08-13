# NomadVibe Trading Dashboard

A modern, responsive trading dashboard built with Next.js 14, Supabase, and Tailwind CSS. Features real-time market data, AI-powered insights, and comprehensive trading analytics.

## 🚀 Features

- **Real-time Trading Data**: Live market prices and portfolio tracking
- **AI-Powered Analysis**: Machine learning insights for trading decisions
- **Responsive Design**: Mobile-first design with dark trading theme
- **Supabase Integration**: Real-time database with authentication
- **TypeScript**: Full type safety throughout the application
- **Performance Optimized**: Built for speed with Next.js 14 App Router

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS with custom trading theme
- **Language**: TypeScript
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📊 Database Schema

The application uses three main Supabase tables:

### `trading_history`
- Tracks all buy/sell transactions
- Includes profit/loss calculations
- Links to user accounts

### `completed_trades` 
- Stores finalized trade pairs (entry/exit)
- Calculates performance metrics
- Tracks trade duration and returns

### `ai_learning_data`
- AI prediction storage and validation
- Market condition analysis
- Accuracy scoring for model improvement

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd nomadvibe
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.local.example .env.local
```

Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the following SQL to create tables:

```sql
-- Trading History Table
CREATE TABLE trading_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  symbol TEXT NOT NULL,
  action TEXT CHECK (action IN ('buy', 'sell')) NOT NULL,
  quantity DECIMAL(20,8) NOT NULL,
  price DECIMAL(20,8) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  strategy TEXT,
  notes TEXT,
  profit_loss DECIMAL(20,8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Completed Trades Table
CREATE TABLE completed_trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  symbol TEXT NOT NULL,
  entry_price DECIMAL(20,8) NOT NULL,
  exit_price DECIMAL(20,8) NOT NULL,
  quantity DECIMAL(20,8) NOT NULL,
  profit_loss DECIMAL(20,8) NOT NULL,
  percentage_return DECIMAL(10,4) NOT NULL,
  entry_date TIMESTAMPTZ NOT NULL,
  exit_date TIMESTAMPTZ NOT NULL,
  strategy TEXT,
  notes TEXT,
  trade_duration_hours INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Learning Data Table
CREATE TABLE ai_learning_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  symbol TEXT NOT NULL,
  prediction_type TEXT CHECK (prediction_type IN ('price_target', 'trend_direction', 'volatility', 'sentiment')) NOT NULL,
  prediction_value TEXT NOT NULL,
  actual_value TEXT,
  confidence_score DECIMAL(5,4) NOT NULL,
  market_conditions JSONB,
  technical_indicators JSONB,
  prediction_date TIMESTAMPTZ NOT NULL,
  outcome_date TIMESTAMPTZ,
  accuracy_score DECIMAL(5,4),
  model_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE trading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning_data ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can CRUD their own trading_history" ON trading_history
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD their own completed_trades" ON completed_trades
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD their own ai_learning_data" ON ai_learning_data
FOR ALL USING (auth.uid() = user_id);
```

3. Enable authentication in your Supabase project
4. Copy your project URL and anon key to `.env.local`

### 4. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### 5. Type Generation (Optional)

Generate TypeScript types from your Supabase schema:

```bash
npm run db:types
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

The app includes Vercel configuration (`vercel.json`) for optimal deployment.

## 📁 Project Structure

```
nomadvibe/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles with trading theme
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable UI components
├── lib/                   # Utilities and configurations
│   ├── supabase.ts       # Supabase client and helpers
│   └── utils.ts          # Helper functions
├── types/                 # TypeScript type definitions
│   └── database.types.ts # Database schema types
├── .env.local.example     # Environment template
├── vercel.json           # Vercel deployment config
└── tailwind.config.ts    # Tailwind with trading theme
```

## 🎨 Theming

The dashboard uses a custom dark trading theme:

- **Green** (#00ff88): Profits, positive trends
- **Red** (#ff4757): Losses, negative trends  
- **Dark Blue** (#0f0f23): Primary background
- **Gray** (#2f3349): Cards and borders

Colors are defined in `tailwind.config.ts` as the `trading` color palette.

## 📈 Trading Features

- **Portfolio Tracking**: Real-time portfolio value and performance
- **Trade History**: Complete transaction log with P&L
- **AI Insights**: Machine learning predictions and analysis
- **Market Data**: Live price feeds and market indicators
- **Performance Analytics**: Win rate, returns, and trade metrics

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking
- `npm run db:types` - Generate Supabase types

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the Supabase documentation
- Review Next.js 14 documentation

---

Built with ❤️ using Next.js 14, Supabase, and modern web technologies.