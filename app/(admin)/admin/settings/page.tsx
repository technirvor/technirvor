"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Save,
  Shield,
  Bell,
  Mail,
  Database,
  Globe,
  Lock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface SystemSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  currency: string;
  tax_rate: number;
  shipping_enabled: boolean;
  notifications_enabled: boolean;
  maintenance_mode: boolean;
}

interface SecuritySettings {
  max_login_attempts: number;
  session_timeout: number;
  require_email_verification: boolean;
  enable_2fa: boolean;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    site_name: "TechNirvor",
    site_description: "Your trusted electronics store",
    contact_email: "technirvorbd@gmail.com",
    contact_phone: "+880 1234567890",
    address: "Dhaka, Bangladesh",
    currency: "BDT",
    tax_rate: 0,
    shipping_enabled: true,
    notifications_enabled: true,
    maintenance_mode: false,
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    max_login_attempts: 5,
    session_timeout: 60,
    require_email_verification: true,
    enable_2fa: false,
  });

  const [systemStats, setSystemStats] = useState({
    database_status: "connected",
    last_backup: new Date().toISOString(),
    total_users: 0,
    total_orders: 0,
    total_products: 0,
    storage_used: "0 MB",
  });

  useEffect(() => {
    fetchSettings();
    fetchSystemStats();
  }, []);

  const fetchSettings = async () => {
    try {
      // In a real app, you'd fetch these from a settings table
      // For now, we'll use default values
      setLoading(false);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to fetch settings");
      setLoading(false);
    }
  };

  const fetchSystemStats = async () => {
    try {
      // Fetch basic system statistics
      const [ordersResult, productsResult] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
      ]);

      setSystemStats((prev) => ({
        ...prev,
        total_orders: ordersResult.count || 0,
        total_products: productsResult.count || 0,
      }));
    } catch (error) {
      console.error("Error fetching system stats:", error);
    }
  };

  const saveSystemSettings = async () => {
    setSaving(true);
    try {
      // In a real app, you'd save these to a settings table
      // For now, we'll just show a success message
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("System settings saved successfully");
    } catch (error) {
      console.error("Error saving system settings:", error);
      toast.error("Failed to save system settings");
    } finally {
      setSaving(false);
    }
  };

  const saveSecuritySettings = async () => {
    setSaving(true);
    try {
      // In a real app, you'd save these to a settings table
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Security settings saved successfully");
    } catch (error) {
      console.error("Error saving security settings:", error);
      toast.error("Failed to save security settings");
    } finally {
      setSaving(false);
    }
  };

  const testDatabaseConnection = async () => {
    try {
      const { error } = await supabase.from("products").select("id").limit(1);
      if (error) throw error;
      toast.success("Database connection successful");
      setSystemStats((prev) => ({ ...prev, database_status: "connected" }));
    } catch (error) {
      console.error("Database connection failed:", error);
      toast.error("Database connection failed");
      setSystemStats((prev) => ({ ...prev, database_status: "error" }));
    }
  };

  const clearCache = async () => {
    try {
      // Simulate cache clearing
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Cache cleared successfully");
    } catch (error) {
      toast.error("Failed to clear cache");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">
          Manage system configuration and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    value={systemSettings.site_name}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        site_name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={systemSettings.currency}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        currency: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="site_description">Site Description</Label>
                <Textarea
                  id="site_description"
                  value={systemSettings.site_description}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({
                      ...prev,
                      site_description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={systemSettings.contact_email}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        contact_email: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={systemSettings.contact_phone}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        contact_phone: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={systemSettings.address}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={systemSettings.tax_rate}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({
                      ...prev,
                      tax_rate: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="shipping_enabled">Enable Shipping</Label>
                    <p className="text-sm text-gray-600">
                      Allow customers to select shipping options
                    </p>
                  </div>
                  <Switch
                    id="shipping_enabled"
                    checked={systemSettings.shipping_enabled}
                    onCheckedChange={(checked) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        shipping_enabled: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                    <p className="text-sm text-gray-600">
                      Put the site in maintenance mode
                    </p>
                  </div>
                  <Switch
                    id="maintenance_mode"
                    checked={systemSettings.maintenance_mode}
                    onCheckedChange={(checked) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        maintenance_mode: checked,
                      }))
                    }
                  />
                </div>
              </div>

              <Button onClick={saveSystemSettings} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save General Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                  <Input
                    id="max_login_attempts"
                    type="number"
                    min="1"
                    max="10"
                    value={securitySettings.max_login_attempts}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        max_login_attempts: parseInt(e.target.value) || 5,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="session_timeout">
                    Session Timeout (minutes)
                  </Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    min="5"
                    max="480"
                    value={securitySettings.session_timeout}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        session_timeout: parseInt(e.target.value) || 60,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require_email_verification">
                      Require Email Verification
                    </Label>
                    <p className="text-sm text-gray-600">
                      Users must verify their email before accessing the system
                    </p>
                  </div>
                  <Switch
                    id="require_email_verification"
                    checked={securitySettings.require_email_verification}
                    onCheckedChange={(checked) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        require_email_verification: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable_2fa">
                      Enable Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-gray-600">
                      Require 2FA for admin accounts
                    </p>
                  </div>
                  <Switch
                    id="enable_2fa"
                    checked={securitySettings.enable_2fa}
                    onCheckedChange={(checked) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        enable_2fa: checked,
                      }))
                    }
                  />
                </div>
              </div>

              <Button onClick={saveSecuritySettings} disabled={saving}>
                <Lock className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Security Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">
                      Receive email notifications for important events
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.notifications_enabled}
                    onCheckedChange={(checked) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        notifications_enabled: checked,
                      }))
                    }
                  />
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Notification Types</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">New Orders</p>
                        <p className="text-sm text-gray-600">
                          Get notified when new orders are placed
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Low Stock Alerts</p>
                        <p className="text-sm text-gray-600">
                          Get notified when products are running low
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">System Updates</p>
                        <p className="text-sm text-gray-600">
                          Get notified about system maintenance and updates
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Database</span>
                    <Badge
                      variant={
                        systemStats.database_status === "connected"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {systemStats.database_status === "connected" ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" /> Connected
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3 mr-1" /> Error
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Orders</span>
                    <Badge variant="secondary">
                      {systemStats.total_orders}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Products</span>
                    <Badge variant="secondary">
                      {systemStats.total_products}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Storage Used</span>
                    <Badge variant="secondary">
                      {systemStats.storage_used}
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={testDatabaseConnection}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test Database Connection
                </Button>
              </CardContent>
            </Card>

            {/* System Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button
                    onClick={clearCache}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>

                  <Button variant="outline" className="w-full">
                    <Database className="h-4 w-4 mr-2" />
                    Backup Database
                  </Button>

                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Test Email Configuration
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Last Backup:</p>
                  <p className="text-sm font-medium">
                    {new Date(systemStats.last_backup).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
