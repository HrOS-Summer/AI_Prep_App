import express from 'express';
import { ENV } from './lib/env.js';
import path from 'path';

const app = express();
const __dirname = path.resolve();

app.use(express.json());

// 1. API Routes first
app.get('/api/health', (req, res) => {
    res.json({ message: 'Server is healthy!' });
});

// 2. Production Setup
if (ENV.NODE_ENV === 'production') {
    const frontendPath = path.resolve(__dirname, '../frontend/dist');
    
    app.use(express.static(frontendPath));

    // Only fallback to index.html if the request isn't for an /api route
    app.get(/^(?!\/api).+/, (req, res) => {     // This regex matches any route that does NOT start with /api
        res.sendFile(path.join(frontendPath, 'index.html'));
    }); 
}

app.listen(ENV.PORT, () => {
    console.log(`Server is running on port ${ENV.PORT}`);
});