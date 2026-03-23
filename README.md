
# 📊 HYDGEN KPI Dashboard

> **Executive KPI monitoring and analytics platform for real-time business intelligence**

![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=flat-square)
![Last Updated](https://img.shields.io/badge/Updated-March%2023%2C%202026-lightgrey?style=flat-square)

---

## 🎯 Overview

HYDGEN KPI Dashboard is a **production-grade React application** providing real-time KPI tracking and analytics across 5 departments (Finance, Sales, Product, Marketing, R&D). The platform enables executive decision-making through interactive visualizations, period comparisons, and AI-powered insights.

**Key Features:**
- ✅ 15 KPIs across 5 departments with real-time tracking
- ✅ Interactive dashboards with Recharts visualizations
- ✅ Role-based access control (Admin/User)
- ✅ AI-powered insights using OpenRouter LLM
- ✅ Monthly, quarterly, and year-over-year comparisons
- ✅ KPI upload functionality for administrators
- ✅ Responsive UI with Tailwind CSS

---

## 🚀 Quick Start

### Prerequisites
```
Node.js 18+  |  npm 10+  |  Supabase Account  |  Git
```

### 1️⃣ Installation

```bash
# Clone repository
git clone <repository-url>
cd "KPI dashboard"

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
```

### 2️⃣ Environment Configuration

Edit `.env.local`:

```env
# ⚙️ Required - Supabase Setup
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...

# 🤖 Optional - AI Insights (Mistral 7B)
VITE_OPENROUTER_API_KEY=sk-or-v1-...
```

**Getting Supabase Credentials:**
1. Navigate to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → Settings → API
3. Copy `Project URL` and `anon public key`
4. Paste into `.env.local`

### 3️⃣ Run Application

```bash
# Development (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | UI Framework |
| **Bundler** | Vite 6 | Lightning-fast builds |
| **Styling** | Tailwind CSS + shadcn/ui | Modern UI components |
| **Database** | Supabase PostgreSQL | Real-time data storage |
| **Charts** | Recharts | Data visualization |
| **Authentication** | Supabase Auth (JWT) | Secure user access |
| **LLM** | OpenRouter (Mistral 7B) | AI insights & Q&A |

### Database Schema

```sql
┌─────────────────────────────────────────────────┐
│                 Supabase PostgreSQL             │
├─────────────────────────────────────────────────┤
│                                                 │
│  kpi_catalog          [Master Reference]        │
│  ├─ kpi_code (PK)                              │
│  ├─ kpi_name, department, unit                 │
│  └─ 15 KPI definitions                         │
│                                                 │
│  kpi_metrics          [Main Data Table]         │
│  ├─ id (PK), kpi_code (FK)                     │
│  ├─ year, month, value, target                 │
│  └─ Monthly KPI data (UNIQUE: code+year+month) │
│                                                 │
│  kpi_definitions      [Extended Metadata]      │
│  ├─ kpi_code (FK)                              │
│  └─ objective, definition, category            │
│                                                 │
│  kpi_insights         [AI-Generated]           │
│  ├─ department, period, insight                │
│  └─ Rule-based analysis results                │
│                                                 │
│  users                [App Profiles]           │
│  ├─ id (FK to auth.users)                      │
│  ├─ email, role (admin|user)                   │
│  └─ Application user management                │
│                                                 │
└─────────────────────────────────────────────────┘
```

**For complete schema documentation:** See [DATABASE_DOCUMENTATION.md](./DATABASE_DOCUMENTATION.md)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── App.tsx                  # Main routing & layout
│   ├── components/              # Department dashboards
│   │   ├── OverviewDashboard.tsx
│   │   ├── FinancialData.tsx
│   │   ├── ExecutiveSalesPerformance.tsx
│   │   ├── ProductDashboard.tsx
│   │   ├── MarketingDashboard.tsx
│   │   ├── RnD.tsx
│   │   ├── UploadKPI.tsx
│   │   ├── MonthSelector.tsx
│   │   └── ui/                  # shadcn components
│   ├── kpi/
│   │   ├── AuthContext.tsx      # Authentication state
│   │   └── KPIContext.tsx       # KPI data management
│   └── pages/
│       └── LoginPage.tsx
│
├── lib/
│   ├── kpiAPI.ts               # Database queries & data fetching
│   ├── authService.ts          # Supabase auth integration
│   ├── aiInsights.ts           # Rule-based insight generation
│   ├── openrouterService.ts    # LLM integration
│   ├── supabase.ts             # Supabase client config
│   ├── hooks/
│   │   ├── useKPI.ts           # Single/batch KPI fetching
│   │   └── useTimeFilter.ts    # Date range filtering
│   └── utils/
│       ├── quarterUtils.ts
│       └── dashboardFilterUtils.ts
│
├── config/
│   ├── kpiCodes.ts             # KPI identifiers
│   ├── kpiDefinitions.ts       # KPI metadata
│   ├── labels.ts               # UI text constants
│   └── financialModelData.ts   # Sample financial data
│
└── styles/
    ├── index.css
    ├── theme.css
    └── tailwind.css
```

---

## 👥 Department Dashboards

| Dashboard | Metrics | Purpose |
|-----------|---------|---------|
| **Overview** | Executive summary across all KPIs | C-level snapshot |
| **Finance** | Cash balance, burn rate, liquidity | Financial health |
| **Sales** | Pipeline, conversion, revenue | Revenue tracking |
| **Product** | Retention, churn, engagement | User metrics |
| **Marketing** | Lead generation, acquisition cost | Demand generation |
| **R&D** | Development velocity, test coverage | Innovation tracking |

---

## 🔐 Authentication & Authorization

### User Roles

| Role | Permissions | Use Case |
|------|-------------|----------|
| **Admin** | View all dashboards + Upload KPI data | Data managers, Analysts |
| **User** | View dashboards (read-only) | Executives, Stakeholders |

### Admin Configuration

Assign admin access by editing `src/lib/authService.ts`:

```typescript
const ADMIN_EMAILS = [
  'admin@hydgen.com',
  'analyst@hydgen.com'
];
```

---

## 📊 Data Management

### KPI Data Model

Each KPI captures:
- **kpi_code**: Unique identifier (e.g., `FIN_CASH_BALANCE`)
- **year**: Fiscal year (e.g., 2026)
- **month**: Month number (1-12)
- **value**: Actual measured value
- **target**: Goal/benchmark value
- **notes**: Optional commentary

### Adding / Updating KPI Data

**Option 1: Via Dashboard (Admin only)**
- Login with admin role
- Navigate to "Upload KPI" tab
- Upload CSV with (kpi_code, year, month, value, target)

**Option 2: Direct Database Insert**
```sql
INSERT INTO kpi_metrics (kpi_code, year, month, value, target)
VALUES ('FIN_CASH_BALANCE', 2026, 3, 2500000, 2800000);
```

**Option 3: Batch via Supabase API**
```typescript
const { data, error } = await supabase
  .from('kpi_metrics')
  .insert([
    { kpi_code: 'FIN_CASH_BALANCE', year: 2026, month: 3, value: 2500000, target: 2800000 },
    { kpi_code: 'SLS_PIPELINE_VALUE', year: 2026, month: 3, value: 5300000, target: 4800000 }
  ]);
```

---

## 🚀 Deployment

### Build Verification

```bash
npm run build
```

**Build Stats:**
- ⏱️ **Time**: ~3.5 seconds
- 📦 **Size**: 1.4 MB JS (399 KB gzipped)
- 🔧 **Modules**: 2,284 transformed
- ✅ **Status**: Production ready

### Deployment Platforms

| Platform | Type | Recommendation |
|----------|------|-----------------|
| **Vercel** | Serverless | ⭐ **Recommended** - Native React support |
| **Netlify** | Static + Functions | ⭐ Great alternative |
| **AWS (S3 + CloudFront)** | CDN | For custom setups |
| **Docker** | Container | For on-premise deployment |

### Deployment Checklist

- [ ] Environment variables configured (`.env.local`)
- [ ] Supabase database initialized and populated
- [ ] Build succeeds without warnings
- [ ] Admin emails configured in `authService.ts`
- [ ] OpenRouter API key added (if using AI features)
- [ ] Database backups configured in Supabase
- [ ] CORS settings configured for production domain

---

## 🔧 Development

### npm Scripts

```bash
npm run dev        # Start dev server (port 5173)
npm run build      # Production build
npm run preview    # Test production build locally
```

### Key Development Files

| File | Purpose |
|------|---------|
| `src/app/App.tsx` | Main app routing and layout |
| `src/lib/kpiAPI.ts` | All database queries |
| `src/lib/authService.ts` | Authentication logic |
| `src/config/kpiDefinitions.ts` | KPI metadata |
| `vite.config.ts` | Vite build configuration |

---

## 🐛 Troubleshooting

### Connection Errors

**Error:** `Cannot find Supabase URL or key`
```bash
# Solution: Verify .env.local
cat .env.local | grep VITE_SUPABASE

# If empty, update .env.local with correct credentials
```

**Error:** `Foreign key constraint violation` when uploading data
```bash
# Solution: Ensure KPI code exists in kpi_catalog first
SELECT COUNT(*) FROM kpi_catalog WHERE kpi_code = 'YOUR_CODE';

# If 0, add to catalog:
INSERT INTO kpi_catalog (kpi_code, kpi_name, department) 
VALUES ('YOUR_CODE', 'Name', 'Department');
```

### Build Issues

```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite package-lock.json
npm install
npm run build
```

### Authentication Issues

```bash
# Clear browser session
# DevTools → Application → LocalStorage → Delete items with 'sb-' or 'supabase'
# Refresh page and login again
```

---

## 📈 Performance Metrics

| Metric | Value | Status |
|--------|-------|--------|
| **Build Time** | 3.5 seconds | ✅ Excellent |
| **Bundle Size** | 1.4 MB | ✅ Acceptable |
| **Gzipped Size** | 399 KB | ✅ Good |
| **Modules** | 2,284 | ✅ Optimized |
| **Page Load** | < 2 seconds | ✅ Fast |

---

## 📚 Core Data Hooks

### `useKPI(code)`
Fetch single KPI with auto-aggregation and time filters

```typescript
const { data, loading } = useKPI('FIN_CASH_BALANCE');
```

### `useKPIs(codes[])`
Batch fetch multiple KPIs

```typescript
const { data, loading } = useKPIs(['FIN_CASH_BALANCE', 'SLS_PIPELINE_VALUE']);
```

### `useTimeFilter()`
Month/quarter/year selection state

```typescript
const { month, year, quarter } = useTimeFilter();
```

### `useAIInsights()`
Generate rule-based insights

```typescript
const { insights, loading } = useAIInsights(department, period);
```

---

## 🔗 Important Links & Files

| Resource | Location | Purpose |
|----------|----------|---------|
| **Database Guide** | [DATABASE_DOCUMENTATION.md](./DATABASE_DOCUMENTATION.md) | Complete schema reference |
| **SOP Guide** | [PROJECT_SOP.md](./PROJECT_SOP.md) | Operating procedures |
| **Figma Design** | [KPI Dashboard Design](https://www.figma.com/design/USj5QhUjvFKllQes7bkN7x/KPI-dashboard) | UI/UX reference |
| **Supabase Dashboard** | https://supabase.com/dashboard | Database management |
| **OpenRouter Platform** | https://openrouter.ai | LLM services |

---

## ✨ Current Status & Data

| Item | Status |
|------|--------|
| **Application** | ✅ Production Ready |
| **Database** | ✅ Initialized (PostgreSQL 15+) |
| **Sample Data** | ✅ Seeded (February 2026) |
| **Build** | ✅ Verified (3.5s build time) |
| **Auth** | ✅ Configured (JWT + roles) |
| **AI Integration** | ✅ Optional (OpenRouter) |

### Data Snapshot
- **KPIs**: 15 metrics seeded
- **Departments**: 5 (Finance, Sales, Product, Marketing, R&D)
- **Current Month**: March 2026
- **Available Data**: February 2026

---

## 👋 Handover Support

### For New Developers

1. **Start here:** Read this README → DATABASE_DOCUMENTATION.md → PROJECT_SOP.md
2. **Environment setup:** Copy `.env.example` to `.env.local` with your credentials
3. **Run locally:** `npm install && npm run dev`
4. **Explore:** Open browser to localhost:5173

### For Database Support

- Schema validation: See DATABASE_DOCUMENTATION.md sections 2-5
- Common queries: See DATABASE_DOCUMENTATION.md section 8
- Troubleshooting: See DATABASE_DOCUMENTATION.md section 13

### For Deployment

1. Ensure build passes: `npm run build`
2. Configure environment variables
3. Deploy to your platform (Vercel, Netlify, etc.)
4. Test admin access and KPI data

### Contact & Support

For technical questions, refer to:
- 📖 Documentation files (README, DATABASE_DOCUMENTATION.md, PROJECT_SOP.md)
- 🔍 Code comments in `src/lib/kpiAPI.ts` and `src/app/App.tsx`
- 🐛 Check Supabase logs for database issues
- ⚙️ Review `.env.local` for configuration problems

---

## 📋 Maintenance Checklist

- [ ] Weekly: Monitor Supabase usage and query performance
- [ ] Monthly: Update KPI data for latest month
- [ ] Monthly: Review and backfill any missing metrics
- [ ] Quarterly: Audit admin access and user roles
- [ ] Quarterly: Update insights rules based on business changes
- [ ] Annually: Review and optimize database indexes

---

## 📄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | March 23, 2026 | **Initial Production Release** - Full dashboard suite, authentication, AI insights |
| 0.9.0 | March 19, 2026 | Cleanup: Remove debug files and console logs |
| 0.8.0 | March 15, 2026 | Feature complete: API integration and styling |

---

**Made with ❤️ by HYDGEN Team**  
*Last Updated: March 23, 2026*  
**Status: ✅ Production Ready**
  