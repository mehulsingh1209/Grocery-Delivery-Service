// src/pages/ProductList.js
import React, { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import axios from 'axios';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useContext(CartContext);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'name_asc'
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get('/api/products', { 
            params: { 
              category: filters.category,
              search: filters.search,
              sort: filters.sort
            } 
          }),
          axios.get('/api/categories')
        ]);
        
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load products');
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Update URL params
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.search) params.search = filters.search;
    if (filters.sort !== 'name_asc') params.sort = filters.sort;
    setSearchParams(params);
    
  }, [filters, setSearchParams]);
  
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };
  
  const getSortLabel = (sortValue) => {
    switch (sortValue) {
      case 'name_asc': return 'Name (A-Z)';
      case 'name_desc': return 'Name (Z-A)';
      case 'price_asc': return 'Price (Low to High)';
      case 'price_desc': return 'Price (High to Low)';
      default: return 'Default';
    }
  };
  
  if (loading) {
    return <div className="loading">Loading products...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="product-list-page">
      <div className="filter-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <button className="search-button">
            <i className="fas fa-search"></i>
          </button>
        </div>
        
        <div className="category-filter">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="sort-filter">
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
          >
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="price_asc">Price (Low to High)</option>
            <option value="price_desc">Price (High to Low)</option>
          </select>
        </div>
      </div>
      
      {products.length === 0 ? (
        <div className="no-products">
          <p>No products found.</p>
          <button 
            className="button is-primary"
            onClick={() => setFilters({ category: '', search: '', sort: 'name_asc' })}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="results-info">
            <p>
              {products.length} {products.length === 1 ? 'product' : 'products'} found
              {filters.category && categories.find(c => c._id === filters.category) && 
                ` in ${categories.find(c => c._id === filters.category).name}`}
              {filters.search && ` matching "${filters.search}"`}
              {filters.sort !== 'name_asc' && ` sorted by ${getSortLabel(filters.sort)}`}
            </p>
          </div>
          
          <div className="products-grid">
            {products.map(product => (
              <div key={product._id} className="product-card">
                <Link to={`/products/${product._id}`} className="product-image">
                  <img src={product.image} alt={product.name} />
                  {product.salePrice && (
                    <span className="sale-badge">SALE</span>
                  )}
                </Link>
                
                <div className="product-info">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="product-name">{product.name}</h3>
                  </Link>
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
                  
                  <div className="product-actions">
                    <button 
                      className="button is-primary add-to-cart-btn"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.inventory <= 0}
                    >
                      {product.inventory > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductList;
