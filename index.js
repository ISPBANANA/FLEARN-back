require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { apiKeyAuth, optionalApiKeyAuth, rateLimitByApiKey } = require('./middleware/auth');
const externalApiService = require('./services/externalApi');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/flearn-db';

const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = process.env.ALLOWED_ORIGINS 
            ? process.env.ALLOWED_ORIGINS.split(',')
            : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'];
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ 
        message: 'FLEARN Backend API is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Public API endpoints (no authentication required)
app.get('/api/public/info', (req, res) => {
    res.json({
        message: 'This is a public endpoint',
        version: '1.0.0',
        features: ['authentication', 'user management', 'learning platform']
    });
});

// Protected API endpoints (require API key)
app.get('/api/protected/users', apiKeyAuth, (req, res) => {
    res.json({
        message: 'This is a protected endpoint',
        users: ['user1', 'user2', 'user3'],
        requestedBy: 'authenticated_user'
    });
});

// Rate-limited endpoint
app.get('/api/limited/data', rateLimitByApiKey(10), (req, res) => {
    res.json({
        message: 'This endpoint is rate-limited to 10 requests per minute',
        data: { timestamp: new Date().toISOString() }
    });
});

// Example external API integration
app.post('/api/ai/generate', apiKeyAuth, async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const result = await externalApiService.generateText(prompt);
        res.json({ result });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to generate text',
            message: error.message 
        });
    }
});

// Connect to MongoDB
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to MongoDB successfully');
    console.log(`🗄️  Database: ${mongoURL}`);
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({ 
        message: 'Internal Server Error',
        error: NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        message: 'Route not found',
        path: req.originalUrl 
    });
});

// Start the server
app.listen(PORT, () => {
    console.log('\n🚀 FLEARN Backend Server Started!');
    console.log(`📍 Server URL: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`🗄️  MongoDB URL: ${mongoURL}`);
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    console.log('====================================\n');
});
