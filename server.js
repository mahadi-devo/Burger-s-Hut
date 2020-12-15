const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const expressLayout = require('express-ejs-layouts');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const morgan = require('morgan');
const MongoDbStore = require('connect-mongo')(session);
const Emitter = require('events');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

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

// Event Emitter
const eventEmitter = new Emitter();
app.set('eventEmitter', eventEmitter);

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

// Passport Config
const passportInit = require('./app/config/passport');
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Dev logger Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(flash());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 500,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Assets
app.use(express.static('public'));

// Global middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

// Set Template Engine
app.use(expressLayout);
app.set('views', path.join(__dirname, 'resources/views'));
app.set('view engine', 'ejs');
require('./routes/web')(app);

const PORT = process.env.PORT || 3500;

app.use((req, res) => {
  res.status(404).render('errors/404');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).redirect('/');
});

const server = app.listen(PORT, () =>
  console.log(`Server is Listening to port ${PORT}`)
);

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});

const io = require('socket.io')(server);
io.on('connection', (socket) => {
  //  Join
  socket.on('join', (roomName) => {
    socket.join(roomName);
  });
});

eventEmitter.on('orderUpdated', (data) => {
  io.to(`order_${data.id}`).emit('orderUpdated', data);
});

eventEmitter.on('orderPlaced', (data) => {
  io.to(`adminRoom`).emit('orderPlaced', data);
});
