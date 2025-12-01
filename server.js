const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database configuration for Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'store-intelligence-secret-key-2024';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Store Intelligence API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // For demo - check against hardcoded users
    const demoUsers = {
      'admin@company.uz': {
        name: 'Администратор Системы',
        role: 'admin',
        password: 'password',
        avatar: '👑',
        store_id: null
      },
      'manager@company.uz': {
        name: 'Менеджер Магазина',
        role: 'manager',
        password: 'password',
        avatar: '👨‍💼',
        store_id: 1
      }
    };
    
    const user = demoUsers[email];
    
    if (!user || password !== user.password) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      {
        email: email,
        name: user.name,
        role: user.role,
        store_id: user.store_id,
        avatar: user.avatar
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        email: email,
        name: user.name,
        role: user.role,
        store_id: user.store_id,
        avatar: user.avatar
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Analytics endpoints
app.get('/api/analytics/daily-stats', async (req, res) => {
  try {
    // Demo data for daily statistics
    const stats = {
      revenue: 12845000,
      customers: 324,
      avg_check: 39645,
      items_sold: 587,
      stores_count: 4,
      growth: 12.5
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Inventory notifications
app.get('/api/inventory/notifications', async (req, res) => {
  try {
    const notifications = [
      {
        id: 1,
        product: 'Молоко Простоквашино 1л',
        stock: 8,
        min_stock: 25,
        status: 'low',
        store: 'Ташкент Центральный'
      },
      {
        id: 2,
        product: 'Хлеб Бородинский',
        stock: 15,
        min_stock: 30,
        status: 'medium',
        store: 'Ташкент Центральный'
      },
      {
        id: 3,
        product: 'Вода минеральная 1.5л',
        stock: 42,
        min_stock: 20,
        status: 'normal',
        store: 'Ташкент Центральный'
      },
      {
        id: 4,
        product: 'Сахар 1кг',
        stock: 12,
        min_stock: 25,
        status: 'low',
        store: 'Самарканд Торговый'
      }
    ];
    
    res.json(notifications);
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Sales data for chart
app.get('/api/analytics/sales-chart', async (req, res) => {
  try {
    const days = 30;
    const chartData = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      chartData.push({
        date: date.toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 300000) + 700000,
        transactions: Math.floor(Math.random() * 50) + 100
      });
    }
    
    res.json(chartData);
  } catch (error) {
    console.error('Chart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Stores list
app.get('/api/stores', async (req, res) => {
  try {
    const stores = [
      {
        id: 1,
        name: 'Ташкент Центральный',
        city: 'Ташкент',
        revenue: 12845000,
        customers: 324,
        rating: 4.8
      },
      {
        id: 2,
        name: 'Самарканд Торговый',
        city: 'Самарканд',
        revenue: 9850000,
        customers: 245,
        rating: 4.6
      },
      {
        id: 3,
        name: 'Бухара Старый город',
        city: 'Бухара',
        revenue: 7450000,
        customers: 198,
        rating: 4.7
      },
      {
        id: 4,
        name: 'Наманган Северный',
        city: 'Наманган',
        revenue: 6210000,
        customers: 167,
        rating: 4.5
      }
    ];
    
    res.json(stores);
  } catch (error) {
    console.error('Stores error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Products list
app.get('/api/products', async (req, res) => {
  try {
    const products = [
      {
        id: 1,
        name: 'Молоко Простоквашино 1л',
        sku: 'MLK-001',
        category: 'Молочные продукты',
        price: 12000,
        stock: 8,
        min_stock: 25,
        status: 'low'
      },
      {
        id: 2,
        name: 'Хлеб Бородинский',
        sku: 'BRD-001',
        category: 'Хлебобулочные изделия',
        price: 4000,
        stock: 15,
        min_stock: 30,
        status: 'medium'
      },
      {
        id: 3,
        name: 'Вода минеральная 1.5л',
        sku: 'WTR-001',
        category: 'Напитки',
        price: 3500,
        stock: 42,
        min_stock: 20,
        status: 'normal'
      },
      {
        id: 4,
        name: 'Рис узгенский 1кг',
        sku: 'RIC-001',
        category: 'Бакалея',
        price: 11000,
        stock: 25,
        min_stock: 15,
        status: 'normal'
      },
      {
        id: 5,
        name: 'Сахар 1кг',
        sku: 'SUG-001',
        category: 'Бакалея',
        price: 8000,
        stock: 12,
        min_stock: 25,
        status: 'low'
      },
      {
        id: 6,
        name: 'Масло сливочное 180г',
        sku: 'BUT-001',
        category: 'Молочные продукты',
        price: 14000,
        stock: 18,
        min_stock: 20,
        status: 'medium'
      }
    ];
    
    res.json(products);
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new sale
app.post('/api/sales', async (req, res) => {
  try {
    const { products, total, payment_method } = req.body;
    
    const newSale = {
      id: Date.now(),
      date: new Date().toISOString(),
      total: total,
      payment_method: payment_method || 'cash',
      products: products,
      status: 'completed'
    };
    
    res.json({
      success: true,
      message: 'Продажа успешно создана',
      sale: newSale
    });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve frontend for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Store Intelligence System запущен на порту ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api/health`);
  console.log(`👑 Админ: admin@company.uz / password`);
  console.log(`👨‍💼 Менеджер: manager@company.uz / password`);
});
