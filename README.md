# ⚡ FlowBoard

A real-time visual workflow automation platform that lets users build, run, and monitor multi-step business processes without writing code — similar to Zapier or n8n.

![FlowBoard](https://img.shields.io/badge/Status-Live-4ade80?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20PostgreSQL-60a5fa?style=flat-square)

## 🎯 What It Does

Users drag and drop trigger and action nodes onto a canvas, connect them to define execution order, then hit Run to execute the workflow in real time. Every node lights up as it executes, with live status updates streamed directly to the browser.

## ✨ Features

- **Visual canvas** — drag and drop workflow builder powered by React Flow
- **DAG execution engine** — implements Kahn's topological sort algorithm to determine correct node execution order
- **Real-time execution** — WebSocket-powered live node highlighting as workflows run
- **Retry logic** — failed nodes automatically retry with exponential backoff (1s → 2s → 4s)
- **Save & load** — workflows persist to PostgreSQL via Supabase
- **Version history** — every save creates a snapshot; users can roll back to any previous version
- **Live execution log** — real-time step-by-step execution feedback

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, React Flow, Zustand, Vite |
| Backend | Node.js, Express |
| Real-time | Socket.io (WebSockets) |
| Database | PostgreSQL via Supabase |
| Dev Tools | Nodemon, ESLint |

## 🏗 Architecture
```
client/                  # React frontend
├── components/          # Canvas, Sidebar, ExecutionLog, Modals
├── hooks/               # useSocket, useWorkflow, useToast
└── store/               # Zustand state management

server/                  # Node.js backend
├── engine/              # DAG executor with Kahn's algorithm
├── routes/              # REST API endpoints
└── models/              # Data models
```

## 🚀 Running Locally

**Prerequisites:** Node.js 18+, a Supabase account

**1. Clone the repo**
```bash
git clone https://github.com/justcoffeebean/flowboard.git
cd flowboard
```

**2. Set up the server**
```bash
cd server
npm install
```

Create `server/.env`:
```
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

**3. Set up the database**

Run this in your Supabase SQL editor:
```sql
CREATE TABLE workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  nodes JSONB NOT NULL,
  edges JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE workflow_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  nodes JSONB NOT NULL,
  edges JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**4. Start the server**
```bash
npm run dev
```

**5. Set up and start the client**
```bash
cd ../client
npm install
npm run dev
```

Visit `http://localhost:5173`

## 🧠 Technical Highlights

### DAG Execution Engine
The workflow executor implements **Kahn's algorithm** — a topological sort that determines the correct execution order for connected nodes. It detects cycles, handles parallel branches, and processes nodes level by level.

### Exponential Backoff Retry
Failed nodes automatically retry up to 3 times with increasing delays:
- Attempt 1 → wait 1 second
- Attempt 2 → wait 2 seconds  
- Attempt 3 → wait 4 seconds

### Real-time WebSockets
Rather than polling, the server pushes execution events directly to the client via Socket.io. Each node emits `nodeStart`, `nodeComplete`, and `nodeError` events that update the UI instantly.