s */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}import { useState, useCallback } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw } from 'lucide-react';

import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { ShoppingCart, Target, Activity, Zap } from 'lucide-react';
import { motion } from 'framer-motion';


import { TrendingUp, TrendingDown, DollarSign, Users, hoppingCart, Target } from 'lucide-react';
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
interface QuickStatData {
  id: string;
  label: string;
  value: string;
  change: number;
  sparklineData: { value: number }[];
  icon: 'revenue' | 'users' | 'orders' | 'conversion';
}

const mockQuickStats: QuickStatData[] = [
  {
    id: '1',
    label: 'Revenue',
    value: '$45.2K',
    change: 12.5,
    sparklineData: [
      { value: 30 }, { value: 40 }, { value: 35 }, { value: 50 }, { value: 49 }, { value: 60 }, { value: 70 }
    ],
    icon: 'revenue'
  },
  {
    id: '2',
    label: 'Users',
    value: '2,350',
    change: 8.2,
    sparklineData: [
      { value: 20 }, { value: 35 }, { value: 30 }, { value: 45 }, { value: 50 }, { value: 55 }, { value: 65 }
    ],
    icon: 'users'
  },
  {
    id: '3',
    label: 'Orders',
    value: '1,543',
    change: -3.1,
    sparklineData: [
      { value: 60 }, { value: 55 }, { value: 50 }, { value: 45 }, { value: 48 }, { value: 42 }, { value: 40 }
    ],
    icon: 'orders'
  },
  {
    id: '4',
    label: 'Conversion',
    value: '3.24%',
    change: 5.7,
    sparklineData: [
      { value: 25 }, { value: 30 }, { value: 28 }, { value: 40 }, { value: 45 }, { value: 50 }, { value: 55 }
    ],
    icon: 'conversion'
  }
];

interface ActivityItem {
  id: string;
  type: 'success' | 'warning' | 'info';
  message: string;
  timestamp: string;
  icon: 'check' | 'alert' | 'clock';
}

const mockActivityData: ActivityItem[] = [
  { id: '1', type: 'success', message: 'New order received', timestamp: '2 min ago', icon: 'check' },
  { id: '2', type: 'info', message: 'User registration completed', timestamp: '15 min ago', icon: 'clock' },
  { id: '3', type: 'success', message: 'Payment processed', timestamp: '1 hour ago', icon: 'check' },
  { id: '4', type: 'warning', message: 'Low stock alert', timestamp: '2 hours ago', icon: 'alert' },
  { id: '5', type: 'success', message: 'Report generated', timestamp: '3 hours ago', icon: 'check' }
];
const pieChartData = [
  { name: 'Premium Plan', value: 234, color: '#3b82f6' },
  { name: 'Basic Plan', value: 567, color: '#10b981' },
  { name: 'Enterprise Plan', value: 89, color: '#f59e0b' },
  { name: 'Starter Plan', value: 432, color: '#8b5cf6' },
  { name: 'Pro Plan', value: 156, color: '#ec4899' }
];

export default function AnalyticsDashboard() {

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>(mockMetrics);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(mockChartData);
  const [tableData, setTableData] = useState<TableRow[]>(mockTableData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quickStats, setQuickStats] = useState<QuickStatData[]>(mockQuickStats);

  const getStatIcon = (iconType: string) => {
    switch (iconType) {
      case 'revenue':
        return <DollarSign className="h-5 w-5" />;
      case 'users':
        return <Users className="h-5 w-5" />;
      case 'orders':
        return <ShoppingCart className="h-5 w-5" />;
      case 'conversion':
        return <Target className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

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

      // Generate updated quick stats with random variations
      const updatedQuickStats = mockQuickStats.map(stat => ({
        ...stat,
        change: parseFloat((Math.random() * 20 - 5).toFixed(1)),
        sparklineData: stat.sparklineData.map(point => ({
          value: Math.max(10, point.value + Math.floor(Math.random() * 20 - 10))
        }))
      }));

      setMetrics(updatedMetrics);
      setChartData(updatedChartData);
      setTableData(updatedTableData);
      setQuickStats(updatedQuickStats);
      setIsRefreshing(false);
    }, 1500);</parameter>

</invoke>r(Math.random() * 2000 - 1000)
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
            const Icon = metric.label.includes('Revenue') ? DollarSign :
                        metric.label.includes('Users') ? Users :
                        metric.label.includes('Orders') ? ShoppingCart : Target;
            
            const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
            
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {metric.label}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {metric.label.includes('Rate') ? `${metric.value}%` : 
                       metric.label.includes('Revenue') ? `$${metric.value.toLocaleString()}` : 
                       metric.value.toLocaleString()}
                    </div>
                    <div className="flex items-center mt-2">
                      <TrendIcon 
                        className={`h-4 w-4 mr-1 ${
                          metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`} 
                      />
                      <span className={`text-sm font-medium ${
                        metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {Math.abs(metric.change)}%
                      </span>
                      <span className={`text-sm ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        vs last period
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
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
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
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
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '6px',
                      color: isDarkMode ? '#ffffff' : '#000000'
                    }}
                    labelStyle={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>User Growth</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Active users over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        color: isDarkMode ? '#ffffff' : '#000000'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      formatter={(value: number) => [value.toLocaleString(), 'Users']}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#userGradient)"
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Orders Distribution</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                By product category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                      borderRadius: '6px',
                      color: isDarkMode ? '#ffffff' : '#000000'
                    }}
                    formatter={(value: number) => [`${value} orders`, 'Orders']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{
                      color: isDarkMode ? '#9ca3af' : '#4b5563'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={`lg:col-span-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Performance Metrics</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Combined view of key indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
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
                      color: isDarkMode ? '#f3f4f6' : '#111827'
                    }}
                    labelStyle={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}
                    formatter={(value: number) => value.toLocaleString()}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  />
                  <Legend 
                    wrapperStyle={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                    name="Revenue ($)"
                  />
                  <Bar 
                    dataKey="users" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                    name="Users"
                  />
                  <Bar 
                    dataKey="orders" 
                    fill="#f59e0b" 
                    radius={[4, 4, 0, 0]}
                    name="Orders"
                  />
                </BarChart>
              </ResponsiveContainer>
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
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className={isDarkMode ? 'border-gray-700' : ''}>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('product')}
                          className={`-ml-3 h-8 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
                        >
                          Product
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('sales')}
                          className={`-ml-3 h-8 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
                        >
                          Sales
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('revenue')}
                          className={`-ml-3 h-8 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
                        >
                          Revenue
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('status')}
                          className={`-ml-3 h-8 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
                        >
                          Status
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((row) => (
                      <TableRow 
                        key={row.id}
                        className={isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'hover:bg-gray-50'}
                      >
                        <TableCell className={`font-medium ${isDarkMode ? 'text-white' : ''}`}>
                          {row.product}
                        </TableCell>
                        <TableCell className={isDarkMode ? 'text-gray-300' : ''}>
                          {row.sales.toLocaleString()}
                        </TableCell>
                        <TableCell className={isDarkMode ? 'text-gray-300' : ''}>
                          ${row.revenue.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={getStatusBadgeVariant(row.status)}
                            className={`capitalize ${getStatusColor(row.status)} ${isDarkMode ? 'border' : ''}`}
                          >
                            {row.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedTableData.length)} of {sortedTableData.length} products
                </p>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={isDarkMode ? 'border-gray-700' : ''}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 p-0 ${isDarkMode && currentPage !== page ? 'border-gray-700' : ''}`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={isDarkMode ? 'border-gray-700' : ''}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActivityData.map((activity, index) => {
                  const Icon = activity.icon === 'check' ? CheckCircle : activity.icon === 'alert' ? AlertCircle : Clock;
                  const iconColor = activity.type === 'success' ? 'text-green-500' : activity.type === 'warning' ? 'text-yellow-500' : 'text-blue-500';
                  const bgColor = activity.type === 'success' ? 'bg-green-100 dark:bg-green-900/20' : activity.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-blue-100 dark:bg-blue-900/20';
                  
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 animate-in fade-in slide-in-from-left-5"
                      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
                    >
                      <div className={`p-2 rounded-full ${bgColor} flex-shrink-0`}>
                        <Icon className={`h-4 w-4 ${iconColor}`} />
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
              {/* TODO:QuickStats Render mini stat cards with sparklines and percentage changes */}
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {/* TODO:AlertsList Render alert notifications with severity levels and dismiss action