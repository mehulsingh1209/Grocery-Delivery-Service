// src/pages/OrderDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const OrderDetail = () => {
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
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };
  
  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!order) {
    return <div className="not-found">Order not found</div>;
  }
  
  return (
    <div className="order-detail-page">
      <nav className="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/orders">My Orders</Link></li>
          <li className="is-active"><a href="#" aria-current="page">Order Details</a></li>
        </ul>
      </nav>
      
      <div className="order-header">
        <div className="order-title">
          <h1>Order #{order._id.substring(order._id.length - 6)}</h1>
          <div className={`order-status ${getStatusClass(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </div>
        </div>
        <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
      </div>
      
      <div className="order-content">
        <div className="order-items-section">
          <h2>Order Items</h2>
          <div className="items-list">
            {order.items.map(item => (
              <div key={item._id} className="order-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-details">
                  <Link to={`/products/${item.product}`}>
                    <h3>{item.name}</h3>
                  </Link>
                  <p className="item-price">${item.price.toFixed(2)} / unit</p>
                  <p className="item-quantity">Quantity: {item.quantity}</p>
                </div>
                <div className="item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="order-sidebar">
          <div className="order-summary">
            <h2>Order Summary</h2>
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
          
          <div className="delivery-info">
            <h2>Delivery Information</h2>
            <div className="info-group">
              <h3>Shipping Address</h3>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
            </div>
            
            <div className="info-group">
              <h3>Payment Method</h3>
              <p>{order.paymentMethod === 'credit_card' ? 'Credit Card' : 
                order.paymentMethod === 'paypal' ? 'PayPal' : 'Cash on Delivery'}</p>
            </div>
            
            {order.deliveryInstructions && (
              <div className="info-group">
                <h3>Delivery Instructions</h3>
                <p>{order.deliveryInstructions}</p>
              </div>
            )}
          </div>
          
          <div className="order-actions">
            <h2>Need Help?</h2>
            <div className="action-buttons">
              <Link to="/contact" className="button is-outlined">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
