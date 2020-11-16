const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const expressLayout = require('express-ejs-layouts');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const MongoDbStore = require('connect-mongo')(session);

// Load env
dotenv.config({ path: './app/config/config.env' });

// DB Connection
const url = process.env.MONGO_URI;
mongoose.connect(url, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
});
const connection = mongoose.connection;
connection
  .once('open', () => {
    console.log(`MongoDB Connected: ${connection.host}`);
  })
  .catch((err) => {
    console.log('Connection failed...');
  });

// Session Store
let mongoStore = new MongoDbStore({
  mongooseConnection: connection,
  collection: 'sessions',
});

// Session config
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hour
  })
);

app.use(flash());

// Assets
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Global middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

// Set Template Engine
app.use(expressLayout);
app.set('views', path.join(__dirname, 'resources/views'));
app.set('view engine', 'ejs');
require('./routes/web')(app);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server is Listening to port ${PORT}`));

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
