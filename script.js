document.addEventListener("DOMContentLoaded", () => {
  const cart = [];
  const cartButton = document.getElementById("cart-btn");
  const cartCount = document.getElementById("cart-count");
  const cartModal = document.getElementById("cart-modal");
  const closeCartButton = document.querySelector(".close-cart-btn");
  const cartItemsContainer = document.getElementById("cart-items-container");
  const cartTotalPrice = document.getElementById("cart-total-price");
  const shoeModal = document.getElementById("shoe-modal");
  const closeShoeModalButton = document.querySelector(".close-btn");
  const modalImage = document.getElementById("modal-image");
  const modalTitle = document.getElementById("modal-title");
  const modalCategory = document.getElementById("modal-category");
  const modalDescription = document.getElementById("modal-description");
  const modalSizes = document.getElementById("modal-sizes");
  const modalSizeSelect = document.getElementById("modal-size-select");
  const sizeError = document.getElementById("size-error");
  const modalPrice = document.getElementById("modal-price");
  const modalAddToCartButton = document.getElementById("modal-add-to-cart");
  const searchInput = document.getElementById("search-input");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const shoeCards = document.querySelectorAll(".shoe-card");
  const addToCartButtons = document.querySelectorAll(
    ".shoe-card .add-to-cart-btn",
  );
  let selectedProduct = null;

  function formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  }

  function renderCart() {
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    cartCount.textContent = itemCount;
    cartTotalPrice.textContent = formatPrice(totalPrice);
    cartItemsContainer.replaceChildren();

    if (cart.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "empty-cart-msg";
      emptyMessage.textContent = "Your cart is empty.";
      cartItemsContainer.append(emptyMessage);
      return;
    }

    cart.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "cart-item-row";

      const name = document.createElement("span");
      name.textContent = `${item.name} (Size ${item.size}) × ${item.quantity}`;

      const price = document.createElement("span");
      price.textContent = formatPrice(item.price * item.quantity);

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "remove-cart-item";
      removeButton.textContent = "Remove";
      removeButton.setAttribute(
        "aria-label",
        `Remove ${item.name}, size ${item.size}, from cart`,
      );
      removeButton.addEventListener("click", () => {
        cart.splice(index, 1);
        renderCart();
      });

      row.append(name, price, removeButton);
      cartItemsContainer.append(row);
    });
  }

  function setModalOpen(modal, isOpen) {
    modal.style.display = isOpen ? "flex" : "none";
    modal.setAttribute("aria-hidden", String(!isOpen));
  }

  function getProductDetails(card, button) {
    const nameElement = card && card.querySelector("h2");
    const imageElement = card && card.querySelector("img");
    const priceElement =
      card &&
      Array.from(card.querySelectorAll("p")).find((paragraph) =>
        /\bprice\b/i.test(paragraph.textContent),
      );
    const sizeTextNode =
      card &&
      Array.from(card.childNodes).find(
        (node) => node.nodeType === 3 && /\bsizes\b/i.test(node.textContent),
      );
    const priceMatch =
      priceElement && priceElement.textContent.match(/[\d,]+(?:\.\d+)?/);
    const sizes = sizeTextNode && sizeTextNode.textContent.match(/\d+/g);

    if (!nameElement || !imageElement || !priceMatch || !sizes) {
      console.error(
        "Could not select this shoe: its name, image, price, or sizes are missing.",
      );
      return null;
    }

    const price = Number(priceMatch[0].replace(/,/g, ""));
    if (!Number.isFinite(price)) {
      console.error(
        `Could not select ${nameElement.textContent.trim()}: its price is invalid.`,
      );
      return null;
    }

    return {
      button,
      name: nameElement.textContent.trim(),
      image: imageElement.getAttribute("src"),
      category: card.getAttribute("data-category") || "",
      description: card.getAttribute("data-description") || "",
      price,
      sizes,
    };
  }

  function openSizePicker(product) {
    selectedProduct = product;
    modalImage.src = product.image;
    modalImage.alt = product.name;
    modalTitle.textContent = product.name;
    modalCategory.textContent = product.category;
    modalDescription.textContent = product.description;
    modalSizes.textContent = product.sizes.join(", ");
    modalPrice.textContent = `Price: ${formatPrice(product.price)}`;
    sizeError.textContent = "";
    modalSizeSelect.replaceChildren();

    const promptOption = document.createElement("option");
    promptOption.value = "";
    promptOption.textContent = "Select a size";
    modalSizeSelect.append(promptOption);

    product.sizes.forEach((size) => {
      const option = document.createElement("option");
      option.value = size;
      option.textContent = size;
      modalSizeSelect.append(option);
    });

    setModalOpen(shoeModal, true);
    modalSizeSelect.focus();
  }

  function addProductToCart(product, size) {
    const existingItem = cart.find(
      (item) =>
        item.name === product.name &&
        item.price === product.price &&
        item.size === size,
    );
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        name: product.name,
        price: product.price,
        size,
        quantity: 1,
      });
    }

    renderCart();
    product.button.textContent = "Added!";
    window.setTimeout(() => {
      product.button.textContent = "Add to Cart";
    }, 900);
  }

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const product = getProductDetails(button.closest(".shoe-card"), button);
      if (product) {
        openSizePicker(product);
      }
    });
  });

  modalAddToCartButton.addEventListener("click", () => {
    if (!selectedProduct) {
      console.error("No shoe is selected for adding to the cart.");
      return;
    }

    const size = modalSizeSelect.value;
    if (!selectedProduct.sizes.includes(size)) {
      sizeError.textContent = "Please choose a shoe size.";
      modalSizeSelect.focus();
      return;
    }

    addProductToCart(selectedProduct, size);
    selectedProduct = null;
    setModalOpen(shoeModal, false);
  });

  cartButton.addEventListener("click", () => setModalOpen(cartModal, true));
  closeCartButton.addEventListener("click", () =>
    setModalOpen(cartModal, false),
  );
  closeShoeModalButton.addEventListener("click", () => {
    selectedProduct = null;
    setModalOpen(shoeModal, false);
  });

  [cartModal, shoeModal].forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        if (modal === shoeModal) {
          selectedProduct = null;
        }
        setModalOpen(modal, false);
      }
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      selectedProduct = null;
      setModalOpen(cartModal, false);
      setModalOpen(shoeModal, false);
    }
  });

  function filterShoes() {
    const searchTerm = searchInput.value.toLowerCase();
    const activeFilter = document.querySelector(".filter-btn.active");
    const activeCategory = activeFilter.getAttribute("data-filter");

    shoeCards.forEach((card) => {
      const title = card.querySelector("h2").textContent.toLowerCase();
      const category = card.getAttribute("data-category");
      const matchesSearch = title.includes(searchTerm);
      const matchesCategory =
        activeCategory === "all" || category === activeCategory;

      card.style.display = matchesSearch && matchesCategory ? "block" : "none";
    });
  }

  searchInput.addEventListener("input", filterShoes);
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((filterButton) =>
        filterButton.classList.remove("active"),
      );
      button.classList.add("active");
      filterShoes();
    });
  });

  renderCart();
});
