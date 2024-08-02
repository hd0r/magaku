const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const session = require('express-session');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));

// إعداد جلسات
app.use(session({
  secret: 'your_secret_key_2006_mangaku',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

const pool = new Pool({
  user: 'koyeb-adm',
  host: 'ep-summer-thunder-a2u8j8ss.eu-central-1.pg.koyeb.app',
  database: 'koyebdb',
  password: 'hVa57pEYmJNI',
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
    require: true
  }
});
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'haider2006789@hotmail.com',
    pass: 'haiderali123321'
  }
});

// Passport configuration
passport.use(new LocalStrategy(
  {
    usernameField: 'login', // استخدم حقل 'login' بدلاً من 'username' الافتراضي
    passwordField: 'password'
  },
  async (login, password, done) => {
    try {
      // حاول العثور على المستخدم باستخدام اسم المستخدم أو البريد الإلكتروني
      const res = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $1', [login]);
      if (res.rows.length > 0) {
        const user = res.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'الباسورد غير صحيح' });
        }
      } else {
        return done(null, false, { message: 'اسم المستخدم أو البريد الإلكتروني غير متوفر' });
      }
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (res.rows.length > 0) {
      done(null, res.rows[0]);
    } else {
      done(null, false);
    }
  } catch (err) {
    done(err);
  }
});

app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    // تحقق من ما إذا كان البريد الإلكتروني مستخدمًا بالفعل
    const emailExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailExists.rows.length > 0) {
      return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل' });
    }

    const result = await pool.query('INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id', [username, hashedPassword, email]);
    res.status(201).json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/check-email', async (req, res) => {
  const { email } = req.query;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      res.status(200).json({ exists: true });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/check-username', async (req, res) => {
  const { username } = req.query;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      res.status(200).json({ exists: true });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return res.status(500).json({ error: 'Internal server error' });
    if (!user) return res.status(401).json({ error: info.message });
    req.logIn(user, (err) => {
      if (err) return res.status(500).json({ error: 'Internal server error' });
      return res.status(200).json({ id: user.id });
    });
  })(req, res, next);
});

// إرسال رمز التحقق عبر البريد الإلكتروني باستخدام Hotmail
app.post('/send-verification-code', async (req, res) => {
  const { email } = req.body;
  const verificationCode = crypto.randomInt(100000, 999999).toString();
  try {
    await pool.query('UPDATE users SET verification_code = $1 WHERE email = $2', [verificationCode, email]);
    const mailOptions = {
      from: 'haider2006789@hotmail.com',
      to: email,
      subject: 'رمز التحقق لتغيير كلمة المرور',
      text:` رمز التحقق الخاص بك هو ${verificationCode}`,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني' });
  } catch (err) {
    console.error('Error in /send-verification-code:', err);
    res.status(500).json({ error: 'خطأ في إرسال رمز التحقق' });
  }
});

app.post('/reset-password', async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND verification_code = $2', [email, verificationCode]);
    if (result.rows.length > 0) {
      await pool.query('UPDATE users SET password = $1, verification_code = NULL WHERE email = $2', [hashedPassword, email]);
      res.status(200).json({ message: 'تم تغيير كلمة المرور بنجاح' });
    } else {
      res.status(400).json({ error: 'رمز التحقق غير صحيح' });
    }
  } catch (err) {
    console.error('Error in /reset-password:', err);
    res.status(500).json({ error: 'خطأ في تغيير كلمة المرور' });
  }
});


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});