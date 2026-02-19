# E-Commerce Database Seed Script

## Overview
This SQL script (`seed_new_data.sql`) is designed to:
1. **Truncate all tables** - Removes all existing data while preserving table structures
2. **Seed new test data** - Populates the database with fresh, realistic sample data
3. **Maintain referential integrity** - Handles foreign key constraints properly

## What's Included

### User Data
- 1 Admin user
- 5 Customer users
- Complete shipping and billing addresses

### Product Catalog
- **15 Products** across multiple categories:
  - iPhones (2 models)
  - Android phones (2 models)
  - Smart TVs (2 models)
  - Smartwatches (2 models)
  - Fitness bands (1 model)
  - Headphones (2 models)
  - Men's clothing (3 products)
  - Women's clothing (2 products)

### Product Features
- **25 Product Portions** (storage, size, case options)
- **9 Modifier Portions** (color, RAM, strap material, wash types)
- **11 Modifiers** (various colors, sizes, materials)

### Categories
- **21 Hierarchical Categories** with parent-child relationships
- Electronics, Fashion, and accessories

### Orders & Payments
- **3 Complete Orders** with items, totals, and pricing
- **3 Payments** (credit card, debit card, cash on delivery)
- Tax calculations (18% GST included)

### Discounts & Offers
- **5 Active Promotional Offers**:
  - Welcome 10% discount
  - Electronics Fest 15% off
  - Fashion Weekly flat discount
  - Premium Phones 3000 off
  - Accessories 20% off
- **2 Offer Usage Records** with discount tracking

### Shopping Features
- **3 Shopping Carts** with items
- **5 Product Reviews** (approved and pending)

## How to Use

### Method 1: MySQL Command Line
```bash
mysql -u root -p eeom < seed_new_data.sql
```

### Method 2: MySQL GUI/Workbench
1. Open the `seed_new_data.sql` file
2. Execute the script (Ctrl+Shift+Enter or Run button)

### Method 3: Node.js Application
```javascript
const mysql = require('mysql2/promise');
const fs = require('fs');

const script = fs.readFileSync('seed_new_data.sql', 'utf8');

async function seedDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'eeom',
    multipleStatements: true
  });
  
  await connection.query(script);
  console.log('Database seeded successfully!');
  await connection.end();
}

seedDatabase();
```

## Script Features

✅ **Disables Foreign Key Checks** - Prevents constraint errors during truncation
✅ **Proper Table Order** - Truncates dependent tables first
✅ **Fresh Auto-Increment Values** - Resets ID sequences for clean data
✅ **Realistic Test Data** - Product names, prices, and quantities match reality
✅ **Timestamp Data** - Uses current datetime (2026-02-13) for consistency
✅ **Complete Relationships** - All foreign key references are properly linked
✅ **Tax Calculations** - 18% GST included in order totals
✅ **User Tracking** - created_by/updated_by fields properly populated

## Data Statistics

| Table | Records |
|-------|---------|
| user_master | 6 |
| category_master | 21 |
| portion_master | 13 |
| modifier_master | 11 |
| product_master | 15 |
| product_portion | 25 |
| modifier_portion | 9 |
| product_categories | 43 |
| offer_master | 5 |
| user_addresses | 6 |
| cart_master | 3 |
| cart_items | 5 |
| order_master | 3 |
| order_items | 5 |
| payment_master | 3 |
| offer_usage | 2 |
| product_reviews | 5 |

**Total: ~181 records**

## Important Notes

⚠️ **WARNING**: This script will **DELETE ALL DATA** from your database. Ensure you have backups!

- All timestamps are set to 2026-02-13
- Default currency is set to USD for payments
- Tax rate used: 18% GST
- All addresses are set to USA (can be modified for India)

## Customization

You can easily modify:
- Product names and descriptions
- Prices and discounts
- Categories and hierarchies
- User information
- Order statuses and payment methods

Edit the INSERT statements directly in the SQL file to customize data as needed.

## Verification

After running the script, verify with:
```sql
SELECT COUNT(*) as total_users FROM user_master;
SELECT COUNT(*) as total_products FROM product_master;
SELECT COUNT(*) as total_orders FROM order_master;
SELECT COUNT(*) as total_categories FROM category_master;
```

## Support

If you encounter any errors:
1. Check MySQL version (requires MySQL 8.0+)
2. Ensure `FOREIGN_KEY_CHECKS` is supported
3. Verify database `eeom` exists
4. Check user permissions for DROP and INSERT operations

---
**Last Updated**: 2026-02-13
