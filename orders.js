// Order management and payment processing

// Order status constants
const ORDER_STATUS = {
    PLACED: 'PLACED',
    CONFIRMED: 'CONFIRMED',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED'
};

// Payment methods
const PAYMENT_METHODS = {
    COD: 'CASH_ON_DELIVERY',
    UPI: 'UPI',
    PAYTM: 'PAYTM',
    GOOGLE_PAY: 'GOOGLE_PAY'
};

// Generate unique order ID
function generateOrderId() {
    return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// Store orders in localStorage
let orders = JSON.parse(localStorage.getItem('orders')) || [];

// Save orders to localStorage
function saveOrders() {
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Create new order
function createOrder(userId, items, totalAmount, paymentMethod, paymentDetails = null, notes = '') {
    const order = {
        orderId: generateOrderId(),
        userId: userId,
        items: items,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        paymentDetails: paymentDetails,
        notes: notes,
        status: ORDER_STATUS.PLACED,
        statusHistory: [{
            status: ORDER_STATUS.PLACED,
            timestamp: new Date().toISOString()
        }],
        createdAt: new Date().toISOString()
    };

    // For COD orders, confirm immediately
    if (paymentMethod === PAYMENT_METHODS.COD) {
        order.status = ORDER_STATUS.CONFIRMED;
        order.statusHistory.push({
            status: ORDER_STATUS.CONFIRMED,
            timestamp: new Date().toISOString()
        });
    }

    orders.push(order);
    saveOrders();
    return order;
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
        order.status = newStatus;
        order.statusHistory.push({
            status: newStatus,
            timestamp: new Date().toISOString()
        });
        saveOrders();
        return true;
    }
    return false;
}

// Get user's orders
function getUserOrders(userId) {
    return orders.filter(order => order.userId === userId);
}

// Get order by ID
function getOrderById(orderId) {
    return orders.find(order => order.orderId === orderId);
}

// Process online payment
function processOnlinePayment(orderId, paymentMethod, paymentDetails) {
    const order = getOrderById(orderId);
    if (order && order.status === ORDER_STATUS.PLACED) {
        // In a real application, this would integrate with payment gateways
        // For now, we'll simulate payment success
        const paymentSuccess = true;

        if (paymentSuccess) {
            order.paymentDetails = paymentDetails;
            updateOrderStatus(orderId, ORDER_STATUS.CONFIRMED);
            return true;
        }
    }
    return false;
}

// Format order status for display
function formatOrderStatus(status) {
    return status.charAt(0) + status.slice(1).toLowerCase();
}

// Get order tracking information
function getOrderTracking(orderId) {
    const order = getOrderById(orderId);
    if (!order) return null;

    return {
        orderId: order.orderId,
        status: order.status,
        statusHistory: order.statusHistory,
        formattedStatus: formatOrderStatus(order.status)
    };
}