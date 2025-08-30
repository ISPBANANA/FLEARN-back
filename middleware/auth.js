// middleware/auth.js
require('dotenv').config();

/**
 * API Key Authentication Middleware
 * Checks for API key in headers, query params, or body
 */
const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || 
                   req.headers['authorization']?.replace('Bearer ', '') ||
                   req.query.api_key ||
                   req.body.api_key;

    const validApiKey = process.env.INTERNAL_API_KEY;

    if (!apiKey) {
        return res.status(401).json({
            error: 'API key required',
            message: 'Please provide an API key in headers (x-api-key) or query params (api_key)'
        });
    }

    if (apiKey !== validApiKey) {
        return res.status(403).json({
            error: 'Invalid API key',
            message: 'The provided API key is not valid'
        });
    }

    next();
};

/**
 * Optional API Key Authentication (doesn't block if no key provided)
 */
const optionalApiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || 
                   req.headers['authorization']?.replace('Bearer ', '') ||
                   req.query.api_key ||
                   req.body.api_key;

    if (apiKey) {
        const validApiKey = process.env.INTERNAL_API_KEY;
        if (apiKey === validApiKey) {
            req.authenticated = true;
        } else {
            req.authenticated = false;
        }
    } else {
        req.authenticated = false;
    }

    next();
};

/**
 * Rate limiting by API key (basic implementation)
 */
const rateLimitByApiKey = (requestsPerMinute = 60) => {
    const requests = new Map();

    return (req, res, next) => {
        const apiKey = req.headers['x-api-key'] || 'anonymous';
        const now = Date.now();
        const windowStart = now - (60 * 1000); // 1 minute window

        if (!requests.has(apiKey)) {
            requests.set(apiKey, []);
        }

        const keyRequests = requests.get(apiKey);
        
        // Remove old requests outside the window
        const recentRequests = keyRequests.filter(timestamp => timestamp > windowStart);
        requests.set(apiKey, recentRequests);

        if (recentRequests.length >= requestsPerMinute) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                message: `Maximum ${requestsPerMinute} requests per minute allowed`
            });
        }

        recentRequests.push(now);
        next();
    };
};

module.exports = {
    apiKeyAuth,
    optionalApiKeyAuth,
    rateLimitByApiKey
};
