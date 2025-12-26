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

// ЖДЕМ ПОЛНУЮ ЗАГРУЗКУ DOM
document.addEventListener('DOMContentLoaded', function() {

    /* ---------- КНОПКА "В КОРЗИНУ" + ВЫБОР КОЛИЧЕСТВА ---------- */
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemEl = btn.closest('.item');
            const id = itemEl.dataset.id;
            const name = itemEl.dataset.name;
            const price = Number(itemEl.dataset.price);
            const desc = itemEl.dataset.desc || '';
            let images = [];

            try {
                images = itemEl.dataset.images ? JSON.parse(itemEl.dataset.images) : [];
            } catch (e) {
                images = [];
            }

            currentItem = { id, name, price, desc, images };

            document.getElementById('qty-title').textContent = `Добавить «${name}»`;
            document.getElementById('qty-value').textContent = '1';
            document.getElementById('qty-modal').classList.add('open');
        });
    });

    /* ---------- КОЛИЧЕСТВО ---------- */
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

    /* ---------- МОДАЛКА КОРЗИНЫ ---------- */
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
            cartItemsEl.innerHTML = cart
                .map(i => `<div>${i.name} — ${i.qty} шт × ${i.price} ₽</div>`)
                .join('');
        }
        const total = cart.reduce((s, i) => s + i.qty * i.price, 0);
        document.getElementById('cart-total-modal').textContent = total;
    }

    /* ---------- ПЕРЕХОД К ФОРМЕ ДОСТАВКИ ---------- */
    document.getElementById('cart-checkout').onclick = () => {
        if (!cart.length) {
            alert('Корзина пуста');
            return;
        }
        document.getElementById('shipping-modal').classList.add('open');
    };

    /* ---------- ФОРМА ДОСТАВКИ ---------- */
    const shippingModal = document.getElementById('shipping-modal');
    
    document.getElementById('ship-cancel').onclick = () => {
        shippingModal.classList.remove('open');
    };

    document.getElementById('ship-ok').onclick = () => {
        const name = document.getElementById('ship-name').value.trim();
        const phone = document.getElementById('ship-phone').value.trim();
        const address = document.getElementById('ship-address').value.trim();

        if (!name || !phone || !address) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        const payload = {
            cart: cart,
            total: cart.reduce((s, i) => s + i.qty * i.price, 0),
            customer: { name, phone, address }
        };

        tg.sendData(JSON.stringify(payload));
        tg.close();
    };

    /* ---------- ЛАЙТБОКС ДЛЯ ФОТО ---------- */
    const lightbox = document.getElementById('lightbox');
    const imgEl = lightbox.querySelector('.lightbox-image');
    const btnClose = lightbox.querySelector('.lightbox-close');
    const btnPrev = lightbox.querySelector('.lightbox-prev');
    const btnNext = lightbox.queryListener('lightbox-next');
    const backdrop = lightbox.querySelector('.lightbox-backdrop');

    let images = [];
    let index = 0;

    function openLightbox(imgList, startIndex) {
        images = imgList;
        index = startIndex || 0;
        imgEl.src = images[index];
        lightbox.classList.add('open');
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
    }

    function show(delta) {
        if (!images.length) return;
        index = (index + delta + images.length) % images.length;
        imgEl.src = images[index];
    }

    btnClose.onclick = closeLightbox;
    backdrop.onclick = closeLightbox;
    btnPrev.onclick = () => show(-1);
    btnNext.onclick = () => show(1);

    // Подключение лайтбокса к изображениям товаров
    document.querySelectorAll('.item').forEach(item => {
        const imgs = item.querySelectorAll('.js-open-lightbox');
        const data = item.getAttribute('data-images');
        let imgList = [];
        try {
            imgList = data ? JSON.parse(data) : [];
        } catch (e) {
            imgList = Array.from(imgs).map(i => i.src);
        }

        imgs.forEach((imgNode, i) => {
            imgNode.onclick = () => openLightbox(imgList, i);
        });
    });

}); // конец DOMContentLoaded
