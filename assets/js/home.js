/**
 * Omah Rambak - Home Page JavaScript
 * Mengatur produk unggulan, interaktivitas hero, dan accordion FAQ.
 */

document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedProducts();
    setupFaqAccordion();
});

// -----------------------------------------------------------------------------
// 1. Memuat Produk Unggulan
// -----------------------------------------------------------------------------
async function loadFeaturedProducts() {
    const container = document.getElementById('featuredProductsGrid');
    if (!container) return;

    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const allProducts = await response.json();
        // Ambil 3 produk pertama sebagai unggulan
        const featuredProducts = allProducts.slice(0, 3);

        if (featuredProducts.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">Produk unggulan akan segera hadir.</p>';
            return;
        }

        container.innerHTML = '';

        featuredProducts.forEach((product, index) => {
            const categoryBadge = product.category === 'mentah' 
                ? '<span class="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">Siap Goreng</span>'
                : '<span class="absolute top-3 left-3 bg-amber-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">Siap Santap</span>';

            const card = document.createElement('div');
            card.className = 'bg-white rounded-2xl shadow-md border border-orange-100/80 overflow-hidden flex flex-col product-card-hover animate-on-scroll fade-in-up';
            card.style.transitionDelay = `${index * 0.15}s`;

            card.innerHTML = `
                <div class="relative overflow-hidden group">
                    <a href="catalog.html#${product.id}" class="block overflow-hidden" aria-label="Lihat detail ${product.name}">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-56 object-cover transform group-hover:scale-105 transition duration-500 ease-out" loading="lazy">
                    </a>
                    ${categoryBadge}
                </div>
                <div class="p-5 sm:p-6 flex flex-col flex-grow">
                    <span class="text-xs font-medium text-orange-500 uppercase tracking-wider mb-1">${product.category === 'mentah' ? 'Rambak Mentah' : 'Rambak Matang'}</span>
                    <h3 class="text-lg font-bold text-gray-900 mb-2 hover:text-orange-600 transition-colors">
                        <a href="catalog.html#${product.id}">${product.name}</a>
                    </h3>
                    <p class="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">${product.description}</p>
                    <div class="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                        <div>
                            <span class="text-xs text-gray-400 block">Harga</span>
                            <span class="text-xl font-extrabold text-orange-600">Rp ${product.price}</span>
                        </div>
                        <button onclick="addToCart('${product.id}', '${product.name.replace(/'/g, "\\'")}', '${product.price}', '${product.image}')" 
                                class="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all duration-200 button-click-effect flex items-center shadow-sm hover:shadow"
                                aria-label="Tambah ${product.name} ke keranjang">
                            <i class="fas fa-cart-plus mr-1.5"></i> + Keranjang
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Trigger animasi untuk kartu yang baru dirender
        if (typeof setupScrollAnimations === 'function') {
            setupScrollAnimations();
        }
    } catch (error) {
        console.error("Tidak dapat memuat produk unggulan:", error);
        container.innerHTML = `
            <div class="col-span-full text-center py-8">
                <i class="fas fa-exclamation-triangle text-3xl text-orange-400 mb-2"></i>
                <p class="text-gray-600">Gagal memuat produk unggulan. Silakan muat ulang halaman.</p>
            </div>
        `;
    }
}

// -----------------------------------------------------------------------------
// 2. Accordion FAQ (Pertanyaan yang Sering Diajukan)
// -----------------------------------------------------------------------------
function setupFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        if (questionBtn) {
            questionBtn.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Tutup item FAQ lainnya (opsional, untuk tampilan rapi)
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) otherItem.classList.remove('active');
                });

                item.classList.toggle('active', !isActive);
            });
        }
    });
}

