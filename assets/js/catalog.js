/**
 * Omah Rambak - Catalog Page JavaScript
 * Mengatur katalog produk, pencarian real-time, filter kategori & harga, pengurutan,
 * modal detail cepat, serta injeksi skema SEO terstruktur (JSON-LD).
 */

const DOMAIN = "https://omah-rambak.great-site.net";
let allProducts = [];
let activeCategoryFilter = 'all'; // 'all', 'matang', 'mentah', 'eceran'
let currentDisplayedProductSchemas = [];

document.addEventListener('DOMContentLoaded', () => {
    initCatalog();
});

// -----------------------------------------------------------------------------
// 1. Inisialisasi Katalog
// -----------------------------------------------------------------------------
async function initCatalog() {
    setupFilterEvents();
    setupQuickViewModal();
    await loadProducts();
    
    // Cek jika ada hash di URL (misal: #KSM001) untuk auto open detail atau scroll
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        setTimeout(() => {
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetEl.classList.add('ring-2', 'ring-orange-500');
                setTimeout(() => targetEl.classList.remove('ring-2', 'ring-orange-500'), 2500);
            }
        }, 500);
    }
}

// -----------------------------------------------------------------------------
// 2. Memuat Data Produk
// -----------------------------------------------------------------------------
async function loadProducts() {
    const container = document.getElementById('productGrid');
    const countDisplay = document.getElementById('productCountDisplay');

    if (container) {
        container.innerHTML = `
            <div class="col-span-full py-16 flex flex-col items-center justify-center">
                <div class="loading-spinner mb-4"></div>
                <p class="text-gray-500 text-sm">Menyiapkan aneka kerupuk kulit terbaik...</p>
            </div>
        `;
    }

    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        allProducts = await response.json();
        setupPriceRangeMax();
        applyFiltersAndSort();
    } catch (error) {
        console.error("Gagal memuat produk:", error);
        if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12 bg-white rounded-2xl p-8 border border-red-100">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-3"></i>
                    <h3 class="text-lg font-bold text-gray-800 mb-1">Gagal Memuat Produk</h3>
                    <p class="text-gray-600 text-sm mb-4">Terjadi kendala saat mengambil data katalog kerupuk.</p>
                    <button onclick="loadProducts()" class="bg-orange-500 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600">
                        Coba Lagi
                    </button>
                </div>
            `;
        }
        if (countDisplay) countDisplay.textContent = 'Gagal memuat produk.';
    }
}

// -----------------------------------------------------------------------------
// 3. Konfigurasi Slider Rentang Harga
// -----------------------------------------------------------------------------
function setupPriceRangeMax() {
    const priceRangeInput = document.getElementById('priceRange');
    const priceRangeValueDisplay = document.getElementById('priceRangeValue');
    
    if (!priceRangeInput || allProducts.length === 0) return;

    // Cari harga tertinggi dari data
    const prices = allProducts.map(p => parseInt(p.price.replace(/\D/g, ''), 10) || 0);
    const maxProductPrice = Math.max(...prices, 150000);

    priceRangeInput.max = maxProductPrice;
    priceRangeInput.value = maxProductPrice;

    if (priceRangeValueDisplay) {
        priceRangeValueDisplay.textContent = `Rp ${maxProductPrice.toLocaleString('id-ID')}`;
    }
}

// -----------------------------------------------------------------------------
// 4. Setup Event Filter & Search
// -----------------------------------------------------------------------------
function setupFilterEvents() {
    const searchInput = document.getElementById('searchProductInput');
    const clearSearchBtn = document.getElementById('clearSearchButton');
    const priceRangeInput = document.getElementById('priceRange');
    const priceRangeValueDisplay = document.getElementById('priceRangeValue');
    const sortSelect = document.getElementById('sort');
    const applyFilterBtn = document.getElementById('applyFilterButton');
    const resetFilterBtn = document.getElementById('resetFilterButton');

    // Pencarian Teks Real-time
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (clearSearchBtn) {
                clearSearchBtn.classList.toggle('hidden', searchInput.value.trim() === '');
            }
            applyFiltersAndSort();
        });
    }

    if (clearSearchBtn && searchInput) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearSearchBtn.classList.add('hidden');
            searchInput.focus();
            applyFiltersAndSort();
        });
    }

    // Filter Chips (Pill Kategori)
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeCategoryFilter = chip.getAttribute('data-category') || 'all';

            // Sinkronkan ke checkbox sidebar
            const checkboxes = document.querySelectorAll('input[name="categoryFilter"]');
            checkboxes.forEach(cb => {
                if (activeCategoryFilter === 'all') {
                    cb.checked = false;
                } else {
                    cb.checked = cb.value === activeCategoryFilter;
                }
            });

            applyFiltersAndSort();
        });
    });

    // Sidebar Checkboxes
    const categoryCheckboxes = document.querySelectorAll('input[name="categoryFilter"]');
    categoryCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            // Update filter chip "Semua" jika tidak ada atau ada yang dipilih
            const checkedCategories = Array.from(categoryCheckboxes).filter(c => c.checked).map(c => c.value);
            filterChips.forEach(chip => {
                const cat = chip.getAttribute('data-category');
                if (checkedCategories.length === 1 && cat === checkedCategories[0]) {
                    chip.classList.add('active');
                } else if (checkedCategories.length === 0 && cat === 'all') {
                    chip.classList.add('active');
                } else {
                    chip.classList.remove('active');
                }
            });
            applyFiltersAndSort();
        });
    });

    // Slider Harga
    if (priceRangeInput && priceRangeValueDisplay) {
        priceRangeInput.addEventListener('input', () => {
            const val = parseInt(priceRangeInput.value, 10);
            priceRangeValueDisplay.textContent = `Rp ${val.toLocaleString('id-ID')}`;
        });
        priceRangeInput.addEventListener('change', applyFiltersAndSort);
    }

    // Pengurutan
    if (sortSelect) {
        sortSelect.addEventListener('change', applyFiltersAndSort);
    }

    // Tombol Terapkan & Reset
    if (applyFilterBtn) applyFilterBtn.addEventListener('click', applyFiltersAndSort);
    if (resetFilterBtn) resetFilterBtn.addEventListener('click', resetFilters);
}

// -----------------------------------------------------------------------------
// 5. Menerapkan Filter & Sorting
// -----------------------------------------------------------------------------
function applyFiltersAndSort() {
    if (!allProducts || allProducts.length === 0) return;

    const searchInput = document.getElementById('searchProductInput');
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';

    const priceRangeInput = document.getElementById('priceRange');
    const maxPrice = priceRangeInput ? parseInt(priceRangeInput.value, 10) : Infinity;

    const sortSelect = document.getElementById('sort');
    const sortBy = sortSelect ? sortSelect.value : 'default';

    // Cek kategori dari checkbox sidebar
    const checkedCategories = Array.from(document.querySelectorAll('input[name="categoryFilter"]:checked')).map(cb => cb.value);

    let filtered = allProducts.filter(product => {
        // 1. Filter Pencarian Teks
        if (searchTerm) {
            const matchName = product.name.toLowerCase().includes(searchTerm);
            const matchDesc = product.description.toLowerCase().includes(searchTerm);
            if (!matchName && !matchDesc) return false;
        }

        // 2. Filter Kategori
        if (checkedCategories.length > 0) {
            if (!checkedCategories.includes(product.category)) return false;
        } else if (activeCategoryFilter !== 'all') {
            if (product.category !== activeCategoryFilter) return false;
        }

        // 3. Filter Harga
        const priceNum = parseInt(product.price.replace(/\D/g, ''), 10) || 0;
        if (priceNum > maxPrice) return false;

        return true;
    });

    // 4. Pengurutan
    switch (sortBy) {
        case 'id-desc':
            filtered.sort((a, b) => b.id.localeCompare(a.id));
            break;
        case 'harga-asc':
            filtered.sort((a, b) => {
                const pA = parseInt(a.price.replace(/\D/g, ''), 10) || 0;
                const pB = parseInt(b.price.replace(/\D/g, ''), 10) || 0;
                return pA - pB;
            });
            break;
        case 'harga-desc':
            filtered.sort((a, b) => {
                const pA = parseInt(a.price.replace(/\D/g, ''), 10) || 0;
                const pB = parseInt(b.price.replace(/\D/g, ''), 10) || 0;
                return pB - pA;
            });
            break;
        case 'nama-asc':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'nama-desc':
            filtered.sort((a, b) => b.name.localeCompare(a.name));
            break;
        default:
            // Urutan default sesuai data
            break;
    }

    renderProducts(filtered);
}

// -----------------------------------------------------------------------------
// 6. Merender Kartu Produk
// -----------------------------------------------------------------------------
function renderProducts(productsToDisplay) {
    const container = document.getElementById('productGrid');
    const countDisplay = document.getElementById('productCountDisplay');
    if (!container) return;

    container.innerHTML = '';
    currentDisplayedProductSchemas = [];

    if (productsToDisplay.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-16 bg-white rounded-2xl p-8 border border-orange-100 shadow-sm">
                <i class="fas fa-search text-4xl text-orange-300 mb-3"></i>
                <h3 class="text-lg font-bold text-gray-800 mb-1">Produk Tidak Ditemukan</h3>
                <p class="text-gray-500 text-sm mb-5">Tidak ada produk yang cocok dengan kriteria pencarian atau filter Anda.</p>
                <button onclick="resetFilters()" class="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition button-click-effect shadow">
                    <i class="fas fa-redo-alt mr-2"></i> Reset Semua Filter
                </button>
            </div>
        `;
        if (countDisplay) {
            countDisplay.innerHTML = 'Menampilkan <span class="font-bold text-gray-800">0</span> produk';
        }
        injectPageSchema();
        return;
    }

    productsToDisplay.forEach((product, index) => {
        const badgeColor = product.category === 'mentah' 
            ? 'bg-emerald-600 text-white' 
            : (product.category === 'eceran' ? 'bg-blue-600 text-white' : 'bg-amber-600 text-white');
        
        const badgeText = product.category === 'mentah' 
            ? 'Siap Goreng' 
            : (product.category === 'eceran' ? 'Eceran Praktis' : 'Siap Santap');

        const card = document.createElement('div');
        card.id = product.id;
        card.className = 'bg-white rounded-2xl shadow-sm hover:shadow-xl border border-orange-100/80 overflow-hidden flex flex-col product-card-hover transition-all duration-300';
        
        card.innerHTML = `
            <div class="relative overflow-hidden group cursor-pointer" onclick="openProductDetail('${product.id}')">
                <img src="${product.image}" alt="${product.name}" class="w-full h-48 sm:h-56 object-cover transform group-hover:scale-105 transition duration-500 ease-out" loading="lazy">
                <span class="absolute top-3 left-3 ${badgeColor} text-[11px] font-semibold px-2.5 py-1 rounded-full shadow">
                    ${badgeText}
                </span>
                <button type="button" class="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-orange-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm opacity-90 group-hover:opacity-100 transition" aria-label="Lihat cepat ${product.name}">
                    <i class="fas fa-eye mr-1"></i> Detail
                </button>
            </div>
            <div class="p-4 sm:p-5 flex flex-col flex-grow">
                <div class="flex items-center justify-between text-xs text-orange-500 font-medium mb-1">
                    <span>${product.package_type ? product.package_type.toUpperCase() : 'KILOAN'}</span>
                    <span class="text-gray-400">SKU: ${product.id}</span>
                </div>
                <h3 class="text-base sm:text-lg font-bold text-gray-900 mb-1.5 hover:text-orange-600 transition cursor-pointer" onclick="openProductDetail('${product.id}')">
                    ${product.name}
                </h3>
                <p class="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">${product.description}</p>
                <div class="flex items-baseline justify-between pt-3 border-t border-gray-100 mt-auto">
                    <span class="text-lg sm:text-xl font-extrabold text-orange-600">Rp ${product.price}</span>
                    <button onclick="addToCart('${product.id}', '${product.name.replace(/'/g, "\\'")}', '${product.price}', '${product.image}')" 
                            class="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-2 px-3.5 rounded-xl text-xs sm:text-sm transition duration-200 button-click-effect flex items-center shadow-sm"
                            aria-label="Tambah ${product.name} ke keranjang">
                        <i class="fas fa-cart-plus mr-1.5"></i> Beli
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);

        // Skema Produk Terstruktur untuk SEO
        const productSchema = {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "image": `${DOMAIN}/${product.image}`,
            "description": product.description,
            "sku": product.id,
            "brand": { "@type": "Brand", "name": "Omah Rambak" },
            "offers": {
                "@type": "Offer",
                "url": `${DOMAIN}/catalog.html#${product.id}`,
                "priceCurrency": "IDR",
                "price": product.price.replace(/\D/g, ''),
                "availability": "https://schema.org/InStock",
                "itemCondition": "https://schema.org/NewCondition"
            }
        };
        currentDisplayedProductSchemas.push(productSchema);
    });

    if (countDisplay) {
        countDisplay.innerHTML = `Menampilkan <span class="font-bold text-orange-600">${productsToDisplay.length}</span> dari <span class="font-bold text-gray-800">${allProducts.length}</span> produk`;
    }

    injectPageSchema();
}

// -----------------------------------------------------------------------------
// 7. Reset Semua Filter
// -----------------------------------------------------------------------------
function resetFilters() {
    const searchInput = document.getElementById('searchProductInput');
    const clearSearchBtn = document.getElementById('clearSearchButton');
    const priceRangeInput = document.getElementById('priceRange');
    const priceRangeValueDisplay = document.getElementById('priceRangeValue');
    const sortSelect = document.getElementById('sort');

    if (searchInput) searchInput.value = '';
    if (clearSearchBtn) clearSearchBtn.classList.add('hidden');

    document.querySelectorAll('input[name="categoryFilter"]').forEach(cb => cb.checked = false);
    
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-category') === 'all');
    });
    activeCategoryFilter = 'all';

    if (priceRangeInput) {
        priceRangeInput.value = priceRangeInput.max;
        if (priceRangeValueDisplay) {
            priceRangeValueDisplay.textContent = `Rp ${parseInt(priceRangeInput.max, 10).toLocaleString('id-ID')}`;
        }
    }

    if (sortSelect) sortSelect.value = 'default';

    applyFiltersAndSort();
    showToast("Filter katalog berhasil di-reset", 'info');
}

// -----------------------------------------------------------------------------
// 8. Modal Detail Produk Cepat (Quick View)
// -----------------------------------------------------------------------------
function setupQuickViewModal() {
    const modal = document.getElementById('productDetailModal');
    if (!modal) return;

    const closeBtn = document.getElementById('closeModalButton');
    if (closeBtn) closeBtn.addEventListener('click', closeProductDetail);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeProductDetail();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeProductDetail();
        }
    });
}

function openProductDetail(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('productDetailModal');
    const modalImage = document.getElementById('modalProductImage');
    const modalName = document.getElementById('modalProductName');
    const modalCategory = document.getElementById('modalProductCategory');
    const modalPrice = document.getElementById('modalProductPrice');
    const modalDesc = document.getElementById('modalProductDesc');
    const modalBuyBtn = document.getElementById('modalAddToCartButton');
    const modalQtyInput = document.getElementById('modalProductQty');

    if (modalImage) modalImage.src = product.image;
    if (modalImage) modalImage.alt = product.name;
    if (modalName) modalName.textContent = product.name;
    if (modalCategory) {
        modalCategory.textContent = product.category === 'mentah' ? 'Rambak Mentah (Siap Goreng)' : 'Rambak Matang (Siap Santap)';
    }
    if (modalPrice) modalPrice.textContent = `Rp ${product.price}`;
    if (modalDesc) modalDesc.textContent = product.description;
    if (modalQtyInput) modalQtyInput.value = 1;

    if (modalBuyBtn) {
        modalBuyBtn.onclick = () => {
            const qty = parseInt(modalQtyInput ? modalQtyInput.value : 1, 10) || 1;
            addToCart(product.id, product.name, product.price, product.image, qty);
            closeProductDetail();
        };
    }

    if (modal) {
        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    }
}

function closeProductDetail() {
    const modal = document.getElementById('productDetailModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }
}

// -----------------------------------------------------------------------------
// 9. Injeksi Skema JSON-LD untuk SEO
// -----------------------------------------------------------------------------
function injectPageSchema() {
    const oldScript = document.getElementById('dynamicCatalogSchema');
    if (oldScript) oldScript.remove();

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'dynamicCatalogSchema';

    if (currentDisplayedProductSchemas.length > 0) {
        const schema = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Katalog Aneka Kerupuk Kulit Sapi - Omah Rambak",
            "description": "Daftar pilihan kerupuk kulit sapi asli matang renyah dan mentah siap goreng berkualitas premium.",
            "url": `${DOMAIN}/catalog.html`,
            "numberOfItems": currentDisplayedProductSchemas.length,
            "itemListElement": currentDisplayedProductSchemas.map((prod, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "item": prod
            }))
        };
        script.textContent = JSON.stringify(schema);
    }

    document.head.appendChild(script);
}

