import express from 'express';
import mongoose from 'mongoose';

import exerciseRouter from './routes/exercises.js';

const app = express();

// Middleware voor JSON-gegevens
app.use(express.json());

// Middleware voor www-urlencoded-gegevens
app.use(express.urlencoded({ extended: true }));

// Middleware om te controleren op Accept-header
app.use((req, res, next) => {
    if (req.headers.accept !== 'application/json' && req.method !== "OPTIONS") {
        return res.status(406).json({ error: 'Accept header must be application/json' });
    }

    next();
});



// Verbind met MongoDB
mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DB_NAME}`);

app.get('/', (req, res) => {
    res.json({ message: 'welkom, new' });
});


// Gebruik de spots-router
app.use('/exercises', exerciseRouter);

// Root route

// Start de server
app.listen(process.env.EXPRESS_PORT, () => {
    console.log('server gestart');
});
