const User = require('../../models/user');

function authController() {
  return {
    login(req, res) {
      res.render('auth/login');
    },
    register(req, res) {
      res.render('auth/register');
    },
    async postRegister(req, res) {
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
          req.flash('success', `Hi, ${user.name} welcome to Burger's Hut`);
          return res.redirect('/');
        })
        .catch((error) => {
          req.flash('name', name);
          req.flash('email', email);
          return res.render('auth/register', {
            error: error,
          });
        });
    },
  };
}

module.exports = authController;
