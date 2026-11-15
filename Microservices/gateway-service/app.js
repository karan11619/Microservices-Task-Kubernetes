const express = require('express');
const axios = require('axios');
const app = express();

// Log every incoming request except health checks (probes call /health every few seconds)
app.use((req, res, next) => {
  if (req.url !== '/health') console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`);
  next();
});
app.use(express.json());
const port = 3003;

// Backend URLs come from environment variables (set in the Kubernetes Deployment).
// Defaults are the original values, so the app still works without them.
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3000';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3001';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service:3002';

app.get('/health', (req, res) => {
  res.json({ status: 'Gateway Service is healthy' });
});

app.get('/api/users', async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/users`);
    console.log(`Gateway -> ${response.config.method.toUpperCase()} ${response.config.url} : ${response.status}`);
    res.json(response.data);
  } catch (error) {
    console.error(`Gateway upstream error: ${error.message}`);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/products`);
    console.log(`Gateway -> ${response.config.method.toUpperCase()} ${response.config.url} : ${response.status}`);
    res.json(response.data);
  } catch (error) {
    console.error(`Gateway upstream error: ${error.message}`);
    res.status(500).json({ error: 'Error fetching products' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const response = await axios.get(`${ORDER_SERVICE_URL}/orders`);
    console.log(`Gateway -> ${response.config.method.toUpperCase()} ${response.config.url} : ${response.status}`);
    res.json(response.data);
  } catch (error) {
    console.error(`Gateway upstream error: ${error.message}`);
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const response = await axios.post(`${ORDER_SERVICE_URL}/orders`, req.body);
    console.log(`Gateway -> ${response.config.method.toUpperCase()} ${response.config.url} : ${response.status}`);
    res.json(response.data);
  } catch (error) {
    console.error(`Gateway upstream error: ${error.message}`);
    res.status(500).json({ error: 'Error creating order' });
  }
});

app.listen(port, () => {
  console.log(`Gateway service running on port ${port}`);
});