// src/pages/Account/Addresses.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const Addresses = () => {
  const { currentUser } = useContext(AuthContext);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  });
  
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await axios.get('/api/users/me');
        setAddresses(response.data.addresses || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to load addresses');
        setLoading(false);
      }
    };
    
    fetchAddresses();
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
      street: '',
      city: '',
      state: '',
      zipCode: '',
      isDefault: false
    });
    setEditingAddress(null);
    setShowAddForm(false);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let response;
      
      if (editingAddress) {
        response = await axios.put(`/api/users/addresses/${editingAddress._id}`, formData);
      } else {
        response = await axios.post('/api/users/addresses', formData);
      }
      
      setAddresses(response.data.addresses);
      resetForm();
    } catch (err) {
      setError('Failed to save address');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (address) => {
    setFormData({
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      isDefault: address.isDefault
    });
    setEditingAddress(address);
    setShowAddForm(true);
  };
  
  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.delete(`/api/users/addresses/${addressId}`);
      setAddresses(response.data.addresses);
    } catch (err) {
      setError('Failed to delete address');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSetDefault = async (addressId) => {
    setLoading(true);
    
    try {
      const response = await axios.put(`/api/users/addresses/${addressId}/default`);
      setAddresses(response.data.addresses);
    } catch (err) {
      setError('Failed to set default address');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && addresses.length === 0) {
    return <div className="loading">Loading addresses...</div>;
  }
  
  return (
    <div className="addresses-section">
      <div className="section-header">
        <h2>My Addresses</h2>
        {!showAddForm && (
          <button 
            className="button is-primary"
            onClick={() => setShowAddForm(true)}
          >
            Add New Address
          </button>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {showAddForm && (
        <div className="address-form-container">
          <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
          <form onSubmit={handleSubmit} className="address-form">
            <div className="form-group">
              <label htmlFor="street">Street Address</label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="zipCode">ZIP Code</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
              />
              <label htmlFor="isDefault">Set as default address</label>
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="button is-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Address'}
              </button>
              <button 
                type="button" 
                className="button is-light"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {addresses.length === 0 ? (
        <div className="no-addresses">
          <p>You don't have any saved addresses.</p>
        </div>
      ) : (
        <div className="addresses-list">
          {addresses.map(address => (
            <div key={address._id} className="address-card">
              <div className="address-content">
                {address.isDefault && <span className="default-badge">Default</span>}
                <p>{currentUser.firstName} {currentUser.lastName}</p>
                <p>{address.street}</p>
                <p>{address.city}, {address.state} {address.zipCode}</p>
              </div>
              
              <div className="address-actions">
                <button 
                  className="edit-button"
                  onClick={() => handleEdit(address)}
                >
                  Edit
                </button>
                {!address.isDefault && (
                  <button 
                    className="set-default-button"
                    onClick={() => handleSetDefault(address._id)}
                  >
                    Set as Default
                  </button>
                )}
                <button 
                  className="delete-button"
                  onClick={() => handleDelete(address._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Addresses;
