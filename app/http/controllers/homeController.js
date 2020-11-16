const Menu = require('../../models/menu.js');
function homeController() {
  return {
    async index(req, res) {
      const { size, price } = req.query;
      let large, medium, small, queryPrice;
      let query;

      if (price) {
        queryPrice = price.lte;
      }

      if (typeof size == 'string') {
        switch (size) {
          case 'large':
            large = size;
            break;
          case 'medium':
            medium = size;
            break;
          case 'small':
            small = size;
            break;
        }
      } else if (typeof size == 'object') {
        if (size[0] == 'large' || size[1] == 'large' || size[2] == 'large') {
          large = 'large';
        }

        if (size[0] == 'medium' || size[1] == 'medium' || size[2] == 'medium') {
          medium = 'medium';
        }

        if (size[0] == 'small' || size[1] == 'small' || size[2] == 'small') {
          small = 'small';
        }
      }

      let queryStr = JSON.stringify(req.query);
      queryStr = queryStr.replace(
        /\b(gt|gte|lt|lte)\b/g,
        (match) => `$${match}`
      );

      query = Menu.find(JSON.parse(queryStr));
      const burgers = await query;
      return res.render('home', {
        burgers: burgers,
        count: burgers.length,
        large,
        medium,
        small,
        queryPrice,
      });
    },
  };
}

module.exports = homeController;
