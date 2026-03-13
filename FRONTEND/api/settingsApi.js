/**
 * @module settingsApi
 * @description API layer for admin settings management.
 *
 * Endpoints used:
 *  - GET /api/settings          → fetchAllSettings
 *  - GET /api/settings/category/:category → fetchSettingsByCategory
 *  - GET /api/settings/key/:key → fetchSettingByKey
 *  - PUT /api/settings/:key     → updateSetting
 *  - PUT /api/settings/bulk/update → updateSettingsBulk
 *  - POST /api/settings         → createSetting
 *  - DELETE /api/settings/:key  → deleteSetting
 *  - GET /api/settings/system/info → fetchSystemInfo
 *  - GET /api/settings/activity-logs → fetchActivityLogs
 *  - GET /api/settings/database/stats → fetchDatabaseStats
 */
import api from "./api";

/**
 * Fetch all settings grouped by category
 * @returns {Promise<Object>}
 */
export const fetchAllSettings = async () => {
  const response = await api.get("/settings");
  return response.data?.data || {};
};

/**
 * Fetch settings by category
 * @param {string} category - Settings category
 * @returns {Promise<Object>}
 */
export const fetchSettingsByCategory = async (category) => {
  const response = await api.get(`/settings/category/${category}`);
  return response.data?.data || {};
};

/**
 * Fetch a single setting by key
 * @param {string} key - Setting key
 * @returns {Promise<Object>}
 */
export const fetchSettingByKey = async (key) => {
  const response = await api.get(`/settings/key/${key}`);
  return response.data?.data || {};
};

/**
 * Update a single setting
 * @param {string} key - Setting key
 * @param {any} value - New value
 * @returns {Promise<Object>}
 */
export const updateSetting = async (key, value) => {
  const response = await api.put(`/settings/${key}`, { value });
  return response.data?.data || {};
};

/**
 * Update multiple settings
 * @param {Object} settings - Key-value pairs
 * @returns {Promise<Object>}
 */
export const updateSettingsBulk = async (settings) => {
  const response = await api.put("/settings/bulk/update", { settings });
  return response.data?.data || {};
};

/**
 * Create a new setting
 * @param {Object} data - Setting data
 * @returns {Promise<Object>}
 */
export const createSetting = async (data) => {
  const response = await api.post("/settings", data);
  return response.data?.data || {};
};

/**
 * Delete a setting
 * @param {string} key - Setting key
 * @returns {Promise<void>}
 */
export const deleteSetting = async (key) => {
  await api.delete(`/settings/${key}`);
};

/**
 * Fetch system information
 * @returns {Promise<Object>}
 */
export const fetchSystemInfo = async () => {
  const response = await api.get("/settings/system/info");
  return response.data?.data || {};
};

/**
 * Fetch activity logs
 * @param {number} limit - Number of logs
 * @returns {Promise<Array>}
 */
export const fetchActivityLogs = async (limit = 50) => {
  const response = await api.get(`/settings/activity-logs?limit=${limit}`);
  return response.data?.data || [];
};

/**
 * Fetch database statistics
 * @returns {Promise<Object>}
 */
export const fetchDatabaseStats = async () => {
  const response = await api.get("/settings/database/stats");
  return response.data?.data || {};
};
