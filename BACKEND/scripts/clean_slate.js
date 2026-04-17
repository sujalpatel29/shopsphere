import pool from '../configs/db.js';

// Tables truncated in FK-safe order (leaf → root). Preserves:
//   - user_master row with user_id = 1 (Platform Admin)
//   - app_settings (global config)
const TABLES_IN_ORDER = [
  'activity_logs',
  'review_helpful', 'product_reviews',
  'offer_usage', 'offer_product_category',
  'payment_master',
  'order_item_modifiers', 'order_items', 'order_master',
  'cart_item_modifiers', 'cart_items', 'cart_master',
  'product_images',
  'modifier_combination_items', 'modifier_combination',
  'modifier_portion', 'product_portion', 'product_categories',
  'product_master',
  'offer_master',
  'user_addresses', 'seller_profiles',
  'category_master', 'modifier_master', 'portion_master',
];

async function cleanSlate() {
  console.log('--- Database cleanup (preserving admin user_id=1 + app_settings) ---');
  try {
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of TABLES_IN_ORDER) {
      try {
        console.log(`  TRUNCATE ${table}`);
        await pool.query('TRUNCATE TABLE ??', [table]);
      } catch (err) {
        if (err.errno === 1146) {
          console.warn(`    (${table} does not exist, skipping)`);
          continue;
        }
        console.warn(`    TRUNCATE failed (${err.message}), trying DELETE…`);
        try {
          await pool.query('DELETE FROM ??', [table]);
        } catch (deleteErr) {
          console.error(`    DELETE also failed: ${deleteErr.message}`);
        }
      }
    }
    console.log('  DELETE FROM user_master WHERE user_id <> 1');
    await pool.query('DELETE FROM user_master WHERE user_id <> 1');
    await pool.query('ALTER TABLE user_master AUTO_INCREMENT = 2');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('--- Cleanup successful ---');
  } catch (err) {
    console.error('--- Cleanup failed ---');
    console.error(err);
  } finally {
    process.exit(0);
  }
}

cleanSlate();
