const homeController = require('../app/http/controllers/homeController.js');
const authController = require('../app/http/controllers/authController.js');
const cartController = require('../app/http/controllers/customers/cartController.js');
const guest = require('../app/http/middleware/guest.js');

function initRoutes(app) {
  app.get('/', homeController().index);
  app.get('/login', guest, authController().login);
  app.post('/login', authController().postLogin);
  app.get('/register', guest, authController().register);
  app.post('/register', authController().postRegister);
  app.post('/logout', authController().logout);

  app.get('/cart', cartController().cart);
  app.post('/update-cart', cartController().update);
}

module.exports = initRoutes;
