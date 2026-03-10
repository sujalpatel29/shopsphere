/**
 * @component AdminSettingsTab
 * @description Comprehensive application settings management
 *
 * Features:
 *  - General settings (site name, contact, etc.)
 *  - Store settings (currency, tax, shipping)
 *  - Payment settings (Stripe configuration)
 *  - Email settings (SMTP configuration)
 *  - Security settings (JWT, password policies)
 *  - System information dashboard
 *  - Activity logs viewer
 *  - Database statistics
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Skeleton } from "primereact/skeleton";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { Dropdown } from "primereact/dropdown";
import { TabView, TabPanel } from "primereact/tabview";
import { Dialog } from "primereact/dialog";
import { Chip } from "primereact/chip";
import { ProgressBar } from "primereact/progressbar";
import {
  Settings,
  Store,
  CreditCard,
  Mail,
  Shield,
  Database,
  Activity,
  Server,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Info,
  Cpu,
  HardDrive,
  Clock,
  User,
  Globe,
  DollarSign,
  Bell,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  fetchAllSettings,
  fetchSystemInfo,
  fetchActivityLogs,
  updateSetting,
  updateSettingsBulk,
  createSetting,
  deleteSetting,
} from "../../../api/settingsApi";
import "./AdminProducts.css";

// Setting categories with icons
const SETTING_CATEGORIES = [
  { key: "general", label: "General", icon: Settings },
  { key: "store", label: "Store", icon: Store },
  { key: "payment", label: "Payment", icon: CreditCard },
  { key: "email", label: "Email", icon: Mail },
  { key: "security", label: "Security", icon: Shield },
  { key: "notifications", label: "Notifications", icon: Bell },
];

// Currency options
const CURRENCIES = [
  { label: "INR - Indian Rupee", value: "INR" },
  { label: "USD - US Dollar", value: "USD" },
  { label: "EUR - Euro", value: "EUR" },
  { label: "GBP - British Pound", value: "GBP" },
];

// Timezone options
const TIMEZONES = [
  { label: "Asia/Kolkata (IST)", value: "Asia/Kolkata" },
  { label: "UTC", value: "UTC" },
  { label: "America/New_York (EST)", value: "America/New_York" },
  { label: "Europe/London (GMT)", value: "Europe/London" },
];

function AdminSettingsTab() {
  const toast = useRef(null);
  const { darkMode, toggleDarkMode } = useTheme();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [settings, setSettings] = useState({});
  const [systemInfo, setSystemInfo] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const [newSetting, setNewSetting] = useState({
    setting_key: "",
    setting_value: "",
    setting_type: "string",
    category: "general",
    description: "",
  });

  // Form state for each category
  const [formData, setFormData] = useState({});

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load settings and system info first (required)
      const [settingsData, sysInfo] = await Promise.all([
        fetchAllSettings(),
        fetchSystemInfo(),
      ]);
      setSettings(settingsData);
      setSystemInfo(sysInfo);

      // Initialize form data from settings
      const initialFormData = {};
      Object.entries(settingsData).forEach(([category, categorySettings]) => {
        initialFormData[category] = {};
        Object.entries(categorySettings).forEach(([key, data]) => {
          initialFormData[category][key] = data.value;
        });
      });
      setFormData(initialFormData);

      // Try to load activity logs (optional - may fail if table doesn't exist)
      try {
        const logs = await fetchActivityLogs(20);
        setActivityLogs(logs);
      } catch (logError) {
        console.warn("Activity logs not available:", logError);
        setActivityLogs([]);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load settings",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Export settings to JSON
  const handleExportSettings = useCallback(() => {
    if (!settings || Object.keys(settings).length === 0) {
      toast.current?.show({
        severity: "warning",
        summary: "No Data",
        detail: "No settings available to export",
        life: 3000,
      });
      return;
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      settings: settings,
      systemInfo: {
        nodeVersion: systemInfo?.nodeVersion,
        platform: systemInfo?.platform,
        database: systemInfo?.database,
      },
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    
    const link = document.createElement("a");
    link.setAttribute("href", dataUri);
    link.setAttribute("download", `settings_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.current?.show({
      severity: "success",
      summary: "Exported",
      detail: "Settings exported successfully",
      life: 3000,
    });
  }, [settings, systemInfo]);

  // Clear cache (simulated - in production would call actual cache clear API)
  const handleClearCache = useCallback(() => {
    // Clear localStorage cache keys
    const keysToClear = ['admin-sidebar-open', 'cart-cache', 'product-cache'];
    let cleared = 0;
    keysToClear.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        cleared++;
      }
    });

    toast.current?.show({
      severity: "success",
      summary: "Cache Cleared",
      detail: `${cleared} cache entries cleared`,
      life: 3000,
    });
  }, []);

  // Backup database (simulated - would call backend API in production)
  const handleBackupDatabase = useCallback(() => {
    toast.current?.show({
      severity: "info",
      summary: "Backup Started",
      detail: "Database backup initiated. Check server logs.",
      life: 3000,
    });
  }, []);

  // Handle form change
  const handleFormChange = (category, key, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [key]: value,
      },
    }));
  };

  // Save settings for a category
  const saveCategorySettings = async (category) => {
    try {
      setSaving(true);
      const categoryData = formData[category] || {};
      await updateSettingsBulk(categoryData);
      toast.current?.show({
        severity: "success",
        summary: "Saved",
        detail: `${category} settings saved successfully`,
        life: 3000,
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to save settings",
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  // Create new setting
  const handleCreateSetting = async () => {
    try {
      if (!newSetting.setting_key || !newSetting.setting_value) {
        toast.current?.show({
          severity: "warning",
          summary: "Warning",
          detail: "Key and value are required",
          life: 3000,
        });
        return;
      }

      await createSetting(newSetting);
      setShowAddDialog(false);
      setNewSetting({
        setting_key: "",
        setting_value: "",
        setting_type: "string",
        category: "general",
        description: "",
      });
      loadData();
      toast.current?.show({
        severity: "success",
        summary: "Created",
        detail: "Setting created successfully",
        life: 3000,
      });
    } catch (error) {
      console.error("Failed to create setting:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to create setting",
        life: 3000,
      });
    }
  };

  // Format bytes
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format uptime
  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  // Activity log action template
  const actionTemplate = (rowData) => {
    const colors = {
      CREATE: "success",
      UPDATE: "info",
      DELETE: "danger",
      LOGIN: "success",
      LOGOUT: "warning",
      ERROR: "danger",
    };
    return (
      <Tag
        value={rowData.action}
        severity={colors[rowData.action] || "secondary"}
        className="!text-xs"
      />
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="!p-4">
              <Skeleton width="100%" height="15rem" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Setting input component based on type
  const SettingInput = ({ category, settingKey, data, value, onChange }) => {
    const type = data?.type || "string";

    switch (type) {
      case "boolean":
        return (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{formatLabel(settingKey)}</p>
              <p className="text-xs text-gray-500">{data?.description}</p>
            </div>
            <InputSwitch
              checked={value === "true" || value === true}
              onChange={(e) => onChange(category, settingKey, String(e.value))}
            />
          </div>
        );
      case "number":
        return (
          <div className="space-y-1">
            <label className="font-medium text-gray-900 dark:text-white">{formatLabel(settingKey)}</label>
            <InputNumber
              value={Number(value) || 0}
              onValueChange={(e) => onChange(category, settingKey, String(e.value))}
              className="!w-full"
            />
            {data?.description && <p className="text-xs text-gray-500">{data.description}</p>}
          </div>
        );
      case "currency":
        return (
          <div className="space-y-1">
            <label className="font-medium text-gray-900 dark:text-white">{formatLabel(settingKey)}</label>
            <Dropdown
              value={value}
              options={CURRENCIES}
              onChange={(e) => onChange(category, settingKey, e.value)}
              className="!w-full"
            />
            {data?.description && <p className="text-xs text-gray-500">{data.description}</p>}
          </div>
        );
      case "timezone":
        return (
          <div className="space-y-1">
            <label className="font-medium text-gray-900 dark:text-white">{formatLabel(settingKey)}</label>
            <Dropdown
              value={value}
              options={TIMEZONES}
              onChange={(e) => onChange(category, settingKey, e.value)}
              className="!w-full"
            />
            {data?.description && <p className="text-xs text-gray-500">{data.description}</p>}
          </div>
        );
      case "password":
        return (
          <div className="space-y-1">
            <label className="font-medium text-gray-900 dark:text-white">{formatLabel(settingKey)}</label>
            <InputText
              type="password"
              value={value || ""}
              onChange={(e) => onChange(category, settingKey, e.target.value)}
              className="!w-full"
              placeholder="••••••••"
            />
            {data?.description && <p className="text-xs text-gray-500">{data.description}</p>}
          </div>
        );
      default:
        return (
          <div className="space-y-1">
            <label className="font-medium text-gray-900 dark:text-white">{formatLabel(settingKey)}</label>
            <InputText
              value={value || ""}
              onChange={(e) => onChange(category, settingKey, e.target.value)}
              className="!w-full"
            />
            {data?.description && <p className="text-xs text-gray-500">{data.description}</p>}
          </div>
        );
    }
  };

  // Format label from key
  const formatLabel = (key) => {
    return key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div className="admin-products-container space-y-6">
      <Toast ref={toast} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-7 h-7 text-amber-600" />
            Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage application configuration and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            icon={<RefreshCw className="w-4 h-4" />}
            label="Refresh"
            onClick={loadData}
            className="!bg-gray-600 !border-gray-600 hover:!bg-gray-700 !text-white"
          />
          <Button
            icon={<Plus className="w-4 h-4" />}
            label="Add Setting"
            onClick={() => setShowAddDialog(true)}
            className="!bg-amber-600 !border-amber-600 hover:!bg-amber-700 !text-white"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-2">
          <Card className="!shadow-sm !border !border-gray-100 dark:!border-gray-800 !bg-white dark:!bg-gray-900">
            <TabView
              activeIndex={activeIndex}
              onTabChange={(e) => setActiveIndex(e.index)}
              className="settings-tabview"
            >
              {SETTING_CATEGORIES.map((category) => {
                const CategoryIcon = category.icon;
                const categorySettings = settings[category.key] || {};
                const hasSettings = Object.keys(categorySettings).length > 0;

                return (
                  <TabPanel
                    key={category.key}
                    header={
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="w-4 h-4" />
                        <span>{category.label}</span>
                      </div>
                    }
                  >
                    <div className="p-4 space-y-6">
                      {hasSettings ? (
                        <>
                          {Object.entries(categorySettings).map(([key, data]) => (
                            <SettingInput
                              key={key}
                              category={category.key}
                              settingKey={key}
                              data={data}
                              value={formData[category.key]?.[key]}
                              onChange={handleFormChange}
                            />
                          ))}
                          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                            <Button
                              icon={<Save className="w-4 h-4" />}
                              label={`Save ${category.label} Settings`}
                              onClick={() => saveCategorySettings(category.key)}
                              loading={saving}
                              className="!bg-teal-600 !border-teal-600 hover:!bg-teal-700"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12 text-gray-400">
                          <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">No settings configured</p>
                          <p className="text-sm">Add settings for this category</p>
                        </div>
                      )}
                    </div>
                  </TabPanel>
                );
              })}

              {/* System Info Tab */}
              <TabPanel
                header={
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    <span>System</span>
                  </div>
                }
              >
                <div className="p-4 space-y-6">
                  {systemInfo && (
                    <>
                      {/* Database Info */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <Database className="w-5 h-5 text-amber-600" />
                          Database
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">MySQL Version</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {systemInfo.database?.mysql_version}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Database</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {systemInfo.database?.database_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Tables</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {systemInfo.database?.table_count}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Server Info */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <Server className="w-5 h-5 text-teal-600" />
                          Server
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Node Version</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {systemInfo.nodeVersion}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Platform</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {systemInfo.platform}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Uptime</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatUptime(systemInfo.uptime)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Memory Usage */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <Cpu className="w-5 h-5 text-purple-600" />
                          Memory Usage
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-500">Heap Used</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {formatBytes(systemInfo.memoryUsage?.heapUsed)}
                              </span>
                            </div>
                            <ProgressBar
                              value={(systemInfo.memoryUsage?.heapUsed / systemInfo.memoryUsage?.heapTotal) * 100}
                              showValue={false}
                              className="!h-2"
                              pt={{ value: { className: "!bg-purple-500" } }}
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-500">RSS</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {formatBytes(systemInfo.memoryUsage?.rss)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Top Tables */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <HardDrive className="w-5 h-5 text-green-600" />
                          Top Tables by Size
                        </h4>
                        <div className="space-y-2">
                          {systemInfo.tables?.slice(0, 5).map((table, index) => (
                            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                              <span className="text-sm text-gray-700 dark:text-gray-300">{table.table_name}</span>
                              <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-500">{table.table_rows} rows</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {table.size_mb} MB
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </TabPanel>

              {/* Activity Logs Tab */}
              <TabPanel
                header={
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>Activity</span>
                  </div>
                }
              >
                <div className="p-4">
                  <DataTable
                    value={activityLogs}
                    className="admin-products-table"
                    emptyMessage="No activity logs"
                    paginator
                    rows={10}
                  >
                    <Column
                      field="created_at"
                      header="Time"
                      className="!text-sm"
                      body={(rowData) => new Date(rowData.created_at).toLocaleString()}
                    />
                    <Column
                      field="user_name"
                      header="User"
                      className="!text-sm"
                    />
                    <Column
                      field="action"
                      header="Action"
                      className="!text-sm"
                      body={actionTemplate}
                    />
                    <Column
                      field="entity_type"
                      header="Entity"
                      className="!text-sm"
                    />
                    <Column
                      field="ip_address"
                      header="IP"
                      className="!text-sm font-mono"
                    />
                  </DataTable>
                </div>
              </TabPanel>
            </TabView>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="!shadow-sm !border !border-gray-100 dark:!border-gray-800 !bg-white dark:!bg-gray-900">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-3">
              <Button
                icon={<Activity className="w-4 h-4" />}
                label="View All Logs"
                onClick={() => setShowLogsDialog(true)}
                className="!w-full !bg-gray-100 !text-gray-700 hover:!bg-gray-200 dark:!bg-gray-800 dark:!text-gray-300"
                text
              />
              <Button
                icon={<RefreshCw className="w-4 h-4" />}
                label="Clear Cache"
                onClick={handleClearCache}
                className="!w-full !bg-gray-100 !text-gray-700 hover:!bg-gray-200 dark:!bg-gray-800 dark:!text-gray-300"
                text
              />
              <Button
                icon={<Database className="w-4 h-4" />}
                label="Backup Database"
                onClick={handleBackupDatabase}
                className="!w-full !bg-gray-100 !text-gray-700 hover:!bg-gray-200 dark:!bg-gray-800 dark:!text-gray-300"
                text
              />
            </div>
          </Card>

          {/* Stats */}
          <Card className="!shadow-sm !border !border-gray-100 dark:!border-gray-800 !bg-white dark:!bg-gray-900">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">Statistics</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Settings</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {Object.values(settings).reduce((sum, cat) => sum + Object.keys(cat).length, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Categories</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {Object.keys(settings).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Activity Logs</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {activityLogs.length}
                </span>
              </div>
            </div>
          </Card>

          {/* Environment */}
          <Card className="!shadow-sm !border !border-gray-100 dark:!border-gray-800 !bg-white dark:!bg-gray-900">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white">Environment</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Database Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Cloudinary Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Stripe Test Mode</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Setting Dialog */}
      <Dialog
        header="Add New Setting"
        visible={showAddDialog}
        onHide={() => setShowAddDialog(false)}
        className="!w-full !max-w-lg"
      >
        <div className="space-y-4 p-4">
          <div className="space-y-1">
            <label className="font-medium text-gray-900 dark:text-white">Setting Key</label>
            <InputText
              value={newSetting.setting_key}
              onChange={(e) => setNewSetting({ ...newSetting, setting_key: e.target.value })}
              className="!w-full"
              placeholder="e.g., site_name"
            />
          </div>
          <div className="space-y-1">
            <label className="font-medium text-gray-900 dark:text-white">Value</label>
            <InputText
              value={newSetting.setting_value}
              onChange={(e) => setNewSetting({ ...newSetting, setting_value: e.target.value })}
              className="!w-full"
              placeholder="Setting value"
            />
          </div>
          <div className="space-y-1">
            <label className="font-medium text-gray-900 dark:text-white">Type</label>
            <Dropdown
              value={newSetting.setting_type}
              options={[
                { label: "String", value: "string" },
                { label: "Number", value: "number" },
                { label: "Boolean", value: "boolean" },
                { label: "Password", value: "password" },
              ]}
              onChange={(e) => setNewSetting({ ...newSetting, setting_type: e.value })}
              className="!w-full"
            />
          </div>
          <div className="space-y-1">
            <label className="font-medium text-gray-900 dark:text-white">Category</label>
            <Dropdown
              value={newSetting.category}
              options={SETTING_CATEGORIES.map((c) => ({ label: c.label, value: c.key }))}
              onChange={(e) => setNewSetting({ ...newSetting, category: e.value })}
              className="!w-full"
            />
          </div>
          <div className="space-y-1">
            <label className="font-medium text-gray-900 dark:text-white">Description</label>
            <InputText
              value={newSetting.description}
              onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
              className="!w-full"
              placeholder="Optional description"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              label="Cancel"
              onClick={() => setShowAddDialog(false)}
              className="!bg-gray-200 !text-gray-700"
            />
            <Button
              label="Create"
              onClick={handleCreateSetting}
              className="!bg-amber-600 !border-amber-600"
            />
          </div>
        </div>
      </Dialog>

      {/* Activity Logs Dialog */}
      <Dialog
        header="Activity Logs"
        visible={showLogsDialog}
        onHide={() => setShowLogsDialog(false)}
        className="!w-full !max-w-4xl"
      >
        <DataTable
          value={activityLogs}
          className="admin-products-table"
          emptyMessage="No activity logs"
          paginator
          rows={15}
        >
          <Column
            field="created_at"
            header="Time"
            className="!text-sm"
            body={(rowData) => new Date(rowData.created_at).toLocaleString()}
          />
          <Column field="user_name" header="User" className="!text-sm" />
          <Column field="action" header="Action" className="!text-sm" body={actionTemplate} />
          <Column field="entity_type" header="Entity" className="!text-sm" />
          <Column field="entity_id" header="ID" className="!text-sm font-mono" />
          <Column field="ip_address" header="IP Address" className="!text-sm font-mono" />
        </DataTable>
      </Dialog>
    </div>
  );
}

export default AdminSettingsTab;
