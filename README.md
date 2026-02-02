# SnackSecure - FDA Compliance Checker for Snack Exports

A web application that helps snack food exporters verify their products meet FDA requirements for the US market. Features AI-powered packaging analysis and manual compliance assessments with bilingual support (English/Chinese).

## Features

- **AI-Powered Image Analysis** - Upload product packaging images for automatic FDA compliance detection using Claude AI vision
- **Manual Assessment** - Complete detailed compliance questionnaires across labeling, facility, and safety categories
- **Bilingual Support** - Full English and Simplified Chinese interface
- **User Dashboard** - Track assessment history and compliance status
- **Compliance Scoring** - Automated scoring with pass/partial/fail status
- **Detailed Recommendations** - Actionable remediation guidance for failed items

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite (dev server & build tool)
- Tailwind CSS
- React Router DOM
- i18next (internationalization)
- Axios

**Backend:**
- Express.js with TypeScript
- SQLite (better-sqlite3)
- Anthropic Claude API (AI vision analysis)
- JWT authentication
- bcryptjs (password hashing)
- Multer (file uploads)

## Project Structure

```
snackSecure/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route pages
│   │   ├── services/          # API integration
│   │   ├── context/           # React context (auth)
│   │   ├── i18n/              # Translation files (en.json, zh.json)
│   │   ├── data/              # Questions & scoring logic
│   │   └── App.tsx
│   ├── vite.config.ts
│   └── tailwind.config.js
├── server/                    # Express backend
│   ├── src/
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # JWT auth middleware
│   │   └── models/            # Database models
│   ├── .env.example
│   └── database.sqlite
└── package.json               # Workspace configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd snackSecure
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp server/.env.example server/.env
   ```

4. Edit `server/.env` with your values:
   ```
   PORT=3001
   JWT_SECRET=your_secure_jwt_secret_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3001) | No |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude AI | Yes |

## Development

Run both frontend and backend in development mode:

```bash
npm run dev
```

This starts:
- Client at `http://localhost:5173`
- Server at `http://localhost:3001`

Run individually:

```bash
npm run dev:client    # Frontend only
npm run dev:server    # Backend only
```

### Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

**Register Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "company": "string (optional)"
}
```

### Assessments (Requires Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/assessments` | Create new assessment |
| GET | `/api/assessments` | List user's assessments |
| GET | `/api/assessments/:id` | Get assessment by ID |
| DELETE | `/api/assessments/:id` | Delete assessment |

### AI Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/analyze-packaging` | Analyze packaging image |

**Request:** `multipart/form-data`
- `image`: Image file (JPEG, PNG, WebP, GIF - max 10MB)
- `language`: `en` or `zh`

**Response:** Returns pre-filled assessment answers with confidence levels.

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server status |

## Assessment Categories

### 1. Labeling Requirements (80 points)

| Question | Weight | Description |
|----------|--------|-------------|
| Nutrition Facts | 15 | FDA-compliant nutrition panel |
| Ingredient List | 15 | Listed in descending order by weight |
| Allergen Declaration | 20 | "Big 9" allergens declared |
| Net Quantity | 10 | Metric & US customary units |
| Manufacturer Info | 10 | Name and address displayed |
| Country of Origin | 10 | "Product of..." labeling |

### 2. Facility Requirements (60 points)

| Question | Weight | Description |
|----------|--------|-------------|
| FDA Registration | 25 | Facility registered with FDA |
| Prior Notice | 20 | Submission before US arrival |
| FSVP | 15 | Foreign Supplier Verification Program |

### 3. Safety Requirements (60 points)

| Question | Weight | Description |
|----------|--------|-------------|
| HACCP | 15 | Hazard Analysis Critical Control Points |
| FSMA | 20 | Food Safety Modernization Act compliance |
| GMP | 15 | Good Manufacturing Practices (21 CFR 117) |
| Hazard Analysis | 10 | Documented hazard analysis |

## Scoring System

### Answer Options
- **Yes** - 100% of question weight
- **Partial** - 50% of question weight
- **No** - 0% of question weight
- **Not Applicable** - Excluded from calculation

### Score Calculation
```
Score = (Earned Weight / Total Applicable Weight) × 100
```

### Status Thresholds

| Score | Status | Description |
|-------|--------|-------------|
| ≥ 80% | Passed | Meets FDA requirements |
| 50-79% | Partial | Requires improvements |
| < 50% | Failed | Significant gaps |

## Internationalization

The application supports:
- **English** (en) - Default
- **Simplified Chinese** (zh)

Language detection:
1. User preference (localStorage)
2. Browser language settings

Toggle language using the language switcher in the header.

## Product Categories

- Chips
- Cookies
- Candy
- Nuts
- Dried Fruits
- Crackers
- Popcorn
- Other

## Database Schema

**Users:**
- id, name, email, password (hashed), company, created_at

**Assessments:**
- id, user_id, product_category, answers (JSON), score, status, created_at

## License

MIT License
