const Order = require('../../../models/order');
const moment = require('moment');

function orderController() {
  return {
    store(req, res) {
      // Validate request
      const { phone, address } = req.body;

      if (!phone || !address) {
        req.flash('error', 'All fields are required');
        return res.redirect('/cart');
      }

      const order = new Order({
        customerId: req.user._id,
        items: req.session.cart.items,
        phone,
        address,
      });

      order
        .save()
        .then((result) => {
          req.flash('order', 'Order placed Successfully');
          delete req.session.cart;
          return res.redirect('/customer/orders');
        })
        .catch((err) => {
          req.flash('error', 'Something went wrong!');
          console.log(err);
          return res.redirect('/');
        });
    },
    index(req, res) {
      let perPage = 10;
      let page = req.params.page || 1;

      Order.find({ customerId: req.user._id }, null, {
        sort: { createdAt: -1 },
      })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec(function(err, orders) {
          if (err) throw err;
          Order.countDocuments({}).exec((err, count) => {
            res.render('customers/orders', {
              records: orders,
              current: page,
              pages: Math.ceil(count / perPage),
              moment: moment,
            });
          });
        });
    },
    page(req, res) {
      let perPage = 10;
      let page = req.params.page || 1;

      Order.find({ customerId: req.user._id }, null, {
        sort: { createdAt: -1 },
      })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec(function(err, orders) {
          if (err) throw err;
          Order.countDocuments({}).exec((err, count) => {
            res.render('customers/orders', {
              records: orders,
              current: page,
              pages: Math.ceil(count / perPage),
              moment: moment,
            });
          });
        });
    },
  };
}

module.exports = orderController;
