import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Checkout = () => {
  const { cart, calculateTotal, clearCart } = useContext(CartContext);
  const { currentUser, isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const subtotal = calculateTotal();
  const tax = subtotal * 0.07; // 7% tax
  const deliveryFee = subtotal >= 50 ? 0 : 5.99; // Free delivery over $50
  const total = subtotal + tax + deliveryFee;
  
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    
    if (cart.length === 0) {
      navigate('/cart');
      return;
    }
    
    const fetchAddresses = async () => {
      try {
        const response = await axios.get('/api/users/me');
        setAddresses(response.data.addresses);
        if (response.data.addresses.length > 0) {
          const defaultAddress = response.data.addresses.find(addr => addr.isDefault);
          setSelectedAddress(defaultAddress ? defaultAddress._id : response.data.addresses[0]._id);
        }
      } catch (err) {
        setError('Failed to load addresses');
      }
    };
    
    fetchAddresses();
  }, [isLoggedIn, navigate, cart]);
  
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Please select a delivery address');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Find the selected address
      const shippingAddress = addresses.find(addr => addr._id === selectedAddress);
      
      // Format order items
      const orderItems = cart.map(item => ({
        product: item._id,
        name: item.name,
        price: item.salePrice || item.price,
        quantity: item.quantity,
        image: item.image
      }));
      
      const orderData = {
        items: orderItems,
        shippingAddress,
        paymentMethod,
        subtotal,
        tax,
        deliveryFee,
        total,
        deliveryInstructions
      };
      
      const response = await axios.post('/api/orders', orderData);
      clearCart();
      navigate(`/order-confirmation/${response.data._id}`);
    } catch (err) {
      setError('Failed to place order. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="checkout-content">
        <div className="checkout-form">
          <section className="address-section">
            <h2>Delivery Address</h2>
            
            {addresses.length === 0 ? (
              <div className="no-address">
                <p>You don't have any saved addresses.</p>
                <button 
                  className="button is-primary"
                  onClick={() => navigate('/account/addresses')}
                >
                  Add New Address
                </button>
              </div>
            ) : (
              <div className="address-options">
                {addresses.map(address => (
                  <div className="address-option" key={address._id}>
                    <label>
                      <input 
                        type="radio" 
                        name="address"
                        value={address._id}
                        checked={selectedAddress === address._id}
                        onChange={() => setSelectedAddress(address._id)}
                      />
                      <div className="address-details">
                        <p>
                          {currentUser.firstName} {currentUser.lastName}
                        </p>
                        <p>{address.street}</p>
                        <p>{address.city}, {address.state} {address.zipCode}</p>
                        {address.isDefault && <span className="default-badge">Default</span>}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </section>
          
          <section className="payment-section">
            <h2>Payment Method</h2>
            
            <div className="payment-options">
              <div className="payment-option">
                <label>
                  <input 
                    type="radio" 
                    name="payment"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={() => setPaymentMethod('credit_card')}
                  />
                  <span>Credit Card</span>
                </label>
              </div>
              
              <div className="payment-option">
                <label>
                  <input 
                    type="radio" 
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={() => setPaymentMethod('paypal')}
                  />
                  <span>PayPal</span>
                </label>
              </div>
              
              <div className="payment-option">
                <label>
                  <input 
                    type="radio" 
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                  />
                  <span>Cash on Delivery</span>
                </label>
              </div>
            </div>
          </section>
          
          <section className="delivery-instructions">
            <h2>Delivery Instructions (Optional)</h2>
            <textarea
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              placeholder="Any special instructions for delivery"
            />
          </section>
        </div>
        
        <div className="order-summary">
          <h2>Order Summary</h2>
          
          <div className="summary-items">
            {cart.map(item => (
              <div key={item._id} className="summary-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                  <span className="item-quantity">{item.quantity}</span>
                </div>
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>{item.category.name}</p>
                </div>
                <div className="item-price">
                  ${((item.salePrice || item.price) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (7%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee {subtotal >= 50 && <small>(Free over $50)</small>}</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          
          <button 
            className="button is-primary place-order-btn"
            onClick={handlePlaceOrder}
            disabled={loading || addresses.length === 0}
          >
            {loading ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};
