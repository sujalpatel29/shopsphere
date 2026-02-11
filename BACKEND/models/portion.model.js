 import pool from '../configs/db.js';


export const createPortion = {
       
    // Create new portion

     create: async (portionData) => {      
     const values = [
      portionData.product_id,
      portionData.portion_value,
      portionData.price,
      portionData.stock,
      portionData.is_active !== undefined ? portionData.is_active : true,
      false,
      portionData.created_by
    ];

      const query = `
      INSERT INTO portion_master 
      (product_id, portion_value, price, stock, is_active, is_deleted, created_by, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW()) `;
     

    const [result] = await pool.query(query, values);
    return result.insertId;
},
 

// Check if product exists
checkProductExists: async (productId) => {
   const query = `SELECT product_id from product_master where product_id = ? and is_deleted = false`;
   const [rows] = await pool.query(query, [productId]);
   return rows.length > 0;
},



// Check if portion already exists for this product
checkDuplicatePortion: async (productId, portionValue) =>{
   const query = `
      SELECT portion_id FROM portion_master 
      WHERE product_id = ? AND portion_value = ? AND is_deleted = false`;

    const [rows] = await pool.query(query, [productId, portionValue]);
    return rows.length > 0;
},

};


export const getAllPortion = async() => {
  const query = `SELECT 
        pm.portion_id,
        pm.portion_value,
        pm.description,
        pm.is_active,
        pm.created_by,
        pm.updated_by,
        pm.created_at,
        pm.updated_at
      FROM portion_master pm where is_deleted = false`;


  const [rows] = await pool.query(query);
  return rows;
};


export const getPortionById = async(portion_id) => {
  const query = `  SELECT 
        pm.portion_id,
        pm.portion_value,
        pm.description,
        pm.is_active,
        pm.created_by,
        pm.updated_by,
        pm.created_at,
        pm.updated_at
      FROM portion_master pm where portion_id = ? and is_deleted = false`;

  const [rows] = await pool.query(query, [portion_id]);
  return rows[0] || null;
};












