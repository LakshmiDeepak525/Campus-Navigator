import express from 'express';
import cors from 'cors';
import graphRouter from './routes/graph';
import algoRouter from './routes/algo';

const app = express();
const PORT = 3001;

app.use(cors({ origin: [/localhost:\d+$/, /127\.0\.0\.1:\d+$/] }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/graph', graphRouter);
app.use('/api/algo', algoRouter);
app.use('/api/campus', algoRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`🚀 Campus Navigator API running on http://localhost:${PORT}`);
});

export default app;
