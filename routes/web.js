const homeController = require('../app/http/controllers/homeController.js');
const authController = require('../app/http/controllers/authController.js');
const cartController = require('../app/http/controllers/customers/cartController.js');
const orderController = require('../app/http/controllers/customers/orderController.js');
const adminOrderController = require('../app/http/controllers/admin/orderController.js');
const guest = require('../app/http/middleware/guest.js');
const auth = require('../app/http/middleware/auth.js');
const admin = require('../app/http/middleware/admin.js');

function initRoutes(app) {
  app.get('/', homeController().index);
  app.get('/login', guest, authController().login);
  app.post('/login', authController().postLogin);
  app.get('/register', guest, authController().register);
  app.post('/register', authController().postRegister);
  app.post('/logout', authController().logout);

  app.get('/cart', cartController().cart);
  app.post('/update-cart', cartController().update);

  // Cutomers Route
  app.post('/orders', auth, orderController().store);
  app.get('/customer/orders', auth, orderController().index);
  app.get('/customer/orders/:page', auth, orderController().page);

  // Admin Routes
  app.get('/admin/orders', admin, adminOrderController().index);
}

module.exports = initRoutes;
