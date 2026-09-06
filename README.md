# AI Battle Arena

AI Battle Arena is a full-stack multi-model AI coding platform. An authenticated user submits a problem, Gemini and Cohere independently generate responses, and Groq evaluates both responses with scores, reasoning, a winner, and a verdict. Battles are stored as user-owned conversations that can be revisited from the frontend.

## Live Links

- [Live Demo](https://ai-battle-arena-gilt.vercel.app/L)
- [GitHub Repository](https://github.com/raiayush2209-web/AI-Battle-Arena)

The repository currently contains no deployment manifest or published URL. The backend CORS configuration includes the deployed frontend origin `https://ai-battle-arena-gilt.vercel.app`.

What makes it different?

Instead of relying on a single LLM response, AI Battle Arena:
- Generates two independent solutions
- Runs the solution models in parallel
- Uses a separate LLM judge to compare them
- Scores each solution and explains the decision
- Persists battles as user-specific conversations
## Features

- Authenticated AI battles between Gemini and Cohere
- LangGraph workflow with Groq as a separate judging model
- Parallel solution generation with `Promise.allSettled`
- Scores from 0 to 10, per-solution reasoning, winner, and verdict
- JWT authentication stored in an HTTP-only cookie
- Protected battle and conversation APIs
- MongoDB-backed, user-specific conversation history
- Create, reopen, continue, rename, pin/unpin, search, and delete conversations
- Responsive React interface with a mobile history sidebar
- Separate frontend/backend deployment model for Vercel and Render

Code generation is displayed as model output. The repository does not implement code execution or sandboxing.

## Architecture

```text
User Prompt
    |
    v
Authenticated Express Backend
    |
    v
LangGraph
    |
    +-------------------+
    |                   |
    v                   v
 Gemini              Cohere
 Solution 1          Solution 2
    |                   |
    +---------+---------+
              |
              v
         Groq Judge
              |
              v
 Winner + Scores + Reasoning + Verdict
              |
              v
        React Frontend
              |
              v
 MongoDB Conversation History
```

The graph contains two nodes: `solution` and `judge_node`. The `solution` node invokes Gemini and Cohere concurrently with `Promise.allSettled`, then the `judge_node` sends the original problem and both responses to Groq. Parallel generation reduces unnecessary waiting because the two solution requests do not depend on one another. If either solution provider fails, the graph returns a provider-specific error; the judge parser also has an explicit fallback when the response is not valid JSON.

## Technology Stack

### Frontend

- React 19 and React DOM
- Vite 7
- Tailwind CSS 4 with `@tailwindcss/vite`
- JavaScript/JSX
- ESLint 9

### Backend

- Node.js with native ESM
- Express 5
- TypeScript
- LangGraph and LangChain
- `@langchain/google`, `@langchain/cohere`, and `@langchain/groq`
- Zod request validation
- `cookie-parser`, CORS, `dotenv`, `jsonwebtoken`, and `bcryptjs`

### Database

- MongoDB through Mongoose
- MongoDB Atlas can be used for production storage

## Project Structure

```text
AI_battle_arena/
├── Backend/
│   ├── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── test-cohere.ts
│   ├── test-mistral.ts
│   └── src/
│       ├── ai/
│       │   ├── graph.ai.ts
│       │   └── model.ai.ts
│       ├── config/
│       │   ├── cache.ts
│       │   └── config.ts
│       ├── controllers/
│       │   ├── auth.controller.ts
│       │   └── conversation.controller.ts
│       ├── middlewares/
│       │   └── auth.middleware.ts
│       ├── models/
│       │   ├── battle.ts
│       │   ├── conversation.model.ts
│       │   └── user.model.ts
│       ├── routes/
│       │   ├── auth.routes.ts
│       │   └── conversation.routes.ts
│       ├── app.ts
│       └── db.ts
├── Frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── BattleArena.jsx
│       │   ├── BattleHistory.tsx
│       │   ├── BattleResult.jsx
│       │   ├── ConversationItem.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── Sidebar.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── ConversationContext.jsx
│       ├── pages/
│       │   ├── Login.jsx
│       │   └── Register.jsx
│       ├── services/api.js
│       ├── utils/
│       │   ├── scoreHelper.js
│       │   └── titleHelper.js
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       └── main.jsx
├── package.json
└── README.md
```

`Backend/src/models/battle.ts` and `Frontend/src/components/BattleHistory.tsx` are present but are not part of the active routed flow. The active persistence path is the `Conversation` model and `/api/conversations` API.

## Authentication and Authorization

1. Registration validates username, email, and password, lowercases the registration email, hashes the password with `bcryptjs` using 10 salt rounds, and creates a user.
2. Login verifies the password and signs a JWT containing the user id and username. The token expires after three days.
3. The JWT is stored in an HTTP-only `token` cookie. In production the cookie uses `secure: true` and `sameSite: "none"`; otherwise it uses `secure: false` and `sameSite: "lax"`.
4. The frontend sends credentialed requests with `credentials: "include"`.
5. The auth middleware verifies the cookie before `/invoke`, `/api/auth/get-me`, and all conversation routes.
6. Conversation queries use both the requested conversation id and the authenticated JWT user id. The backend does not accept a frontend-supplied `userId` for conversation ownership.

The API key values, JWT secret, database URI, and other secrets remain on the backend. CORS allows the local Vite ports `5173`, `5174`, and `5175`, plus the configured deployed frontend origin, with credentials enabled.

## API Reference

All JSON bodies use `Content-Type: application/json` where a body is required. Authenticated requests use the HTTP-only `token` cookie.

### Health and AI invocation

| Method | Endpoint | Auth | Purpose | Response |
|---|---|---:|---|---|
| `GET` | `/` | No | Backend health response | `{ success: true, message }` |
| `POST` | `/invoke` | Yes | Run the LangGraph battle | `{ success: true, message, result }` |

`POST /invoke` accepts:

```json
{
  "input": "Write a Java binary search algorithm with edge case handling"
}
```

The `result` contains the graph state:

```json
{
  "problem": "Write a Java binary search algorithm with edge case handling",
  "solution_1": "Gemini response text",
  "solution_2": "Cohere response text",
  "judge": {
    "solution_1_score": 8,
    "solution_2_score": 7,
    "solution_1_reasoning": "...",
    "solution_2_reasoning": "...",
    "winner": "Solution 1",
    "verdict": "..."
  }
}
```

The scores and text above are illustrative values showing the response shape, not a fixed result.

### Authentication

| Method | Endpoint | Auth | Purpose | Request body / response |
|---|---|---:|---|---|
| `POST` | `/api/auth/register` | No | Create an account and set the cookie | `{ username, email, password }`; returns a public user object |
| `POST` | `/api/auth/login` | No | Authenticate and set the cookie | `{ email, password }`; returns a public user object |
| `GET` | `/api/auth/get-me` | Yes | Fetch the current user | Returns `{ message, user }` |
| `GET` | `/api/auth/logout` | No | Clear the auth cookie | Returns a logout message |

### Conversations

All conversation routes require authentication.

| Method | Endpoint | Purpose | Request body / response |
|---|---|---|---|
| `POST` | `/api/conversations` | Create a conversation | Optional `{ title }`; returns `{ success, conversation }` |
| `GET` | `/api/conversations` | List the current user's conversations | Returns metadata sorted by `updatedAt` descending |
| `GET` | `/api/conversations/:id` | Open one conversation | Returns `{ success, conversation }` |
| `PATCH` | `/api/conversations/:id` | Rename or pin/unpin | `{ title?: string, pinned?: boolean }`; returns the updated conversation |
| `DELETE` | `/api/conversations/:id` | Delete a conversation | Returns a success message |
| `POST` | `/api/conversations/:id/messages` | Save one battle round | `{ userMessage, assistant }`; returns the updated conversation |

The `assistant` object saved by the frontend contains `ai1`, `ai2`, and `judge` entries with model names and response/judging text. Conversation bodies are validated with Zod, including title and message length limits, strict object shapes, and MongoDB ObjectId validation.

## Database Models

### User

The `User` model contains:

- `username`: required and unique
- `email`: required and unique
- `password`: required and excluded from normal queries with `select: false`

### Conversation

The `Conversation` model contains:

- `userId`: required ObjectId reference to `User`, indexed
- `title`: required, trimmed, default `New Battle`
- `pinned`: required Boolean, default `false`
- `messages`: embedded user/assistant message documents
- `createdAt` and `updatedAt`: Mongoose timestamps

Each assistant message can contain:

```json
{
  "ai1": { "model": "Gemini", "response": "..." },
  "ai2": { "model": "Cohere", "response": "..." },
  "judge": { "model": "Groq", "winner": "...", "explanation": "..." }
}
```

The schema has a compound index on `{ userId: 1, updatedAt: -1 }` to support user-scoped history ordered by recent activity.

## Local Setup

### Prerequisites

- Node.js with npm
- A MongoDB connection string, local or MongoDB Atlas
- API keys for Gemini, Cohere, and Groq

### Install

```bash
git clone YOUR_GITHUB_URL
cd AI_battle_arena

cd Backend
npm install

cd ../Frontend
npm install
```

### Environment variables

Create `Backend/.env`:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=
GEMINI_API_KEY=
COHERE_API_KEY=
GROQ_API_KEY=
```

Create `Frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

The backend loads `GEMINI_API_KEY`, `COHERE_API_KEY`, `GROQ_API_KEY`, `MONGODB_URI`, and `JWT_SECRET` through `dotenv`. `PORT` and `NODE_ENV` are read directly by the server/auth code. The frontend reads `VITE_API_URL` through Vite. Do not commit either `.env` file.

### Run the applications

Start the backend from `Backend/`:

```bash
npm run dev
```

Start the frontend in a second terminal from `Frontend/`:

```bash
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`. The backend listens on port `3000` by default. MongoDB must be reachable through `MONGODB_URI` before the backend starts.

The root package contains shared TypeScript development dependencies but no application scripts. The backend `dev` script runs `tsx watch server.ts` from `Backend/`, where the actual server file is located.

### Frontend checks

```bash
npm run build
npm run lint
```

Run these from `Frontend/`. The root and backend package test scripts do not provide an automated application test suite; the root `test` script is the default placeholder that exits with an error.

## Deployment

The intended production layout is:

```text
React/Vite frontend  ->  Vercel
Express/Node backend  ->  Render
MongoDB                ->  MongoDB Atlas
AI providers           ->  Gemini + Cohere + Groq
```

- Vercel hosts the built React/Vite frontend.
- Render runs `Backend/server.ts` as the Node/Express service.
- MongoDB Atlas provides the production MongoDB connection through `MONGODB_URI`.
- AI API keys and `JWT_SECRET` stay in backend environment variables and are never bundled into the frontend.
- The deployed frontend sets `VITE_API_URL` to the Render backend URL.
- Production requests use credentialed cookies, and the backend enables CORS for the deployed frontend origin.
- Set `NODE_ENV=production` on the backend so auth cookies use the production `secure` and `sameSite` settings.

No Vercel or Render configuration file is committed in this repository, so the exact provider build/start commands should be entered in the respective deployment dashboards using the package layout above.

## Error Handling and Development Lessons

The backend returns `400` for invalid input/bodies, `401` for missing or invalid auth cookies, `404` for missing conversations, `409` for duplicate users, and `500` for server/provider failures. The AI graph includes provider-aware messages for rate limits and authentication failures. If Gemini or Cohere fails during parallel generation, `/invoke` returns an error instead of saving an incomplete battle. Invalid JSON from Groq produces an `Error` judgment with the raw response in the verdict field.

During development, Mistral was initially explored but replaced by Gemini; the active graph does not use Mistral. Provider model/endpoint compatibility and availability also required updates: Cohere's integration was corrected, Gemini was moved to a supported model, and the Groq judge model was updated after the previous model became unavailable. These are historical integration lessons, not current failure states.

## Screenshots

Screenshots are not included in the repository yet.

- Login/Register
- AI Battle Arena
- Battle result
- Conversation history/sidebar

## Technical Highlights

- **Multi-model comparison:** independent Gemini and Cohere responses expose different approaches to the same prompt.
- **Explicit orchestration:** LangGraph models the solution and judging stages as a small, inspectable workflow.
- **Parallel execution:** `Promise.allSettled` runs the independent solution calls together while preserving provider-specific failure reporting.
- **Separate judge model:** Groq evaluates the generated responses instead of having either solution model judge itself.
- **REST API boundary:** React communicates with the Express backend through authentication, invocation, and conversation endpoints.
- **Persistence and isolation:** Mongoose stores conversations and embeds each battle round; queries scope records to the authenticated user.
- **Deployment separation:** the frontend and backend can scale and configure independently while secrets remain server-side.

## Key Engineering Decisions

1. **Why multiple AI models?** Comparing independent outputs makes differences in solution quality and reasoning visible instead of relying on one generation.
2. **Why LangGraph?** It gives the solution and judging stages explicit state and edges, making the workflow easier to extend than a single opaque request handler.
3. **Why parallel execution?** Gemini and Cohere do not depend on one another, so `Promise.allSettled` avoids serial provider latency and reports both outcomes.
4. **Why a separate judge model?** Groq provides an independent evaluation step with structured scores, reasoning, a winner, and a verdict.
5. **Why MongoDB instead of localStorage?** Conversations need server persistence and user scoping so they can be reopened across sessions and devices.
6. **Why HTTP-only cookies?** The JWT is not exposed to frontend JavaScript, while `credentials: "include"` allows the browser to send it to the API.
7. **How do production CORS and cookies work?** The backend allows the deployed frontend origin with credentials, and production cookies use `secure` plus `sameSite: "none"` for the separate frontend/backend origins.
8. **How is conversation isolation enforced?** The JWT middleware supplies the authenticated identity; every conversation query combines that identity with the conversation id where applicable.
9. **Why deploy frontend and backend separately?** Vercel is used for the Vite frontend and Render for the long-running Node/Express API, with MongoDB Atlas as the shared production data service.

## Project Summary

AI Battle Arena is a full-stack multi-model AI coding platform where Gemini and Cohere independently generate solutions and Groq evaluates them through a LangGraph-orchestrated workflow. React/Vite provides the authenticated battle interface, while Express, JWT cookies, and MongoDB persist user-specific conversation history.

## Development Notes

- `Backend/test-cohere.ts` and `Backend/test-mistral.ts` are provider experiments, not the application test suite.
- The active provider configuration is Gemini, Cohere, and Groq. The Mistral package/test remains in the repository but is not wired into the active graph.
- The active history API is `/api/conversations`; the older `Battle` model and `BattleHistory.tsx` are not registered or used by the current backend route setup.