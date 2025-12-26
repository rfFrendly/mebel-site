const tg = window.Telegram.WebApp;
tg.ready();
tg.expand(); // на весь экран

let cart = [];

function updateCart() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const total = cart.reduce((s, i) => s + i.qty * i.price, 0);
    document.getElementById('cart-count').textContent = count;
    document.getElementById('cart-total').textContent = total;
}

document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const itemEl = btn.closest('.item');
        const id = itemEl.dataset.id;
        const name = itemEl.dataset.name;
        const price = Number(itemEl.dataset.price);

        const existing = cart.find(i => i.id === id);
        if (existing) existing.qty += 1;
        else cart.push({ id, name, price, qty: 1 });

        updateCart();
    });
});

document.getElementById('checkout-btn').addEventListener('click', () => {
    if (!cart.length) {
        alert('Добавьте товары в корзину');
        return;
    }

    // отправляем корзину в бота
    tg.sendData(JSON.stringify({
        cart: cart,
        total: cart.reduce((s, i) => s + i.qty * i.price, 0)
    })); // message.web_app_data.data в боте [web:57][web:75]

    tg.close(); // закрыть WebApp
});
