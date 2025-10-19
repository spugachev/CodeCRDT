import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target } from 'lucide-react';
import { Clock, UserPlus, ShoppingBag, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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
interface FunnelStage {
  stage: string;
  value: number;
  color: string;
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
interface ActivityEvent {
  id: string;
  type: 'user' | 'order' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

const mockActivityData: ActivityEvent[] = [
  { id: '1', type: 'user', message: 'New user registered: john.doe@example.com', timestamp: '2 minutes ago' },
  { id: '2', type: 'order', message: 'Order #1234 completed - $450.00', timestamp: '5 minutes ago' },
  { id: '3', type: 'success', message: 'Payment processed successfully', timestamp: '8 minutes ago' },
  { id: '4', type: 'user', message: 'User profile updated: jane.smith@example.com', timestamp: '12 minutes ago' },
  { id: '5', type: 'warning', message: 'Low stock alert: Premium Plan', timestamp: '15 minutes ago' },
  { id: '6', type: 'order', message: 'Order #1233 placed - $280.00', timestamp: '18 minutes ago' },
  { id: '7', type: 'success', message: 'Database backup completed', timestamp: '25 minutes ago' },
  { id: '8', type: 'error', message: 'Failed login attempt detected', timestamp: '30 minutes ago' },
  { id: '9', type: 'user', message: 'New user registered: alice.wonder@example.com', timestamp: '35 minutes ago' },
  { id: '10', type: 'order', message: 'Order #1232 shipped', timestamp: '42 minutes ago' }
];
const mockFunnelData: FunnelStage[] = [
  { stage: 'Visitors', value: 10000, color: '#3b82f6' },
  { stage: 'Sign Ups', value: 6500, color: '#8b5cf6' },
  { stage: 'Active Users', value: 4200, color: '#ec4899' },
  { stage: 'Paying Customers', value: 2350, color: '#f59e0b' },
  { stage: 'Retained', value: 1890, color: '#10b981' }
];
const mockTrafficData = [
  { name: 'Organic Search', value: 4200, color: '#3b82f6' },
  { name: 'Direct', value: 2800, color: '#10b981' },
  { name: 'Social Media', value: 1900, color: '#f59e0b' },
  { name: 'Referral', value: 1200, color: '#8b5cf6' },
  { name: 'Email', value: 850, color: '#ec4899' }
];

export default function AnalyticsDashboard() {
  type SortField = 'product' | 'sales' | 'revenue' | 'status';
  type SortDirection = 'asc' | 'desc' | null;
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>(mockMetrics);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(mockChartData);
  const [tableData, setTableData] = useState<TableRow[]>(mockTableData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  const sortedTableData = useCallback(() => {
    if (!sortField || !sortDirection) return tableData;

    return [...tableData].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tableData, sortField, sortDirection]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
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

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4" />;
  };
  const [hoveredUserPoint, setHoveredUserPoint] = useState<number | null>(null);

  const getMaxOrders = useCallback(() => {
    return Math.max(...chartData.map(d => d.orders));
  }, [chartData]);
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
          {metrics.map((metric, index) => {
            const Icon = metric.label.includes('Revenue') ? DollarSign :
                        metric.label.includes('Users') ? Users :
                        metric.label.includes('Orders') ? ShoppingCart :
                        Target;
            
            const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
            const trendColor = metric.trend === 'up' ? 'text-green-500' : 'text-red-500';
            const trendBgColor = metric.trend === 'up' 
              ? (isDarkMode ? 'bg-green-500/10' : 'bg-green-50')
              : (isDarkMode ? 'bg-red-500/10' : 'bg-red-50');

            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} hover:shadow-lg transition-shadow duration-300`}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {metric.label}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <Icon className={`h-4 w-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {metric.label.includes('Revenue') ? `$${metric.value.toLocaleString()}` : 
                       metric.label.includes('Rate') ? `${metric.value}%` :
                       metric.value.toLocaleString()}
                    </div>
                    <div className="flex items-center mt-2">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${trendBgColor}`}>
                        <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                        <span className={`text-xs font-medium ${trendColor}`}>
                          {Math.abs(metric.change)}%
                        </span>
                      </div>
                      <span className={`text-xs ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        vs last period
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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
              <div className="w-full h-[300px] md:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
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
                        borderRadius: '8px',
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
                      activeDot={{ r: 6, fill: '#2563eb' }}
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
              <div className="relative h-64 w-full">
                <svg className="w-full h-full" viewBox="0 0 700 256" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="userGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={isDarkMode ? "#3b82f6" : "#60a5fa"} stopOpacity="0.5" />
                      <stop offset="100%" stopColor={isDarkMode ? "#3b82f6" : "#60a5fa"} stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area path */}
                  <motion.path
                    d={`M 0,${256 - (chartData[0].users / 800) * 256} 
                        L ${100},${256 - (chartData[1].users / 800) * 256}
                        L ${200},${256 - (chartData[2].users / 800) * 256}
                        L ${300},${256 - (chartData[3].users / 800) * 256}
                        L ${400},${256 - (chartData[4].users / 800) * 256}
                        L ${500},${256 - (chartData[5].users / 800) * 256}
                        L ${600},${256 - (chartData[6].users / 800) * 256}
                        L 600,256 L 0,256 Z`}
                    fill="url(#userGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                  
                  {/* Line path */}
                  <motion.path
                    d={`M 0,${256 - (chartData[0].users / 800) * 256} 
                        L ${100},${256 - (chartData[1].users / 800) * 256}
                        L ${200},${256 - (chartData[2].users / 800) * 256}
                        L ${300},${256 - (chartData[3].users / 800) * 256}
                        L ${400},${256 - (chartData[4].users / 800) * 256}
                        L ${500},${256 - (chartData[5].users / 800) * 256}
                        L ${600},${256 - (chartData[6].users / 800) * 256}`}
                    fill="none"
                    stroke={isDarkMode ? "#3b82f6" : "#2563eb"}
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />
                  
                  {/* Data points */}
                  {chartData.map((point, index) => (
                    <g key={index}>
                      <motion.circle
                        cx={index * 100}
                        cy={256 - (point.users / 800) * 256}
                        r={hoveredUserPoint === index ? 6 : 4}
                        fill={isDarkMode ? "#3b82f6" : "#2563eb"}
                        stroke={isDarkMode ? "#1e293b" : "#ffffff"}
                        strokeWidth="2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        onMouseEnter={() => setHoveredUserPoint(index)}
                        onMouseLeave={() => setHoveredUserPoint(null)}
                        className="cursor-pointer transition-all duration-200"
                        style={{ pointerEvents: 'all' }}
                      />
                      
                      {/* Tooltip */}
                      {hoveredUserPoint === index && (
                        <g>
                          <motion.rect
                            x={index * 100 - 40}
                            y={256 - (point.users / 800) * 256 - 50}
                            width="80"
                            height="40"
                            rx="6"
                            fill={isDarkMode ? "#1e293b" : "#ffffff"}
                            stroke={isDarkMode ? "#3b82f6" : "#2563eb"}
                            strokeWidth="2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          />
                          <motion.text
                            x={index * 100}
                            y={256 - (point.users / 800) * 256 - 35}
                            textAnchor="middle"
                            fill={isDarkMode ? "#ffffff" : "#1e293b"}
                            fontSize="12"
                            fontWeight="600"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.2 }}
                          >
                            {point.users} users
                          </motion.text>
                          <motion.text
                            x={index * 100}
                            y={256 - (point.users / 800) * 256 - 20}
                            textAnchor="middle"
                            fill={isDarkMode ? "#9ca3af" : "#6b7280"}
                            fontSize="10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.2 }}
                          >
                            {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </motion.text>
                        </g>
                      )}
                    </g>
                  ))}
                </svg>
                
                {/* X-axis labels */}
                <div className="flex justify-between mt-2 px-2">
                  {chartData.map((point, index) => (
                    <span
                      key={index}
                      className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
              <div className="space-y-4">
                {chartData.map((dataPoint, index) => {
                  const maxOrders = getMaxOrders();
                  const percentage = (dataPoint.orders / maxOrders) * 100;
                  const barColor = percentage > 75 ? 'bg-green-500' : percentage > 50 ? 'bg-blue-500' : percentage > 25 ? 'bg-yellow-500' : 'bg-red-500';
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {new Date(dataPoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {dataPoint.orders}
                        </span>
                      </div>
                      <div className={`w-full h-8 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className={`h-full ${barColor} transition-all duration-500 ease-out flex items-center justify-end pr-3`}
                          style={{ width: `${percentage}%` }}
                        >
                          {percentage > 20 && (
                            <BarChart3 className="h-4 w-4 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="date" 
                    stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                    tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
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
                  <TableRow className={isDarkMode ? 'border-gray-700 hover:bg-gray-750' : ''}>
                    <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('product')}
                        className={`-ml-4 h-auto p-2 font-semibold ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : ''}`}
                      >
                        Product
                        {getSortIcon('product')}
                      </Button>
                    </TableHead>
                    <TableHead className={`text-right ${isDarkMode ? 'text-gray-300' : ''}`}>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('sales')}
                        className={`-mr-4 ml-auto h-auto p-2 font-semibold ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : ''}`}
                      >
                        Sales
                        {getSortIcon('sales')}
                      </Button>
                    </TableHead>
                    <TableHead className={`text-right ${isDarkMode ? 'text-gray-300' : ''}`}>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('revenue')}
                        className={`-mr-4 ml-auto h-auto p-2 font-semibold ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : ''}`}
                      >
                        Revenue
                        {getSortIcon('revenue')}
                      </Button>
                    </TableHead>
                    <TableHead className={`text-right ${isDarkMode ? 'text-gray-300' : ''}`}>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('status')}
                        className={`-mr-4 ml-auto h-auto p-2 font-semibold ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : ''}`}
                      >
                        Status
                        {getSortIcon('status')}
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTableData().map((row) => (
                    <TableRow
                      key={row.id}
                      className={isDarkMode ? 'border-gray-700 hover:bg-gray-750' : ''}
                    >
                      <TableCell className={`font-medium ${isDarkMode ? 'text-gray-200' : ''}`}>
                        {row.product}
                      </TableCell>
                      <TableCell className={`text-right ${isDarkMode ? 'text-gray-300' : ''}`}>
                        {formatNumber(row.sales)}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${isDarkMode ? 'text-gray-200' : ''}`}>
                        {formatCurrency(row.revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={getStatusBadgeVariant(row.status)}
                          className={`capitalize ${
                            row.status === 'active'
                              ? isDarkMode
                                ? 'bg-green-900 text-green-200 border-green-700'
                                : 'bg-green-100 text-green-800 border-green-300'
                              : row.status === 'pending'
                              ? isDarkMode
                                ? 'bg-yellow-900 text-yellow-200 border-yellow-700'
                                : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                              : isDarkMode
                              ? 'bg-gray-700 text-gray-300 border-gray-600'
                              : 'bg-gray-100 text-gray-600 border-gray-300'
                          }`}
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Conversion Funnel</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                User journey and drop-off rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockFunnelData.map((stage, index) => {
                  const percentage = index === 0 
                    ? 100 
                    : ((stage.value / mockFunnelData[0].value) * 100).toFixed(1);
                  const dropOffRate = index > 0 
                    ? (((mockFunnelData[index - 1].value - stage.value) / mockFunnelData[index - 1].value) * 100).toFixed(1)
                    : null;
                  const widthPercentage = (stage.value / mockFunnelData[0].value) * 100;

                  return (
                    <div key={stage.stage} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            {stage.stage}
                          </span>
                          {dropOffRate && (
                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              (-{dropOffRate}%)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {stage.value.toLocaleString()}
                          </span>
                          <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div className={`h-12 rounded-lg transition-all duration-300 hover:opacity-80 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className="h-full rounded-lg flex items-center justify-center text-white text-sm font-medium transition-all duration-500"
                          style={{
                            width: `${widthPercentage}%`,
                            backgroundColor: stage.color,
                            boxShadow: `0 4px 6px -1px ${stage.color}40`
                          }}
                        >
                          {widthPercentage > 30 && (
                            <span className="px-2">{percentage}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Overall Conversion Rate
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {((mockFunnelData[mockFunnelData.length - 1].value / mockFunnelData[0].value) * 100).toFixed(1)}%
                      </span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Traffic Sources</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Visitor sources breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockTrafficData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {mockTrafficData.map((entry, index) => (
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
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {mockTrafficData.map((source) => {
                  const total = mockTrafficData.reduce((sum, item) => sum + item.value, 0);
                  const percentage = ((source.value / total) * 100).toFixed(1);
                  return (
                    <div key={source.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: source.color }}
                        />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {source.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {percentage}%
                        </span>
                        <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {source.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Recent Activity</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Latest system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                {mockActivityData.map((event, index) => {
                  const getEventIcon = () => {
                    switch (event.type) {
                      case 'user':
                        return <UserPlus className="h-4 w-4 text-blue-500" />;
                      case 'order':
                        return <ShoppingBag className="h-4 w-4 text-green-500" />;
                      case 'success':
                        return <CheckCircle className="h-4 w-4 text-green-500" />;
                      case 'warning':
                        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
                      case 'error':
                        return <XCircle className="h-4 w-4 text-red-500" />;
                      default:
                        return <Clock className="h-4 w-4 text-gray-500" />;
                    }
                  };

                  const getEventBgColor = () => {
                    if (isDarkMode) {
                      return 'bg-gray-700/50 hover:bg-gray-700';
                    }
                    return 'bg-gray-50 hover:bg-gray-100';
                  };

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${getEventBgColor()}`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getEventIcon()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {event.message}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock className={`h-3 w-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            {event.timestamp}
                          </span>
                        </div>
                      </div>
                    </motion.div>
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