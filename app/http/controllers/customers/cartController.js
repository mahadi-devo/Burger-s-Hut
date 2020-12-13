const Menu = require('../../../models/menu.js');
function cartController() {
  return {
    async cart(req, res) {
      const burgers = await Menu.find();
      res.render('customers/cart', { burgers: burgers });
    },
    update(req, res) {
      // first time creating a cart and adding basic structure
      if (!req.session.cart) {
        req.session.cart = {
          items: {},
          totalQty: 0,
          totalPrice: 0,
        };
      }

      let cart = req.session.cart;

      // Check if item does not exist in cart
      if (
        !cart.items[req.body.burger._id] &&
        req.body.mode == `add-to-cart${req.body.burger._id}`
      ) {
        cart.items[req.body.burger._id] = {
          item: req.body.burger,
          qty: 1,
        };
        cart.totalQty = cart.totalQty + 1;
        cart.totalPrice = cart.totalPrice + req.body.burger.price;
      } else if (
        cart.items[req.body.burger._id] &&
        req.body.mode == `remove-from-cart${req.body.burger._id}`
      ) {
        if (req.session.cart.items[req.body.burger._id].qty == 1) {
          try {
            let id = req.session.cart.items[req.body.burger._id].item._id;
            let qty = req.session.cart.items[req.body.burger._id].qty;
            let price =
              req.session.cart.items[req.body.burger._id].item.price / qty;
            delete cart.items[req.body.burger._id];

            req.session.cart.totalQty = req.session.cart.totalQty - 1;
            req.session.cart.totalPrice = req.session.cart.totalPrice - price;

            return res.json({
              msg: `Remove the cart item with ${id}`,
              totalQty: req.session.cart.totalQty,
              id: id,
              totalPrice: req.session.cart.totalPrice,
              mode: req.body.mode,
            });
          } catch (error) {
            process.exitCode = 1;
          }
        } else if (req.session.cart.items[req.body.burger._id].qty < 1) {
          process.exitCode = 1;
        } else {
          cart.items[req.body.burger._id].qty =
            cart.items[req.body.burger._id].qty - 1;
          cart.totalQty = cart.totalQty - 1;
          cart.totalPrice = cart.totalPrice - req.body.burger.price;
        }
      } else if (
        cart.items[req.body.burger._id] &&
        req.body.mode == `remove-selected-item-from-cart${req.body.burger._id}`
      ) {
        try {
          let id = req.session.cart.items[req.body.burger._id].item._id;
          let qty = req.session.cart.items[req.body.burger._id].qty;
          let price =
            req.session.cart.items[req.body.burger._id].item.price * qty;

          delete cart.items[req.body.burger._id];

          req.session.cart.totalQty = req.session.cart.totalQty - qty;
          req.session.cart.totalPrice = req.session.cart.totalPrice - price;

          return res.json({
            msg: `Remove the cart item with ${id}`,
            totalQty: req.session.cart.totalQty,
            id: id,
            totalPrice: req.session.cart.totalPrice,
            mode: req.body.mode,
          });
        } catch (error) {
          process.exitCode = 1;
        }
      } else {
        cart.items[req.body.burger._id].qty =
          cart.items[req.body.burger._id].qty + 1;
        cart.totalQty = cart.totalQty + 1;
        cart.totalPrice = cart.totalPrice + req.body.burger.price;
      }

      return res.json({
        totalQty: req.session.cart.totalQty,
        id: req.session.cart.items[req.body.burger._id].item._id,
        totalPrice: req.session.cart.totalPrice,
        price:
          req.session.cart.items[req.body.burger._id].qty *
          req.session.cart.items[req.body.burger._id].item.price,
        qty: req.session.cart.items[req.body.burger._id].qty,
        mode: req.body.mode,
      });
    },
  };
}

module.exports = cartController;
