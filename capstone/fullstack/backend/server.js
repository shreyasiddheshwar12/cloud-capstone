const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const recalls = new Map();
const VALID_SEVERITIES = new Set(['low', 'medium', 'high', 'critical']);

function validateRecall(body) {
  const { product_name, batch_number, severity, reason } = body || {};
  if (typeof product_name !== 'string' || product_name.trim().length < 1 || product_name.length > 200) {
    return 'product_name must be a non-empty string of at most 200 characters';
  }
  if (typeof batch_number !== 'string' || batch_number.trim().length < 1 || batch_number.length > 100) {
    return 'batch_number must be a non-empty string of at most 100 characters';
  }
  if (typeof severity !== 'string' || !VALID_SEVERITIES.has(severity)) {
    return 'severity must be one of: low, medium, high, critical';
  }
  if (typeof reason !== 'string' || reason.trim().length < 1 || reason.length > 2000) {
    return 'reason must be a non-empty string of at most 2000 characters';
  }
  return null;
}

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/api/v1/recalls', (_req, res) => {
  res.json(Array.from(recalls.values()));
});

app.post('/api/v1/recalls', (req, res) => {
  const validationError = validateRecall(req.body);
  if (validationError) {
    return res.status(400).json({ detail: validationError });
  }

  const now = new Date().toISOString();
  const recall = {
    id: crypto.randomUUID(),
    product_name: req.body.product_name.trim(),
    batch_number: req.body.batch_number.trim(),
    severity: req.body.severity,
    reason: req.body.reason.trim(),
    status: 'draft',
    created_at: now,
    published_at: null,
  };

  recalls.set(recall.id, recall);
  return res.status(201).json(recall);
});

app.get('/api/v1/recalls/:recallId', (req, res) => {
  const recall = recalls.get(req.params.recallId);
  if (!recall) {
    return res.status(404).json({ detail: 'Recall not found' });
  }
  return res.json(recall);
});

app.post('/api/v1/recalls/:recallId/publish', (req, res) => {
  const recall = recalls.get(req.params.recallId);
  if (!recall) {
    return res.status(404).json({ detail: 'Recall not found' });
  }

  recall.status = 'published';
  recall.published_at = new Date().toISOString();
  return res.json(recall);
});

app.listen(PORT, () => {
  console.log(`Pharmaceutical Recall API running at http://localhost:${PORT}`);
});
