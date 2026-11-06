/**
 * Omah Rambak - Cart Page JavaScript
 * Mengatur tampilan keranjang, kuantitas item, modal konfirmasi penghapusan,
 * formulir data pengiriman, dan checkout terstruktur via WhatsApp.
 */

let currentConfirmCallback = null;

document.addEventListener('DOMContentLoaded', () => {
    initCartPage();
});

function initCartPage() {
    renderCart();
    setupCartModal();
}

// -----------------------------------------------------------------------------
// 1. Render Tampilan Keranjang
// -----------------------------------------------------------------------------
function renderCart() {
    const cart = getCart();
    const itemsContainer = document.getElementById('cartItemsContainer');
    const summaryContainer = document.getElementById('cartSummaryContainer');
    const emptyState = document.getElementById('cartEmptyState');
    const tableWrapper = document.getElementById('cartTableWrapper');

    if (!itemsContainer) return;

    if (cart.length === 0) {
        if (itemsContainer) itemsContainer.innerHTML = '';
        if (tableWrapper) tableWrapper.classList.add('hidden');
        if (summaryContainer) summaryContainer.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    if (tableWrapper) tableWrapper.classList.remove('hidden');
    if (summaryContainer) summaryContainer.classList.remove('hidden');

    let subtotal = 0;
    let tableHtml = `
        <table class="w-full text-left text-sm text-gray-700">
            <thead class="text-xs text-orange-950 uppercase bg-orange-100/70 border-b border-orange-200">
                <tr>
                    <th scope="col" class="py-3.5 px-4 font-semibold">Produk</th>
                    <th scope="col" class="py-3.5 px-4 font-semibold hidden sm:table-cell">Harga</th>
                    <th scope="col" class="py-3.5 px-4 font-semibold text-center">Jumlah</th>
                    <th scope="col" class="py-3.5 px-4 font-semibold text-right">Subtotal</th>
                    <th scope="col" class="py-3.5 px-4 font-semibold text-center">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
    `;

    cart.forEach(item => {
        const itemPrice = parseInt(item.price, 10) || 0;
        const itemQty = parseInt(item.quantity, 10) || 1;
        const itemSubtotal = itemPrice * itemQty;
        subtotal += itemSubtotal;

        tableHtml += `
            <tr class="hover:bg-orange-50/50 transition">
                <td class="py-4 px-4">
                    <div class="flex items-center space-x-3 sm:space-x-4">
                        <img src="${item.image}" alt="${item.name}" class="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl border border-orange-100 shadow-sm flex-shrink-0">
                        <div>
                            <h4 class="font-bold text-gray-900 text-sm sm:text-base leading-snug">${item.name}</h4>
                            <span class="text-xs text-orange-600 sm:hidden block mt-0.5">${formatRupiah(itemPrice)}</span>
                        </div>
                    </div>
                </td>
                <td class="py-4 px-4 whitespace-nowrap text-gray-600 font-medium hidden sm:table-cell">
                    ${formatRupiah(itemPrice)}
                </td>
                <td class="py-4 px-4 text-center">
                    <div class="quantity-control inline-flex">
                        <button type="button" onclick="changeQuantity('${item.id}', -1)" class="quantity-button" aria-label="Kurangi kuantitas ${item.name}">-</button>
                        <input type="number" min="1" value="${itemQty}" onchange="handleQtyInput(event, '${item.id}')" class="quantity-input" aria-label="Jumlah item ${item.name}">
                        <button type="button" onclick="changeQuantity('${item.id}', 1)" class="quantity-button" aria-label="Tambah kuantitas ${item.name}">+</button>
                    </div>
                </td>
                <td class="py-4 px-4 text-right whitespace-nowrap font-bold text-orange-600 text-sm sm:text-base">
                    ${formatRupiah(itemSubtotal)}
                </td>
                <td class="py-4 px-4 text-center">
                    <button type="button" onclick="confirmRemoveItem('${item.id}', '${item.name.replace(/'/g, "\\'")}')" class="text-gray-400 hover:text-red-500 transition p-2 rounded-lg" title="Hapus dari keranjang" aria-label="Hapus ${item.name}">
                        <i class="fas fa-trash-alt text-base"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tableHtml += `
            </tbody>
        </table>
    `;

    itemsContainer.innerHTML = tableHtml;

    // Perbarui Nilai Ringkasan
    const subtotalEl = document.getElementById('summarySubtotal');
    const totalEl = document.getElementById('summaryTotal');
    const itemCountEl = document.getElementById('summaryItemCount');

    if (subtotalEl) subtotalEl.textContent = formatRupiah(subtotal);
    if (totalEl) totalEl.textContent = formatRupiah(subtotal);
    if (itemCountEl) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        itemCountEl.textContent = `${totalItems} item`;
    }
}

// -----------------------------------------------------------------------------
// 2. Modifikasi Kuantitas Item
// -----------------------------------------------------------------------------
function changeQuantity(productId, delta) {
    let cart = getCart();
    const itemIndex = cart.findIndex(i => i.id === productId);
    if (itemIndex === -1) return;

    const item = cart[itemIndex];
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
        confirmRemoveItem(productId, item.name);
    } else {
        item.quantity = newQty;
        saveCart(cart);
        renderCart();
    }
}

function handleQtyInput(event, productId) {
    const rawVal = parseInt(event.target.value, 10);
    let cart = getCart();
    const itemIndex = cart.findIndex(i => i.id === productId);
    if (itemIndex === -1) return;

    const item = cart[itemIndex];

    if (isNaN(rawVal) || rawVal <= 0) {
        event.target.value = item.quantity;
        confirmRemoveItem(productId, item.name);
    } else {
        item.quantity = rawVal;
        saveCart(cart);
        renderCart();
    }
}

// -----------------------------------------------------------------------------
// 3. Konfirmasi Hapus & Kosongkan Keranjang (Modal)
// -----------------------------------------------------------------------------
function setupCartModal() {
    const modal = document.getElementById('cartActionModal');
    const cancelBtn = document.getElementById('modalCancelBtn');
    const confirmBtn = document.getElementById('modalConfirmBtn');

    if (cancelBtn) cancelBtn.addEventListener('click', closeCartModal);
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            if (typeof currentConfirmCallback === 'function') {
                currentConfirmCallback();
            }
            closeCartModal();
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeCartModal();
        });
    }
}

function openCartModal(title, message, callback) {
    const modal = document.getElementById('cartActionModal');
    const titleEl = document.getElementById('modalTitle');
    const messageEl = document.getElementById('modalMessage');

    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.innerHTML = message;

    currentConfirmCallback = callback;

    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeCartModal() {
    const modal = document.getElementById('cartActionModal');
    if (modal) modal.classList.add('hidden');
    currentConfirmCallback = null;
}

function confirmRemoveItem(productId, productName) {
    openCartModal(
        'Hapus Produk',
        `Apakah Anda yakin ingin menghapus <strong>"${productName}"</strong> dari keranjang?`,
        () => {
            let cart = getCart();
            cart = cart.filter(item => item.id !== productId);
            saveCart(cart);
            renderCart();
            showToast(`"${productName}" dihapus dari keranjang.`, 'info');
        }
    );
}

function confirmEmptyCart() {
    const cart = getCart();
    if (cart.length === 0) {
        showToast("Keranjang Anda sudah kosong.", 'info');
        return;
    }

    openCartModal(
        'Kosongkan Keranjang',
        'Apakah Anda yakin ingin menghapus <strong>seluruh produk</strong> di keranjang belanja?',
        () => {
            localStorage.removeItem(CART_KEY);
            updateCartIconCount();
            renderCart();
            showToast("Keranjang belanja telah dikosongkan.", 'info');
        }
    );
}

// -----------------------------------------------------------------------------
// 4. Checkout via WhatsApp Terstruktur
// -----------------------------------------------------------------------------
function submitOrderViaWhatsApp() {
    const cart = getCart();
    if (cart.length === 0) {
        showToast("Keranjang Anda kosong! Silakan pilih produk terlebih dahulu.", 'error');
        return;
    }

    // Ambil input form pengiriman
    const nameInput = document.getElementById('customerName');
    const addressInput = document.getElementById('customerAddress');
    const noteInput = document.getElementById('customerNote');

    const customerName = nameInput ? nameInput.value.trim() : '';
    const customerAddress = addressInput ? addressInput.value.trim() : '';
    const customerNote = noteInput ? noteInput.value.trim() : '';

    if (!customerName) {
        showToast("Mohon masukkan nama lengkap Anda untuk pemesanan.", 'error');
        if (nameInput) {
            nameInput.focus();
            nameInput.classList.add('ring-2', 'ring-red-400');
            setTimeout(() => nameInput.classList.remove('ring-2', 'ring-red-400'), 2000);
        }
        return;
    }

    // Hitung total dan susun rincian item
    let totalOrder = 0;
    let itemsText = "";

    cart.forEach((item, index) => {
        const itemPrice = parseInt(item.price, 10) || 0;
        const sub = itemPrice * item.quantity;
        totalOrder += sub;

        itemsText += `${index + 1}. *${item.name}*\n`;
        itemsText += `   - Jumlah: ${item.quantity} bungkus\n`;
        itemsText += `   - Harga Satuan: ${formatRupiah(itemPrice)}\n`;
        itemsText += `   - Subtotal: ${formatRupiah(sub)}\n`;
    });

    // Format Pesan WhatsApp
    let waMessage = `Halo *Omah Rambak*, saya ingin memesan kerupuk kulit sapi asli:\n\n`;
    waMessage += `📋 *RINCIAN PESANAN:*\n`;
    waMessage += `${itemsText}\n`;
    waMessage += `💰 *TOTAL HARGA: ${formatRupiah(totalOrder)}*\n`;
    waMessage += `_(Belum termasuk ongkos kirim)_\n\n`;
    waMessage += `👤 *DATA PENERIMA:*\n`;
    waMessage += `• *Nama:* ${customerName}\n`;
    if (customerAddress) {
        waMessage += `• *Alamat Pengiriman:* ${customerAddress}\n`;
    }
    if (customerNote) {
        waMessage += `• *Catatan:* ${customerNote}\n`;
    }
    waMessage += `\nMohon info ketersediaan stok & ongkir ke alamat saya. Terima kasih!`;

    const waUrl = `https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(waMessage)}`;
    window.open(waUrl, '_blank');
}

