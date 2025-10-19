import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, ShoppingCart, UserPlus, DollarSign, Package } from 'lucide-react';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target } from 'lucide-react';
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
interface Alert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
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
  { date: '2024-01-06', revenue: 20000, users: 680, orders: 350 },
  { date: '2024-01-07', revenue: 22000, users: 720, orders: 380 }
];

const mockTableData: TableRow[] = [
  { id: '1', product: 'Premium Plan', sales: 234, revenue: 23400, status: 'active' },
  { id: '2', product: 'Basic Plan', sales: 567, revenue: 11340, status: 'active' },
  { id: '3', product: 'Enterprise Plan', sales: 89, revenue: 44500, status: 'active' },
  { id: '4', product: 'Starter Plan', sales: 432, revenue: 4320, status: 'pending' },
  { id: '5', product: 'Pro Plan', sales: 156, revenue: 15600, status: 'inactive' }
];
const mockAlerts: Alert[] = [
  { id: '1', message: 'System backup completed successfully', severity: 'success', timestamp: '2 min ago' },
  { id: '2', message: 'High CPU usage detected on server 3', severity: 'warning', timestamp: '15 min ago' },
  { id: '3', message: 'Failed login attempt from unknown IP', severity: 'error', timestamp: '1 hour ago' },
  { id: '4', message: 'New user registration milestone reached', severity: 'info', timestamp: '2 hours ago' },
  { id: '5', message: 'Database connection timeout', severity: 'error', timestamp: '3 hours ago' }
];

const mockQuickStats = [
  { id: '1', label: 'Goal Completion', value: 78, target: 100, icon: Target, color: 'text-blue-500' },
  { id: '2', label: 'Customer Satisfaction', value: 92, target: 100, icon: Users, color: 'text-green-500' },
  { id: '3', label: 'Sales Target', value: 65, target: 100, icon: DollarSign, color: 'text-purple-500' },
  { id: '4', label: 'Order Fulfillment', value: 88, target: 100, icon: ShoppingCart, color: 'text-orange-500' }
];
interface ActivityItem {
  id: string;
  type: 'sale' | 'user' | 'revenue' | 'order';
  message: string;
  timestamp: string;
  icon: 'cart' | 'user' | 'dollar' | 'package';
}

const mockActivityData: ActivityItem[] = [
  { id: '1', type: 'sale', message: 'New sale: Premium Plan', timestamp: '2 minutes ago', icon: 'cart' },
  { id: '2', type: 'user', message: 'New user registered', timestamp: '5 minutes ago', icon: 'user' },
  { id: '3', type: 'revenue', message: 'Revenue milestone reached', timestamp: '12 minutes ago', icon: 'dollar' },
  { id: '4', type: 'order', message: 'Order #1234 completed', timestamp: '18 minutes ago', icon: 'package' },
  { id: '5', type: 'sale', message: 'New sale: Enterprise Plan', timestamp: '25 minutes ago', icon: 'cart' },
  { id: '6', type: 'user', message: '5 new users registered', timestamp: '32 minutes ago', icon: 'user' },
  { id: '7', type: 'order', message: 'Order #1233 completed', timestamp: '45 minutes ago', icon: 'package' },
  { id: '8', type: 'revenue', message: 'Daily revenue updated', timestamp: '1 hour ago', icon: 'dollar' }
];
const mockPieData = [
  { name: 'Premium Plan', value: 23400, color: '#3b82f6' },
  { name: 'Basic Plan', value: 11340, color: '#10b981' },
  { name: 'Enterprise Plan', value: 44500, color: '#8b5cf6' },
  { name: 'Starter Plan', value: 4320, color: '#f59e0b' },
  { name: 'Pro Plan', value: 15600, color: '#ef4444' }
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium" style={{ color: entry.color }}>
              {entry.dataKey.charAt(0).toUpperCase() + entry.dataKey.slice(1)}:
            </span>{' '}
            ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const UserChartComponent = ({ data, isDarkMode }: { data: ChartDataPoint[], isDarkMode: boolean }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {new Date(payload[0].payload.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            Users: {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDarkMode ? '#374151' : '#e5e7eb'}
            vertical={false}
          />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
            style={{ fontSize: '12px' }}
            tickLine={false}
          />
          <YAxis 
            stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
            style={{ fontSize: '12px' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="users" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fill="url(#userGradient)"
            animationDuration={1000}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

const getStatusBadgeVariant = (status: TableRow['status']) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'inactive':
      return 'outline';
    default:
      return 'default';
  }
};

const getStatusColor = (status: TableRow['status'], isDark: boolean) => {
  switch (status) {
    case 'active':
      return isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800';
    case 'pending':
      return isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
    case 'inactive':
      return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    default:
      return '';
  }
};

export default function AnalyticsDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>(mockMetrics);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(mockChartData);
  const [tableData, setTableData] = useState<TableRow[]>(mockTableData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortColumn, setSortColumn] = useState<keyof TableRow>('revenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const handleSort = useCallback((column: keyof TableRow) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  }, [sortColumn]);

  const sortedData = useCallback(() => {
    const sorted = [...tableData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
    
    return sorted;
  }, [tableData, sortColumn, sortDirection]);

  const paginatedData = useCallback(() => {
    const sorted = sortedData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sorted.slice(startIndex, endIndex);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  }, [totalPages]);
</parameter>
</invoke>

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);

    
    setTimeout(() => {
      // Generate updated mock metrics with random variations
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
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Analytics Dashboard
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Real-time insights and performance metrics
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleDarkMode}
              className={isDarkMode ? 'border-gray-700' : ''}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={isDarkMode ? 'border-gray-700' : ''}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {metrics.map((metric, index) => {
            const Icon = metric.id === '1' ? DollarSign : 
                        metric.id === '2' ? Users : 
                        metric.id === '3' ? ShoppingCart : Target;
            
            return (
              <Card 
                key={metric.id} 
                className={`transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
                }`}
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {metric.label}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {metric.id === '1' || metric.id === '4' 
                      ? metric.id === '1' 
                        ? `$${metric.value.toLocaleString()}` 
                        : `${metric.value}%`
                      : metric.value.toLocaleString()
                    }
                  </div>
                  <div className="flex items-center mt-2">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                    <span className={`text-sm ml-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      vs last period
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}</parameter>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Revenue Overview</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Daily revenue trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px] md:h-[350px]">
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
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis 
                      stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
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
                Active users over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserChartComponent data={chartData} isDarkMode={isDarkMode} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          <Card className={`lg:col-span-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Performance Metrics</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Combined view of key metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
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
                      borderRadius: '6px',
                      color: isDarkMode ? '#ffffff' : '#000000'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  />
                  <Legend 
                    wrapperStyle={{
                      color: isDarkMode ? '#9ca3af' : '#6b7280'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Revenue ($)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Users"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Distribution</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Sales by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {mockPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                        borderRadius: '6px',
                        color: isDarkMode ? '#ffffff' : '#000000'
                      }}
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{
                        color: isDarkMode ? '#9ca3af' : '#6b7280'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : ''}>Top Products</CardTitle>
            <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
              Best performing products by revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* TODO:DataTable Render sortable table with product data, status badges, and pagination */}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {mockActivityData.map((activity) => {
                  const IconComponent = 
                    activity.icon === 'cart' ? ShoppingCart :
                    activity.icon === 'user' ? UserPlus :
                    activity.icon === 'dollar' ? DollarSign :
                    Package;
                  
                  const iconColor = 
                    activity.type === 'sale' ? 'text-blue-500' :
                    activity.type === 'user' ? 'text-green-500' :
                    activity.type === 'revenue' ? 'text-purple-500' :
                    'text-orange-500';
                  
                  const bgColor = 
                    activity.type === 'sale' ? (isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50') :
                    activity.type === 'user' ? (isDarkMode ? 'bg-green-500/10' : 'bg-green-50') :
                    activity.type === 'revenue' ? (isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50') :
                    (isDarkMode ? 'bg-orange-500/10' : 'bg-orange-50');

                  return (
                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0 border-gray-200 dark:border-gray-700">
                      <div className={`p-2 rounded-lg ${bgColor}`}>
                        <IconComponent className={`h-4 w-4 ${iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {activity.message}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {activity.timestamp}
                        </p>
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
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockQuickStats.map((stat) => {
                  const Icon = stat.icon;
                  const percentage = (stat.value / stat.target) * 100;
                  
                  return (
                    <div key={stat.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${stat.color}`} />
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {stat.label}
                          </span>
                        </div>
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {stat.value}%
                        </span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className={`h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                          Target: {stat.target}%
                        </span>
                        {percentage >= 75 ? (
                          <span className="flex items-center gap-1 text-green-500">
                            <TrendingUp className="h-3 w-3" />
                            On track
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-orange-500">
                            <TrendingDown className="h-3 w-3" />
                            Needs attention
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {mockAlerts.map((alert) => {
                  const severityConfig = {
                    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800' },
                    warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-800' },
                    error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800' },
                    success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800' }
                  };

                  const config = severityConfig[alert.severity];
                  const Icon = config.icon;

                  return (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${config.bg} ${config.border}`}
                    >
                      <Icon className={`h-5 w-5 ${config.color} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {alert.message}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {alert.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}