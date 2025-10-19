import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { ShoppingCart, UserPlus, DollarSign, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';;
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';


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
  { id: '3', product: 'Enterprise Plan', sales: 89, revenue: 17800, status: 'active' },
  { id: '4', product: 'Starter Plan', sales: 432, revenue: 4320, status: 'pending' },
  { id: '5', product: 'Pro Plan', sales: 156, revenue: 15600, status: 'active' }
];

interface ActivityItem {
  id: string;
  type: 'sale' | 'user' | 'revenue' | 'order' | 'success' | 'alert';
  message: string;
  timestamp: string;
  icon: 'ShoppingCart' | 'UserPlus' | 'DollarSign' | 'Package' | 'CheckCircle' | 'AlertCircle';
}

const mockActivityData: ActivityItem[] = [
  { id: '1', type: 'sale', message: 'New sale: Premium Plan', timestamp: '2 minutes ago', icon: 'ShoppingCart' },
  { id: '2', type: 'user', message: 'New user registered', timestamp: '5 minutes ago', icon: 'UserPlus' },
  { id: '3', type: 'revenue', message: 'Revenue milestone reached', timestamp: '12 minutes ago', icon: 'DollarSign' },
  { id: '4', type: 'order', message: 'Order #1234 shipped', timestamp: '18 minutes ago', icon: 'Package' },
  { id: '5', type: 'success', message: 'Payment processed successfully', timestamp: '25 minutes ago', icon: 'CheckCircle' },
  { id: '6', type: 'alert', message: 'Low stock alert: Basic Plan', timestamp: '32 minutes ago', icon: 'AlertCircle' },
  { id: '7', type: 'sale', message: 'New sale: Enterprise Plan', timestamp: '45 minutes ago', icon: 'ShoppingCart' },
  { id: '8', type: 'user', message: '3 new users registered', timestamp: '1 hour ago', icon: 'UserPlus' },
  { id: '9', type: 'revenue', message: 'Daily revenue target achieved', timestamp: '2 hours ago', icon: 'DollarSign' },
  { id: '10', type: 'order', message: 'Order #1233 delivered', timestamp: '3 hours ago', icon: 'CheckCircle' }
];
interface GoalData {
  id: string;
  label: string;
  current: number;
  target: number;
  color: string;
}

const mockGoals: GoalData[] = [
  { id: '1', label: 'Monthly Revenue', current: 45231, target: 50000, color: 'bg-blue-500' },
  { id: '2', label: 'New Users', current: 2350, target: 3000, color: 'bg-green-500' },
  { id: '3', label: 'Orders Target', current: 1543, target: 2000, color: 'bg-purple-500' },
  { id: '4', label: 'Conversion Goal', current: 324, target: 400, color: 'bg-orange-500' }
];
const mockQuickStats = [
  { name: 'Mon', value: 4200, color: '#3b82f6' },
  { name: 'Tue', value: 5100, color: '#8b5cf6' },
  { name: 'Wed', value: 3800, color: '#ec4899' },
  { name: 'Thu', value: 6200, color: '#10b981' },
  { name: 'Fri', value: 5500, color: '#f59e0b' },
  { name: 'Sat', value: 4800, color: '#06b6d4' },
  { name: 'Sun', value: 3900, color: '#6366f1' }
];

const RevenueChart = ({ data, isDarkMode }: { data: ChartDataPoint[], isDarkMode: boolean }) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const minRevenue = Math.min(...data.map(d => d.revenue));
  const revenueRange = maxRevenue - minRevenue;
  
  const chartHeight = 200;
  const chartWidth = 100; // percentage
  const padding = 20;
  
  const getX = (index: number) => {
    return (index / (data.length - 1)) * 100;
  };
  
  const getY = (value: number) => {
    const normalized = (value - minRevenue) / revenueRange;
    return chartHeight - (normalized * (chartHeight - padding * 2)) - padding;
  };
  
  const pathData = data.map((point, index) => {
    const x = getX(index);
    const y = getY(point.revenue);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  const areaPathData = `${pathData} L ${getX(data.length - 1)} ${chartHeight} L 0 ${chartHeight} Z`;
  
  return (
    <div className="relative w-full h-64">
      <svg
        viewBox={`0 0 100 ${chartHeight}`}
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDarkMode ? '#3b82f6' : '#2563eb'} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isDarkMode ? '#3b82f6' : '#2563eb'} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <path
          d={areaPathData}
          fill="url(#revenueGradient)"
          className="transition-all duration-300"
        />
        
        <path
          d={pathData}
          fill="none"
          stroke={isDarkMode ? '#3b82f6' : '#2563eb'}
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
          className="transition-colors duration-300"
        />
        
        {data.map((point, index) => (
          <g key={index}>
            <circle
              cx={getX(index)}
              cy={getY(point.revenue)}
              r={hoveredPoint === index ? '1.5' : '1'}
              fill={isDarkMode ? '#3b82f6' : '#2563eb'}
              vectorEffect="non-scaling-stroke"
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHoveredPoint(index)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          </g>
        ))}
      </svg>
      
      <div className="absolute inset-0 flex items-end justify-between px-2 pb-2 pointer-events-none">
        {data.map((point, index) => (
          <div key={index} className="flex flex-col items-center text-xs">
            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {new Date(point.date).getDate()}/{new Date(point.date).getMonth() + 1}
            </span>
          </div>
        ))}
      </div>
      
      {hoveredPoint !== null && (
        <div
          className={`absolute pointer-events-none transition-all duration-200 ${
            isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
          } px-3 py-2 rounded-lg shadow-lg border ${
            isDarkMode ? 'border-gray-600' : 'border-gray-200'
          }`}
          style={{
            left: `${getX(hoveredPoint)}%`,
            top: `${(getY(data[hoveredPoint].revenue) / chartHeight) * 100}%`,
            transform: 'translate(-50%, -120%)'
          }}
        >
          <div className="text-xs font-semibold mb-1">
            {new Date(data[hoveredPoint].date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-blue-500" />
            <span className="text-sm font-bold">
              ${data[hoveredPoint].revenue.toLocaleString()}
            </span>
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {data[hoveredPoint].orders} orders
          </div>
        </div>
      )}
    </div>
  );
};

const UserChart = ({ data, isDarkMode }: { data: ChartDataPoint[], isDarkMode: boolean }) => {
  const maxUsers = Math.max(...data.map(d => d.users));
  const minUsers = Math.min(...data.map(d => d.users));
  const range = maxUsers - minUsers;
  const padding = range * 0.1;
  const chartHeight = 200;
  const chartWidth = 100;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * chartWidth;
    const y = chartHeight - ((point.users - minUsers + padding) / (range + 2 * padding)) * chartHeight;
    return { x, y, ...point };
  });

  const pathD = points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `${path} L ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="relative w-full h-[200px]">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
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
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {points.map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={hoveredIndex === index ? "1.2" : "0.8"}
            fill="#3b82f6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="cursor-pointer"
          />
        ))}
      </svg>

      {hoveredIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute top-2 left-2 px-3 py-2 rounded-lg shadow-lg ${
            isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
          }`}
        >
          <div className="text-xs font-semibold">{points[hoveredIndex].date}</div>
          <div className="text-sm font-bold text-blue-500">
            {points[hoveredIndex].users.toLocaleString()} users
          </div>
        </motion.div>
      )}

      <div className={`flex justify-between mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {data.map((point, index) => (
          index % Math.ceil(data.length / 4) === 0 && (
            <span key={index}>{new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          )
        ))}
      </div>
    </div>
  );
};

<style jsx>{`
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`}</style>
export default function AnalyticsDashboard() {
  const [sortColumn, setSortColumn] = useState<keyof TableRow | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>(mockMetrics);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(mockChartData);
  const [tableData, setTableData] = useState<TableRow[]>(mockTableData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activityData] = useState<ActivityItem[]>(mockActivityData);

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

  const sortedTableData = useCallback(() => {
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
    const sorted = sortedTableData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sorted.slice(startIndex, endIndex);
  }, [sortedTableData, currentPage]);

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
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    
    // Simulate async data refresh
    setTimeout(() => {
      // Generate updated metrics with random variations
      const updatedMetrics = mockMetrics.map(metric => ({
        ...metric,
        value: metric.value * (0.9 + Math.random() * 0.2),
        change: -10 + Math.random() * 20
      }));
      
      setMetrics(updatedMetrics);
      setIsRefreshing(false);
    }, 1500);
  }, []);

  // Calculate pie chart data from table data
  const pieChartData = tableData.map(item => ({
    name: item.product,
    value: item.sales,
    revenue: item.revenue
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / tableData.reduce((sum, item) => sum + item.sales, 0)) * 100).toFixed(1);
      return (
        <div className={`p-3 rounded-lg shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}>
          <p className="font-semibold">{data.name}</p>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Sales: {data.value}
          </p>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Revenue: ${data.payload.revenue.toLocaleString()}
          </p>
          <p className="font-semibold text-blue-500">{percentage}%</p>
        </div>
      );
    }
    return null;
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
    }, 1500);
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {metrics.map((metric, index) => {
            const Icon = metric.label.includes('Revenue') ? DollarSign :
                        metric.label.includes('Users') ? Users :
                        metric.label.includes('Orders') ? ShoppingCart :
                        Target;
            
            const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
            const trendColor = metric.trend === 'up' ? 'text-green-500' : 'text-red-500';
            const trendBgColor = metric.trend === 'up' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20';

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
                  <CardTitle className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {metric.label}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <Icon className={`h-4 w-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {metric.label.includes('Rate') 
                      ? `${metric.value}%` 
                      : metric.label.includes('Revenue') 
                        ? `$${metric.value.toLocaleString()}` 
                        : metric.value.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${trendBgColor}`}>
                      <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                      <span className={`text-xs font-medium ${trendColor}`}>
                        {Math.abs(metric.change)}%
                      </span>
                    </div>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      vs last period
                    </span>
                  </div>
                </CardContent>
              </Card>
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
              <RevenueChart data={chartData} isDarkMode={isDarkMode} />
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
              <UserChart data={chartData} isDarkMode={isDarkMode} />
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
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
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
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
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
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('sales')}
                          className="h-8 px-2 lg:px-3"
                        >
                          Sales
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('revenue')}
                          className="h-8 px-2 lg:px-3"
                        >
                          Revenue
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('status')}
                          className="h-8 px-2 lg:px-3"
                        >
                          Status
                          <ArrowUpDown className="ml-2 h-4 w-4" />
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
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Page {currentPage} of {totalPages}
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
              <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                {activityData.map((activity) => {
                  const IconComponent = 
                    activity.icon === 'ShoppingCart' ? ShoppingCart :
                    activity.icon === 'UserPlus' ? UserPlus :
                    activity.icon === 'DollarSign' ? DollarSign :
                    activity.icon === 'Package' ? Package :
                    activity.icon === 'CheckCircle' ? CheckCircle :
                    AlertCircle;

                  const iconColor = 
                    activity.type === 'sale' ? 'text-blue-500' :
                    activity.type === 'user' ? 'text-green-500' :
                    activity.type === 'revenue' ? 'text-yellow-500' :
                    activity.type === 'order' ? 'text-purple-500' :
                    activity.type === 'success' ? 'text-emerald-500' :
                    'text-red-500';

                  const bgColor = 
                    activity.type === 'sale' ? (isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50') :
                    activity.type === 'user' ? (isDarkMode ? 'bg-green-500/10' : 'bg-green-50') :
                    activity.type === 'revenue' ? (isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-50') :
                    activity.type === 'order' ? (isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50') :
                    activity.type === 'success' ? (isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50') :
                    (isDarkMode ? 'bg-red-500/10' : 'bg-red-50');

                  return (
                    <div 
                      key={activity.id} 
                      className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50"
                    >
                      <div className={`p-2 rounded-full ${bgColor} flex-shrink-0`}>
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
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Daily sales comparison (last 7 days)
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={mockQuickStats}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                    />
                    <XAxis 
                      dataKey="name" 
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
                        borderRadius: '6px',
                        color: isDarkMode ? '#ffffff' : '#000000'
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Sales']}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {mockQuickStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className={`text-center p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Avg Daily
                    </div>
                    <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${(mockQuickStats.reduce((sum, stat) => sum + stat.value, 0) / mockQuickStats.length).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div className={`text-center p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Peak Day
                    </div>
                    <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {mockQuickStats.reduce((max, stat) => stat.value > max.value ? stat : max).name}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Goals Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockGoals.map((goal) => {
                  const percentage = Math.min((goal.current / goal.target) * 100, 100);
                  
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {goal.label}
                        </span>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className={`h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                      />
                      <div className="flex justify-between items-center">
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
                        </span>
                        <span className={`text-xs font-medium ${
                          percentage >= 100 
                            ? 'text-green-500' 
                            : percentage >= 75 
                            ? 'text-blue-500' 
                            : percentage >= 50 
                            ? 'text-yellow-500' 
                            : 'text-red-500'
                        }`}>
                          {percentage >= 100 
                            ? '✓ Complete' 
                            : `${(goal.target - goal.current).toLocaleString()} to go`
                          }
                        </span>
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