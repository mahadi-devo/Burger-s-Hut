const passport = require('passport');
const User = require('../../models/user');

function authController() {
  const _getRedirectUrl = (req) => {
    return req.user.role === 'admin' ? 'admin/orders' : 'customer/orders';
  };

  return {
    login(req, res) {
      res.render('auth/login');
    },
    register(req, res) {
      res.render('auth/register');
    },
    async postLogin(req, res, next) {
      const { email, password } = req.body;

      if (!email || !password) {
        req.flash('error', 'All fields are required');
        return res.redirect('/login');
      }

      passport.authenticate('local', (err, user, info) => {
        if (err) {
          req.flash('email', req.body.email);
          req.flash('error', info.message);
          return next(err);
        }
        if (!user) {
          req.flash('email', req.body.email);
          req.flash('error', info.message);
          return res.redirect('/login');
        }

        req.logIn(user, (err) => {
          if (err) {
            req.flash('email', req.body.email);
            req.flash('error', info.message);
            return next(err);
          }
          req.flash('success', `Welcome back ${user.name}`);
          res.header(
            'Cache-Control',
            'no-cache, private, no-store, must-revalidate,max-stale=0, post-check=0, pre-check=0'
          );
          return res.redirect(_getRedirectUrl(req));
        });
      })(req, res, next);
    },
    postRegister(req, res) {
      const { name, email, password } = req.body;

      // Check if email exists
      User.exists({ email: email }, (err, result) => {
        if (result) {
          req.flash('name', name);
          req.flash('email', email);
          return res.render('auth/register', {
            error: 'Email already taken',
          });
        }
      });

      // Create a user
      const user = new User({
        name,
        email,
        password,
      });

      user
        .save()
        .then((user) => {
          // Login
          res.header(
            'Cache-Control',
            'no-cache, no-store, must-revalidate,max-stale=0, post-check=0, pre-check=0'
          );
          req.flash('success', `Hi, ${user.name} welcome to Burger's Hut`);
          return res.redirect('/login');
        })
        .catch((error) => {
          req.flash('name', name);
          req.flash('email', email);
          return res.render('auth/register', {
            error: error,
          });
        });
    },
    logout(req, res) {
      req.logout();
      return res.redirect('/login');
    },
  };
}

module.exports = authController;
