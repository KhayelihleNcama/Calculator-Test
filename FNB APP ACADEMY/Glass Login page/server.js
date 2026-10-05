require('dotenv').config();

const path = require('node:path');
const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const sql = require('mssql');

const app = express();
const port = Number.parseInt(process.env.PORT || '3001', 10);
const isProduction = process.env.NODE_ENV === 'production';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordMaxBytes = 72;

function requiredEnvironmentVariable(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

function booleanEnvironmentVariable(name, defaultValue) {
    const value = process.env[name];
    if (value === undefined) {
        return defaultValue;
    }
    if (value.toLowerCase() === 'true') {
        return true;
    }
    if (value.toLowerCase() === 'false') {
        return false;
    }
    throw new Error(`${name} must be "true" or "false".`);
}

const sessionSecret = requiredEnvironmentVariable('SESSION_SECRET');
if (sessionSecret.length < 32 || sessionSecret.startsWith('replace-this-with-')) {
    throw new Error('SESSION_SECRET must be a private random value of at least 32 characters.');
}

const databaseConfig = {
    server: requiredEnvironmentVariable('DB_SERVER'),
    port: Number.parseInt(process.env.DB_PORT || '1433', 10),
    database: requiredEnvironmentVariable('DB_NAME'),
    user: requiredEnvironmentVariable('DB_USER'),
    password: requiredEnvironmentVariable('DB_PASSWORD'),
    options: {
        encrypt: booleanEnvironmentVariable('DB_ENCRYPT', true),
        trustServerCertificate: booleanEnvironmentVariable('DB_TRUST_SERVER_CERTIFICATE', false),
    },
    connectionTimeout: 15000,
    requestTimeout: 15000,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
}
if (!Number.isInteger(databaseConfig.port) || databaseConfig.port < 1 || databaseConfig.port > 65535) {
    throw new Error('DB_PORT must be an integer between 1 and 65535.');
}

const poolPromise = new sql.ConnectionPool(databaseConfig).connect();

app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
app.use(session({
    name: 'login.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
    },
}));

const authenticationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts. Please wait and try again.' },
});

function validateRegistration(body) {
    const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
    const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const countryCode = typeof body.countryCode === 'string' ? body.countryCode : '';
    const phoneNumber = typeof body.phoneNumber === 'string' ? body.phoneNumber : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (firstName.length < 1 || firstName.length > 100 || lastName.length < 1 || lastName.length > 100) {
        return { error: 'Enter a first and last name of no more than 100 characters.' };
    }
    if (email.length > 254 || !emailPattern.test(email)) {
        return { error: 'Enter a valid email address.' };
    }
    if (!/^\+\d{1,4}$/.test(countryCode) || !/^\d{7,15}$/.test(phoneNumber)) {
        return { error: 'Enter a valid country code and cellphone number.' };
    }
    if (password.length < 8 || Buffer.byteLength(password, 'utf8') > passwordMaxBytes) {
        return { error: 'Password must be at least 8 characters and no more than 72 bytes.' };
    }
    if (body.termsAccepted !== true) {
        return { error: 'You must accept the terms and conditions.' };
    }

    return {
        value: { firstName, lastName, email, countryCode, phoneNumber, password },
    };
}

function regenerateSession(request, accountId, rememberMe) {
    return new Promise((resolve, reject) => {
        request.session.regenerate((error) => {
            if (error) {
                reject(error);
                return;
            }

            request.session.accountId = accountId;
            if (rememberMe) {
                request.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
            }
            request.session.save((saveError) => {
                if (saveError) {
                    reject(saveError);
                    return;
                }
                resolve();
            });
        });
    });
}

function requireAuthentication(request, response, next) {
    if (request.session.accountId) {
        next();
        return;
    }
    response.redirect('/login.html');
}

app.get('/', (request, response) => {
    response.redirect('/login.html');
});

app.post('/api/register', authenticationLimiter, async (request, response) => {
    const validation = validateRegistration(request.body || {});
    if (validation.error) {
        response.status(400).json({ message: validation.error });
        return;
    }

    try {
        const { firstName, lastName, email, countryCode, phoneNumber, password } = validation.value;
        const passwordHash = await bcrypt.hash(password, 12);
        const pool = await poolPromise;
        await pool.request()
            .input('firstName', sql.NVarChar(100), firstName)
            .input('lastName', sql.NVarChar(100), lastName)
            .input('email', sql.NVarChar(254), email)
            .input('countryCode', sql.VarChar(5), countryCode)
            .input('phoneNumber', sql.VarChar(15), phoneNumber)
            .input('passwordHash', sql.VarChar(100), passwordHash)
            .query(`
                INSERT INTO dbo.Accounts
                    (FirstName, LastName, Email, CountryCode, PhoneNumber, PasswordHash, TermsAcceptedAt)
                VALUES
                    (@firstName, @lastName, @email, @countryCode, @phoneNumber, @passwordHash, SYSUTCDATETIME());
            `);

        response.status(201).json({ message: 'Account created. You can now log in.' });
    } catch (error) {
        if (error.number === 2601 || error.number === 2627) {
            response.status(409).json({ message: 'An account with that email address already exists.' });
            return;
        }
        console.error('Account registration failed:', error.message);
        response.status(503).json({ message: 'Account registration is temporarily unavailable.' });
    }
});

app.post('/api/login', authenticationLimiter, async (request, response) => {
    const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
    const password = typeof request.body?.password === 'string' ? request.body.password : '';

    if (!emailPattern.test(email) || !password || Buffer.byteLength(password, 'utf8') > passwordMaxBytes) {
        response.status(400).json({ message: 'Enter a valid email address and password.' });
        return;
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.NVarChar(254), email)
            .query(`
                SELECT AccountId, PasswordHash
                FROM dbo.Accounts
                WHERE Email = @email;
            `);

        const account = result.recordset[0];
        if (!account || !(await bcrypt.compare(password, account.PasswordHash))) {
            response.status(401).json({ message: 'Invalid email or password.' });
            return;
        }

        await regenerateSession(request, account.AccountId, request.body?.rememberMe === true);
        response.json({ message: 'Login successful.' });
    } catch (error) {
        console.error('Login failed:', error.message);
        response.status(503).json({ message: 'Login is temporarily unavailable.' });
    }
});

app.post('/api/logout', (request, response) => {
    request.session.destroy((error) => {
        if (error) {
            console.error('Logout failed:', error.message);
            response.status(500).json({ message: 'Could not end the session. Please try again.' });
            return;
        }
        response.clearCookie('login.sid', { httpOnly: true, sameSite: 'lax', secure: isProduction });
        response.status(204).end();
    });
});

app.get(['/website', '/website/', '/website/index.html'], requireAuthentication, (request, response) => {
    response.sendFile(path.join(__dirname, 'website', 'index.html'));
});

app.use('/website', requireAuthentication, express.static(path.join(__dirname, 'website'), { index: false }));
app.use('/Images', express.static(path.join(__dirname, 'Images')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));

for (const fileName of ['login.html', 'register.html', 'Forgote passwprd.html', 'style.css']) {
    app.get(`/${fileName}`, (request, response) => {
        response.sendFile(path.join(__dirname, fileName));
    });
}

app.use((request, response) => {
    if (request.path.startsWith('/api/')) {
        response.status(404).json({ message: 'Not found.' });
        return;
    }
    response.status(404).send('Not found.');
});

async function startServer() {
    try {
        await poolPromise;
        app.listen(port, () => {
            console.log(`Login app listening on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Could not connect to SQL Server. Check DB_SERVER, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, and SQL Server availability.');
        console.error(error.message);
        process.exitCode = 1;
    }
}

startServer();
