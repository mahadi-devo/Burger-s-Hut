const Order = require('../../../models/order');
const moment = require('moment');

function orderController() {
  return {
    store(req, res) {
      // Validate request
      const { phone, address } = req.body;

      if (!phone || !address) {
        req.flash('error', 'All fields are required');
        return res.redirect('back');
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
          Order.populate(result, { path: 'customerId' }, (err, placedOrder) => {
            req.flash('order', 'Order placed Successfully');
            //  Emit
            const eventEmitter = req.app.get('eventEmitter');
            eventEmitter.emit('orderPlaced', placedOrder);
            delete req.session.cart;
            return res.redirect('/customer/orders');
          });
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
            res.header(
              'Cache-Control',
              'no-cache, private, no-store, must-revalidate,max-stale=0, post-check=0, pre-check=0'
            );
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
    async show(req, res) {
      const order = await Order.findById(req.params.id);
      // Authorize user
      if (req.user._id.toString() === order.customerId.toString()) {
        return res.render('customers/singleOrder', { order });
      }
      return res.redirect('/');
    },
  };
}

module.exports = orderController;
