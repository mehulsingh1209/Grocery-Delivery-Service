// src/pages/Account/Orders.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const Orders = () => {
  const { currentUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders/my-orders');
        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load orders');
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
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
    return <div className="loading">Loading your orders...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="account-orders">
      <h1>My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <Link to="/products" className="button is-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order._id.substring(order._id.length - 6)}</h3>
                  <p>Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div className={`order-status ${getStatusClass(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </div>
              
              <div className="order-items-preview">
                {order.items.slice(0, 3).map(item => (
                  <div key={item._id} className="item-preview">
                    <img src={item.image} alt={item.name} />
                    <span className="item-quantity">x{item.quantity}</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="more-items">
                    +{order.items.length - 3} more
                  </div>
                )}
              </div>
              
              <div className="order-footer">
                <div className="order-total">
                  <span>Total:</span>
                  <span className="total-amount">${order.total.toFixed(2)}</span>
                </div>
                <Link to={`/orders/${order._id}`} className="button is-outlined">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
