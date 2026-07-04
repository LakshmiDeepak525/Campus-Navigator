# Campus Navigator — Graph Algorithms Visualized

A full-stack web application that models a university campus as a weighted graph and provides step-by-step visualization of 6 algorithm families.

## 🚀 Quick Start

**Terminal 1 — Backend:**
```bash.
cd server
npm start
```
Server runs on "http://localhost:3001"

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```
App runs on "http://localhost:5173"

---

## ✨ Features

| Algorithm | Route | Accent |
|-----------|-------|--------|
| Dijkstra's Shortest Path | `/dijkstra` | 🔴 Red |
| Bellman-Ford | `/bellman` | 🟢 Neon Green |
| Floyd-Warshall | `/floyd` | 🔵 Electric Blue |
| BFS / DFS | `/bfsdfs` | 🩷 Hot Pink |
| MST (Kruskal + Prim) | `/mst` | 🟠 Orange |
| Graph Builder | `/builder` | 🟡 Yellow |

## 🎨 Design

**Neobrutalism** — raw, bold, high-contrast:
- Hard shadows (`4px 4px 0 #000`), no blur, no gradients
- Thick 3px black borders on all elements  
- `Archivo Black` / `Space Mono` / `IBM Plex Mono` typography
- Physical button press animation
- Spring-physics page transitions

## 🕹 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `→` | Next step |
| `←` | Previous step |
| `R` | Reset to start |

## 📡 API Reference

```
GET  /api/health          — Server health check
GET  /api/graph           — Load saved graph
POST /api/graph           — Save graph
POST /api/algo/dijkstra   — Run Dijkstra { graph, source, target }
POST /api/algo/bellman    — Run Bellman-Ford { graph, source }
POST /api/algo/floyd      — Run Floyd-Warshall { graph }
POST /api/algo/bfs        — Run BFS { graph, start }
POST /api/algo/dfs        — Run DFS { graph, start }
POST /api/algo/mst        — Run Kruskal + Prim { graph, start }
GET  /api/campus/osm      — Import from OpenStreetMap ?bbox=s,w,n,e
```

## 🏗 Architecture.

```
campus-nav/
├── client/   React 18 + Vite + Framer Motion + Zustand
└── server/   Node.js + Express + TypeScript
```

All algorithm state is computed server-side and returned as `steps[]` arrays. The frontend consumes these arrays frame-by-frame for animation.

## 🗺 Sample Campus Graph

Pre-loaded 8-node campus: Main Gate → Library → Cafeteria → Lab Block A → Lab Block B → Hostel → Sports Ground → Admin Block

Graph persists in `localStorage` across page refreshes.
