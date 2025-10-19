import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { ShoppingCart, UserPlus, DollarSign, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


import { motion } from 'framer-motion';

import { motion } from 'framer-motion';


import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';

import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target } from 'lucide-react';
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
interface ActivityItem {
  id: string;
  type: 'sale' | 'user' | 'order' | 'alert' | 'success';
  message: string;
  timestamp: string;
  icon: 'ShoppingCart' | 'UserPlus' | 'Package' | 'AlertCircle' | 'CheckCircle';
}

const mockActivityData: ActivityItem[] = [
  { id: '1', type: 'sale', message: 'New sale: Premium Plan', timestamp: '2 minutes ago', icon: 'ShoppingCart' },
  { id: '2', type: 'user', message: 'New user registered', timestamp: '5 minutes ago', icon: 'UserPlus' },
  { id: '3', type: 'success', message: 'Payment processed successfully', timestamp: '12 minutes ago', icon: 'CheckCircle' },
  { id: '4', type: 'order', message: 'Order #1234 shipped', timestamp: '23 minutes ago', icon: 'Package' },
  { id: '5', type: 'sale', message: 'New sale: Enterprise Plan', timestamp: '35 minutes ago', icon: 'ShoppingCart' },
  { id: '6', type: 'alert', message: 'Low stock alert: Starter Plan', timestamp: '1 hour ago', icon: 'AlertCircle' },
  { id: '7', type: 'user', message: 'New user registered', timestamp: '1 hour ago', icon: 'UserPlus' },
  { id: '8', type: 'success', message: 'Refund completed', timestamp: '2 hours ago', icon: 'CheckCircle' },
  { id: '9', type: 'order', message: 'Order #1235 delivered', timestamp: '3 hours ago', icon: 'Package' },
  { id: '10', type: 'sale', message: 'New sale: Pro Plan', timestamp: '4 hours ago', icon: 'ShoppingCart' }
];
interface AlertData {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
}

const mockAlerts: AlertData[] = [
  { id: '1', message: 'System backup completed successfully', severity: 'success', timestamp: '2 min ago' },
  { id: '2', message: 'High server load detected', severity: 'warning', timestamp: '15 min ago' },
  { id: '3', message: 'New user registration spike', severity: 'info', timestamp: '1 hour ago' },
  { id: '4', message: 'Payment gateway timeout', severity: 'error', timestamp: '2 hours ago' },
  { id: '5', message: 'Database optimization recommended', severity: 'warning', timestamp: '3 hours ago' }
];
interface QuickStatData {
  id: string;
  label: string;
  value: number;
  target: number;
  icon: any;
  color: string;
}

const mockQuickStats: QuickStatData[] = [
  { id: '1', label: 'Monthly Goal', value: 75, target: 100, icon: Target, color: 'blue' },
  { id: '2', label: 'Customer Satisfaction', value: 92, target: 100, icon: TrendingUp, color: 'green' },
  { id: '3', label: 'Response Time', value: 68, target: 100, icon: Zap, color: 'yellow' },
  { id: '4', label: 'Task Completion', value: 85, target: 100, icon: TrendingUp, color: 'purple' }
];
const mockPieData = [
  { category: 'Premium Plan', value: 23400, color: '#3b82f6' },
  { category: 'Enterprise Plan', value: 44500, color: '#8b5cf6' },
  { category: 'Pro Plan', value: 15600, color: '#10b981' },
  { category: 'Basic Plan', value: 11340, color: '#f59e0b' },
  { category: 'Starter Plan', value: 4320, color: '#ef4444' }
];

const PieChart = ({ data, isDarkMode }: { data: typeof mockPieData, isDarkMode: boolean }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  let currentAngle = -90;
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    
    return {
      ...item,
      percentage,
      startAngle,
      endAngle
    };
  });
  
  const createArcPath = (startAngle: number, endAngle: number, radius: number, innerRadius: number = 0) => {
    const start = polarToCartesian(100, 100, radius, endAngle);
    const end = polarToCartesian(100, 100, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    
    if (innerRadius > 0) {
      const innerStart = polarToCartesian(100, 100, innerRadius, endAngle);
      const innerEnd = polarToCartesian(100, 100, innerRadius, startAngle);
      
      return [
        'M', start.x, start.y,
        'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        'L', innerEnd.x, innerEnd.y,
        'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
        'Z'
      ].join(' ');
    }
    
    return [
      'M', 100, 100,
      'L', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'Z'
    ].join(' ');
  };
  
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };
  
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-full max-w-[280px] aspect-square">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {segments.map((segment, index) => {
            const isHovered = hoveredIndex === index;
            const radius = isHovered ? 85 : 80;
            const innerRadius = 40;
            
            return (
              <motion.g
                key={segment.category}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <motion.path
                  d={createArcPath(segment.startAngle, segment.endAngle, radius, innerRadius)}
                  fill={segment.color}
                  stroke={isDarkMode ? '#1f2937' : '#ffffff'}
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200"
                  animate={{
                    d: createArcPath(segment.startAngle, segment.endAngle, radius, innerRadius)
                  }}
                  transition={{ duration: 0.2 }}
                />
                {isHovered && (
                  <motion.text
                    x="100"
                    y="95"
                    textAnchor="middle"
                    className={`text-xs font-semibold ${isDarkMode ? 'fill-white' : 'fill-gray-900'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {segment.percentage.toFixed(1)}%
                  </motion.text>
                )}
              </motion.g>
            );
          })}
          <circle
            cx="100"
            cy="100"
            r="38"
            fill={isDarkMode ? '#1f2937' : '#ffffff'}
          />
          <text
            x="100"
            y="105"
            textAnchor="middle"
            className={`text-sm font-bold ${isDarkMode ? 'fill-white' : 'fill-gray-900'}`}
          >
            ${(total / 1000).toFixed(0)}k
          </text>
        </svg>
      </div>
      
      <div className="w-full space-y-2">
        {segments.map((segment, index) => (
          <motion.div
            key={segment.category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer ${
              hoveredIndex === index
                ? isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                : ''
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
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
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ${segment.value.toLocaleString()}
              </span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {segment.percentage.toFixed(1)}%
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
  
  const chartHeight = 250;
  const chartWidth = 100;
  const padding = 20;
  
  const getX = (index: number) => {
    return (index / (data.length - 1)) * (chartWidth - padding * 2) + padding;
  };
  
  const getY = (revenue: number) => {
    const normalized = (revenue - minRevenue) / revenueRange;
    return chartHeight - (normalized * (chartHeight - padding * 2) + padding);
  };
  
  const pathData = data.map((point, index) => {
    const x = getX(index);
    const y = getY(point.revenue);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  const gradientPathData = `${pathData} L ${getX(data.length - 1)} ${chartHeight} L ${getX(0)} ${chartHeight} Z`;
  
  return (
    <div className="relative w-full h-[250px]">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        <path
          d={gradientPathData}
          fill="url(#revenueGradient)"
        />
        
        <path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
        />
        
        {data.map((point, index) => (
          <g key={index}>
            <circle
              cx={getX(index)}
              cy={getY(point.revenue)}
              r={hoveredPoint === index ? "1.5" : "1"}
              fill="#3b82f6"
              className="transition-all cursor-pointer"
              vectorEffect="non-scaling-stroke"
              onMouseEnter={() => setHoveredPoint(index)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          </g>
        ))}
      </svg>
      
      {hoveredPoint !== null && (
        <div
          className={`absolute pointer-events-none ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} px-3 py-2 rounded-lg shadow-lg border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
          style={{
            left: `${getX(hoveredPoint)}%`,
            top: `${getY(data[hoveredPoint].revenue) / chartHeight * 100}%`,
            transform: 'translate(-50%, -120%)'
          }}
        >
          <div className="text-xs font-semibold mb-1">
            {new Date(data[hoveredPoint].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-blue-500" />
            <span className="text-sm font-bold">
              ${data[hoveredPoint].revenue.toLocaleString()}
            </span>
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {data[hoveredPoint].users} users
          </div>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs">
        {data.map((point, index) => {
          if (index % Math.ceil(data.length / 4) === 0 || index === data.length - 1) {
            return (
              <span key={index} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

type SortField = 'product' | 'sales' | 'revenue' | 'status';
type SortDirection = 'asc' | 'desc';

export default function AnalyticsDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>(mockMetrics);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(mockChartData);
  const [tableData, setTableData] = useState<TableRow[]>(mockTableData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

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

  const sortedData = useCallback(() => {
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
    const sorted = sortedData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sorted.slice(startIndex, endIndex);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  const getStatusBadge = (status: TableRow['status']) => {
    const variants = {
      active: 'default',
      pending: 'secondary',
      inactive: 'outline'
    } as const;

    const colors = {
      active: isDarkMode ? 'bg-green-900 text-green-300 border-green-700' : 'bg-green-100 text-green-800 border-green-300',
      pending: isDarkMode ? 'bg-yellow-900 text-yellow-300 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-300',
      inactive: isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300'
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
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
                  
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={i * 60 + 20}
                      x2="700"
                      y2={i * 60 + 20}
                      stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Area path */}
                  <motion.path
                    d={`M 0,${280 - (chartData[0].users / 800) * 260}
                        L 116.67,${280 - (chartData[1].users / 800) * 260}
                        L 233.33,${280 - (chartData[2].users / 800) * 260}
                        L 350,${280 - (chartData[3].users / 800) * 260}
                        L 466.67,${280 - (chartData[4].users / 800) * 260}
                        L 583.33,${280 - (chartData[5].users / 800) * 260}
                        L 700,${280 - (chartData[6].users / 800) * 260}
                        L 700,280 L 0,280 Z`}
                    fill="url(#userGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                  
                  {/* Line path */}
                  <motion.path
                    d={`M 0,${280 - (chartData[0].users / 800) * 260}
                        L 116.67,${280 - (chartData[1].users / 800) * 260}
                        L 233.33,${280 - (chartData[2].users / 800) * 260}
                        L 350,${280 - (chartData[3].users / 800) * 260}
                        L 466.67,${280 - (chartData[4].users / 800) * 260}
                        L 583.33,${280 - (chartData[5].users / 800) * 260}
                        L 700,${280 - (chartData[6].users / 800) * 260}`}
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
                  {chartData.map((point, index) => {
                    const x = index * 116.67;
                    const y = 280 - (point.users / 800) * 260;
                    return (
                      <g key={point.date}>
                        <motion.circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#3b82f6"
                          stroke={isDarkMode ? '#1f2937' : '#ffffff'}
                          strokeWidth="2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
                          className="cursor-pointer hover:r-7 transition-all"
                        />
                        <motion.circle
                          cx={x}
                          cy={y}
                          r="8"
                          fill="#3b82f6"
                          opacity="0"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
                          className="cursor-pointer hover:opacity-20 transition-opacity"
                        />
                      </g>
                    );
                  })}
                </svg>
                
                {/* X-axis labels */}
                <div className="flex justify-between mt-2 px-1">
                  {chartData.map((point, index) => (
                    <motion.span
                      key={point.date}
                      className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.8 }}
                    >
                      {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </motion.span>
                  ))}
                </div>
                
                {/* Stats summary */}
                <motion.div
                  className="flex items-center justify-between mt-4 pt-4 border-t"
                  style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Peak Users
                    </p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {Math.max(...chartData.map(d => d.users))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Growth
                    </p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <p className="text-2xl font-bold text-green-500">
                        {(((chartData[chartData.length - 1].users - chartData[0].users) / chartData[0].users) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </motion.div>
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
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
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
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        color: isDarkMode ? '#ffffff' : '#000000'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
              <div className="rounded-md border" style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
                <Table>
                  <TableHeader>
                    <TableRow className={isDarkMode ? 'border-gray-700 hover:bg-gray-750' : ''}>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('product')}
                          className={`flex items-center gap-1 ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : ''}`}
                        >
                          Product
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('sales')}
                          className={`flex items-center gap-1 ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : ''}`}
                        >
                          Sales
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('revenue')}
                          className={`flex items-center gap-1 ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : ''}`}
                        >
                          Revenue
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('status')}
                          className={`flex items-center gap-1 ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : ''}`}
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
                        className={isDarkMode ? 'border-gray-700 hover:bg-gray-750' : ''}
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
                          {getStatusBadge(row.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, tableData.length)} of {tableData.length} products
                </p>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : ''}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page 
                          ? '' 
                          : isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : ''
                        }
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
                    className={isDarkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-700' : ''}
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
                {mockActivityData.map((activity, index) => {
                  const getIcon = () => {
                    switch (activity.icon) {
                      case 'ShoppingCart':
                        return <ShoppingCart className="h-4 w-4" />;
                      case 'UserPlus':
                        return <UserPlus className="h-4 w-4" />;
                      case 'Package':
                        return <Package className="h-4 w-4" />;
                      case 'AlertCircle':
                        return <AlertCircle className="h-4 w-4" />;
                      case 'CheckCircle':
                        return <CheckCircle className="h-4 w-4" />;
                      default:
                        return <DollarSign className="h-4 w-4" />;
                    }
                  };

                  const getIconColor = () => {
                    switch (activity.type) {
                      case 'sale':
                        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
                      case 'user':
                        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
                      case 'order':
                        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
                      case 'alert':
                        return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
                      case 'success':
                        return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
                      default:
                        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
                    }
                  };

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${getIconColor()}`}>
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
                {mockQuickStats.map((stat) => {
                  const Icon = stat.icon;
                  const percentage = Math.round((stat.value / stat.target) * 100);
                  
                  const colorClasses = {
                    blue: isDarkMode ? 'text-blue-400' : 'text-blue-600',
                    green: isDarkMode ? 'text-green-400' : 'text-green-600',
                    yellow: isDarkMode ? 'text-yellow-400' : 'text-yellow-600',
                    purple: isDarkMode ? 'text-purple-400' : 'text-purple-600'
                  };
                  
                  const bgClasses = {
                    blue: isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100',
                    green: isDarkMode ? 'bg-green-500/20' : 'bg-green-100',
                    yellow: isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100',
                    purple: isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'
                  };
                  
                  const progressClasses = {
                    blue: 'bg-blue-500',
                    green: 'bg-green-500',
                    yellow: 'bg-yellow-500',
                    purple: 'bg-purple-500'
                  };
                  
                  return (
                    <div key={stat.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${bgClasses[stat.color as keyof typeof bgClasses]}`}>
                            <Icon className={`h-4 w-4 ${colorClasses[stat.color as keyof typeof colorClasses]}`} />
                          </div>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {stat.label}
                          </span>
                        </div>
                        <span className={`text-sm font-bold ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                          {percentage}%
                        </span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div
                          className={`h-full ${progressClasses[stat.color as keyof typeof progressClasses]} transition-all duration-500 ease-out`}
                          style={{ width: `${percentage}%` }}
                        />
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
              <div className="space-y-3">
                {mockAlerts.map((alert) => {
                  const severityConfig = {
                    info: {
                      icon: Info,
                      bgColor: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50',
                      borderColor: isDarkMode ? 'border-blue-700' : 'border-blue-200',
                      iconColor: isDarkMode ? 'text-blue-400' : 'text-blue-600',
                      textColor: isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    },
                    warning: {
                      icon: AlertTriangle,
                      bgColor: isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50',
                      borderColor: isDarkMode ? 'border-yellow-700' : 'border-yellow-200',
                      iconColor: isDarkMode ? 'text-yellow-400' : 'text-yellow-600',
                      textColor: isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    },
                    error: {
                      icon: AlertCircle,
                      bgColor: isDarkMode ? 'bg-red-900/30' : 'bg-red-50',
                      borderColor: isDarkMode ? 'border-red-700' : 'border-red-200',
                      iconColor: isDarkMode ? 'text-red-400' : 'text-red-600',
                      textColor: isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    },
                    success: {
                      icon: CheckCircle,
                      bgColor: isDarkMode ? 'bg-green-900/30' : 'bg-green-50',
                      borderColor: isDarkMode ? 'border-green-700' : 'border-green-200',
                      iconColor: isDarkMode ? 'text-green-400' : 'text-green-600',
                      textColor: isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }
                  };

                  const config = severityConfig[alert.severity];
                  const IconComponent = config.icon;

                  return (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}
                    >
                      <IconComponent className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${config.textColor}`}>
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