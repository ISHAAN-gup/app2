// User authentication state
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Event listeners for authentication forms
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            if (!email || !password) {
                alert('Please fill in all fields');
                return;
            }
            
            if (login(email, password)) {
                window.location.href = 'index.html';
            } else {
                alert('Invalid email or password');
            }
        });
    }
});

// Product data with prices in INR
const products = [{
    id: 1,
    name: 'Whole Wheat Atta',
    price: 1499,
    image: 'product1.jpg'
}, {
    id: 2,
    name: 'Multigrain Atta',
    price: 2499,
    image: 'product2.jpg'
}, {
    id: 3,
    name: 'Organic Atta',
    price: 3499,
    image: 'product3.jpg'
}, {
    id: 4,
    name: 'Ragi Atta',
    price: 2999,
    image: 'product4.jpg'
}, {
    id: 5,
    name: 'Jowar Atta',
    price: 2799,
    image: 'product5.jpg'
}];

// Authentication functions
function login(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        delete user.password; // Don't store password in session
        localStorage.setItem('currentUser', JSON.stringify(user));
        currentUser = user;
        window.location.href = 'index.html';
        return true;
    }
    return false;
}

function signup(userData) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(u => u.email === userData.email)) {
        return false; // Email already exists
    }
    // Assign user ID starting from 1
    userData.id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login after signup
    const { password, ...userWithoutPassword } = userData;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    currentUser = userWithoutPassword;
    window.location.href = 'index.html';
    return true;
}

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    window.location.href = 'login.html';
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(price);
}

// Cart data
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Function to save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Function to render products
function renderProducts() {
    const productsSection = document.getElementById('products');
    if (productsSection) {
        // Check if user is logged in
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // Update header to show user ID
        const header = document.querySelector('header h1');
        if (header) {
            header.textContent = `N.K. ATTA CHAKKI - User ID: ${currentUser.id}`;
        }

        productsSection.innerHTML = products.map(product => {
            const cartItem = cart.find(item => item.id === product.id);
            const quantity = cartItem ? cartItem.quantity : 0;
            return `
                <div class="product">
                    <h3>${product.name}</h3>
                    <p>${formatPrice(product.price)}</p>
                    ${quantity === 0 ? 
                        `<button onclick="addToCart(${product.id})">Add to Cart</button>` :
                        `<div class="quantity-controls">
                            <button onclick="updateQuantity(${product.id}, -1)">-</button>
                            <span>${quantity}</span>
                            <button onclick="updateQuantity(${product.id}, 1)">+</button>
                        </div>`
                    }
                </div>
            `;
        }).join('');
    }
}

// Function to add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    renderCart();
    renderProducts();
}

// Function to remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
}

// Function to update item quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (change > 0) {
            item.quantity += 1;
        } else {
            item.quantity -= 1;
        }

        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            renderCart();
            renderProducts();
        }
    }
}

// Function to calculate cart total
function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Function to render cart
function renderCart() {
    const cartSection = document.getElementById('cart-items');
    if (cartSection) {
        // Check if user is logged in
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        if (cart.length === 0) {
            cartSection.innerHTML = '<p>Your cart is empty</p>';
            return;
        }

        cartSection.innerHTML = `
            <div class="cart-items">
                ${cart.map(item => `
                    <div class="cart-item">
                        <h3>${item.name}</h3>
                        <p>${formatPrice(item.price)}</p>
                        <div class="quantity-controls">
                            <button onclick="updateQuantity(${item.id}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateQuantity(${item.id}, 1)">+</button>
                        </div>
                        <button onclick="removeFromCart(${item.id})">Remove</button>
                    </div>
                `).join('')}
                <div class="cart-total">
                    <h3>Total: ${formatPrice(calculateTotal())}</h3>
                    <a href="checkout.html" class="checkout-btn">Proceed to Checkout</a>
                </div>
            </div>
        `;
    }

    // Update order summary on checkout page
    const orderSummary = document.getElementById('order-summary');
    if (orderSummary) {
        orderSummary.innerHTML = `
            ${cart.map(item => `
                <div class="order-item">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>${formatPrice(item.price * item.quantity)}</span>
                </div>
            `).join('')}
            <div class="order-total">
                <strong>Total: ${formatPrice(calculateTotal())}</strong>
            </div>
        `;
    }
}

// Initialize order tracking page
function initializeTracking() {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');
    if (!orderId) return;

    const tracking = getOrderTracking(orderId);
    if (!tracking) {
        alert('Order not found');
        return;
    }

    const order = getOrderById(orderId);
    
    // Update order info
    document.querySelector('.order-id').textContent = `Order ID: ${tracking.orderId}`;
    document.querySelector('.order-status').textContent = `Status: ${tracking.formattedStatus}`;
    
    // Update timeline
    const timeline = document.querySelector('.tracking-timeline');
    timeline.innerHTML = tracking.statusHistory.map(status => `
        <div class="timeline-item ${status.status.toLowerCase()}">
            <div class="status">${formatOrderStatus(status.status)}</div>
            <div class="timestamp">${new Date(status.timestamp).toLocaleString()}</div>
        </div>
    `).join('');

    // Update payment info
    document.querySelector('.payment-method').textContent = `Method: ${order.paymentMethod.replace('_', ' ')}`;
    if (order.paymentDetails) {
        document.querySelector('.payment-status').textContent = `Payment ID: ${order.paymentDetails.paymentId}`;
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Handle login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            
            // Form validation
            if (!email || !password) {
                alert('Please fill in all fields');
                return;
            }
            if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                alert('Please enter a valid email address');
                return;
            }
            
            if (login(email, password)) {
                window.location.href = 'index.html';
            } else {
                alert('Invalid email or password. Please try again.');
                document.getElementById('login-password').value = '';
            }
        });
    }

    // Handle signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const userData = {
                fullname: document.getElementById('fullname').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                address: document.getElementById('address').value.trim(),
                password: document.getElementById('signup-password').value
            };

            // Form validation
            if (!userData.fullname || !userData.email || !userData.phone || !userData.password) {
                alert('Please fill in all required fields');
                return;
            }

            if (!userData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                alert('Please enter a valid email address');
                return;
            }

            if (!userData.phone.match(/^[0-9]{10}$/)) {
                alert('Please enter a valid 10-digit phone number');
                return;
            }

            if (userData.password.length < 6) {
                alert('Password must be at least 6 characters long');
                return;
            }

            const confirmPassword = document.getElementById('confirm-password').value;
            if (userData.password !== confirmPassword) {
                alert('Passwords do not match');
                document.getElementById('signup-password').value = '';
                document.getElementById('confirm-password').value = '';
                return;
            }

            if (signup(userData)) {
                alert('Account created successfully! You will be redirected to the home page.');
                window.location.href = 'index.html';
            } else {
                alert('Email already exists. Please use a different email address.');
                document.getElementById('email').value = '';
            }
        });
    }

    renderProducts();
    renderCart();
});

// Auto-populate checkout form with user data
function populateCheckoutForm() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        document.getElementById('full-name').value = currentUser.fullname || '';
        document.getElementById('email').value = currentUser.email || '';
        document.getElementById('phone').value = currentUser.phone || '';
        document.getElementById('address').value = currentUser.address || '';

        // Show/hide payment ID field based on payment method
        const paymentOptions = document.getElementsByName('payment-method');
        const onlinePaymentDetails = document.getElementById('online-payment-details');
        paymentOptions.forEach(option => {
            option.addEventListener('change', (e) => {
                onlinePaymentDetails.classList.toggle('hidden', e.target.value === 'CASH_ON_DELIVERY');
            });
        });

        // Update order summary
        const checkoutItems = document.getElementById('checkout-items');
        const totalPrice = document.getElementById('total-price');
        if (checkoutItems && totalPrice) {
            checkoutItems.innerHTML = cart.map(item => `
                <div class="checkout-item">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>${formatPrice(item.price * item.quantity)}</span>
                </div>
            `).join('');
            totalPrice.textContent = formatPrice(calculateTotal());
        }

        // Handle form submission
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const notes = document.getElementById('notes')?.value;

            // Create order with Cash on Delivery
            const order = createOrder(
                currentUser.id,
                cart,
                calculateTotal(),
                'CASH_ON_DELIVERY',
                null,
                notes
            );

            alert(`Order placed successfully! Your order ID is: ${order.orderId}`);
            cart = [];
            saveCart();
            window.location.href = `tracking.html?orderId=${order.orderId}`;
        });
    }
}

// Initialize checkout page
if (document.getElementById('checkout-section')) {
    populateCheckoutForm();
}