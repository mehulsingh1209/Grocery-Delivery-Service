// src/pages/Account/index.js
import React, { useState } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Profile from './Profile';
import Orders from './Orders';
import Addresses from './Addresses';
import Payment from './Payment';

const Account = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname.split('/')[2] || 'profile');
  
  return (
    <div className="account-page">
      <h1>My Account</h1>
      
      <div className="account-content">
        <div className="account-sidebar">
          <div className="account-tabs">
            <Link 
              to="/account/profile" 
              className={`account-tab ${activeTab === 'profile' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="fas fa-user"></i>
              <span>Profile</span>
            </Link>
            
            <Link 
              to="/account/orders" 
              className={`account-tab ${activeTab === 'orders' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <i className="fas fa-shopping-bag"></i>
              <span>Orders</span>
            </Link>
            
            <Link 
              to="/account/addresses" 
              className={`account-tab ${activeTab === 'addresses' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              <i className="fas fa-map-marker-alt"></i>
              <span>Addresses</span>
            </Link>
            
            <Link 
              to="/account/payment" 
              className={`account-tab ${activeTab === 'payment' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('payment')}
            >
              <i className="fas fa-credit-card"></i>
              <span>Payment Methods</span>
            </Link>
          </div>
        </div>
        
        <div className="account-main">
          <Routes>
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/addresses" element={<Addresses />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/" element={<Navigate to="/account/profile" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Account;
