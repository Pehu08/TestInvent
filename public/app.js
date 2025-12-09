// Global state
let products = [];
let filteredProducts = [];

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const addProductBtn = document.getElementById('addProductBtn');
const productModal = document.getElementById('productModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const productForm = document.getElementById('productForm');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const modalTitle = document.getElementById('modalTitle');

// Stats elements
const totalProductsEl = document.getElementById('totalProducts');
const totalValueEl = document.getElementById('totalValue');
const lowStockEl = document.getElementById('lowStock');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    addProductBtn.addEventListener('click', () => openModal());
    closeModal.addEventListener('click', () => closeModalHandler());
    cancelBtn.addEventListener('click', () => closeModalHandler());
    productForm.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);
    
    // Close modal on outside click
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) {
            closeModalHandler();
        }
    });
}

// API Functions
async function loadProducts() {
    try {
        showLoading();
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to load products');
        products = await response.json();
        filteredProducts = products;
        renderProducts();
        updateStats();
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products. Please refresh the page.');
    }
}

async function createProduct(productData) {
    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        if (!response.ok) throw new Error('Failed to create product');
        await loadProducts();
        closeModalHandler();
        showNotification('Product added successfully!', 'success');
    } catch (error) {
        console.error('Error creating product:', error);
        showNotification('Failed to add product', 'error');
    }
}

async function updateProduct(id, productData) {
    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        if (!response.ok) throw new Error('Failed to update product');
        await loadProducts();
        closeModalHandler();
        showNotification('Product updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating product:', error);
        showNotification('Failed to update product', 'error');
    }
}

async function deleteProduct(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete product');
        await loadProducts();
        showNotification('Product deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Failed to delete product', 'error');
    }
}

async function updateQuantity(id, newQuantity) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...product, quantity: newQuantity })
        });
        if (!response.ok) throw new Error('Failed to update quantity');
        await loadProducts();
    } catch (error) {
        console.error('Error updating quantity:', error);
        showNotification('Failed to update quantity', 'error');
    }
}

// Render Functions
function renderProducts() {
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⛷️</div>
                <h3>No products found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-icon">${product.image_url || '⛷️'}</div>
            <h3 class="product-name">${escapeHtml(product.name)}</h3>
            <span class="product-category">${escapeHtml(product.category)}</span>
            <p class="product-description">${escapeHtml(product.description || '')}</p>
            <div class="product-info">
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-quantity">
                    <span class="quantity-label">Stock:</span>
                    <span class="quantity-value ${product.quantity < 20 ? 'low-stock' : ''}">${product.quantity}</span>
                </div>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="changeQuantity(${product.id}, -1)" ${product.quantity <= 0 ? 'disabled' : ''}>-</button>
                <span style="flex: 1; text-align: center; font-weight: 600;">${product.quantity}</span>
                <button class="quantity-btn" onclick="changeQuantity(${product.id}, 1)">+</button>
            </div>
            <div class="product-actions">
                <button class="btn btn-success" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteProductHandler(${product.id}, '${escapeHtml(product.name)}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;

    filteredProducts = products.filter(product => {
        const matchesSearch = !searchTerm || 
            product.name.toLowerCase().includes(searchTerm) ||
            (product.description || '').toLowerCase().includes(searchTerm);
        const matchesCategory = !category || product.category === category;
        return matchesSearch && matchesCategory;
    });

    renderProducts();
}

function updateStats() {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const lowStock = products.filter(p => p.quantity < 20).length;

    totalProductsEl.textContent = totalProducts;
    totalValueEl.textContent = `$${totalValue.toFixed(2)}`;
    lowStockEl.textContent = lowStock;
}

// Modal Functions
function openModal(productId = null) {
    const product = productId ? products.find(p => p.id === productId) : null;
    
    modalTitle.textContent = product ? 'Edit Product' : 'Add New Product';
    
    if (product) {
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productQuantity').value = product.quantity;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productIcon').value = product.image_url || '';
    } else {
        productForm.reset();
        document.getElementById('productId').value = '';
    }
    
    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModalHandler() {
    productModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    productForm.reset();
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        quantity: parseInt(document.getElementById('productQuantity').value),
        description: document.getElementById('productDescription').value,
        image_url: document.getElementById('productIcon').value || '⛷️'
    };

    if (productId) {
        updateProduct(productId, productData);
    } else {
        createProduct(productData);
    }
}

// Global functions for inline handlers
window.editProduct = function(id) {
    openModal(id);
};

window.deleteProductHandler = function(id, name) {
    deleteProduct(id, name);
};

window.changeQuantity = function(id, change) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const newQuantity = Math.max(0, product.quantity + change);
    updateQuantity(id, newQuantity);
};

// Utility Functions
function showLoading() {
    productsGrid.innerHTML = `
        <div class="loading">
            <h3>Loading products...</h3>
        </div>
    `;
}

function showError(message) {
    productsGrid.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <h3>Error</h3>
            <p>${message}</p>
        </div>
    `;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideIn 0.3s;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
