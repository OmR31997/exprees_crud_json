// 📦 Importing required modules
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
// 📁 Importing route handlers and middleware
import { pageUI } from './Controller/StudentController.js';
import StudentRoute from './Routes/StudentRoute.js';
import isAuthenticated from './Middleware/auth.js';
import DownloadRoute from './Routes/DownloadRoute.js';
import MongoStore from 'connect-mongo';

dotenv.config();

// 🧭 Setup for __dirname in ES Modules
const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);

// 🚀 Initialize Express app
const appServer = express();

// 🧾 Enable JSON and form-urlencoded request body parsing
appServer.use(express.json());
appServer.use(express.urlencoded({ extended: true }));

// 🔐 Configure session management

appServer.set('trust proxy', 1); 

appServer.use(session({
    secret: '@$1025$@', // Secret key for session encryption
    resave: false, // Don't save session if not modified
    saveUninitialized: false, // Don't create session until something is stored
    store:MongoStore.create({
        mongoUrl:process.env.MONGO_URL,
        collectionName:'sessions'
    }),
    cookie: {
        httpOnly: true, // Prevent client-side JS from accessing cookies
        secure: process.env.NODE_ENV === 'production', // Use HTTPS only in production
        maxAge: 1000 * 60 * 60 * 2 // Session timeout: 2 hours
    }
}));

// 🧩 Static file paths for Bootstrap and SweetAlert
appServer.use('/bootstrap', express.static(path.join(__dirName, 'node_modules/bootstrap/dist')));
appServer.use('/sweetAlert', express.static(path.join(__dirName, 'node_modules/sweetalert2/dist')));

// 🌐 Public route: Login Page (GET)
appServer.get('/login', (req, res) => {
    res.sendFile(path.join(__dirName, 'public', 'login.html'));
});

// 🔑 Login Form Handler (POST)
appServer.post('/login', (req, res) => {
    const { userName, password } = req.body;
    console.log('Login attempt:', req.body);

    // ✅ Simple static admin login check
    if (userName === 'admin' && password === '1234') {
        req.session.user = userName; // Store username in session
        return res.status(200).type('text').send('Login successful');
    } else {
        return res.status(401).type('text').send('Invalid credentials');
    }
});

// 🚪 Logout API: Destroy session and clear cookie
appServer.get('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Logout failed');
        }

        res.clearCookie('connect.sid'); // Clear session cookie
        res.send({ message: 'Logged out successfully' });
    });
});

// 🛡️ Protect all static files and APIs below with authentication middleware
appServer.use(isAuthenticated, express.static('public'));

// 📦 Student-related routes (GET/POST/PUT/DELETE)
appServer.use('/api/students', isAuthenticated, StudentRoute);

// 📤 Export/download routes like CSV, Excel, PDF
appServer.use('/api/export/download', isAuthenticated, DownloadRoute);

// 🏠 Main page renderer
appServer.get('/', isAuthenticated, pageUI);

// 📄 Dynamic page route: handles any other routes like `/register`, `/status`, etc.
appServer.get('/:page', isAuthenticated, pageUI);

// 🚀 Start the server
const port = process.env.PORT;
appServer.listen(port, () => console.log(`Server is running on http://localhost:${port}`));