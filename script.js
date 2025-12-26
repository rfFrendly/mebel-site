const tg = window.Telegram.WebApp;
tg.ready();
tg.expand(); // во весь экран

let cart = [];
let currentItem = null;

function updateCartViews() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.qty * i.price, 0);

  const countSpan = document.getElementById("cart-count");
  const totalSpan = document.getElementById("cart-total");
  const topCount = document.getElementById("cart-top-count");

  if (countSpan) countSpan.textContent = count;
  if (totalSpan) totalSpan.textContent = total;
  if (topCount) topCount.textContent = count;
}

// Ждем загрузку DOM
document.addEventListener("DOMContentLoaded", function () {
  /* ---------- КНОПКА "В КОРЗИНУ" + ВЫБОР КОЛИЧЕСТВА ---------- */
  document.querySelectorAll(".add-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const itemEl = btn.closest(".item");
      const id = itemEl.dataset.id;
      const name = itemEl.dataset.name;
      const price = Number(itemEl.dataset.price);
      const desc = itemEl.dataset.desc || "";

      let images = [];
      try {
        images = itemEl.dataset.images ? JSON.parse(itemEl.dataset.images) : [];
      } catch (e) {
        images = [];
      }

      currentItem = { id, name, price, desc, images };

      document.getElementById("qty-title").textContent = `Добавить «${name}»`;
      document.getElementById("qty-value").textContent = "1";
      document.getElementById("qty-modal").classList.add("open");
    });
  });

  /* ---------- КОЛИЧЕСТВО ДОБАВЛЕНИЯ ---------- */
  const qtyModal = document.getElementById("qty-modal");
  const qtyValueEl = document.getElementById("qty-value");

  document.getElementById("qty-plus").onclick = () => {
    qtyValueEl.textContent = String(Number(qtyValueEl.textContent) + 1);
  };

  document.getElementById("qty-minus").onclick = () => {
    const v = Number(qtyValueEl.textContent);
    if (v > 1) qtyValueEl.textContent = String(v - 1);
  };

  document.getElementById("qty-cancel").onclick = () => {
    qtyModal.classList.remove("open");
  };

  document.getElementById("qty-ok").onclick = () => {
    const qty = Number(qtyValueEl.textContent) || 1;
    if (!currentItem) return;

    const existing = cart.find((i) => i.id === currentItem.id);
    if (existing) existing.qty += qty;
    else cart.push({ ...currentItem, qty });

    qtyModal.classList.remove("open");
    updateCartViews();
  };

  /* ---------- МОДАЛКА КОРЗИНЫ ---------- */
  const cartModal = document.getElementById("cart-modal");
  const cartItemsEl = document.getElementById("cart-items");

  document.getElementById("open-cart").onclick = () => {
    renderCartModal();
    cartModal.classList.add("open");
  };

  document.getElementById("cart-close").onclick = () => {
    cartModal.classList.remove("open");
  };

  function renderCartModal() {
    if (!cart.length) {
      cartItemsEl.innerHTML = `<p class="cart-empty">Корзина пуста</p>`;
    } else {
      cartItemsEl.innerHTML = cart
        .map(
          (i, idx) => `
          <div class="cart-row" data-index="${idx}">
            <div class="cart-row-main">
              <div class="cart-row-name">${i.name}</div>
              <div class="cart-row-price">${i.price} ₽ за шт.</div>
            </div>
            <div class="cart-row-controls">
              <button class="cart-qty-btn cart-qty-minus">−</button>
              <span class="cart-qty-value">${i.qty}</span>
              <button class="cart-qty-btn cart-qty-plus">+</button>
              <div class="cart-row-total">${i.qty * i.price} ₽</div>
              <button class="cart-remove-btn">×</button>
            </div>
          </div>
        `
        )
        .join("");
    }

    const total = cart.reduce((s, i) => s + i.qty * i.price, 0);
    document.getElementById("cart-total-modal").textContent = total;

    // Вешаем обработчики на +/- и удаление
    cartItemsEl.querySelectorAll(".cart-row").forEach((row) => {
      const index = Number(row.dataset.index);

      const minusBtn = row.querySelector(".cart-qty-minus");
      const plusBtn = row.querySelector(".cart-qty-plus");
      const removeBtn = row.querySelector(".cart-remove-btn");
      const qtyEl = row.querySelector(".cart-qty-value");
      const rowTotalEl = row.querySelector(".cart-row-total");

      minusBtn.onclick = () => {
        const item = cart[index];
        if (!item) return;
        if (item.qty > 1) {
          item.qty -= 1;
        } else {
          // если было 1 — удаляем позицию
          cart.splice(index, 1);
        }
        updateCartViews();
        renderCartModal();
      };

      plusBtn.onclick = () => {
        const item = cart[index];
        if (!item) return;
        item.qty += 1;
        qtyEl.textContent = item.qty;
        rowTotalEl.textContent = `${item.qty * item.price} ₽`;
        const newTotal = cart.reduce((s, i) => s + i.qty * i.price, 0);
        document.getElementById("cart-total-modal").textContent = newTotal;
        updateCartViews();
      };

      removeBtn.onclick = () => {
        cart.splice(index, 1);
        updateCartViews();
        renderCartModal();
      };
    });
  }

  document.getElementById("cart-checkout").onclick = () => {
    if (!cart.length) {
      alert("Сначала добавьте товары в корзину.");
      return;
    }

    tg.sendData(
      JSON.stringify({
        cart,
        total: cart.reduce((s, i) => s + i.qty * i.price, 0),
      })
    );
    tg.close();
  };

  /* ---------- ЛАЙТБОКС ---------- */
  initLightbox();
});

/* Инициализация лайтбокса */
function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const imgEl = lightbox.querySelector(".lightbox-image");
  const btnClose = lightbox.querySelector(".lightbox-close");
  const btnPrev = lightbox.querySelector(".lightbox-prev");
  const btnNext = lightbox.querySelector(".lightbox-next");
  const backdrop = lightbox.querySelector(".lightbox-backdrop");

  let images = [];
  let index = 0;

  function openLightbox(imgList, startIndex) {
    images = imgList;
    index = startIndex || 0;

    if (!images.length) return;

    imgEl.src = images[index];
    lightbox.classList.add("open");
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
  }

  function show(delta) {
    if (!images.length) return;
    index = (index + delta + images.length) % images.length;
    imgEl.src = images[index];
  }

  btnClose.addEventListener("click", closeLightbox);
  backdrop.addEventListener("click", closeLightbox);
  btnPrev.addEventListener("click", () => show(-1));
  btnNext.addEventListener("click", () => show(1));

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") show(-1);
    if (e.key === "ArrowRight") show(1);
  });

  // Привязка к картинкам и data-images
  document.querySelectorAll(".item").forEach((item) => {
    const imgsNodes = item.querySelectorAll(".js-open-lightbox");
    const data = item.getAttribute("data-images");

    let imgList = [];
    try {
      imgList = data ? JSON.parse(data) : [];
    } catch (e) {
      imgList = [];
    }

    if (!imgList.length) {
      imgList = Array.from(imgsNodes).map((i) => i.src);
    }

    imgsNodes.forEach((imgNode, i) => {
      imgNode.addEventListener("click", () => {
        openLightbox(imgList, i);
      });
    });

    // Клика по миниатюрам: переключаем главное фото и активный класс
    const thumbs = item.querySelectorAll(".thumb");
    const bigImages = item.querySelectorAll(".item-img");

    thumbs.forEach((thumb, idx) => {
      thumb.addEventListener("click", () => {
        bigImages.forEach((bi) => bi.classList.remove("active"));
        thumbs.forEach((t) => t.classList.remove("thumb-active"));

        if (bigImages[idx]) bigImages[idx].classList.add("active");
        thumb.classList.add("thumb-active");
      });
    });
  });
}
