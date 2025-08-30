// services/externalApi.js
require('dotenv').config();

/**
 * Service for making external API calls with proper key management
 */
class ExternalApiService {
    constructor() {
        this.auth0Domain = process.env.AUTH0_DOMAIN;
        this.auth0ClientId = process.env.AUTH0_CLIENT_ID;
        this.auth0ClientSecret = process.env.AUTH0_CLIENT_SECRET;
        this.openaiApiKey = process.env.OPENAI_API_KEY;
        this.stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    }

    /**
     * Generic method to make authenticated API calls
     */
    async makeAuthenticatedRequest(url, options = {}) {
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'User-Agent': 'FLEARN-Backend/1.0.0'
        };

        const config = {
            method: 'GET',
            headers: { ...defaultHeaders, ...options.headers },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error.message);
            throw error;
        }
    }

    /**
     * Auth0 Management API calls
     */
    async getAuth0Users() {
        if (!this.auth0Domain || !this.auth0ClientSecret) {
            throw new Error('Auth0 credentials not configured');
        }

        // First get access token
        const tokenResponse = await this.makeAuthenticatedRequest(
            `https://${this.auth0Domain}/oauth/token`,
            {
                method: 'POST',
                body: JSON.stringify({
                    client_id: this.auth0ClientId,
                    client_secret: this.auth0ClientSecret,
                    audience: `https://${this.auth0Domain}/api/v2/`,
                    grant_type: 'client_credentials'
                })
            }
        );

        // Then get users
        return await this.makeAuthenticatedRequest(
            `https://${this.auth0Domain}/api/v2/users`,
            {
                headers: {
                    'Authorization': `Bearer ${tokenResponse.access_token}`
                }
            }
        );
    }

    /**
     * OpenAI API calls
     */
    async generateText(prompt, options = {}) {
        if (!this.openaiApiKey) {
            throw new Error('OpenAI API key not configured');
        }

        return await this.makeAuthenticatedRequest(
            'https://api.openai.com/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.openaiApiKey}`
                },
                body: JSON.stringify({
                    model: options.model || 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: options.maxTokens || 150,
                    temperature: options.temperature || 0.7
                })
            }
        );
    }

    /**
     * Example method for any external service
     */
    async callExternalService(serviceName, endpoint, apiKey, data = {}) {
        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'X-API-Key': apiKey // Some services use this header instead
        };

        return await this.makeAuthenticatedRequest(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
    }
}

module.exports = new ExternalApiService();
