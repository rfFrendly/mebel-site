const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) {
  tg.ready();
  tg.expand();
}

let cart = [];
let currentItem = null;

function updateCartViews() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.qty * i.price, 0);

  const countSpan = document.getElementById("cart-count");
  const totalSpan = document.getElementById("cart-total");
  const topCount = document.getElementById("cart-top-count");
  const modalTotal = document.getElementById("cart-modal-total");

  if (countSpan) countSpan.textContent = count;
  if (topCount) topCount.textContent = count;
  if (totalSpan) totalSpan.textContent = total;
  if (modalTotal) modalTotal.textContent = total;
}

document.addEventListener("DOMContentLoaded", () => {
  /* КНОПКА "В корзину" */
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
      } catch {
        images = [];
      }

      currentItem = { id, name, price, desc, images };
      document.getElementById("qty-title").textContent = `Добавить «${name}»`;
      document.getElementById("qty-value").textContent = "1";
      document.getElementById("qty-modal").classList.add("open");
    });
  });

  /* Модалка количества */
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

  /* Модалка корзины */
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
      cartItemsEl.innerHTML = `<div class="cart-empty">Корзина пуста</div>`;
      updateCartViews();
      return;
    }

    cartItemsEl.innerHTML = cart
      .map((i, idx) => {
        const thumb = i.images && i.images.length ? i.images[0] : "";
        return `
          <div class="cart-row" data-index="${idx}">
            <div class="cart-row-left">
              ${
                thumb
                  ? `<img src="${thumb}" class="cart-row-thumb" alt="" />`
                  : ""
              }
            </div>
            <div class="cart-row-right">
              <div class="cart-row-main">
                <span class="cart-row-name">${i.name}</span>
                <span class="cart-row-price">${i.price} ₽ за шт.</span>
              </div>
              <div class="cart-row-bottom">
                <div class="cart-row-controls">
                  <button class="cart-qty-btn cart-minus">−</button>
                  <span class="cart-qty-value">${i.qty}</span>
                  <button class="cart-qty-btn cart-plus">+</button>
                </div>
                <span class="cart-row-total">${i.qty * i.price} ₽</span>
                <button class="cart-remove-btn">×</button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    attachCartRowHandlers();
    updateCartViews();
  }

  function attachCartRowHandlers() {
    document.querySelectorAll(".cart-row").forEach((row) => {
      const index = Number(row.dataset.index);

      row.querySelector(".cart-minus").onclick = () => {
        if (cart[index].qty > 1) cart[index].qty -= 1;
        else cart.splice(index, 1);
        renderCartModal();
      };

      row.querySelector(".cart-plus").onclick = () => {
        cart[index].qty += 1;
        renderCartModal();
      };

      row.querySelector(".cart-remove-btn").onclick = () => {
        cart.splice(index, 1);
        renderCartModal();
      };
    });
  }

  /* Лайтбокс для галерей */
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");

  let currentGallery = [];
  let currentIndex = 0;

  document.querySelectorAll(".item-gallery").forEach((galleryEl) => {
    const parentItem = galleryEl.closest(".item");
    const images = JSON.parse(parentItem.dataset.images || "[]");
    const imgs = galleryEl.querySelectorAll(".item-img");
    const thumbs = galleryEl.querySelectorAll(".thumb");

    imgs.forEach((imgEl) => {
      imgEl.addEventListener("click", () => {
        currentGallery = images;
        currentIndex = Number(imgEl.dataset.index);
        openLightbox();
      });
    });

    thumbs.forEach((thumbEl) => {
      thumbEl.addEventListener("click", () => {
        const idx = Number(thumbEl.dataset.index);
        imgs.forEach((im) => im.classList.remove("active"));
        thumbs.forEach((t) => t.classList.remove("thumb-active"));
        imgs[idx].classList.add("active");
        thumbEl.classList.add("thumb-active");
      });
    });
  });

  function openLightbox() {
    if (!currentGallery.length) return;
    lightboxImage.src = currentGallery[currentIndex];
    lightbox.classList.add("open");
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
  }

  function showPrev() {
    if (!currentGallery.length) return;
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    lightboxImage.src = currentGallery[currentIndex];
  }

  function showNext() {
    if (!currentGallery.length) return;
    currentIndex = (currentIndex + 1) % currentGallery.length;
    lightboxImage.src = currentGallery[currentIndex];
  }

  lightboxClose.onclick = closeLightbox;
  lightboxPrev.onclick = showPrev;
  lightboxNext.onclick = showNext;
  lightbox.querySelector(".lightbox-backdrop").onclick = closeLightbox;
});
