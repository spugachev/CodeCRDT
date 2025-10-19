import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { TrendingUp, TrendingDown, ShoppingCart, UserPlus, DollarSign, Package, AlertCircle, CheckCircle } from 'lucide-react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Zap, BarChart3DollarSign, Users, ShoppingCart, Target } from 'lucide-react';
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
interface PieChartData {
  name: string;
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
  { date: '2024-01-06', revenue: 20000, users: 680, orders: 350 },
  { date: '2024-01-07', revenue: 22000, users: 720, orders: 380 }
];

const mockTableData: TableRow[] = [
  { id: '1', product: 'Premium Plan', sales: 234, revenue: 23400, status: 'active' },
  { id: '2', product: 'Basic Plan', sales: 567, revenue: 11340, status: 'active' },
  { id: '3', product: 'Enterprise Plan', sales: 89, revenue: 17800, status: 'active' },
  { id: '4', product: 'Starter Plan', sales: 432, revenue: 4320, status: 'pending' },
  { id: '5', product: 'Pro Plan', sales: 156, revenue: 15600, status: 'active' }
];
interface QuickStat {
  id: string;
  label: string;
  value: number;
  target: number;
  icon: string;
  color: string;
}

const mockQuickStats: QuickStat[] = [
  { id: '1', label: 'Daily Goal', value: 18500, target: 25000, icon: 'target', color: 'blue' },
  { id: '2', label: 'Engagement', value: 78, target: 100, icon: 'activity', color: 'green' },
  { id: '3', label: 'Performance', value: 92, target: 100, icon: 'zap', color: 'yellow' },
  { id: '4', label: 'Growth', value: 65, target: 100, icon: 'chart', color: 'purple' }
];
interface ActivityItem {
  id: string;
  type: 'sale' | 'user' | 'revenue' | 'order' | 'alert' | 'success';
  message: string;
  timestamp: string;
  icon: 'cart' | 'user' | 'dollar' | 'package' | 'alert' | 'check';
}

const mockActivityData: ActivityItem[] = [
  { id: '1', type: 'sale', message: 'New sale: Premium Plan purchased', timestamp: '2 minutes ago', icon: 'cart' },
  { id: '2', type: 'user', message: 'New user registered: john@example.com', timestamp: '5 minutes ago', icon: 'user' },
  { id: '3', type: 'revenue', message: 'Revenue milestone: $50,000 reached', timestamp: '12 minutes ago', icon: 'dollar' },
  { id: '4', type: 'order', message: 'Order #1234 shipped successfully', timestamp: '18 minutes ago', icon: 'package' },
  { id: '5', type: 'success', message: 'System backup completed', timestamp: '25 minutes ago', icon: 'check' },
  { id: '6', type: 'sale', message: 'New sale: Enterprise Plan purchased', timestamp: '32 minutes ago', icon: 'cart' },
  { id: '7', type: 'user', message: 'New user registered: sarah@example.com', timestamp: '45 minutes ago', icon: 'user' },
  { id: '8', type: 'alert', message: 'Low stock alert: Starter Plan', timestamp: '1 hour ago', icon: 'alert' },
  { id: '9', type: 'order', message: 'Order #1233 delivered', timestamp: '1 hour ago', icon: 'package' },
  { id: '10', type: 'revenue', message: 'Daily revenue target achieved', timestamp: '2 hours ago', icon: 'dollar' }
];
const mockPieData: PieChartData[] = [
  { name: 'Premium Plan', value: 23400, color: '#3b82f6' },
  { name: 'Enterprise Plan', value: 17800, color: '#8b5cf6' },
  { name: 'Pro Plan', value: 15600, color: '#06b6d4' },
  { name: 'Basic Plan', value: 11340, color: '#10b981' },
  { name: 'Starter Plan', value: 4320, color: '#f59e0b' }
];

const UserAreaChart = ({ data, isDarkMode }: { data: ChartDataPoint[], isDarkMode: boolean }) => {
  const maxUsers = Math.max(...data.map(d => d.users));
  const minUsers = Math.min(...data.map(d => d.users));
  const range = maxUsers - minUsers;
  const padding = range * 0.2;
  const chartMax = maxUsers + padding;
  const chartMin = Math.max(0, minUsers - padding);
  const chartRange = chartMax - chartMin;

  const width = 100;
  const height = 100;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((point.users - chartMin) / chartRange) * height;
    return { x, y, ...point };
  });

  const pathD = points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `${path} L ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="relative w-full h-64">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="userGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <motion.path
          d={areaD}
          fill="url(#userGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        <motion.path
          d={pathD}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />

        {points.map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={hoveredIndex === index ? "1.5" : "1"}
            fill="#3b82f6"
            stroke={isDarkMode ? "#1f2937" : "#ffffff"}
            strokeWidth="0.5"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="cursor-pointer"
          />
        ))}
      </svg>

      <div className="absolute inset-0 flex items-end justify-between px-2 pb-2 pointer-events-none">
        {points.map((point, index) => (
          <div key={index} className="flex flex-col items-center">
            <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {new Date(point.date).getDate()}
            </span>
          </div>
        ))}
      </div>

      {hoveredIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-3 py-2 rounded-lg shadow-lg ${
            isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
          }`}
        >
          <div className="text-sm font-semibold">{points[hoveredIndex].users.toLocaleString()} Users</div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {new Date(points[hoveredIndex].date).toLocaleDateString()}
          </div>
        </motion.div>
      )}

      <div className={`absolute top-2 left-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        {chartMax.toFixed(0)}
      </div>
      <div className={`absolute bottom-8 left-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        {chartMin.toFixed(0)}
      </div>
    </div>
  );
};

export default function AnalyticsDashboard() {
  const [sortColumn, setSortColumn] = useState<keyof TableRow | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>(mockMetrics);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(mockChartData);
  const [tableData, setTableData] = useState<TableRow[]>(mockTableData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quickStats] = useState<QuickStat[]>(mockQuickStats);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'target': return Target;
      case 'activity': return Activity;
      case 'zap': return Zap;
      case 'chart': return BarChart3;
      default: return Target;
    }
  };

  const getColorClasses = (color: string, isDark: boolean) => {
    const colors = {
      blue: {
        bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50',
        text: isDark ? 'text-blue-400' : 'text-blue-600',
        progress: 'bg-blue-500'
      },
      green: {
        bg: isDark ? 'bg-green-500/10' : 'bg-green-50',
        text: isDark ? 'text-green-400' : 'text-green-600',
        progress: 'bg-green-500'
      },
      yellow: {
        bg: isDark ? 'bg-yellow-500/10' : 'bg-yellow-50',
        text: isDark ? 'text-yellow-400' : 'text-yellow-600',
        progress: 'bg-yellow-500'
      },
      purple: {
        bg: isDark ? 'bg-purple-500/10' : 'bg-purple-50',
        text: isDark ? 'text-purple-400' : 'text-purple-600',
        progress: 'bg-purple-500'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);
  const handleSort = useCallback((column: keyof TableRow) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  }, [sortColumn]);

  const getSortedData = useCallback(() => {
    if (!sortColumn) return tableData;
    
    return [...tableData].sort((a, b) => {
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
  }, [tableData, sortColumn, sortDirection]);

  const paginatedData = useCallback(() => {
    const sorted = getSortedData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sorted.slice(startIndex, endIndex);
  }, [getSortedData, currentPage]);

  const totalPages = Math.ceil(tableData.length / itemsPerPage);

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

  const SortIcon = ({ column }: { column: keyof TableRow }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    
    // Simulate async data refresh
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
    }, 1500)</parameter>
</invoke>
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
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
                        metric.label.includes('Orders') ? ShoppingCart :
                        Target;
            
            const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
            const trendColor = metric.trend === 'up' ? 'text-green-500' : 'text-red-500';
            const trendBgColor = metric.trend === 'up' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20';

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
                      <span className={`text-xs ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
                Active users over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserAreaChart data={chartData} isDarkMode={isDarkMode} />
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
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
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
                        color: isDarkMode ? '#f3f4f6' : '#111827'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    />
                    <Legend 
                      wrapperStyle={{
                        color: isDarkMode ? '#f3f4f6' : '#111827'
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
              </div>
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
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
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
                      formatter={(value) => (
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {value}
                        </span>
                      )}
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
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className={isDarkMode ? 'border-gray-700' : ''}>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('product')}
                          className="h-8 px-2 lg:px-3"
                        >
                          Product
                          <SortIcon column="product" />
                        </Button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('sales')}
                          className="h-8 px-2 lg:px-3"
                        >
                          Sales
                          <SortIcon column="sales" />
                        </Button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('revenue')}
                          className="h-8 px-2 lg:px-3"
                        >
                          Revenue
                          <SortIcon column="revenue" />
                        </Button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('status')}
                          className="h-8 px-2 lg:px-3"
                        >
                          Status
                          <SortIcon column="status" />
                        </Button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData().map((row) => (
                      <TableRow 
                        key={row.id}
                        className={isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : ''}
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
                            variant={getStatusBadgeVariant(row.status)}
                            className="capitalize"
                          >
                            {row.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between">
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, tableData.length)} of {tableData.length} products
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={isDarkMode ? 'border-gray-700' : ''}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 ${isDarkMode && currentPage !== page ? 'border-gray-700' : ''}`}
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
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-8">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Recent Activity</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Latest system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                {mockActivityData.map((activity) => {
                  const getIcon = () => {
                    switch (activity.icon) {
                      case 'cart':
                        return <ShoppingCart className="h-4 w-4" />;
                      case 'user':
                        return <UserPlus className="h-4 w-4" />;
                      case 'dollar':
                        return <DollarSign className="h-4 w-4" />;
                      case 'package':
                        return <Package className="h-4 w-4" />;
                      case 'alert':
                        return <AlertCircle className="h-4 w-4" />;
                      case 'check':
                        return <CheckCircle className="h-4 w-4" />;
                      default:
                        return <CheckCircle className="h-4 w-4" />;
                    }
                  };

                  const getIconColor = () => {
                    switch (activity.type) {
                      case 'sale':
                        return isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600';
                      case 'user':
                        return isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600';
                      case 'revenue':
                        return isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600';
                      case 'order':
                        return isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-600';
                      case 'alert':
                        return isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-600';
                      case 'success':
                        return isDarkMode ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-100 text-teal-600';
                      default:
                        return isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600';
                    }
                  };

                  return (
                    <div
                      key={activity.id}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getIconColor()}`}>
                        {getIcon()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {activity.message}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
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
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Summary statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickStats.map((stat, index) => {
                  const IconComponent = getIconComponent(stat.icon);
                  const colorClasses = getColorClasses(stat.color, isDarkMode);
                  const percentage = Math.round((stat.value / stat.target) * 100);

                  return (
                    <motion.div
                      key={stat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border ${
                        isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {stat.label}
                          </p>
                          <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {stat.label.includes('Goal') ? `$${stat.value.toLocaleString()}` : `${stat.value}%`}
                          </p>
                        </div>
                        <div className={`p-2 rounded-lg ${colorClasses.bg}`}>
                          <IconComponent className={`h-5 w-5 ${colorClasses.text}`} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                            Progress
                          </span>
                          <span className={`font-semibold ${colorClasses.text}`}>
                            {percentage}%
                          </span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${
                          isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: index * 0.1 + 0.2, ease: "easeOut" }}
                            className={`h-full ${colorClasses.progress} rounded-full`}
                          />
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          Target: {stat.label.includes('Goal') ? `$${stat.target.toLocaleString()}` : `${stat.target}%`}
                        </p>
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