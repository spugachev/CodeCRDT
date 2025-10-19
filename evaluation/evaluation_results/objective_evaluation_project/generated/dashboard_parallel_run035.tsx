import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';



import { motion } from 'framer-motion';

import { motion } from 'framer-motion';

import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target } from 'lucide-react';

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { Clock, ShoppingCart, UserPlus, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';


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
interface ActivityItem {
  id: string;
  type: 'sale' | 'user' | 'alert' | 'success';
  message: string;
  timestamp: string;
  icon: 'cart' | 'user' | 'dollar' | 'alert' | 'check';
}

const mockActivityData: ActivityItem[] = [
  { id: '1', type: 'sale', message: 'New order #1234 received', timestamp: '2 minutes ago', icon: 'cart' },
  { id: '2', type: 'user', message: 'New user registration: john@example.com', timestamp: '5 minutes ago', icon: 'user' },
  { id: '3', type: 'success', message: 'Payment processed successfully', timestamp: '12 minutes ago', icon: 'check' },
  { id: '4', type: 'sale', message: 'Order #1233 shipped', timestamp: '18 minutes ago', icon: 'cart' },
  { id: '5', type: 'alert', message: 'Low stock alert: Premium Plan', timestamp: '25 minutes ago', icon: 'alert' },
  { id: '6', type: 'user', message: 'User upgraded to Pro Plan', timestamp: '32 minutes ago', icon: 'dollar' },
  { id: '7', type: 'success', message: 'Database backup completed', timestamp: '45 minutes ago', icon: 'check' },
  { id: '8', type: 'sale', message: 'New order #1232 received', timestamp: '1 hour ago', icon: 'cart' },
  { id: '9', type: 'user', message: 'New user registration: sarah@example.com', timestamp: '1 hour ago', icon: 'user' },
  { id: '10', type: 'success', message: 'System update completed', timestamp: '2 hours ago', icon: 'check' }
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
  { id: '3', product: 'Enterprise Plan', sales: 89, revenue: 17800, status: 'active' },
  { id: '4', product: 'Starter Plan', sales: 432, revenue: 4320, status: 'pending' },
  { id: '5', product: 'Pro Plan', sales: 156, revenue: 15600, status: 'active' }
];
const mockQuickStats = [
  { id: '1', label: 'Goal Completion', value: 78, target: 100, icon: Target, color: 'bg-blue-500' },
  { id: '2', label: 'Customer Satisfaction', value: 92, target: 100, icon: Users, color: 'bg-green-500' },
  { id: '3', label: 'Order Fulfillment', value: 85, target: 100, icon: ShoppingCart, color: 'bg-purple-500' },
  { id: '4', label: 'Revenue Target', value: 67, target: 100, icon: DollarSign, color: 'bg-orange-500' }
];
const ActivityFeed = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [activities] = useState<ActivityItem[]>(mockActivityData);

  const getActivityIcon = (icon: ActivityItem['icon']) => {
    const iconClass = "h-4 w-4";
    switch (icon) {
      case 'cart':
        return <ShoppingCart className={iconClass} />;
      case 'user':
        return <UserPlus className={iconClass} />;
      case 'dollar':
        return <DollarSign className={iconClass} />;
      case 'alert':
        return <AlertCircle className={iconClass} />;
      case 'check':
        return <CheckCircle className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'sale':
        return isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600';
      case 'user':
        return isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600';
      case 'alert':
        return isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-600';
      case 'success':
        return isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600';
      default:
        return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
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
            <div className="flex items-center gap-1 mt-1">
              <Clock className={`h-3 w-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {activity.timestamp}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
const mockPieData = [
  { category: 'Premium Plan', value: 23400, color: '#3b82f6' },
  { category: 'Enterprise Plan', value: 17800, color: '#8b5cf6' },
  { category: 'Pro Plan', value: 15600, color: '#10b981' },
  { category: 'Basic Plan', value: 11340, color: '#f59e0b' },
  { category: 'Starter Plan', value: 4320, color: '#ef4444' }
];

const PieChart = ({ data, isDarkMode }: { data: typeof mockPieData, isDarkMode: boolean }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const size = 200;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = 80;
  const innerRadius = 50;

  let currentAngle = -90;
  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');

    return {
      ...item,
      pathData,
      percentage: percentage.toFixed(1)
    };
  });

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((segment, index) => (
            <motion.path
              key={segment.category}
              d={segment.pathData}
              fill={segment.color}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ${(total / 1000).toFixed(1)}k
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Revenue
          </div>
        </div>
      </div>

      <div className="w-full space-y-2">
        {segments.map((segment, index) => (
          <motion.div
            key={segment.category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {segment.category}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ${(segment.value / 1000).toFixed(1)}k
              </span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                ({segment.percentage}%)
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

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
      
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-xs mt-2">
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
          className={`absolute z-10 px-3 py-2 rounded-lg shadow-lg transition-all duration-200 ${
            isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'
          }`}
          style={{
            left: `${getX(hoveredPoint)}%`,
            top: `${(getY(data[hoveredPoint].revenue) / chartHeight) * 100}%`,
            transform: 'translate(-50%, -120%)',
          }}
        >
          <div className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ${data[hoveredPoint].revenue.toLocaleString()}
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {new Date(data[hoveredPoint].date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <div className={`text-xs flex items-center gap-1 mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
            <TrendingUp className="h-3 w-3" />
            <span>{data[hoveredPoint].users} users</span>
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

export default function AnalyticsDashboard() {
  const [sortColumn, setSortColumn] = useState<keyof TableRow>('revenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>(mockMetrics);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(mockChartData);
  const [tableData, setTableData] = useState<TableRow[]>(mockTableData);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const sortedData = [...tableData].sort((a, b) => {
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

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: TableRow['status']) => {
    const variants = {
      active: 'bg-green-500/10 text-green-500 border-green-500/20',
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      inactive: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    };
    
    return (
      <Badge variant="outline" className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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
    }, 1500);</parameter>
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
              <CardTitle className={isDarkMode ? 'text-white' : ''}>User Activity</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Active users over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <svg width="100%" height="100%" viewBox="0 0 700 300" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="userGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  
                  {/* Generate path for area chart */}
                  <motion.path
                    d={(() => {
                      const maxUsers = Math.max(...chartData.map(d => d.users));
                      const width = 700;
                      const height = 300;
                      const padding = 20;
                      const points = chartData.map((d, i) => {
                        const x = (i / (chartData.length - 1)) * (width - 2 * padding) + padding;
                        const y = height - padding - ((d.users / maxUsers) * (height - 2 * padding));
                        return `${x},${y}`;
                      });
                      const pathData = `M ${padding},${height - padding} L ${points[0]} ${points.slice(1).map(p => `L ${p}`).join(' ')} L ${width - padding},${height - padding} Z`;
                      return pathData;
                    })()}
                    fill="url(#userGradient)"
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: 1, pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  
                  {/* Line on top of area */}
                  <motion.polyline
                    points={(() => {
                      const maxUsers = Math.max(...chartData.map(d => d.users));
                      const width = 700;
                      const height = 300;
                      const padding = 20;
                      return chartData.map((d, i) => {
                        const x = (i / (chartData.length - 1)) * (width - 2 * padding) + padding;
                        const y = height - padding - ((d.users / maxUsers) * (height - 2 * padding));
                        return `${x},${y}`;
                      }).join(' ');
                    })()}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  
                  {/* Data points */}
                  {chartData.map((d, i) => {
                    const maxUsers = Math.max(...chartData.map(d => d.users));
                    const width = 700;
                    const height = 300;
                    const padding = 20;
                    const x = (i / (chartData.length - 1)) * (width - 2 * padding) + padding;
                    const y = height - padding - ((d.users / maxUsers) * (height - 2 * padding));
                    
                    return (
                      <motion.g key={i}>
                        <motion.circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#3b82f6"
                          stroke="white"
                          strokeWidth="2"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1 * i, duration: 0.3 }}
                          whileHover={{ scale: 1.5 }}
                          style={{ cursor: 'pointer' }}
                        />
                        <title>{`${d.date}: ${d.users} users`}</title>
                      </motion.g>
                    );
                  })}
                </svg>
                
                {/* Legend and stats */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Active Users
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-green-500">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      +{((chartData[chartData.length - 1].users - chartData[0].users) / chartData[0].users * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
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
              <PieChart data={mockPieData} isDarkMode={isDarkMode} />
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
              <div className="rounded-md border border-gray-200 dark:border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className={isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : ''}>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          size="sm"
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
                          size="sm"
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
                          size="sm"
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
                          size="sm"
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
                        className={isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : ''}
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
                          {getStatusBadge(row.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} products
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
                    <ChevronRight className="h-4 w-4" />
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
              <ActivityFeed isDarkMode={isDarkMode} />
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
              <div className="space-y-4">
                {mockQuickStats.map((stat, index) => {
                  const Icon = stat.icon;
                  const percentage = (stat.value / stat.target) * 100;
                  
                  return (
                    <motion.div
                      key={stat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${stat.color}`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {stat.label}
                            </p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              {stat.value} / {stat.target}
                            </p>
                          </div>
                        </div>
                        <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 + 0.2, ease: "easeOut" }}
                          className={`h-full ${stat.color}`}
                        />
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