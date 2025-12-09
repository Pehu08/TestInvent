const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize SQLite database
const db = new sqlite3.Database('./inventory.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Create table and seed data
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      description TEXT,
      image_url TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      // Check if database is empty
      db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (err) {
          console.error('Error checking product count:', err);
        } else if (row.count === 0) {
          seedDatabase();
        }
      });
    }
  });
}

// Seed database with 20 sample products
function seedDatabase() {
  const products = [
    { name: 'Universal Glide Wax 500g', category: 'All-Temperature', price: 29.99, quantity: 45, description: 'All-purpose ski wax for all snow conditions', image_url: '⛷️' },
    { name: 'Racing Wax Cold -10°C', category: 'Cold Wax', price: 45.99, quantity: 30, description: 'High-performance wax for cold conditions', image_url: '❄️' },
    { name: 'Eco Glide Wax Warm', category: 'Warm Wax', price: 34.99, quantity: 38, description: 'Environmentally friendly warm weather wax', image_url: '☀️' },
    { name: 'Base Cleaner Spray 250ml', category: 'Cleaners', price: 15.99, quantity: 60, description: 'Professional ski base cleaning solution', image_url: '🧴' },
    { name: 'Waxing Iron Professional', category: 'Tools', price: 89.99, quantity: 15, description: 'Temperature-controlled waxing iron', image_url: '🔧' },
    { name: 'Nordic Grip Wax Blue', category: 'Grip Wax', price: 12.99, quantity: 55, description: 'Classic cross-country grip wax', image_url: '🎿' },
    { name: 'Racing Wax Warm +5°C', category: 'Warm Wax', price: 42.99, quantity: 25, description: 'Competition wax for warm conditions', image_url: '🏔️' },
    { name: 'Base Prep Wax 250g', category: 'All-Temperature', price: 19.99, quantity: 40, description: 'Initial preparation wax for new skis', image_url: '⛷️' },
    { name: 'Wax Scraper Set', category: 'Tools', price: 14.99, quantity: 70, description: 'Set of 3 acrylic scrapers', image_url: '🔧' },
    { name: 'Nano Coating Spray', category: 'Cleaners', price: 24.99, quantity: 35, description: 'Advanced protection coating', image_url: '✨' },
    { name: 'Racing Wax Cold -20°C', category: 'Cold Wax', price: 48.99, quantity: 22, description: 'Extreme cold weather racing wax', image_url: '🧊' },
    { name: 'Touring Wax 100g', category: 'All-Temperature', price: 16.99, quantity: 50, description: 'Compact touring wax for backcountry', image_url: '🏂' },
    { name: 'Brass Brush', category: 'Tools', price: 18.99, quantity: 42, description: 'Brass bristle brush for base cleaning', image_url: '🧹' },
    { name: 'Nordic Klister Red', category: 'Grip Wax', price: 13.99, quantity: 48, description: 'Sticky grip wax for wet conditions', image_url: '🎿' },
    { name: 'Fluorocarbon Racing Wax', category: 'Cold Wax', price: 79.99, quantity: 18, description: 'Premium fluoro racing wax', image_url: '💎' },
    { name: 'Cork Block', category: 'Tools', price: 8.99, quantity: 65, description: 'Natural cork for wax polishing', image_url: '🪵' },
    { name: 'Base Repair P-Tex', category: 'Cleaners', price: 11.99, quantity: 52, description: 'Polyethylene repair candles', image_url: '🕯️' },
    { name: 'Travel Wax Kit', category: 'All-Temperature', price: 54.99, quantity: 28, description: 'Complete portable waxing kit', image_url: '💼' },
    { name: 'Edge Sharpener', category: 'Tools', price: 32.99, quantity: 30, description: 'Precision edge tuning tool', image_url: '⚙️' },
    { name: 'Nylon Brush', category: 'Tools', price: 12.99, quantity: 58, description: 'Soft nylon finishing brush', image_url: '🧹' }
  ];

  const stmt = db.prepare('INSERT INTO products (name, category, price, quantity, description, image_url) VALUES (?, ?, ?, ?, ?, ?)');
  
  products.forEach(product => {
    stmt.run(product.name, product.category, product.price, product.quantity, product.description, product.image_url);
  });
  
  stmt.finalize();
  console.log('Database seeded with 20 products');
}

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY id', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.json(row);
    }
  });
});

// Create new product
app.post('/api/products', (req, res) => {
  const { name, category, price, quantity, description, image_url } = req.body;
  
  if (!name || !category || price === undefined || quantity === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    'INSERT INTO products (name, category, price, quantity, description, image_url) VALUES (?, ?, ?, ?, ?, ?)',
    [name, category, price, quantity, description || '', image_url || '📦'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ id: this.lastID, ...req.body });
      }
    }
  );
});

// Update product
app.put('/api/products/:id', (req, res) => {
  const { name, category, price, quantity, description, image_url } = req.body;
  
  db.run(
    'UPDATE products SET name = ?, category = ?, price = ?, quantity = ?, description = ?, image_url = ? WHERE id = ?',
    [name, category, price, quantity, description, image_url, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Product not found' });
      } else {
        res.json({ id: req.params.id, ...req.body });
      }
    }
  );
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.json({ message: 'Product deleted successfully' });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
});
