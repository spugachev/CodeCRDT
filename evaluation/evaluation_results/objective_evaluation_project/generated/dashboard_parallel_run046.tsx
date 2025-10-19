import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target }, AlertCircle, AlertTriangle, Info, X
import { CheckCircle, AlertCircle, UserPlus, Package, CreditCard, Clock } from 'lucide-react';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';


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
  severity: 'error' | 'warning' | 'info';
  timestamp: string;
}
interface ActivityItem {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
  timestamp: string;
  icon: 'check' | 'alert' | 'user' | 'package' | 'card' | 'clock';
}

const mockActivityData: ActivityItem[] = [
  { id: '1', type: 'success', message: 'New order placed - Premium Plan', timestamp: '2 min ago', icon: 'check' },
  { id: '2', type: 'info', message: 'User registered - john@example.com', timestamp: '15 min ago', icon: 'user' },
  { id: '3', type: 'success', message: 'Payment received - $450.00', timestamp: '32 min ago', icon: 'card' },
  { id: '4', type: 'warning', message: 'Low stock alert - Starter Plan', timestamp: '1 hour ago', icon: 'alert' },
  { id: '5', type: 'info', message: 'Package shipped - Order #1234', timestamp: '2 hours ago', icon: 'package' },
  { id: '6', type: 'success', message: 'Subscription renewed - Enterprise', timestamp: '3 hours ago', icon: 'check' }
];

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
  { id: '1', message: 'Server response time increased by 25%', severity: 'warning', timestamp: '5 min ago' },
  { id: '2', message: 'Payment gateway integration successful', severity: 'info', timestamp: '12 min ago' },
  { id: '3', message: 'Critical: Database backup failed', severity: 'error', timestamp: '18 min ago' },
  { id: '4', message: 'New user registration spike detected', severity: 'info', timestamp: '25 min ago' },
  { id: '5', message: 'API rate limit approaching threshold', severity: 'warning', timestamp: '32 min ago' }
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
  },
  {
    id: '4',
    label: 'Page Views',
    value: '45.2K',
    change: 22.7,
    sparklineData: [
      { value: 35 },
      { value: 38 },
      { value: 42 },
      { value: 40 },
      { value: 43 },
      { value: 44 },
      { value: 45 }
    ]
  }
];
const mockPieData = [
  { name: 'Premium Plan', value: 234, color: '#3b82f6' },
  { name: 'Basic Plan', value: 567, color: '#10b981' },
  { name: 'Enterprise Plan', value: 89, color: '#f59e0b' },
  { name: 'Starter Plan', value: 432, color: '#8b5cf6' },
  { name: 'Pro Plan', value: 156, color: '#ec4899' }
];

const getActivityIcon = (icon: string, isDark: boolean) => {
  const iconClass = `h-4 w-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  switch (icon) {
    case 'check':
      return <CheckCircle className={iconClass} />;
    case 'alert':
      return <AlertCircle className={iconClass} />;
    case 'user':
      return <UserPlus className={iconClass} />;
    case 'package':
      return <Package className={iconClass} />;
    case 'card':
      return <CreditCard className={iconClass} />;
    case 'clock':
      return <Clock className={iconClass} />;
    default:
      return <CheckCircle className={iconClass} />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-500';
    case 'warning':
      return 'bg-yellow-500';
    case 'info':
      return 'bg-blue-500';
    case 'error':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};
const UserChart = ({ data, isDarkMode }: { data: ChartDataPoint[], isDarkMode: boolean }) => {
  const maxUsers = Math.max(...data.map(d => d.users));
  const minUsers = Math.min(...data.map(d => d.users));
  const range = maxUsers - minUsers;
  const padding = range * 0.2;
  const chartMax = maxUsers + padding;
  const chartMin = Math.max(0, minUsers - padding);
  const chartRange = chartMax - chartMin;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((point.users - chartMin) / chartRange) * 100;
    return { x, y, ...point };
  });

  const pathD = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L 100 100 L 0 100 Z`;

  const gradientId = `userGradient-${isDarkMode ? 'dark' : 'light'}`;

  return (
    <div className="relative w-full h-64">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDarkMode ? '#3b82f6' : '#60a5fa'} stopOpacity="0.8" />
            <stop offset="50%" stopColor={isDarkMode ? '#3b82f6' : '#60a5fa'} stopOpacity="0.4" />
            <stop offset="100%" stopColor={isDarkMode ? '#3b82f6' : '#60a5fa'} stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <motion.path
          d={areaD}
          fill={`url(#${gradientId})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        <motion.path
          d={pathD}
          fill="none"
          stroke={isDarkMode ? '#3b82f6' : '#2563eb'}
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
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
            fill={isDarkMode ? '#3b82f6' : '#2563eb'}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="cursor-pointer"
            style={{ transformOrigin: `${point.x}px ${point.y}px` }}
          />
        ))}
      </svg>

      <div className="absolute inset-0 pointer-events-none">
        {points.map((point, index) => (
          <motion.div
            key={index}
            className="absolute pointer-events-auto"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {hoveredIndex === index && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`absolute bottom-full mb-2 px-3 py-2 rounded-lg shadow-lg whitespace-nowrap ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                }`}
                style={{ transform: 'translateX(-50%)' }}
              >
                <div className="text-xs font-semibold">{point.users.toLocaleString()} users</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <div className={`flex justify-between mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {data.map((point, index) => (
          index % Math.ceil(data.length / 4) === 0 && (
            <span key={index}>
              {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )
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

type SortField = 'product' | 'sales' | 'revenue' | 'status';
type SortDirection = 'asc' | 'desc';

const DataTable = ({ 
  data, 
  isDarkMode 
}: { 
  data: TableRow[]; 
  isDarkMode: boolean;
}) => {
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: TableRow['status']) => {
    const variants = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };

    return (
      <Badge className={variants[status]} variant="secondary">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <th className={`text-left p-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <button
                  onClick={() => handleSort('product')}
                  className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                >
                  Product
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className={`text-left p-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <button
                  onClick={() => handleSort('sales')}
                  className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                >
                  Sales
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className={`text-left p-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <button
                  onClick={() => handleSort('revenue')}
                  className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                >
                  Revenue
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
              <th className={`text-left p-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                >
                  Status
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}
              >
                <td className={`p-3 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {row.product}
                </td>
                <td className={`p-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {row.sales.toLocaleString()}
                </td>
                <td className={`p-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  ${row.revenue.toLocaleString()}
                </td>
                <td className="p-3">
                  {getStatusBadge(row.status)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {paginatedData.map((row, index) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-750 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {row.product}
              </h3>
              {getStatusBadge(row.status)}
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
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} results
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
  );
};

export default function AnalyticsDashboard() {
  const [pieData] = useState(mockPieData);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>(mockMetrics);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(mockChartData);
  const [tableData, setTableData] = useState<TableRow[]>(mockTableData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

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

  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  const getAlertIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertStyles = (severity: Alert['severity']) => {
    const baseStyles = 'p-3 rounded-lg border flex items-start gap-3 mb-3';
    switch (severity) {
      case 'error':
        return `${baseStyles} ${isDarkMode ? 'bg-red-950 border-red-800' : 'bg-red-50 border-red-200'}`;
      case 'warning':
        return `${baseStyles} ${isDarkMode ? 'bg-yellow-950 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`;
      case 'info':
        return `${baseStyles} ${isDarkMode ? 'bg-blue-950 border-blue-800' : 'bg-blue-50 border-blue-200'}`;
    }
  };

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
            const IconComponent = getMetricIcon(metric.label);
            const isPositive = metric.trend === 'up';
            
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
                      <IconComponent className={`h-4 w-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
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
              <UserChart data={chartData} isDarkMode={isDarkMode} />
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
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {pieData.map((entry, index) => (
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
                    animationDuration={800}
                  />
                  <Bar 
                    dataKey="users" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                  />
                  <Bar 
                    dataKey="orders" 
                    fill="#f59e0b" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
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
            <DataTable data={tableData} isDarkMode={isDarkMode} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActivityData.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className="flex items-start gap-3"
                  >
                    <div className={`mt-1 rounded-full p-2 ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.icon, isDarkMode)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {activity.message}
                      </p>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {activity.timestamp}
                      </p>
                    </div>
                  </motion.div>
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
                {mockQuickStats.map((stat, index) => (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
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
                            animationDuration={1000}
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
            <CardContent>              <div className="space-y-2">
                {alerts.length === 0 ? (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Info className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No alerts at this time</p>
                  </div>
                ) : (
                  alerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className={getAlertStyles(alert.severity)}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getAlertIcon(alert.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {alert.message}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {alert.timestamp}
                        </p>
                      </div>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className={`flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors ${
                          isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                        }`}
                        aria-label="Dismiss alert"
                      >
                        <X className="h-4 w-4" />
                      </button>
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