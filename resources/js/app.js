import axios from 'axios';
import Noty from 'noty';

let addToCart = document.querySelectorAll('.add-to-cart');
let removeFromCart = document.querySelectorAll('.remove-from-cart');
let removeSelectedItemFromCart = document.querySelectorAll(
  '.remove-selected-item-from-cart'
);
let cardCounter = document.querySelector('#cardCounter');
let mode;

function updateCart(burger, mode) {
  axios
    .post('/update-cart', { burger, mode })
    .then((res) => {
      cardCounter.innerText = res.data.totalQty;
      if (
        document.getElementById(res.data.id) != null &&
        document.getElementById('price' + res.data.id) != null
      ) {
        document.getElementById(res.data.id).innerHTML = res.data.qty;
        document.getElementById('price' + res.data.id).innerHTML =
          res.data.price;
        document.getElementById('totalPrice').innerHTML = res.data.totalPrice;
      }

      if (res.data.msg != null) {
        document
          .getElementById('item' + res.data.id)
          .parentNode.removeChild(
            document.getElementById('item' + res.data.id)
          );
      }

      let notiTxt;

      if (res.data.mode.startsWith('add')) {
        notiTxt = 'Item successfully added to cart';
      } else {
        notiTxt = 'Item successfully removed from cart';
      }

      new Noty({
        type: 'success',
        timeout: 600,
        text: notiTxt,
        progressBar: false,
      }).show();
    })
    .catch((err) => {
      new Noty({
        type: 'error',
        timeout: 600,
        text: 'Something went wrong',
        progressBar: false,
      }).show();
    });
}

addToCart.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    let burger = JSON.parse(btn.dataset.burger);
    mode = btn.dataset.id;
    updateCart(burger, mode);
  });
});

removeFromCart.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    let burger = JSON.parse(btn.dataset.burger);
    mode = btn.dataset.id;
    updateCart(burger, mode);
  });
});

removeSelectedItemFromCart.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    let burger = JSON.parse(btn.dataset.burger);
    mode = btn.dataset.id;
    updateCart(burger, mode);
  });
});

let priceRange = document.querySelector('.price-range');
let filter = document.querySelector('.filter');

if (priceRange || filter) {
  document.querySelector('.price-range').addEventListener('change', (e) => {
    document.querySelector('#filtered-price').innerHTML = e.currentTarget.value;
  });

  document.querySelector('.filter').addEventListener('click', (e) => {
    document.querySelector('#filter-tab').classList.toggle('filter-toggle');
  });
}
