import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { TrendingUp, TrendingDown, ShoppingCart, UserPlus, DollarSign, Package } from 'lucide-react';

import { BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Users }, AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react';
import { TrendingDown, DollarSign, ShoppingCart, Target } from 'lucide-react';
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
interface Alert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
}
interface ActivityItem {
  id: string;
  type: 'sale' | 'user' | 'revenue' | 'order';
  message: string;
  timestamp: string;
  icon: 'cart' | 'user' | 'dollar' | 'package';
}

const mockActivityData: ActivityItem[] = [
  { id: '1', type: 'sale', message: 'New sale: Premium Plan', timestamp: '2 minutes ago', icon: 'cart' },
  { id: '2', type: 'user', message: 'New user registered', timestamp: '5 minutes ago', icon: 'user' },
  { id: '3', type: 'revenue', message: 'Revenue milestone reached', timestamp: '12 minutes ago', icon: 'dollar' },
  { id: '4', type: 'order', message: 'Order #1543 completed', timestamp: '18 minutes ago', icon: 'package' },
  { id: '5', type: 'sale', message: 'New sale: Enterprise Plan', timestamp: '25 minutes ago', icon: 'cart' },
  { id: '6', type: 'user', message: '10 new users today', timestamp: '32 minutes ago', icon: 'user' }
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
  { id: '1', message: 'Revenue target achieved for Q1', severity: 'success', timestamp: '2 minutes ago' },
  { id: '2', message: 'Server response time increased by 15%', severity: 'warning', timestamp: '15 minutes ago' },
  { id: '3', message: 'New user registration spike detected', severity: 'info', timestamp: '1 hour ago' },
  { id: '4', message: 'Payment gateway error rate above threshold', severity: 'error', timestamp: '2 hours ago' },
  { id: '5', message: 'Database backup completed successfully', severity: 'success', timestamp: '3 hours ago' }
];
const mockQuickStats = [
  { 
    id: '1', 
    label: 'Avg Order Value', 
    value: 156.78, 
    change: 4.3, 
    trend: 'up' as const,
    icon: DollarSign,
    sparklineData: [120, 135, 145, 140, 150, 156, 157]
  },
  { 
    id: '2', 
    label: 'Cart Abandonment', 
    value: 23.5, 
    change: -2.1, 
    trend: 'down' as const,
    icon: ShoppingCart,
    sparklineData: [28, 27, 26, 25, 24, 23.5, 23.5]
  },
  { 
    id: '3', 
    label: 'Goal Completion', 
    value: 87.2, 
    change: 6.8, 
    trend: 'up' as const,
    icon: Target,
    sparklineData: [75, 78, 82, 84, 85, 86, 87]
  }
];
const ActivityFeed = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const getIcon = (iconType: string) => {
    const iconClass = isDarkMode ? 'text-blue-400' : 'text-blue-600';
    switch (iconType) {
      case 'cart':
        return <ShoppingCart className={`h-4 w-4 ${iconClass}`} />;
      case 'user':
        return <UserPlus className={`h-4 w-4 ${iconClass}`} />;
      case 'dollar':
        return <DollarSign className={`h-4 w-4 ${iconClass}`} />;
      case 'package':
        return <Package className={`h-4 w-4 ${iconClass}`} />;
      default:
        return <ShoppingCart className={`h-4 w-4 ${iconClass}`} />;
    }
  };

  return (
    <div className="space-y-4">
      {mockActivityData.map((activity, index) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2"
          style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
        >
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'
          }`}>
            {getIcon(activity.icon)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              {activity.message}
            </p>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {activity.timestamp}
            </p>
          </div>
          
          {index < mockActivityData.length - 1 && (
            <div className={`absolute left-[15px] top-8 w-0.5 h-12 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`} style={{ marginTop: '8px' }} />
          )}
        </div>
      ))}
    </div>
  );
};

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

const PieChart = ({ data, isDarkMode }: { data: PieChartData[], isDarkMode: boolean }) => {
  const size = 200;
  const center = size / 2;
  const radius = size / 2 - 10;
  
  let currentAngle = -90;
  
  const createArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    
    return [
      `M ${center} ${center}`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
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
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((item, index) => {
          const angle = (item.percentage / 100) * 360;
          const path = createArc(currentAngle, currentAngle + angle);
          currentAngle += angle;
          
          return (
            <motion.path
              key={item.label}
              d={path}
              fill={item.color}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          );
        })}
      </svg>
      
      <div className="grid grid-cols-1 gap-2 w-full">
        {data.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {item.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {item.value}
              </span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                ({item.percentage.toFixed(1)}%)
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
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

const Sparkline = ({ data, trend, isDark }: { data: number[], trend: 'up' | 'down', isDark: boolean }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={trend === 'up' ? (isDark ? '#10b981' : '#059669') : (isDark ? '#ef4444' : '#dc2626')}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

export default function AnalyticsDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>(mockMetrics);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(mockChartData);
  const [tableData, setTableData] = useState<TableRow[]>(mockTableData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);
  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const [sortColumn, setSortColumn] = useState<keyof TableRow>('revenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

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
    
    setTimeout(() => {
      const randomVariation = () => (Math.random() - 0.5) * 20;
      
      const updatedMetrics = mockMetrics.map(m => ({
        ...m,
        value: Math.max(0, m.value + randomVariation()),
        change: parseFloat((Math.random() * 20 - 5).toFixed(1))
      }));
      
      const updatedChartData = mockChartData.map(d => ({
        ...d,
        revenue: Math.max(0, d.revenue + randomVariation() * 100),
        users: Math.max(0, d.users + randomVariation() * 10),
        orders: Math.max(0, d.orders + randomVariation() * 5)
      }));
      
      setMetrics(updatedMetrics);
      setChartData(updatedChartData);
      setIsRefreshing(false);
    }, 1500);
  }, []);</parameter>

<xcrdt_code_output crdtPosition="AK2DwI4F4zQB">
              <div className="space-y-6">
                {chartData.map((dataPoint, index) => {
                  const maxValue = Math.max(
                    ...chartData.map(d => Math.max(d.revenue / 100, d.users, d.orders))
                  );
                  
                  return (
                    <div key={dataPoint.date} className="space-y-2">
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {new Date(dataPoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      
                      <div className="flex gap-2 items-end h-24">
                        {/* Revenue Bar */}
                        <div className="flex-1 relative group">
                          <div
                            className="bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600 cursor-pointer"
                            style={{
                              height: `${(dataPoint.revenue / 100 / maxValue) * 100}%`,
                              minHeight: '4px'
                            }}
                          >
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                              Revenue: ${dataPoint.revenue.toLocaleString()}
                            </div>
                          </div>
                          <div className={`text-xs text-center mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Rev
                          </div>
                        </div>
                        
                        {/* Users Bar */}
                        <div className="flex-1 relative group">
                          <div
                            className="bg-green-500 rounded-t transition-all duration-500 hover:bg-green-600 cursor-pointer"
                            style={{
                              height: `${(dataPoint.users / maxValue) * 100}%`,
                              minHeight: '4px'
                            }}
                          >
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                              Users: {dataPoint.users.toLocaleString()}
                            </div>
                          </div>
                          <div className={`text-xs text-center mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Users
                          </div>
                        </div>
                        
                        {/* Orders Bar */}
                        <div className="flex-1 relative group">
                          <div
                            className="bg-purple-500 rounded-t transition-all duration-500 hover:bg-purple-600 cursor-pointer"
                            style={{
                              height: `${(dataPoint.orders / maxValue) * 100}%`,
                              minHeight: '4px'
                            }}
                          >
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                              Orders: {dataPoint.orders.toLocaleString()}
                            </div>
                          </div>
                          <div className={`text-xs text-center mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Orders
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Legend */}
                <div className="flex justify-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Revenue ($100s)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Users
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Orders
                    </span>
                  </div>
                </div>
              </div>mVariation = () => (Math.random() - 0.5) * 20;
      
      const updatedMetrics = mockMetrics.map(metric => ({
        ...metric,
        value: Math.round(metric.value + (metric.value * randomVariation() / 100)),
        change: parseFloat((Math.random() * 20 - 5).toFixed(1)),
        trend: Math.random() > 0.5 ? 'up' as const : 'down' as const
      }));
      
      const updatedChartData = mockChartData.map(point => ({
        ...point,
        revenue: Math.round(point.revenue + (point.revenue * randomVariation() / 100)),
        users: Math.round(point.users + (point.users * randomVariation() / 100)),
        orders: Math.round(point.orders + (point.orders * randomVariation() / 100))
      }));
      
      const updatedTableData = mockTableData.map(row => ({
        ...row,
        sales: Math.round(row.sales + (row.sales * randomVariation() / 100)),
        revenue: Math.round(row.revenue + (row.revenue * randomVariation() / 100))
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
                    <motion.div
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                      className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                      {metric.id === '1' || metric.id === '3' ? 
                        `$${metric.value.toLocaleString()}` : 
                        metric.id === '4' ? 
                        `${metric.value}%` : 
                        metric.value.toLocaleString()
                      }
                    </motion.div>
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
              <div className="relative h-64 md:h-80">
                <svg className="w-full h-full" viewBox="0 0 700 300" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="userGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={i * 60 + 30}
                      x2="700"
                      y2={i * 60 + 30}
                      stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  ))}
                  
                  {/* Area path */}
                  <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    d={(() => {
                      const maxUsers = Math.max(...chartData.map(d => d.users));
                      const points = chartData.map((d, i) => {
                        const x = (i / (chartData.length - 1)) * 700;
                        const y = 270 - ((d.users / maxUsers) * 240);
                        return `${x},${y}`;
                      });
                      return `M 0,270 L ${points.join(' L ')} L 700,270 Z`;
                    })()}
                    fill="url(#userGradient)"
                  />
                  
                  {/* Line path */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    d={(() => {
                      const maxUsers = Math.max(...chartData.map(d => d.users));
                      const points = chartData.map((d, i) => {
                        const x = (i / (chartData.length - 1)) * 700;
                        const y = 270 - ((d.users / maxUsers) * 240);
                        return `${x},${y}`;
                      });
                      return `M ${points.join(' L ')}`;
                    })()}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Data points */}
                  {chartData.map((d, i) => {
                    const maxUsers = Math.max(...chartData.map(d => d.users));
                    const x = (i / (chartData.length - 1)) * 700;
                    const y = 270 - ((d.users / maxUsers) * 240);
                    
                    return (
                      <motion.g
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.8 + i * 0.1 }}
                      >
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#3b82f6"
                          stroke={isDarkMode ? '#1f2937' : '#ffffff'}
                          strokeWidth="2"
                          className="cursor-pointer hover:r-7 transition-all"
                        />
                        <title>{`${new Date(d.date).toLocaleDateString()}: ${d.users} users`}</title>
                      </motion.g>
                    );
                  })}
                </svg>
                
                {/* X-axis labels */}
                <div className="flex justify-between mt-2 px-1">
                  {chartData.map((d, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 1 + i * 0.05 }}
                      className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </motion.span>
                  ))}
                </div>
                
                {/* Stats summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                  className="flex items-center justify-between mt-4 pt-4 border-t"
                  style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}
                >
                  <div className="flex items-center gap-2">
                    <Users className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Users
                      </p>
                      <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {chartData.reduce((sum, d) => sum + d.users, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <div className="text-right">
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Growth
                      </p>
                      <p className="text-xl font-bold text-green-500">
                        +{(((chartData[chartData.length - 1].users - chartData[0].users) / chartData[0].users) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </motion.div>
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
              <PieChart
                data={(() => {
                  const total = chartData.reduce((sum, item) => sum + item.orders, 0);
                  return chartData.slice(0, 5).map((item, index) => ({
                    label: item.date,
                    value: item.orders,
                    color: pieChartColors[index],
                    percentage: (item.orders / total) * 100
                  }));
                })()}
                isDarkMode={isDarkMode}
              />
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
                          className={`flex items-center gap-1 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
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
                          className={`flex items-center gap-1 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
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
                          className={`flex items-center gap-1 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
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
                          className={`flex items-center gap-1 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
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
              <ActivityFeed isDarkMode={isDarkMode} />
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
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
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${
                            isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                          }`}>
                            <Icon className={`h-4 w-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                          </div>
                          <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {stat.label}
                            </p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {stat.label.includes('Value') || stat.label.includes('Order') 
                                ? `$${stat.value.toFixed(2)}` 
                                : `${stat.value}%`}
                            </p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          stat.trend === 'up'
                            ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                            : isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                        }`}>
                          {stat.trend === 'up' ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(stat.change)}%
                        </div>
                      </div>
                      <Sparkline data={stat.sparklineData} trend={stat.trend} isDark={isDarkMode} />
                    </motion.div>
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
                {alerts.length === 0 ? (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No alerts at this time
                  </p>
                ) : (
                  alerts.map((alert, index) => {
                    const severityConfig = {
                      success: {
                        icon: CheckCircle,
                        bgColor: isDarkMode ? 'bg-green-900/20' : 'bg-green-50',
                        borderColor: 'border-green-500',
                        iconColor: 'text-green-500',
                        textColor: isDarkMode ? 'text-green-400' : 'text-green-700'
                      },
                      warning: {
                        icon: AlertTriangle,
                        bgColor: isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50',
                        borderColor: 'border-yellow-500',
                        iconColor: 'text-yellow-500',
                        textColor: isDarkMode ? 'text-yellow-400' : 'text-yellow-700'
                      },
                      error: {
                        icon: XCircle,
                        bgColor: isDarkMode ? 'bg-red-900/20' : 'bg-red-50',
                        borderColor: 'border-red-500',
                        iconColor: 'text-red-500',
                        textColor: isDarkMode ? 'text-red-400' : 'text-red-700'
                      },
                      info: {
                        icon: AlertTriangle,
                        bgColor: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50',
                        borderColor: 'border-blue-500',
                        iconColor: 'text-blue-500',
                        textColor: isDarkMode ? 'text-blue-400' : 'text-blue-700'
                      }
                    };

                    const config = severityConfig[alert.severity];
                    const Icon = config.icon;

                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative p-3 rounded-lg border-l-4 ${config.bgColor} ${config.borderColor}`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${config.textColor}`}>
                              {alert.message}
                            </p>
                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {alert.timestamp}
                            </p>
                          </div>
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className={`flex-shrink-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                              isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                            }`}
                            aria-label="Dismiss alert"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}