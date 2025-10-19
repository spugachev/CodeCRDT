import { useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, UserPlus, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, hoppingCartShoppingCart, Target, AlertCircle, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
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
interface Alert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
}

const mockAlerts: Alert[] = [
  { id: '1', message: 'Server response time increased by 15%', severity: 'warning', timestamp: '5 min ago' },
  { id: '2', message: 'New user milestone reached: 2,500 users', severity: 'success', timestamp: '12 min ago' },
  { id: '3', message: 'Payment gateway experiencing delays', severity: 'error', timestamp: '18 min ago' },
  { id: '4', message: 'Scheduled maintenance in 2 hours', severity: 'info', timestamp: '25 min ago' }
];

const getAlertIcon = (severity: string) => {
  switch (severity) {
    case 'error':
      return AlertCircle;
    case 'warning':
      return AlertTriangle;
    case 'success':
      return CheckCircle;
    case 'info':
    default:
      return Info;
  }
};

const getAlertColor = (severity: string, isDark: boolean) => {
  switch (severity) {
    case 'error':
      return isDark ? 'text-red-400' : 'text-red-600';
    case 'warning':
      return isDark ? 'text-amber-400' : 'text-amber-600';
    case 'success':
      return isDark ? 'text-green-400' : 'text-green-600';
    case 'info':
    default:
      return isDark ? 'text-blue-400' : 'text-blue-600';
  }
};

const getAlertBgColor = (severity: string, isDark: boolean) => {
  switch (severity) {
    case 'error':
      return isDark ? 'bg-red-900/20' : 'bg-red-50';
    case 'warning':
      return isDark ? 'bg-amber-900/20' : 'bg-amber-50';
    case 'success':
      return isDark ? 'bg-green-900/20' : 'bg-green-50';
    case 'info':
    default:
      return isDark ? 'bg-blue-900/20' : 'bg-blue-50';
  }
};

interface ActivityItem {
  id: string;
  type: 'success' | 'warning' | 'info' | 'order';
  message: string;
  timestamp: string;
}

const mockActivityData: ActivityItem[] = [
  { id: '1', type: 'success', message: 'New user registration completed', timestamp: '2 min ago' },
  { id: '2', type: 'order', message: 'Order #1234 has been shipped', timestamp: '15 min ago' },
  { id: '3', type: 'info', message: '5 new users joined today', timestamp: '1 hour ago' },
  { id: '4', type: 'warning', message: 'Payment pending for Order #1230', timestamp: '2 hours ago' },
  { id: '5', type: 'success', message: 'Revenue milestone reached: $50k', timestamp: '3 hours ago' }
];
const mockQuickStats = [
  {
    id: '1',
    label: 'Avg. Order Value',
    value: '$142.50',
    change: 15.3,
    sparklineData: [
      { value: 120 },
      { value: 135 },
      { value: 128 },
      { value: 145 },
      { value: 138 },
      { value: 152 },
      { value: 142 }
    ]
  },
  {
    id: '2',
    label: 'Customer Retention',
    value: '87.5%',
    change: 4.2,
    sparklineData: [
      { value: 82 },
      { value: 84 },
      { value: 85 },
      { value: 86 },
      { value: 85 },
      { value: 87 },
      { value: 88 }
    ]
  },
  {
    id: '3',
    label: 'Bounce Rate',
    value: '32.1%',
    change: -2.8,
    sparklineData: [
      { value: 35 },
      { value: 36 },
      { value: 34 },
      { value: 33 },
      { value: 34 },
      { value: 32 },
      { value: 32 }
    ]
  }
];
const pieChartColors = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6'  // purple
];

interface PieChartData {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

const preparePieChartData = (data: ChartDataPoint[]): PieChartData[] => {
  const total = data.reduce((sum, item) => sum + item.orders, 0);
  
  return data.map((item, index) => ({
    label: `Day ${index + 1}`,
    value: item.orders,
    color: pieChartColors[index % pieChartColors.length],
    percentage: (item.orders / total) * 100
  }));
};

const PieChart = ({ data, isDark }: { data: PieChartData[]; isDark: boolean }) => {
  const size = 200;
  const center = size / 2;
  const radius = size / 2 - 10;
  
  let currentAngle = -90;
  
  const slices = data.map((item, index) => {
    const angle = (item.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    currentAngle = endAngle;
    
    return {
      pathData,
      color: item.color,
      label: item.label,
      value: item.value,
      percentage: item.percentage
    };
  });
  
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
        {slices.map((slice, index) => (
          <motion.path
            key={index}
            d={slice.pathData}
            fill={slice.color}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="hover:opacity-80 transition-opacity cursor-pointer"
          />
        ))}
      </svg>
      
      <div className="flex flex-col gap-2">
        {data.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center gap-2"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {item.label}: {item.value} ({item.percentage.toFixed(1)}%)
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};


const getMetricIcon = (label: string) => {
  switch (label) {
    case 'Total Revenue':
      return DollarSign;
    case 'Active Users':
      return Users;
    case 'Total Orders':
      return ShoppingCart;
    case 'Conversion Rate':
      return Target;
    default:
      return DollarSign;
  }
};

const formatMetricValue = (label: string, value: number) => {
  if (label === 'Total Revenue') {
    return `$${value.toLocaleString()}`;
  } else if (label === 'Conversion Rate') {
    return `${value}%`;
  }
  return value.toLocaleString();
};

const CustomTooltip = ({ active, payload, isDark }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={`p-3 rounded-lg shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {payload[0].payload.date}
        </p>
        <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Revenue: ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const UserChartTooltip = ({ active, payload, isDark }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg p-3`}>
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
          {payload[0].payload.date}
        </p>
        <p className={`text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
          Users: {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>(mockMetrics);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(mockChartData);
  const [tableData, setTableData] = useState<TableRow[]>(mockTableData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const [sortConfig, setSortConfig] = useState<{ key: keyof TableRow; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const handleSort = useCallback((key: keyof TableRow) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  }, []);

  const sortedTableData = useCallback(() => {
    if (!sortConfig) return tableData;

    return [...tableData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
  }, [tableData, sortConfig]);

  const paginatedData = useCallback(() => {
    const sorted = sortedTableData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sorted.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTableData, currentPage]);

  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  const getStatusColor = (status: TableRow['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
      default:
        return '';
    }
  };

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
            const Icon = getMetricIcon(metric.label);
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
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <Icon className={`h-4 w-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatMetricValue(metric.label, metric.value)}
                    </div>
                    <div className="flex items-center mt-2">
                      <TrendIcon 
                        className={`h-4 w-4 mr-1 ${
                          metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`} 
                      />
                      <span 
                        className={`text-sm font-medium ${
                          metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                      <span className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                      tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip isDark={isDarkMode} />} />
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
              <CardTitle className={isDarkMode ? 'text-white' : ''}>User Growth</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Active users over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
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
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip content={<UserChartTooltip isDark={isDarkMode} />} />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#userGradient)"
                      animationDuration={1000}
                      animationBegin={0}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
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
              <PieChart data={preparePieChartData(chartData)} isDark={isDarkMode} />
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
                    formatter={(value: number, name: string) => {
                      if (name === 'revenue') return [`$${value.toLocaleString()}`, 'Revenue'];
                      if (name === 'users') return [value.toLocaleString(), 'Users'];
                      if (name === 'orders') return [value.toLocaleString(), 'Orders'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
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
                  <Bar 
                    dataKey="revenue" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                  <Bar 
                    dataKey="users" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                  <Bar 
                    dataKey="orders" 
                    fill="#f59e0b" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
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
                        <button
                          onClick={() => handleSort('product')}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          Product
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <button
                          onClick={() => handleSort('sales')}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          Sales
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <button
                          onClick={() => handleSort('revenue')}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          Revenue
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          Status
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData().map((row, index) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`border-b ${isDarkMode ? 'border-gray-700' : ''}`}
                      >
                        <TableCell className={`font-medium ${isDarkMode ? 'text-gray-200' : ''}`}>
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
                            variant="secondary" 
                            className={getStatusColor(row.status)}
                          >
                            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, tableData.length)} of {tableData.length} products
                </p>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={isDarkMode ? 'border-gray-700' : ''}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                    <ChevronRight className="h-4 w-4" />
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
                  const getActivityIcon = () => {
                    switch (activity.type) {
                      case 'success':
                        return <CheckCircle className="h-5 w-5 text-green-500" />;
                      case 'warning':
                        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
                      case 'info':
                        return <UserPlus className="h-5 w-5 text-blue-500" />;
                      case 'order':
                        return <Package className="h-5 w-5 text-purple-500" />;
                      default:
                        return <CheckCircle className="h-5 w-5 text-gray-500" />;
                    }
                  };

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="flex items-start gap-3 pb-4 border-b last:border-b-0 last:pb-0"
                      style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}
                    >
                      <div className="mt-0.5">
                        {getActivityIcon()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {activity.message}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {activity.timestamp}
                        </p>
                      </div>
                    </motion.div>
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
                {mockQuickStats.map((stat, index) => (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {stat.label}
                        </p>
                        <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {stat.value}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        stat.change >= 0
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {stat.change >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(stat.change)}%
                      </div>
                    </div>
                    <div className="h-12">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stat.sparklineData}>
                          <defs>
                            <linearGradient id={`gradient-${stat.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop
                                offset="0%"
                                stopColor={stat.change >= 0 ? '#10b981' : '#ef4444'}
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="100%"
                                stopColor={stat.change >= 0 ? '#10b981' : '#ef4444'}
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={stat.change >= 0 ? '#10b981' : '#ef4444'}
                            strokeWidth={2}
                            fill={`url(#gradient-${stat.id})`}
                            isAnimationActive={true}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAlerts.map((alert, index) => {
                  const AlertIcon = getAlertIcon(alert.severity);
                  const alertColor = getAlertColor(alert.severity, isDarkMode);
                  const alertBgColor = getAlertBgColor(alert.severity, isDarkMode);

                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-lg ${alertBgColor} flex items-start gap-3 group relative`}
                    >
                      <AlertIcon className={`h-5 w-5 ${alertColor} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {alert.message}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {alert.timestamp}
                        </p>
                      </div>
                      <button
                        className={`opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                        aria-label="Dismiss alert"
                      >
                        <X className="h-4 w-4" />
                      </button>
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