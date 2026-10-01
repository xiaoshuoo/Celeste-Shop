const API = 'https://6ab98e67f84897980b729f60.mockapi.io/items';

let items = [];
let comments = [];
let cart = [];
let current = null;

const list = document.getElementById('products');
const itemWindow = document.getElementById('productModal');
const cartWindow = document.getElementById('cartModal');
const videoBox = document.getElementById('modalVideo');
const info = document.getElementById('reviewMessage');
const nameInput = document.getElementById('reviewAuthor');
const textInput = document.getElementById('reviewText');


async function loadData() {
  try {
    const response = await fetch(API + '?limit=999');
    const data = await response.json();

    for (let i = 0; i < data.length; i++) {
      if (data[i].type === 'product') {
        items.push(data[i]);
      } else {
        comments.push(data[i]);
      }
    }

    showItems();
  } catch (error) {
    list.innerHTML = '<p class="muted">Не удалось загрузить товары. Отключи блокировщик рекламы и обнови страницу.</p>';
  }
}


function showItems() {
  let html = '';

  for (let i = 0; i < items.length; i++) {
    html += `
      <div class="card" onclick="openItem(${i})">
        <img src="${items[i].image}">
        <h3>${items[i].name}</h3>
        <p class="muted">${items[i].hero}</p>
        <p class="price">${items[i].price} душ</p>
      </div>
    `;
  }

  list.innerHTML = html;
}


function addToCart(item) {
  cart.push(item);
  showCart();
}

function removeItem(i) {
  cart.splice(i, 1);
  showCart();
}

function showCart() {
  const box = document.getElementById('cartItems');
  document.getElementById('cartCount').textContent = cart.length;

  if (cart.length === 0) {
    box.innerHTML = '<p class="muted">В корзине пока пусто.</p>';
    return;
  }

  let html = '';
  let sum = 0;

  for (let i = 0; i < cart.length; i++) {
    html += `
      <div class="row">
        <span>${cart[i].name} — ${cart[i].price} душ</span>
        <button onclick="removeItem(${i})">Удалить</button>
      </div>
    `;
    sum += Number(cart[i].price);
  }

  html += `
    <p class="total">Итого: <b>${sum} душ</b></p>
    <button onclick="alert('Оплата пока не подключена')">Купить</button>
  `;

  box.innerHTML = html;
}

function openCart() {
  showCart();
  cartWindow.classList.add('is-open');
}


function openItem(i) {
  current = items[i];

  document.getElementById('modalTitle').textContent = current.name;
  document.getElementById('modalPrice').textContent = current.price + ' душ';
  document.getElementById('modalDesc').textContent = current.description;
  document.getElementById('modalImage').innerHTML = '<img src="' + current.image + '">';

  if (current.video) {
    videoBox.innerHTML = '<iframe src="' + current.video.replace('watch?v=', 'embed/') + '" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
    videoBox.style.display = 'block';
  } else {
    videoBox.style.display = 'none';
  }

  showComments();

  nameInput.value = '';
  textInput.value = '';
  info.textContent = '';

  itemWindow.classList.add('is-open');
}

function showComments() {
  let html = '';

  for (let i = 0; i < comments.length; i++) {
    if (comments[i].product === current.name) {
      html += `
        <div class="review">
          <b>${comments[i].author}</b> ${comments[i].rating} ★
          <p>${comments[i].text}</p>
        </div>
      `;
    }
  }

  if (html === '') {
    html = '<p class="muted">Отзывов пока нет.</p>';
  }

  document.getElementById('modalReviews').innerHTML = html;
}

async function sendComment() {
  const name = nameInput.value.trim();
  const text = textInput.value.trim();

  if (name === '' || text === '') {
    info.textContent = 'Заполни имя и текст отзыва.';
    return;
  }

  const newComment = {
    type: 'review',
    product: current.name,
    author: name,
    rating: Number(document.getElementById('reviewRating').value),
    text: text
  };

  info.textContent = 'Отправляем...';

  try {
    const response = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newComment)
    });

    const saved = await response.json();
    comments.push(saved);

    showComments();
    nameInput.value = '';
    textInput.value = '';
    info.textContent = 'Спасибо! Отзыв отправлен.';
  } catch (error) {
    info.textContent = 'Не удалось отправить отзыв. Попробуй ещё раз.';
  }
}


function closeAll() {
  videoBox.innerHTML = '';
  itemWindow.classList.remove('is-open');
  cartWindow.classList.remove('is-open');
}


document.getElementById('modalBuyBtn').onclick = function () {
  addToCart(current);
};
document.getElementById('reviewSendBtn').onclick = sendComment;
document.getElementById('cartBtn').onclick = openCart;

const closeButtons = document.querySelectorAll('.close');
for (let i = 0; i < closeButtons.length; i++) {
  closeButtons[i].onclick = closeAll;
}


loadData();
