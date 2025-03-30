require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const auditRoutes = require('./routes/audit');

app.use(express.json());

// Mount routes under a common API prefix
app.use('/api', authRoutes);
app.use('/api', requestRoutes);
app.use('/api', auditRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
