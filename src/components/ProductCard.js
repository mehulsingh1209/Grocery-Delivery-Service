// src/components/ProductCard.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
  };
  
  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`}>
        <div className="product-image">
          <img src={product.image} alt={product.name} />
          {product.salePrice && <span className="sale-badge">Sale</span>}
        </div>
        <div className="product-info">
          <h3>{product.name}</h3>
          <p className="product-category">{product.category.name}</p>
          <div className="product-price">
            {product.salePrice ? (
              <>
                <span className="sale-price">${product.salePrice.toFixed(2)}</span>
                <span className="original-price">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span>${product.price.toFixed(2)}</span>
            )}
            <span className="unit-price">/ {product.unit}</span>
          </div>
        </div>
      </Link>
      <button 
        className="button is-primary add-to-cart-btn"
        onClick={handleAddToCart}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;

// src/components/CategoryCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  return (
    <Link to={`/products?category=${category._id}`} className="category-card">
      <div className="category-image">
        <img src={category.image} alt={category.name} />
      </div>
      <h3>{category.name}</h3>
    </Link>
  );
};

export default CategoryCard;

// src/components/FeaturedProducts.js
import React from 'react';
import ProductCard from './ProductCard';

const FeaturedProducts = ({ products }) => {
  return (
    <div className="featured-products">
      {products.map(product => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default FeaturedProducts;

// src/components/FilterSidebar.js
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const FilterSidebar = ({ categories }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const currentCategory = searchParams.get('category') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  
  const handleCategoryChange = (categoryId) => {
    const params = new URLSearchParams(searchParams);
    if (categoryId) {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    navigate(`/products?${params.toString()}`);
  };
  
  const handlePriceFilter = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams(searchParams);
    
    if (minPrice) {
      params.set('minPrice', minPrice);
    } else {
      params.delete('minPrice');
    }
    
    if (maxPrice) {
      params.set('maxPrice', maxPrice);
    } else {
      params.delete('maxPrice');
    }
    
    navigate(`/products?${params.toString()}`);
  };
  
  const clearFilters = () => {
    navigate('/products');
    setMinPrice('');
    setMaxPrice('');
  };
  
  return (
    <div className="filter-sidebar">
      <div className="sidebar-section">
        <h3>Categories</h3>
        <ul className="category-list">
          <li>
            <button 
              className={!currentCategory ? 'is-active' : ''}
              onClick={() => handleCategoryChange('')}
            >
              All Products
            </button>
          </li>
          {categories.map(category => (
            <li key={category._id}>
              <button 
                className={currentCategory === category._id ? 'is-active' : ''}
                onClick={() => handleCategoryChange(category._id)}
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="sidebar-section">
        <h3>Price Range</h3>
        <form onSubmit={handlePriceFilter}>
          <div className="price-inputs">
            <div className="field">
              <label>Min Price</label>
              <input 
                type="number" 
                value={minPrice} 
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                min="0"
              />
            </div>
            <div className="field">
              <label>Max Price</label>
              <input 
                type="number" 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                min="0"
              />
            </div>
          </div>
          <button type="submit" className="button is-primary is-small">Apply</button>
        </form>
      </div>
      
      <button className="button is-light is-small" onClick={clearFilters}>
        Clear All Filters
      </button>
    </div>
  );
};

export default FilterSidebar;

// src/pages/ProductDetails.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import axios from 'axios';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        setError('Product not found');
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error || !product) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="product-details">
      <nav className="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/products">Products</Link></li>
          <li><Link to={`/products?category=${product.category._id}`}>{product.category.name}</Link></li>
          <li className="is-active"><a href="#" aria-current="page">{product.name}</a></li>
           <li className="is-active"><a href="#" aria-current="page">{product.name}</a></li>
        </ul>
      </nav>

      <div className="product-detail-content">
        <div className="product-image">
          <img src={product.image} alt={product.name} />
        </div>
        
        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          <p className="product-category">{product.category.name}</p>
          
          <div className="product-price">
            {product.salePrice ? (
              <>
                <span className="sale-price">${product.salePrice.toFixed(2)}</span>
                <span className="original-price">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span>${product.price.toFixed(2)}</span>
            )}
            <span className="unit-price">/ {product.unit}</span>
          </div>
          
          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>
          
          <div className="inventory-status">
            <span className={product.inventory > 0 ? 'in-stock' : 'out-of-stock'}>
              {product.inventory > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          
          <div className="quantity-selector">
            <button 
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              disabled={quantity <= 1}
            >
              -
            </button>
            <input 
              type="number" 
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
            />
            <button onClick={() => setQuantity(prev => prev + 1)}>
              +
            </button>
          </div>
          
          <button 
            className="button is-primary add-to-cart-btn" 
            onClick={handleAddToCart}
            disabled={product.inventory <= 0}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

// src/pages/Cart.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, calculateTotal } = useContext(CartContext);
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleQuantityChange = (product, quantity) => {
    updateQuantity(product._id, quantity);
  };
  
  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };
  
  const handleCheckout = () => {
    if (isLoggedIn) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/checkout' } });
    }
  };
  
  const subtotal = calculateTotal();
  const tax = subtotal * 0.07; // 7% tax
  const deliveryFee = subtotal >= 50 ? 0 : 5.99; // Free delivery over $50
  const total = subtotal + tax + deliveryFee;
  
  return (
    <div className="cart-page">
      <h1>Your Shopping Cart</h1>
      
      {cart.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <Link to="/products" className="button is-primary">Continue Shopping</Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cart.map(item => (
              <div key={item._id} className="cart-item">
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="item-details">
                  <Link to={`/products/${item._id}`}>
                    <h3>{item.name}</h3>
                  </Link>
                  <p>{item.category.name}</p>
                  <p className="item-price">
                    ${(item.salePrice || item.price).toFixed(2)} / {item.unit}
                  </p>
                </div>
                <div className="item-quantity">
                  <button 
                    onClick={() => handleQuantityChange(item, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item, parseInt(e.target.value) || 1)}
                    min="1"
                  />
                  <button onClick={() => handleQuantityChange(item, item.quantity + 1)}>
                    +
                  </button>
                </div>
                <div className="item-total">
                  ${((item.salePrice || item.price) * item.quantity).toFixed(2)}
                </div>
                <button 
                  className="remove-item" 
                  onClick={() => handleRemoveItem(item._id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h2>Order Summary</h2>
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
            
            <button 
              className="button is-primary checkout-btn"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>
            
            <Link to="/products" className="continue-shopping">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
