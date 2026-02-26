import express from 'express';
import cors from 'cors';
import { runMigrations } from './db/index.js';
import categoriesRouter from './routes/categories.js';
import providersRouter from './routes/providers.js';
import servicesRouter from './routes/services.js';
import meRouter from './routes/me.js';
import companyRouter from './routes/company.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/categories', categoriesRouter);
app.use('/api/providers', providersRouter);
app.use('/api/services', servicesRouter);
app.use('/api/me', meRouter);
app.use('/api/company', companyRouter);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

runMigrations()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Handig API running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
