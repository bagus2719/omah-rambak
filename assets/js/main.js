/**
 * Omah Rambak - Main Shared JavaScript
 * Menyediakan fungsionalitas global seperti Keranjang, Toast, Navigasi, & Animasi.
 */

// Konstanta Penyimpanan
const CART_KEY = 'omahRambakCart';
const STORE_PHONE = '6283111481327';

// -----------------------------------------------------------------------------
// 1. Sistem Notifikasi Toast
// -----------------------------------------------------------------------------
let toastTimeout;

function showToast(message, type = 'success', duration = 3000) {
    let toast = document.getElementById('toastNotification');
    let toastMessage = document.getElementById('toastMessage');
    let toastIcon = document.getElementById('toastIcon');

    // Jika belum ada elemen toast di DOM, buat secara dinamis
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastNotification';
        toast.innerHTML = `
            <i id="toastIcon" class="fas fa-check-circle text-lg"></i>
            <span id="toastMessage"></span>
        `;
        document.body.appendChild(toast);
        toastMessage = document.getElementById('toastMessage');
        toastIcon = document.getElementById('toastIcon');
    }

    if (!toastMessage) return;

    toastMessage.textContent = message;

    // Reset kelas status
    toast.classList.remove('success', 'error', 'info', 'show');

    // Tentukan icon dan class
    if (type === 'error') {
        toast.classList.add('error');
        if (toastIcon) toastIcon.className = 'fas fa-exclamation-circle text-lg';
    } else if (type === 'info') {
        toast.classList.add('info');
        if (toastIcon) toastIcon.className = 'fas fa-info-circle text-lg';
    } else {
        toast.classList.add('success');
        if (toastIcon) toastIcon.className = 'fas fa-check-circle text-lg';
    }

    // Tampilkan toast
    void toast.offsetWidth; // trigger reflow
    toast.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// -----------------------------------------------------------------------------
// 2. Pengelolaan Keranjang (Cart Management)
// -----------------------------------------------------------------------------
function getCart() {
    try {
        const cartData = localStorage.getItem(CART_KEY);
        return cartData ? JSON.parse(cartData) : [];
    } catch (e) {
        console.error("Gagal membaca keranjang belanja:", e);
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartIconCount();
    } catch (e) {
        console.error("Gagal menyimpan keranjang belanja:", e);
    }
}

function addToCart(productId, productName, productPrice, productImage, quantity = 1) {
    let cart = getCart();
    
    // Normalisasi harga (hilangkan titik dan non-digit jika berupa string)
    let priceNumber = 0;
    if (typeof productPrice === 'number') {
        priceNumber = productPrice;
    } else if (typeof productPrice === 'string') {
        priceNumber = parseInt(productPrice.replace(/\D/g, ''), 10) || 0;
    }

    const existingIndex = cart.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: priceNumber,
            image: productImage,
            quantity: quantity
        });
    }

    saveCart(cart);

    // Animasi bounce badge keranjang
    const badges = [document.getElementById('cartItemCount'), document.getElementById('cartItemCountMobile')];
    badges.forEach(b => {
        if (b) {
            b.classList.remove('badge-bounce');
            void b.offsetWidth;
            b.classList.add('badge-bounce');
        }
    });

    showToast(`"${productName}" (${quantity} pcs) ditambahkan ke keranjang!`, 'success');
}

function updateCartIconCount() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0);
    const badges = [document.getElementById('cartItemCount'), document.getElementById('cartItemCountMobile')];

    badges.forEach(badge => {
        if (badge) {
            if (totalCount > 0) {
                badge.textContent = totalCount > 99 ? '99+' : totalCount;
                badge.classList.remove('hidden');
            } else {
                badge.textContent = '0';
                badge.classList.add('hidden');
            }
        }
    });
}

// -----------------------------------------------------------------------------
// 3. Format Mata Uang Rupiah
// -----------------------------------------------------------------------------
function formatRupiah(amount) {
    const num = typeof amount === 'number' ? amount : parseInt(String(amount).replace(/\D/g, ''), 10) || 0;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
}

// -----------------------------------------------------------------------------
// 4. Navigasi & Mobile Menu
// -----------------------------------------------------------------------------
function setupNavigation() {
    // Menu Mobile
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenu.classList.toggle('hidden');
            const icon = mobileMenuButton.querySelector('i');
            if (icon) {
                if (mobileMenu.classList.contains('hidden')) {
                    icon.className = 'fas fa-bars text-xl';
                } else {
                    icon.className = 'fas fa-times text-xl';
                }
            }
        });

        // Tutup menu jika klik di luar
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    const icon = mobileMenuButton.querySelector('i');
                    if (icon) icon.className = 'fas fa-bars text-xl';
                }
            }
        });
    }

    // Highlight menu yang aktif
    const rawPath = window.location.pathname.split("/").pop();
    const currentPage = (rawPath === '' || rawPath === 'index') ? 'index.html' : rawPath;

    const navMap = {
        'index.html': 'navBeranda',
        'catalog.html': 'navKatalog',
        'about.html': 'navTentang',
        'cart.html': 'navKeranjang'
    };

    // Bersihkan semua active link
    Object.values(navMap).forEach(id => {
        const link = document.getElementById(id);
        if (link) {
            link.classList.remove('active-link');
        }
    });

    const activeId = navMap[currentPage];
    if (activeId) {
        const activeLink = document.getElementById(activeId);
        if (activeLink) activeLink.classList.add('active-link');
    }
}

// -----------------------------------------------------------------------------
// 5. Animasi Scroll (IntersectionObserver)
// -----------------------------------------------------------------------------
function setupScrollAnimations() {
    // Jalankan segera animasi untuk elemen on-load
    const loadElements = document.querySelectorAll('.animate-on-load');
    loadElements.forEach(el => {
        setTimeout(() => el.classList.add('is-visible'), 60);
    });

    if (!('IntersectionObserver' in window)) {
        // Fallback jika browser lawas
        document.querySelectorAll('.animate-on-scroll, .stagger-children').forEach(el => {
            el.classList.add('is-visible');
        });
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');

                // Jika memiliki stagger-children, jalankan efek berurutan
                if (entry.target.classList.contains('stagger-children')) {
                    const children = Array.from(entry.target.children);
                    children.forEach((child, idx) => {
                        if (!child.style.transitionDelay) {
                            child.style.transitionDelay = `${idx * 0.1}s`;
                        }
                    });
                }

                if (!entry.target.classList.contains('keep-observing')) {
                    obs.unobserve(entry.target);
                }
            }
        });
    }, { root: null, threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.animate-on-scroll, .stagger-children').forEach(el => {
        observer.observe(el);
    });
}

// -----------------------------------------------------------------------------
// 6. Inisialisasi Otomatis saat Halaman Siap
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    updateCartIconCount();
    setupNavigation();
    setupScrollAnimations();
});

