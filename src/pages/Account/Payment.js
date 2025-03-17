// src/pages/Account/Payment.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Payment = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    isDefault: false
  });
  
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await axios.get('/api/users/payment-methods');
        setPaymentMethods(response.data || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to load payment methods');
        setLoading(false);
      }
    };
    
    fetchPaymentMethods();
  }, []);
  
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };
  
  const resetForm = () => {
    setFormData({
      cardNumber: '',
      cardholderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      isDefault: false
    });
    setShowAddForm(false);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('/api/users/payment-methods', {
        cardNumber: formData.cardNumber,
        cardholderName: formData.cardholderName,
        expiryDate: `${formData.expiryMonth}/${formData.expiryYear}`,
        isDefault: formData.isDefault
      });
      
      setPaymentMethods(response.data);
      resetForm();
    } catch (err) {
      setError('Failed to save payment method');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.delete(`/api/users/payment-methods/${paymentId}`);
      setPaymentMethods(response.data);
    } catch (err) {
      setError('Failed to delete payment method');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSetDefault = async (paymentId) => {
    setLoading(true);
    
    try {
      const response = await axios.put(`/api/users/payment-methods/${paymentId}/default`);
      setPaymentMethods(response.data);
    } catch (err) {
      setError('Failed to set default payment method');
    } finally {
      setLoading(false);
    }
  };
  
  const formatCardNumber = (number) => {
    return `•••• •••• •••• ${number.slice(-4)}`;
  };
  
  if (loading && paymentMethods.length === 0) {
    return <div className="loading">Loading payment methods...</div>;
  }
  
  return (
    <div className="payment-section">
      <div className="section-header">
        <h2>Payment Methods</h2>
        {!showAddForm && (
          <button 
            className="button is-primary"
            onClick={() => setShowAddForm(true)}
          >
            Add New Payment Method
          </button>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {showAddForm && (
        <div className="payment-form-container">
          <h3>Add New Payment Method</h3>
          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-group">
              <label htmlFor="cardNumber">Card Number</label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                placeholder="1234 5678 9012 3456"
                required
                maxLength="19"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="cardholderName">Cardholder Name</label>
              <input
                type="text"
                id="cardholderName"
                name="cardholderName"
                value={formData.cardholderName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expiryMonth">Expiry Month</label>
                <select
                  id="expiryMonth"
                  name="expiryMonth"
                  value={formData.expiryMonth}
                  onChange={handleChange}
                  required
                >
                  <option value="">Month</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = i + 1;
                    return (
                      <option key={month} value={month < 10 ? `0${month}` : month}>
                        {month < 10 ? `0${month}` : month}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="expiryYear">Expiry Year</label>
                <select
                  id="expiryYear"
                  name="expiryYear"
                  value={formData.expiryYear}
                  onChange={handleChange}
                  required
                >
                  <option value="">Year</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="cvv">CVV</label>
                <input
                 type="text"
                  id="cvv"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleChange}
                  required
                  maxLength="4"
                />
              </div>
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
              />
              <label htmlFor="isDefault">Set as default payment method</label>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="button is-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Payment Method'}
              </button>
              <button
                type="button"
                className="button is-secondary"
                onClick={resetForm}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {paymentMethods.length > 0 ? (
        <div className="payment-methods-list">
          {paymentMethods.map((method) => (
            <div key={method._id} className={`payment-method-card ${method.isDefault ? 'is-default' : ''}`}>
              <div className="card-info">
                <div className="card-type">
                  <span className={`card-icon ${method.cardType.toLowerCase()}`}></span>
                  {method.cardType}
                </div>
                <div className="card-number">{formatCardNumber(method.cardNumber)}</div>
                <div className="card-expiry">Expires: {method.expiryDate}</div>
                <div className="cardholder-name">{method.cardholderName}</div>
                {method.isDefault && <div className="default-badge">Default</div>}
              </div>
              <div className="card-actions">
                {!method.isDefault && (
                  <button
                    className="button is-small"
                    onClick={() => handleSetDefault(method._id)}
                    disabled={loading}
                  >
                    Set as Default
                  </button>
                )}
                <button
                  className="button is-small is-danger"
                  onClick={() => handleDelete(method._id)}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-methods">
          <p>You haven't added any payment methods yet.</p>
        </div>
      )}
    </div>
  );
};

export default Payment;
