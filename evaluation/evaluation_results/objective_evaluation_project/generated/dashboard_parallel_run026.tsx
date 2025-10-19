import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, ShoppingCart, UserPlus, CreditCard, Package } from 'lucide-react';


import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target } from 'lucide-react';
import { BarChart3 } from 'lucide-react';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target } from 'lucide-react'
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';;
import { motion } from 'framer-motion';

const UserAreaChart = ({ data, isDarkMode }: { data: ChartDataPoint[], isDarkMode: boolean }) => {
  const maxUsers = Math.max(...data.map(d => d.users));
  const minUsers = Math.min(...data.map(d => d.users));
  const range = maxUsers - minUsers;
  const padding = range * 0.2;
  const chartHeight = 200;
  const chartWidth = 100;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * chartWidth;
    const y = chartHeight - ((point.users - minUsers + padding) / (range + padding * 2)) * chartHeight;
    return { x, y, ...point };
  });

  const pathD = points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `${path} L ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <div className="relative w-full h-[200px]">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full" preserveAspectRatio="none">
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
          <motion.g key={index}>
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="1"
              fill="#3b82f6"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            />
          </motion.g>
        ))}
      </svg>
      
      <div className="flex justify-between mt-4 text-xs">
        {data.map((point, index) => (
          index % Math.ceil(data.length / 4) === 0 && (
            <span key={index} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )
        ))}
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current</p>
          <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {data[data.length - 1].users.toLocaleString()}
          </p>
        </div>
        <div>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Peak</p>
          <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {maxUsers.toLocaleString()}
          </p>
        </div>
        <div>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Growth</p>
          <p className="text-lg font-semibold text-blue-500">
            +{(((data[data.length - 1].users - data[0].users) / data[0].users) * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

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
  severity: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    severity: 'error',
    title: 'Server Error',
    message: 'Failed to sync data with backup server',
    timestamp: '2 min ago'
  },
  {
    id: '2',
    severity: 'warning',
    title: 'High Traffic',
    message: 'Server load at 85% capacity',
    timestamp: '15 min ago'
  },
  {
    id: '3',
    severity: 'info',
    title: 'Update Available',
    message: 'New dashboard features are ready',
    timestamp: '1 hour ago'
  },
  {
    id: '4',
    severity: 'warning',
    title: 'Low Inventory',
    message: 'Premium Plan stock below threshold',
    timestamp: '2 hours ago'
  }
];

const mockQuickStats = [
  { 
    id: '1', 
    label: 'Avg Order Value', 
    value: '$142', 
    change: 15.3, 
    trend: 'up' as const,
    icon: DollarSign,
    sparklineData: [120, 135, 128, 145, 138, 152, 142]
  },
  { 
    id: '2', 
    label: 'Customer Retention', 
    value: '87%', 
    change: 3.2, 
    trend: 'up' as const,
    icon: Users,
    sparklineData: [82, 83, 85, 84, 86, 85, 87]
  },
  { 
    id: '3', 
    label: 'Cart Abandonment', 
    value: '23%', 
    change: -5.1, 
    trend: 'down' as const,
    icon: ShoppingCart,
    sparklineData: [28, 27, 26, 25, 24, 24, 23]
  },
  { 
    id: '4', 
    label: 'Goal Completion', 
    value: '94%', 
    change: 8.7, 
    trend: 'up' as const,
    icon: Target,
    sparklineData: [85, 87, 89, 90, 91, 93, 94]
  }
];

const Sparkline = ({ data, trend, isDarkMode }: { data: number[], trend: 'up' | 'down', isDarkMode: boolean }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const pathD = `M ${points.split(' ').map((point, i) => {
    const [x, y] = point.split(',');
    return i === 0 ? `${x} ${y}` : `L ${x} ${y}`;
  }).join(' ')}`;

  return (
    <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
      <motion.path
        d={pathD}
        fill="none"
        stroke={trend === 'up' ? (isDarkMode ? '#10b981' : '#059669') : (isDarkMode ? '#ef4444' : '#dc2626')}
        strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
    </svg>
  );
};
interface ActivityItem {
  id: string;
  type: 'sale' | 'user' | 'order' | 'payment';
  message: string;
  timestamp: string;
  icon: any;
  color: string;
}

const mockActivityData: ActivityItem[] = [
  {
    id: '1',
    type: 'sale',
    message: 'New sale: Premium Plan',
    timestamp: '2 minutes ago',
    icon: TrendingUp,
    color: 'text-green-500'
  },
  {
    id: '2',
    type: 'user',
    message: 'New user registered',
    timestamp: '5 minutes ago',
    icon: UserPlus,
    color: 'text-blue-500'
  },
  {
    id: '3',
    type: 'order',
    message: 'Order #1234 completed',
    timestamp: '12 minutes ago',
    icon: ShoppingCart,
    color: 'text-purple-500'
  },
  {
    id: '4',
    type: 'payment',
    message: 'Payment received: $450',
    timestamp: '18 minutes ago',
    icon: CreditCard,
    color: 'text-emerald-500'
  },
  {
    id: '5',
    type: 'order',
    message: 'New order placed',
    timestamp: '25 minutes ago',
    icon: Package,
    color: 'text-orange-500'
  },
  {
    id: '6',
    type: 'sale',
    message: 'Enterprise Plan upgraded',
    timestamp: '32 minutes ago',
    icon: TrendingUp,
    color: 'text-green-500'
  }
];

const RevenueChart = ({ data, isDarkMode }: { data: ChartDataPoint[], isDarkMode: boolean }) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const minRevenue = Math.min(...data.map(d => d.revenue));
  const revenueRange = maxRevenue - minRevenue;
  
  const chartWidth = 100;
  const chartHeight = 100;
  const padding = 10;
  
  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * (chartWidth - 2 * padding);
    const y = chartHeight - padding - ((point.revenue - minRevenue) / revenueRange) * (chartHeight - 2 * padding);
    return { x, y, ...point };
  });
  
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  
  const areaPath = `${pathData} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;
  
  return (
    <div className="relative w-full h-64 md:h-80">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDarkMode ? "#3b82f6" : "#2563eb"} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isDarkMode ? "#3b82f6" : "#2563eb"} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        <motion.path
          d={areaPath}
          fill="url(#revenueGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        
        <motion.path
          d={pathData}
          fill="none"
          stroke={isDarkMode ? "#3b82f6" : "#2563eb"}
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
        
        {points.map((point, index) => (
          <g key={index}>
            <motion.circle
              cx={point.x}
              cy={point.y}
              r={hoveredPoint === index ? "1.5" : "0.8"}
              fill={isDarkMode ? "#3b82f6" : "#2563eb"}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              onMouseEnter={() => setHoveredPoint(index)}
              onMouseLeave={() => setHoveredPoint(null)}
              className="cursor-pointer transition-all"
              style={{ transformOrigin: `${point.x}px ${point.y}px` }}
            />
          </g>
        ))}
      </svg>
      
      {hoveredPoint !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute top-4 left-1/2 transform -translate-x-1/2 ${
            isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
          } px-4 py-2 rounded-lg shadow-lg border ${
            isDarkMode ? 'border-gray-600' : 'border-gray-200'
          } z-10`}
        >
          <div className="text-xs font-medium mb-1">
            {new Date(points[hoveredPoint].date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
          <div className="text-lg font-bold">
            ${points[hoveredPoint].revenue.toLocaleString()}
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {points[hoveredPoint].users} users • {points[hoveredPoint].orders} orders
          </div>
        </motion.div>
      )}
      
      <div className={`flex justify-between mt-2 px-2 text-xs ${
        isDarkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        <span>{new Date(data[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        <span>{new Date(data[data.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>
    </div>
  );
};


type SortField = 'product' | 'sales' | 'revenue' | 'status';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 3;

const QuickStats = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <div className="space-y-4">
      {mockQuickStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                }`}>
                  <Icon className={`h-4 w-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stat.label}
                  </p>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                stat.trend === 'up' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(stat.change)}%
              </div>
            </div>
            <Sparkline data={stat.sparklineData} trend={stat.trend} isDarkMode={isDarkMode} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default function AnalyticsDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>(mockMetrics);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(mockChartData);
  const [tableData, setTableData] = useState<TableRow[]>(mockTableData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);
  // Prepare pie chart data from table data
  const pieChartData = tableData.map(item => ({
    name: item.product,
    value: item.sales,
    revenue: item.revenue
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  }, [sortField]);

  const sortedTableData = useCallback(() => {
    const sorted = [...tableData].sort((a, b) => {
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
    return sorted;
  }, [tableData, sortField, sortDirection]);

  const paginatedData = useCallback(() => {
    const sorted = sortedTableData();
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sorted.slice(startIndex, endIndex);
  }, [sortedTableData, currentPage]);

  const totalPages = Math.ceil(tableData.length / ITEMS_PER_PAGE);

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

  const [hoveredBar, setHoveredBar] = useState<{ metric: string; value: number; date: string } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleBarHover = useCallback((metric: string, value: number, date: string, event: React.MouseEvent) => {
    setHoveredBar({ metric, value, date });
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  }, []);

  const handleBarLeave = useCallback(() => {
    setHoveredBar(null);
  }, []);

  const getMaxValue = useCallback(() => {
    const allValues = chartData.flatMap(d => [d.revenue, d.users * 10, d.orders * 10]);
    return Math.max(...allValues);
  }, [chartData]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    
    setTimeout(() => {
      // Generate updated mock metrics with random variations
      const updatedMetrics = mockMetrics.map(metric => ({
        ...metric,
        value: metric.value + Math.floor(Math.random() * 200 - 100),
        change: parseFloat((Math.random() * 20 - 5).toFixed(1)),
        trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down'
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
                      {metric.id === '1' || metric.id === '3' ? 
                        metric.value.toLocaleString() : 
                        metric.id === '4' ? 
                        `${metric.value}%` : 
                        metric.value.toLocaleString()
                      }
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
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Orders Distribution</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                By product category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
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
                        `${value} orders`,
                        props.payload.name
                      ]}
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

          <Card className={`lg:col-span-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Performance Metrics</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Combined view of key indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-80">
                {/* Chart Container */}
                <div className="flex items-end justify-between h-full gap-2 px-4">
                  {chartData.map((dataPoint, index) => {
                    const maxValue = getMaxValue();
                    const revenueHeight = (dataPoint.revenue / maxValue) * 100;
                    const usersHeight = ((dataPoint.users * 10) / maxValue) * 100;
                    const ordersHeight = ((dataPoint.orders * 10) / maxValue) * 100;

                    return (
                      <div key={dataPoint.date} className="flex-1 flex items-end justify-center gap-1 h-full">
                        <div className="flex items-end gap-0.5 h-full">
                          {/* Revenue Bar */}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${revenueHeight}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="w-6 bg-blue-500 rounded-t cursor-pointer hover:bg-blue-600 transition-colors relative"
                            onMouseEnter={(e) => handleBarHover('Revenue', dataPoint.revenue, dataPoint.date, e)}
                            onMouseMove={(e) => setTooltipPosition({ x: e.clientX, y: e.clientY })}
                            onMouseLeave={handleBarLeave}
                          />
                          
                          {/* Users Bar */}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${usersHeight}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 + 0.05 }}
                            className="w-6 bg-green-500 rounded-t cursor-pointer hover:bg-green-600 transition-colors relative"
                            onMouseEnter={(e) => handleBarHover('Users', dataPoint.users, dataPoint.date, e)}
                            onMouseMove={(e) => setTooltipPosition({ x: e.clientX, y: e.clientY })}
                            onMouseLeave={handleBarLeave}
                          />
                          
                          {/* Orders Bar */}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${ordersHeight}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 + 0.1 }}
                            className="w-6 bg-purple-500 rounded-t cursor-pointer hover:bg-purple-600 transition-colors relative"
                            onMouseEnter={(e) => handleBarHover('Orders', dataPoint.orders, dataPoint.date, e)}
                            onMouseMove={(e) => setTooltipPosition({ x: e.clientX, y: e.clientY })}
                            onMouseLeave={handleBarLeave}
                          />
                        </div>
                        
                        {/* Date Label */}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 -mb-6">
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(dataPoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Y-axis Labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs pr-2 -ml-12">
                  {[100, 75, 50, 25, 0].map((percent) => (
                    <span key={percent} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {Math.round((getMaxValue() * percent) / 100).toLocaleString()}
                    </span>
                  ))}
                </div>

                {/* Tooltip */}
                {hoveredBar && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`fixed z-50 px-3 py-2 rounded-lg shadow-lg pointer-events-none ${
                      isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                    }`}
                    style={{
                      left: tooltipPosition.x + 10,
                      top: tooltipPosition.y - 40,
                    }}
                  >
                    <div className="text-sm font-semibold">{hoveredBar.metric}</div>
                    <div className="text-xs">
                      {new Date(hoveredBar.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-sm font-bold mt-1">
                      {hoveredBar.metric === 'Revenue' 
                        ? `$${hoveredBar.value.toLocaleString()}`
                        : hoveredBar.value.toLocaleString()}
                    </div>
                  </motion.div>
                )}

                {/* Legend */}
                <div className="flex justify-center gap-6 mt-8">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Revenue
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Users
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Orders
                    </span>
                  </div>
                </div>
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
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
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
                    {paginatedData().map((row) => (
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

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {paginatedData().map((row) => (
                  <div
                    key={row.id}
                    className={`p-4 rounded-lg border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {row.product}
                      </h3>
                      <Badge
                        variant={getStatusBadgeVariant(row.status)}
                        className="capitalize"
                      >
                        {row.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Sales
                        </p>
                        <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {row.sales.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Revenue
                        </p>
                        <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          ${row.revenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, tableData.length)} of{' '}
                  {tableData.length} products
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={isDarkMode ? 'border-gray-700' : ''}
                  >
                    <ChevronLeft className="h-4 w-4" />
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
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="flex items-start gap-3"
                    >
                      <div className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex-shrink-0`}>
                        <Icon className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {activity.message}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {activity.timestamp}
                        </p>
                      </div>
                      <div className={`h-full w-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} absolute left-[22px] top-12 -z-10`} 
                           style={{ height: index === mockActivityData.length - 1 ? '0' : '100%' }} />
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
              <QuickStats isDarkMode={isDarkMode} />
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No active alerts</p>
                  </div>
                ) : (
                  alerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative p-4 rounded-lg border ${
                        isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-gray-200'
                      } ${
                        alert.severity === 'error'
                          ? 'border-l-4 border-l-red-500'
                          : alert.severity === 'warning'
                          ? 'border-l-4 border-l-yellow-500'
                          : 'border-l-4 border-l-blue-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {alert.severity === 'error' && (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                          {alert.severity === 'warning' && (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          )}
                          {alert.severity === 'info' && (
                            <Info className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`text-sm font-semibold ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {alert.title}
                                </h4>
                                <Badge
                                  variant={
                                    alert.severity === 'error'
                                      ? 'destructive'
                                      : alert.severity === 'warning'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {alert.severity}
                                </Badge>
                              </div>
                              <p className={`text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {alert.message}
                              </p>
                              <p className={`text-xs mt-1 ${
                                isDarkMode ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                                {alert.timestamp}
                              </p>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 flex-shrink-0"
                              onClick={() => dismissAlert(alert.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}