const tg = window.Telegram.WebApp;

tg.ready();
tg.expand(); // на весь экран

let cart = [];
let currentItem = null;

function updateCartViews() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const total = cart.reduce((s, i) => s + i.qty * i.price, 0);

    const countSpan = document.getElementById('cart-count');
    const totalSpan = document.getElementById('cart-total');
    const topCount = document.getElementById('cart-top-count');

    if (countSpan) countSpan.textContent = count;
    if (totalSpan) totalSpan.textContent = total;
    if (topCount) topCount.textContent = count;
}

// обработчик кнопки "В корзину" — открываем модалку количества
document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const itemEl = btn.closest('.item');
        const id = itemEl.dataset.id;
        const name = itemEl.dataset.name;
        const price = Number(itemEl.dataset.price);

        currentItem = { id, name, price };

        document.getElementById('qty-title').textContent =
            `Добавить «${name}»`;
        document.getElementById('qty-value').textContent = '1';
        document.getElementById('qty-modal').classList.add('open');
    });
});

// модалка количества
const qtyModal = document.getElementById('qty-modal');
const qtyValueEl = document.getElementById('qty-value');

document.getElementById('qty-plus').onclick = () => {
    qtyValueEl.textContent = String(Number(qtyValueEl.textContent) + 1);
};

document.getElementById('qty-minus').onclick = () => {
    const v = Number(qtyValueEl.textContent);
    if (v > 1) qtyValueEl.textContent = String(v - 1);
};

document.getElementById('qty-cancel').onclick = () => {
    qtyModal.classList.remove('open');
};

document.getElementById('qty-ok').onclick = () => {
    const qty = Number(qtyValueEl.textContent) || 1;
    if (!currentItem) return;

    const existing = cart.find(i => i.id === currentItem.id);
    if (existing) existing.qty += qty;
    else cart.push({ ...currentItem, qty });

    qtyModal.classList.remove('open');
    updateCartViews();
};

// модалка корзины
const cartModal = document.getElementById('cart-modal');
const cartItemsEl = document.getElementById('cart-items');

document.getElementById('open-cart').onclick = () => {
    renderCartModal();
    cartModal.classList.add('open');
};

document.getElementById('cart-close').onclick = () => {
    cartModal.classList.remove('open');
};

function renderCartModal() {
    if (!cart.length) {
        cartItemsEl.innerHTML = '<p>Корзина пуста</p>';
    } else {
        cartItemsEl.innerHTML = cart.map(i =>
            `<div>${i.name} — ${i.qty} шт × ${i.price} ₽</div>`
        ).join('');
    }
    const total = cart.reduce((s, i) => s + i.qty * i.price, 0);
    document.getElementById('cart-total-modal').textContent = total;
}

// отправка заказа в бота из корзины
document.getElementById('cart-checkout').onclick = () => {
    if (!cart.length) {
        alert('Корзина пуста');
        return;
    }

    tg.sendData(JSON.stringify({
        cart: cart,
        total: cart.reduce((s, i) => s + i.qty * i.price, 0)
    }));

    tg.close();
};
