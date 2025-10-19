import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target } from 'lucide-react';
import { Activity, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target } from 'lucide-react';

interface MetricData {
  id: string;
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
}

interface ChartDataPoint {
  date: string;
  revenue: number;
  users: number;
  orders: number;
}

interface TableRow {
  id: string;
  product: string;
  sales: number;
  revenue: number;
  status: 'active' | 'pending' | 'inactive';
}

const mockMetrics: MetricData[] = [
  { id: '1', label: 'Total Revenue', value: 45231, change: 12.5, trend: 'up' },
  { id: '2', label: 'Active Users', value: 2350, change: 8.2, trend: 'up' },
  { id: '3', label: 'Total Orders', value: 1543, change: -3.1, trend: 'down' },
  { id: '4', label: 'Conversion Rate', value: 3.24, change: 5.7, trend: 'up' }
];

const mockChartData: ChartDataPoint[] = [
  { date: '2024-01-01', revenue: 12000, users: 450, orders: 230 },
  { date: '2024-01-02', revenue: 15000, users: 520, orders: 280 },
  { date: '2024-01-03', revenue: 13500, users: 490, orders: 250 },
  { date: '2024-01-04', revenue: 18000, users: 610, orders: 320 },
  { date: '2024-01-05', revenue: 16500, users: 580, orders: 295 },
  { date: '2024-01-06', revenue: 20000, users: 680, orders: 360 },
  { date: '2024-01-07', revenue: 22000, users: 720, orders: 390 }
];

const mockTableData: TableRow[] = [
  { id: '1', product: 'Premium Plan', sales: 234, revenue: 23400, status: 'active' },
  { id: '2', product: 'Basic Plan', sales: 567, revenue: 11340, status: 'active' },
  { id: '3', product: 'Enterprise Plan', sales: 89, revenue: 17800, status: 'active' },
  { id: '4', product: 'Starter Plan', sales: 432, revenue: 4320, status: 'pending' },
  { id: '5', product: 'Pro Plan', sales: 156, revenue: 15600, status: 'inactive' }
];
interface ActivityItem {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
  timestamp: string;
  icon: 'trending-up' | 'trending-down' | 'alert' | 'check' | 'activity';
}

const mockActivityData: ActivityItem[] = [
  { id: '1', type: 'success', message: 'New order received - Premium Plan', timestamp: '2 minutes ago', icon: 'check' },
  { id: '2', type: 'info', message: '15 new users registered', timestamp: '5 minutes ago', icon: 'activity' },
  { id: '3', type: 'success', message: 'Revenue milestone reached: $50,000', timestamp: '12 minutes ago', icon: 'trending-up' },
  { id: '4', type: 'warning', message: 'Server response time increased', timestamp: '18 minutes ago', icon: 'alert' },
  { id: '5', type: 'info', message: 'Database backup completed', timestamp: '25 minutes ago', icon: 'check' },
  { id: '6', type: 'success', message: 'Conversion rate improved by 3.2%', timestamp: '32 minutes ago', icon: 'trending-up' },
  { id: '7', type: 'error', message: 'Payment gateway timeout detected', timestamp: '45 minutes ago', icon: 'alert' },
  { id: '8', type: 'info', message: 'Weekly report generated', timestamp: '1 hour ago', icon: 'activity' },
  { id: '9', type: 'success', message: '50 orders processed successfully', timestamp: '1 hour ago', icon: 'check' },
  { id: '10', type: 'warning', message: 'Low inventory alert - Starter Plan', timestamp: '2 hours ago', icon: 'alert' }
];

type SortField = 'product' | 'sales' | 'revenue' | 'status';
type SortDirection = 'asc' | 'desc' | null;

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

const getStatusColor = (status: 'active' | 'pending' | 'inactive'): string => {
  switch (status) {
    case 'active':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'inactive':
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

export default function AnalyticsDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>(mockMetrics);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(mockChartData);
  const [tableData, setTableData] = useState<TableRow[]>(mockTableData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  const sortedTableData = useCallback(() => {
    if (!sortField || !sortDirection) {
      return tableData;
    }

    return [...tableData].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [tableData, sortField, sortDirection]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    
    setTimeout(() => {
      // Generate updated metrics with random variations
      const updatedMetrics = mockMetrics.map(metric => ({
        ...metric,
        value: metric.value + Math.floor(Math.random() * 200 - 100),
        change: parseFloat((Math.random() * 20 - 5).toFixed(1)),
        trend: Math.random() > 0.5 ? 'up' as const : 'down' as const
      }));
      
      // Generate updated chart data with random variations
      const updatedChartData = mockChartData.map(point => ({
        ...point,
        revenue: point.revenue + Math.floor(Math.random() * 4000 - 2000),
        users: point.users + Math.floor(Math.random() * 100 - 50),
        orders: point.orders + Math.floor(Math.random() * 50 - 25)
      }));
      
      // Generate updated table data with random variations
      const updatedTableData = mockTableData.map(row => ({
        ...row,
        sales: row.sales + Math.floor(Math.random() * 40 - 20),
        revenue: row.revenue + Math.floor(Math.random() * 2000 - 1000)
      }));
      
      setMetrics(updatedMetrics);
      setChartData(updatedChartData);
      setTableData(updatedTableData);
      setIsRefreshing(false);
    }, 1500);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Analytics Dashboard
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Real-time insights and performance metrics
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleDarkMode}
              className={isDarkMode ? 'border-gray-700 hover:bg-gray-800' : ''}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={isDarkMode ? 'border-gray-700 hover:bg-gray-800' : ''}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {metrics.map((metric) => {
            const Icon = metric.label.includes('Revenue') ? DollarSign :
                        metric.label.includes('Users') ? Users :
                        metric.label.includes('Orders') ? ShoppingCart : Target;
            
            return (
              <Card key={metric.id} className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {metric.label}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {metric.label.includes('Rate') ? `${metric.value}%` : metric.value.toLocaleString()}
                  </div>
                  <div className="flex items-center mt-2">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                    <span className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      vs last period
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Revenue Overview</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Daily revenue trends for the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                    />
                    <XAxis 
                      dataKey="date" 
                      stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                      fontSize={12}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '6px',
                        color: isDarkMode ? '#ffffff' : '#000000'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>User Activity</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Active users and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full relative">
                <svg className="w-full h-full" viewBox="0 0 700 300" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="userGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area path */}
                  <motion.path
                    d={`M 0,${300 - (chartData[0].users / 720) * 250} 
                        L ${100},${300 - (chartData[1].users / 720) * 250}
                        L ${200},${300 - (chartData[2].users / 720) * 250}
                        L ${300},${300 - (chartData[3].users / 720) * 250}
                        L ${400},${300 - (chartData[4].users / 720) * 250}
                        L ${500},${300 - (chartData[5].users / 720) * 250}
                        L ${600},${300 - (chartData[6].users / 720) * 250}
                        L 600,300 L 0,300 Z`}
                    fill="url(#userGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                  
                  {/* Line path */}
                  <motion.path
                    d={`M 0,${300 - (chartData[0].users / 720) * 250} 
                        L ${100},${300 - (chartData[1].users / 720) * 250}
                        L ${200},${300 - (chartData[2].users / 720) * 250}
                        L ${300},${300 - (chartData[3].users / 720) * 250}
                        L ${400},${300 - (chartData[4].users / 720) * 250}
                        L ${500},${300 - (chartData[5].users / 720) * 250}
                        L ${600},${300 - (chartData[6].users / 720) * 250}`}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  
                  {/* Data points */}
                  {chartData.map((point, index) => (
                    <motion.g
                      key={point.date}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index, duration: 0.3 }}
                    >
                      <circle
                        cx={index * 100}
                        cy={300 - (point.users / 720) * 250}
                        r="6"
                        fill="#3b82f6"
                        className="cursor-pointer transition-all hover:r-8"
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))' }}
                      />
                      <circle
                        cx={index * 100}
                        cy={300 - (point.users / 720) * 250}
                        r="12"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={(e) => {
                          const tooltip = document.getElementById(`tooltip-${index}`);
                          if (tooltip) tooltip.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                          const tooltip = document.getElementById(`tooltip-${index}`);
                          if (tooltip) tooltip.style.opacity = '0';
                        }}
                      />
                    </motion.g>
                  ))}
                </svg>
                
                {/* Tooltips */}
                {chartData.map((point, index) => (
                  <div
                    key={`tooltip-${point.date}`}
                    id={`tooltip-${index}`}
                    className={`absolute pointer-events-none transition-opacity duration-200 opacity-0 ${
                      isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                    } px-3 py-2 rounded-lg shadow-lg border ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}
                    style={{
                      left: `${(index * 100 / 600) * 100}%`,
                      top: `${((300 - (point.users / 720) * 250) / 300) * 100 - 15}%`,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <div className="text-xs font-semibold">{point.users} Users</div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))}
                
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>720</span>
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>540</span>
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>360</span>
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>180</span>
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>0</span>
                </div>
                
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs mt-2 px-8">
                  {chartData.map((point, index) => (
                    <span key={point.date} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                      {new Date(point.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Orders Distribution</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Order volume by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis 
                      dataKey="date" 
                      stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        color: isDarkMode ? '#ffffff' : '#000000'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    />
                    <Bar 
                      dataKey="orders" 
                      fill="#8b5cf6" 
                      radius={[8, 8, 0, 0]}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className={`lg:col-span-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Performance Comparison</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Multi-metric comparison over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                    />
                    <XAxis 
                      dataKey="date" 
                      stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        color: isDarkMode ? '#ffffff' : '#000000'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      formatter={(value: number, name: string) => {
                        if (name === 'revenue') return [`$${value.toLocaleString()}`, 'Revenue'];
                        if (name === 'users') return [value.toLocaleString(), 'Users'];
                        if (name === 'orders') return [value.toLocaleString(), 'Orders'];
                        return [value, name];
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                      formatter={(value) => {
                        if (value === 'revenue') return 'Revenue';
                        if (value === 'users') return 'Users';
                        if (value === 'orders') return 'Orders';
                        return value;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={{ fill: '#f59e0b', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : ''}>Top Products</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
              Best performing products by sales and revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className={isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : ''}>
                    <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('product')}
                        className={`flex items-center gap-1 px-0 hover:bg-transparent ${isDarkMode ? 'text-gray-300 hover:text-white' : ''}`}
                      >
                        Product
                        {sortField === 'product' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('sales')}
                        className={`flex items-center gap-1 px-0 hover:bg-transparent ${isDarkMode ? 'text-gray-300 hover:text-white' : ''}`}
                      >
                        Sales
                        {sortField === 'sales' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('revenue')}
                        className={`flex items-center gap-1 px-0 hover:bg-transparent ${isDarkMode ? 'text-gray-300 hover:text-white' : ''}`}
                      >
                        Revenue
                        {sortField === 'revenue' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('status')}
                        className={`flex items-center gap-1 px-0 hover:bg-transparent ${isDarkMode ? 'text-gray-300 hover:text-white' : ''}`}
                      >
                        Status
                        {sortField === 'status' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTableData().map((row) => (
                    <TableRow 
                      key={row.id}
                      className={isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'hover:bg-gray-50'}
                    >
                      <TableCell className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>
                        {row.product}
                      </TableCell>
                      <TableCell className={isDarkMode ? 'text-gray-300' : ''}>
                        {formatNumber(row.sales)}
                      </TableCell>
                      <TableCell className={`font-semibold ${isDarkMode ? 'text-gray-300' : ''}`}>
                        {formatCurrency(row.revenue)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(row.status)}
                        >
                          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Real-Time Updates</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Live activity feed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {mockActivityData.map((activity) => {
                  const getIcon = () => {
                    switch (activity.icon) {
                      case 'trending-up':
                        return <TrendingUp className="h-4 w-4" />;
                      case 'trending-down':
                        return <TrendingDown className="h-4 w-4" />;
                      case 'alert':
                        return <AlertCircle className="h-4 w-4" />;
                      case 'check':
                        return <CheckCircle className="h-4 w-4" />;
                      case 'activity':
                        return <Activity className="h-4 w-4" />;
                      default:
                        return <Activity className="h-4 w-4" />;
                    }
                  };

                  const getStatusColor = () => {
                    switch (activity.type) {
                      case 'success':
                        return isDarkMode ? 'text-green-400 bg-green-400/10' : 'text-green-600 bg-green-50';
                      case 'warning':
                        return isDarkMode ? 'text-yellow-400 bg-yellow-400/10' : 'text-yellow-600 bg-yellow-50';
                      case 'error':
                        return isDarkMode ? 'text-red-400 bg-red-400/10' : 'text-red-600 bg-red-50';
                      case 'info':
                        return isDarkMode ? 'text-blue-400 bg-blue-400/10' : 'text-blue-600 bg-blue-50';
                      default:
                        return isDarkMode ? 'text-gray-400 bg-gray-400/10' : 'text-gray-600 bg-gray-50';
                    }
                  };

                  const getBadgeVariant = () => {
                    switch (activity.type) {
                      case 'success':
                        return 'default';
                      case 'warning':
                        return 'secondary';
                      case 'error':
                        return 'destructive';
                      case 'info':
                        return 'outline';
                      default:
                        return 'outline';
                    }
                  };

                  return (
                    <div
                      key={activity.id}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${getStatusColor()}`}>
                        {getIcon()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {activity.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className={`h-3 w-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            {activity.timestamp}
                          </span>
                          <Badge variant={getBadgeVariant()} className="text-xs">
                            {activity.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Quick Stats</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Key performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                      <DollarSign className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs font-medium text-green-500">+12.5%</span>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    $45.2K
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Revenue
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                      <Users className={`h-4 w-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs font-medium text-green-500">+8.2%</span>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    2,350
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Active Users
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
                      <ShoppingCart className={`h-4 w-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingDown className="h-3 w-3 text-red-500" />
                      <span className="text-xs font-medium text-red-500">-3.1%</span>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    1,543
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Orders
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                      <Target className={`h-4 w-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs font-medium text-green-500">+5.7%</span>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    3.24%
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Conversion Rate
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}