'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Shield,
  AlertTriangle,
  Activity,
  Globe,
  Bot,
  Clock,
  TrendingUp,
  RefreshCw,
  Download,
  Eye,
  Ban,
  CheckCircle
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: 'rate_limit' | 'bot_detected' | 'country_blocked' | 'suspicious_activity';
  ip: string;
  country?: string;
  userAgent?: string;
  path: string;
  timestamp: number;
  details?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityMetrics {
  totalRequests: number;
  blockedRequests: number;
  suspiciousActivity: number;
  uniqueIPs: number;
  topCountries: { country: string; count: number }[];
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
}

const SecurityDashboard: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalRequests: 0,
    blockedRequests: 0,
    suspiciousActivity: 0,
    uniqueIPs: 0,
    topCountries: [],
    threatLevel: 'low'
  });
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchSecurityData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock events
        const mockEvents: SecurityEvent[] = [
          {
            id: '1',
            type: 'rate_limit',
            ip: '192.168.1.100',
            country: 'BD',
            userAgent: 'Mozilla/5.0...',
            path: '/api/products',
            timestamp: Date.now() - 300000,
            severity: 'medium'
          },
          {
            id: '2',
            type: 'bot_detected',
            ip: '10.0.0.50',
            country: 'US',
            userAgent: 'Bot/1.0',
            path: '/admin/dashboard',
            timestamp: Date.now() - 600000,
            severity: 'high',
            details: { botScore: 15, trustScore: 25 }
          },
          {
            id: '3',
            type: 'suspicious_activity',
            ip: '203.112.58.1',
            country: 'CN',
            userAgent: 'curl/7.68.0',
            path: '/admin/users',
            timestamp: Date.now() - 900000,
            severity: 'critical'
          }
        ];
        
        // Mock metrics
        const mockMetrics: SecurityMetrics = {
          totalRequests: 15420,
          blockedRequests: 234,
          suspiciousActivity: 45,
          uniqueIPs: 1250,
          topCountries: [
            { country: 'BD', count: 8500 },
            { country: 'IN', count: 2100 },
            { country: 'US', count: 1800 },
            { country: 'GB', count: 950 },
            { country: 'CA', count: 720 }
          ],
          threatLevel: 'medium'
        };
        
        setEvents(mockEvents);
        setMetrics(mockMetrics);
      } catch (error) {
        console.error('Failed to fetch security data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityData();

    // Auto-refresh every 30 seconds
    const interval = autoRefresh ? setInterval(fetchSecurityData, 30000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const exportSecurityReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      metrics,
      events: events.slice(0, 100) // Last 100 events
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading security data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your application's security</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'text-green-600' : 'text-gray-400'}`} />
            Auto Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportSecurityReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Threat Level Alert */}
      {metrics.threatLevel !== 'low' && (
        <Alert className={metrics.threatLevel === 'critical' ? 'border-red-500' : 'border-yellow-500'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Security Alert</AlertTitle>
          <AlertDescription>
            Current threat level is <strong className={getThreatLevelColor(metrics.threatLevel)}>{metrics.threatLevel.toUpperCase()}</strong>. 
            Enhanced monitoring is recommended.
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Requests</CardTitle>
            <Ban className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.blockedRequests}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics.blockedRequests / metrics.totalRequests) * 100).toFixed(2)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
            <Eye className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics.suspiciousActivity}</div>
            <p className="text-xs text-muted-foreground">Requires investigation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
            <Globe className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.uniqueIPs}</div>
            <p className="text-xs text-muted-foreground">Active visitors</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="countries">Geographic Analysis</TabsTrigger>
          <TabsTrigger value="cloudflare">Cloudflare Status</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>Latest security incidents and threats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {event.type === 'bot_detected' && <Bot className="h-5 w-5 text-red-600" />}
                        {event.type === 'rate_limit' && <Clock className="h-5 w-5 text-yellow-600" />}
                        {event.type === 'country_blocked' && <Globe className="h-5 w-5 text-orange-600" />}
                        {event.type === 'suspicious_activity' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                      </div>
                      <div>
                        <div className="font-medium">{event.type.replace('_', ' ').toUpperCase()}</div>
                        <div className="text-sm text-muted-foreground">
                          IP: {event.ip} | Country: {event.country || 'Unknown'} | Path: {event.path}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTimestamp(event.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSeverityColor(event.severity) as any}>
                        {event.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="countries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Countries by Traffic</CardTitle>
              <CardDescription>Geographic distribution of requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topCountries.map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{country.country}</div>
                        <div className="text-sm text-muted-foreground">
                          {((country.count / metrics.totalRequests) * 100).toFixed(1)}% of traffic
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{country.count.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">requests</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cloudflare" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cloudflare Integration Status</CardTitle>
              <CardDescription>Security features and configuration status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>SSL/TLS Encryption</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>DDoS Protection</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Bot Fight Mode</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rate Limiting</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>WAF Rules</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Security Headers</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>IP Geolocation</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Analytics</span>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;