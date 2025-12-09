# TestInvent

Ski Wax Inventory Management System - A modern web application for managing ski wax and tuning supplies inventory.

## Features

- 🎿 Browse ski wax products and accessories
- ➕ Add new products with details (name, category, price, quantity, description)
- ✏️ Edit existing product information
- 🗑️ Delete products from inventory
- 📊 View inventory statistics (total products, total value, low stock alerts)
- 🔍 Search products by name or description
- 🏷️ Filter products by category
- ➕➖ Quick quantity adjustment controls
- 📱 Responsive design for desktop and mobile

## Product Categories

- **All-Temperature**: Universal waxes for all conditions
- **Cold Wax**: Specialized waxes for cold weather
- **Warm Wax**: Waxes optimized for warm conditions
- **Grip Wax**: Cross-country grip waxes
- **Tools**: Waxing irons, scrapers, brushes
- **Cleaners**: Base cleaners and maintenance products

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pehu08/TestInvent.git
   cd TestInvent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Technology Stack

- **Backend**: Node.js with Express
- **Database**: SQLite (local database)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Architecture**: REST API with SPA frontend

## Database

The application uses SQLite for data storage. On first run, the database will be automatically created and seeded with 20 sample ski wax products including:
- Various temperature-specific waxes
- Tools (irons, scrapers, brushes)
- Cleaners and maintenance products
- Grip waxes for cross-country skiing

The database file (`inventory.db`) is created in the root directory.

## API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a single product
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

## Usage

1. **Browse Products**: View all products in a card-based grid layout
2. **Search**: Use the search bar to find products by name or description
3. **Filter**: Select a category from the dropdown to filter products
4. **Add Product**: Click "Add New Product" button and fill in the form
5. **Edit Product**: Click "Edit" on any product card to modify details
6. **Delete Product**: Click "Delete" on any product card (with confirmation)
7. **Adjust Quantity**: Use +/- buttons on product cards for quick stock updates
8. **View Stats**: Check dashboard statistics for inventory overview

## Development

To run in development mode with auto-restart (requires nodemon):
```bash
npm install -g nodemon
nodemon server.js
```

## License

MIT