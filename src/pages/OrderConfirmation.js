import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`/api/orders/${id}`);
        setOrder(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load order details');
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);
  
  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!order) {
    return <div className="not-found">Order not found</div>;
  }
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="order-confirmation">
      <div className="success-message">
        <i className="fas fa-check-circle"></i>
        <h1>Order Placed Successfully!</h1>
        <p>Thank you for your order. We'll deliver your groceries soon.</p>
      </div>
      
      <div className="order-details">
        <div className="order-header">
          <h2>Order #{order._id.substring(order._id.length - 6)}</h2>
          <p>Placed on {formatDate(order.createdAt)}</p>
        </div>
        
        <div className="delivery-info">
          <h3>Delivery Information</h3>
          <div className="info-card">
            <div className="address">
              <h4>Delivery Address</h4>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
            </div>
            
            <div className="payment">
              <h4>Payment Method</h4>
              <p>{order.paymentMethod === 'credit_card' ? 'Credit Card' : 
                order.paymentMethod === 'paypal' ? 'PayPal' : 'Cash on Delivery'}</p>
            </div>
            
            <div className="estimate">
              <h4>Estimated Delivery</h4>
              <p>Within 2 hours</p>
            </div>
          </div>
          
          {order.deliveryInstructions && (
            <div className="delivery-instructions">
              <h4>Delivery Instructions</h4>
              <p>{order.deliveryInstructions}</p>
            </div>
          )}
        </div>
        
        <div className="order-items">
          <h3>Order Items</h3>
          <div className="items-list">
            {order.items.map(item => (
              <div key={item._id} className="order-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <div className="item-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (7%)</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>${order.deliveryFee.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="action-buttons">
        <Link to="/products" className="button is-primary">
          Continue Shopping
        </Link>
        <Link to="/orders" className="button is-outlined">
          View All Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
