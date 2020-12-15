import axios from 'axios';
import Noty from 'noty';
import lozad from 'lozad';
import { initAdmin } from './admin';
import moment from 'moment';

let addToCart = document.querySelectorAll('.add-to-cart');
let removeFromCart = document.querySelectorAll('.remove-from-cart');
let removeSelectedItemFromCart = document.querySelectorAll(
  '.remove-selected-item-from-cart'
);
let cardCounter = document.querySelector('#cardCounter');
let cardCounterMobile = document.querySelector('#cardCounter-mobile');

let mode;

function updateCart(burger, mode) {
  axios
    .post('/update-cart', { burger, mode })
    .then((res) => {
      cardCounter.innerText = res.data.totalQty;
      cardCounterMobile.innerText = res.data.totalQty;
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

lozad('.lozad', {
  load: function(el) {
    el.src = el.dataset.src;
    el.onload = function() {
      el.classList.add('fade');
    };
  },
}).observe();

// Remove alert messages after 2s
const alertMsg = document.querySelector('#success-alert');

if (alertMsg) {
  setTimeout(() => {
    alertMsg.remove();
  }, 2000);
}

const dropdownToggle = document.querySelector('#toggle');
const dropdown = document.querySelector('#dropdown');

if (dropdownToggle) {
  dropdownToggle.addEventListener('click', () => {
    dropdown.classList.toggle('dropdown-show');
  });
}

// Change Order Status
let statuses = document.querySelectorAll('.status_line');
let hiddenInput = document.querySelector('#hiddenInput');
let order = document.querySelector('#hiddenInput')
  ? document.querySelector('#hiddenInput').value
  : null;

let time = document.createElement('small');

order = JSON.parse(order);

function updateStatus(order) {
  statuses.forEach((status) => {
    status.classList.remove('step-completed');
    status.classList.remove('current');
  });
  let stepCompleted = true;

  statuses.forEach((status) => {
    let dataProp = status.dataset.status;

    if (stepCompleted) {
      status.classList.add('step-completed');
    }
    if (dataProp === order.status) {
      stepCompleted = false;
      time.innerText = moment(order.updatedAt).format('hh:mm A');
      status.appendChild(time);
      if (status.nextElementSibling) {
        status.nextElementSibling.classList.add('current');
      }
    }
  });
}

updateStatus(order);

// Socket
let socket = io();

// Join
if (order) {
  socket.emit('join', `order_${order._id}`);
}

let AdminAreaPath = window.location.pathname;

if (AdminAreaPath.includes('admin')) {
  initAdmin(socket);
  socket.emit('join', 'adminRoom');
}

socket.on('orderUpdated', (data) => {
  const updatedOrder = { ...order };
  updatedOrder.updatedAt = moment().format();
  updatedOrder.status = data.status;
  console.log(data);
  updateStatus(updatedOrder);
  new Noty({
    type: 'success',
    timeout: 600,
    text: 'Order Updated',
    progressBar: false,
  }).show();
});

// Mobile Navbar

let mainNav = document.getElementById('js-menu');
let navBarToggle = document.getElementById('js-navbar-toggle');

navBarToggle.addEventListener('click', function() {
  mainNav.classList.toggle('dropdown-show');
});
