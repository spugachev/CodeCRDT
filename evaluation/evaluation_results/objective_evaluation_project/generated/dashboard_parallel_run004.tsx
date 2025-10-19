import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { CheckCircle, AlertCircle, UserPlus, ShoppingBag, DollarSign, Settings } from 'lucide-react';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { motion } from 'framer-motion';




import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target } from 'lucide-react';

import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
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
interface GoalData {
  id: string;
  label: string;
  current: number;
  target: number;
  icon: React.ReactNode;
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
interface ActivityItem {
  id: string;
  type: 'success' | 'warning' | 'info' | 'purchase';
  message: string;
  timestamp: string;
  icon: 'check' | 'alert' | 'user' | 'shopping' | 'dollar' | 'settings';
}

const mockActivityData: ActivityItem[] = [
  { id: '1', type: 'success', message: 'New order completed', timestamp: '2 minutes ago', icon: 'check' },
  { id: '2', type: 'info', message: 'New user registered', timestamp: '5 minutes ago', icon: 'user' },
  { id: '3', type: 'purchase', message: 'Premium plan purchased', timestamp: '12 minutes ago', icon: 'shopping' },
  { id: '4', type: 'success', message: 'Payment received', timestamp: '18 minutes ago', icon: 'dollar' },
  { id: '5', type: 'warning', message: 'Low inventory alert', timestamp: '25 minutes ago', icon: 'alert' },
  { id: '6', type: 'info', message: 'Settings updated', timestamp: '32 minutes ago', icon: 'settings' },
  { id: '7', type: 'success', message: 'Order #1234 shipped', timestamp: '45 minutes ago', icon: 'check' },
  { id: '8', type: 'purchase', message: 'Enterprise plan upgraded', timestamp: '1 hour ago', icon: 'shopping' },
  { id: '9', type: 'info', message: '5 new users registered', timestamp: '1 hour ago', icon: 'user' },
  { id: '10', type: 'success', message: 'Monthly goal achieved', timestamp: '2 hours ago', icon: 'check' }
];
const mockGoals: GoalData[] = [
  { 
    id: '1', 
    label: 'Revenue Target', 
    current: 45231, 
    target: 50000, 
    icon: <DollarSign className="h-4 w-4" />,
    color: 'bg-green-500'
  },
  { 
    id: '2', 
    label: 'User Acquisition', 
    current: 2350, 
    target: 3000, 
    icon: <Users className="h-4 w-4" />,
    color: 'bg-blue-500'
  },
  { 
    id: '3', 
    label: 'Order Volume', 
    current: 1543, 
    target: 2000, 
    icon: <ShoppingCart className="h-4 w-4" />,
    color: 'bg-purple-500'
  },
  { 
    id: '4', 
    label: 'Conversion Goal', 
    current: 324, 
    target: 400, 
    icon: <Target className="h-4 w-4" />,
    color: 'bg-orange-500'
  }
];

const mockQuickStats = [
  { label: 'Today', value: 3200, color: 'bg-blue-500' },
  { label: 'Yesterday', value: 2800, color: 'bg-purple-500' },
  { label: 'This Week', value: 18500, color: 'bg-green-500' },
  { label: 'Last Week', value: 16200, color: 'bg-orange-500' }
];

const RevenueChart = ({ data, isDarkMode }: { data: ChartDataPoint[], isDarkMode: boolean }) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const minRevenue = Math.min(...data.map(d => d.revenue));
  const revenueRange = maxRevenue - minRevenue;

  const getYPosition = (value: number) => {
    const padding = 20;
    const chartHeight = 200;
    const normalizedValue = (value - minRevenue) / revenueRange;
    return chartHeight - (normalizedValue * (chartHeight - padding * 2)) - padding;
  };

  const chartWidth = 100;
  const pointSpacing = chartWidth / (data.length - 1);

  const pathData = data.map((point, index) => {
    const x = index * pointSpacing;
    const y = getYPosition(point.revenue);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const areaPathData = `${pathData} L ${chartWidth} 200 L 0 200 Z`;

  return (
    <div className="relative w-full h-[250px]">
      <svg
        viewBox={`0 0 ${chartWidth} 200`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDarkMode ? "#3b82f6" : "#2563eb"} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isDarkMode ? "#3b82f6" : "#2563eb"} stopOpacity="0.05" />
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
          stroke={isDarkMode ? "#3b82f6" : "#2563eb"}
          strokeWidth="0.5"
          className="transition-all duration-300"
        />

        {data.map((point, index) => {
          const x = index * pointSpacing;
          const y = getYPosition(point.revenue);
          const isHovered = hoveredPoint === index;

          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r={isHovered ? "1.5" : "1"}
                fill={isDarkMode ? "#3b82f6" : "#2563eb"}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {isHovered && (
                <circle
                  cx={x}
                  cy={y}
                  r="2.5"
                  fill="none"
                  stroke={isDarkMode ? "#3b82f6" : "#2563eb"}
                  strokeWidth="0.3"
                  opacity="0.5"
                />
              )}
            </g>
          );
        })}
      </svg>

      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-xs">
        {data.map((point, index) => (
          <span
            key={index}
            className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} ${
              index % 2 === 1 ? 'hidden sm:inline' : ''
            }`}
          >
            {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        ))}
      </div>

      {hoveredPoint !== null && (
        <div
          className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-3 py-2 rounded-lg shadow-lg ${
            isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'
          } transition-all duration-200 z-10`}
        >
          <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
            {new Date(data[hoveredPoint].date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-1`}>
            ${data[hoveredPoint].revenue.toLocaleString()}
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
            {data[hoveredPoint].users} users • {data[hoveredPoint].orders} orders
          </div>
        </div>
      )}
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
const UserAreaChart = ({ data, isDarkMode }: { data: ChartDataPoint[], isDarkMode: boolean }) => {
  const maxUsers = Math.max(...data.map(d => d.users));
  const minUsers = Math.min(...data.map(d => d.users));
  const padding = 40;
  const width = 600;
  const height = 300;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((point.users - minUsers) / (maxUsers - minUsers)) * chartHeight;
    return { x, y, ...point };
  });

  const pathD = points.reduce((acc, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `${acc} L ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`;

  const gradientId = 'userGradient';

  return (
    <div className="relative w-full" style={{ height: '300px' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDarkMode ? '#3b82f6' : '#60a5fa'} stopOpacity="0.8" />
            <stop offset="100%" stopColor={isDarkMode ? '#3b82f6' : '#60a5fa'} stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <motion.path
          d={areaD}
          fill={`url(#${gradientId})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        <motion.path
          d={pathD}
          fill="none"
          stroke={isDarkMode ? '#3b82f6' : '#2563eb'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />

        {points.map((point, index) => (
          <g key={index}>
            <motion.circle
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === index ? 6 : 4}
              fill={isDarkMode ? '#3b82f6' : '#2563eb'}
              stroke={isDarkMode ? '#1e293b' : '#ffffff'}
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            />
            {hoveredIndex === index && (
              <g>
                <rect
                  x={point.x - 50}
                  y={point.y - 50}
                  width="100"
                  height="40"
                  rx="6"
                  fill={isDarkMode ? '#1e293b' : '#ffffff'}
                  stroke={isDarkMode ? '#475569' : '#e5e7eb'}
                  strokeWidth="1"
                  filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
                />
                <text
                  x={point.x}
                  y={point.y - 35}
                  textAnchor="middle"
                  className={`text-xs font-semibold ${isDarkMode ? 'fill-gray-300' : 'fill-gray-600'}`}
                >
                  {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </text>
                <text
                  x={point.x}
                  y={point.y - 20}
                  textAnchor="middle"
                  className={`text-sm font-bold ${isDarkMode ? 'fill-blue-400' : 'fill-blue-600'}`}
                >
                  {point.users.toLocaleString()} users
                </text>
              </g>
            )}
          </g>
        ))}

        <line
          x1={padding}
          y1={padding + chartHeight}
          x2={width - padding}
          y2={padding + chartHeight}
          stroke={isDarkMode ? '#374151' : '#e5e7eb'}
          strokeWidth="1"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={padding + chartHeight}
          stroke={isDarkMode ? '#374151' : '#e5e7eb'}
          strokeWidth="1"
        />
      </svg>
    </div>
  );
};

export default function AnalyticsDashboard() {
  const [sortColumn, setSortColumn] = useState<keyof TableRow>('revenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>(mockMetrics);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(mockChartData);
  const [tableData, setTableData] = useState<TableRow[]>(mockTableData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activityData] = useState<ActivityItem[]>(mockActivityData);

  const getActivityIcon = (icon: ActivityItem['icon']) => {
    const iconClass = "h-4 w-4";
    switch (icon) {
      case 'check':
        return <CheckCircle className={iconClass} />;
      case 'alert':
        return <AlertCircle className={iconClass} />;
      case 'user':
        return <UserPlus className={iconClass} />;
      case 'shopping':
        return <ShoppingBag className={iconClass} />;
      case 'dollar':
        return <DollarSign className={iconClass} />;
      case 'settings':
        return <Settings className={iconClass} />;
      default:
        return <CheckCircle className={iconClass} />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success':
        return isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700';
      case 'warning':
        return isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700';
      case 'info':
        return isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700';
      case 'purchase':
        return isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700';
      default:
        return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleSort = useCallback((column: keyof TableRow) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  }, [sortColumn]);

  const sortedTableData = [...tableData].sort((a, b) => {
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

  const totalPages = Math.ceil(sortedTableData.length / itemsPerPage);
  const paginatedData = sortedTableData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: TableRow['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'inactive':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const pieChartData = tableData.map(item => ({
    name: item.product,
    value: item.sales,
    revenue: item.revenue
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

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
            const IconComponent = getMetricIcon(metric.label);
            const isPositive = metric.trend === 'up';
            
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
                      <IconComponent className={`h-4 w-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatMetricValue(metric.label, metric.value)}
                    </div>
                    <div className="flex items-center mt-2">
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}{metric.change}%
                      </span>
                      <span className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        vs last period
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}</parameter>
</invoke>
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
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    />
                    <Legend 
                      wrapperStyle={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}
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
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                        borderRadius: '6px',
                        color: isDarkMode ? '#ffffff' : '#000000'
                      }}
                      formatter={(value: number, name: string, props: any) => [
                        `${value} sales ($${props.payload.revenue.toLocaleString()})`,
                        props.payload.name
                      ]}
                    />
                    <Legend
                      wrapperStyle={{
                        color: isDarkMode ? '#9ca3af' : '#4b5563'
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
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className={isDarkMode ? 'border-gray-700' : ''}>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('product')}
                          className="flex items-center gap-1 hover:bg-transparent p-0"
                        >
                          Product
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('sales')}
                          className="flex items-center gap-1 hover:bg-transparent p-0"
                        >
                          Sales
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('revenue')}
                          className="flex items-center gap-1 hover:bg-transparent p-0"
                        >
                          Revenue
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-1 hover:bg-transparent p-0"
                        >
                          Status
                          <ArrowUpDown className="h-4 w-4" />
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
                            variant={row.status === 'active' ? 'default' : 'secondary'}
                            className={`${getStatusColor(row.status)} text-white capitalize`}
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
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Page {currentPage} of {totalPages}
                  </span>
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
              <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {activityData.map((activity) => (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                      isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.icon)}
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
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockQuickStats.map((stat, index) => {
                  const maxValue = Math.max(...mockQuickStats.map(s => s.value));
                  const percentage = (stat.value / maxValue) * 100;
                  
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {stat.label}
                        </span>
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          ${stat.value.toLocaleString()}
                        </span>
                      </div>
                      <div className={`h-8 rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                          className={`h-full ${stat.color} flex items-center justify-end px-3`}
                        >
                          <span className="text-xs font-semibold text-white">
                            {percentage.toFixed(0)}%
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Goals Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockGoals.map((goal, index) => {
                  const percentage = Math.min((goal.current / goal.target) * 100, 100);
                  const isComplete = percentage >= 100;
                  
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${goal.color} bg-opacity-10`}>
                            <div className={`${goal.color.replace('bg-', 'text-')}`}>
                              {goal.icon}
                            </div>
                          </div>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            {goal.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
                          </span>
                          <span className={`text-sm font-semibold ${
                            isComplete 
                              ? 'text-green-500' 
                              : percentage >= 75 
                                ? 'text-blue-500' 
                                : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <Progress 
                          value={percentage} 
                          className={`h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                        />
                        {isComplete && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -right-1 -top-1"
                          >
                            <div className="bg-green-500 rounded-full p-0.5">
                              <Target className="h-3 w-3 text-white" />
                            </div>
                          </motion.div>
                        )}
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