import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target, Package, CreditCard, UserPlus, AlertCircle } from 'lucide-react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target } from 'lucide-react';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target } from 'lucide-react'
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
;
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
  severity: 'error' | 'warning' | 'info';
  timestamp: string;
}

const mockAlerts: Alert[] = [
  { id: '1', message: 'Server response time increased by 45%', severity: 'error', timestamp: '2 min ago' },
  { id: '2', message: 'Low inventory alert for Premium Plan', severity: 'warning', timestamp: '15 min ago' },
  { id: '3', message: 'New feature deployed successfully', severity: 'info', timestamp: '1 hour ago' },
  { id: '4', message: 'Payment gateway experiencing delays', severity: 'warning', timestamp: '2 hours ago' }
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

interface ActivityItem {
  id: string;
  type: 'sale' | 'user' | 'order' | 'alert';
  message: string;
  timestamp: string;
  icon: 'package' | 'userPlus' | 'creditCard' | 'alertCircle';
}

const mockActivityData: ActivityItem[] = [
  { id: '1', type: 'sale', message: 'New sale: Premium Plan', timestamp: '2 minutes ago', icon: 'package' },
  { id: '2', type: 'user', message: 'New user registered', timestamp: '5 minutes ago', icon: 'userPlus' },
  { id: '3', type: 'order', message: 'Order #1234 completed', timestamp: '12 minutes ago', icon: 'creditCard' },
  { id: '4', type: 'sale', message: 'New sale: Enterprise Plan', timestamp: '18 minutes ago', icon: 'package' },
  { id: '5', type: 'alert', message: 'Low stock alert', timestamp: '25 minutes ago', icon: 'alertCircle' },
  { id: '6', type: 'user', message: '3 new users registered', timestamp: '32 minutes ago', icon: 'userPlus' }
];
const mockQuickStats = [
  {
    id: '1',
    label: 'Avg Order Value',
    value: '$142.50',
    change: 15.3,
    trend: 'up' as const,
    icon: DollarSign,
    sparklineData: [120, 135, 128, 145, 138, 152, 142]
  },
  {
    id: '2',
    label: 'Customer Retention',
    value: '87.5%',
    change: 4.2,
    trend: 'up' as const,
    icon: Users,
    sparklineData: [82, 83, 85, 84, 86, 87, 87.5]
  },
  {
    id: '3',
    label: 'Cart Abandonment',
    value: '23.8%',
    change: -2.1,
    trend: 'down' as const,
    icon: ShoppingCart,
    sparklineData: [28, 27, 26, 25, 24.5, 24, 23.8]
  },
  {
    id: '4',
    label: 'Goal Completion',
    value: '92.3%',
    change: 8.7,
    trend: 'up' as const,
    icon: Target,
    sparklineData: [85, 87, 88, 89, 90, 91, 92.3]
  }
];
const mockPieData = [
  { name: 'Premium Plan', value: 234, color: '#3b82f6' },
  { name: 'Basic Plan', value: 567, color: '#10b981' },
  { name: 'Enterprise Plan', value: 89, color: '#8b5cf6' },
  { name: 'Starter Plan', value: 432, color: '#f59e0b' },
  { name: 'Pro Plan', value: 156, color: '#ef4444' }
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-white">{payload[0].name}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Orders: <span className="font-medium">{payload[0].value}</span>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Percentage: <span className="font-medium">{payload[0].percent ? (payload[0].percent * 100).toFixed(1) : 0}%</span>
        </p>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

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

type SortField = 'product' | 'sales' | 'revenue' | 'status';
type SortDirection = 'asc' | 'desc';

export default function AnalyticsDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>(mockMetrics);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(mockChartData);
  const [tableData, setTableData] = useState<TableRow[]>(mockTableData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activityData, setActivityData] = useState<ActivityItem[]>(mockActivityData);
  const [pieData, setPieData] = useState(mockPieData);
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
      inactive: 'destructive'
    };
    return (
      <Badge variant={variants[status] as any} className="capitalize">
        {status}
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

  const getAlertBadgeVariant = (severity: Alert['severity']) => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'secondary';
    }
  };</parameter>
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
            const Icon = metric.label === 'Total Revenue' ? DollarSign :
                        metric.label === 'Active Users' ? Users :
                        metric.label === 'Total Orders' ? ShoppingCart :
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
                      {metric.label === 'Total Revenue' ? `$${metric.value.toLocaleString()}` :
                       metric.label === 'Conversion Rate' ? `${metric.value}%` :
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
                <svg width="100%" height="100%" viewBox="0 0 700 300" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="userGradient" x1="0%" y1="0%" x2="0%" y2="100%">
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
                      const firstX = padding;
                      const lastX = width - padding;
                      return `M${firstX},${height - padding} L${points.join(' L')} L${lastX},${height - padding} Z`;
                    })()}
                    fill="url(#userGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                  
                  {/* Line on top of area */}
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
                      return `M${points.join(' L')}`;
                    })()}
                    stroke="#3b82f6"
                    strokeWidth="3"
                    fill="none"
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
                      <g key={i}>
                        <motion.circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#3b82f6"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1 * i, duration: 0.3 }}
                          className="cursor-pointer hover:r-7"
                        />
                        <title>{`${d.date}: ${d.users} users`}</title>
                      </g>
                    );
                  })}
                </svg>
                
                {/* Chart labels */}
                <div className="flex justify-between mt-4 px-4">
                  {chartData.map((d, i) => (
                    <motion.div
                      key={i}
                      className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                    >
                      {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </motion.div>
                  ))}
                </div>
                
                {/* Summary stats */}
                <motion.div
                  className={`mt-4 flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">
                    Total: {chartData[chartData.length - 1].users} users
                  </span>
                  <TrendingUp className="h-4 w-4 text-green-500 ml-2" />
                  <span className="text-sm text-green-500">
                    +{Math.round(((chartData[chartData.length - 1].users - chartData[0].users) / chartData[0].users) * 100)}%
                  </span>
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
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry: any) => (
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
                    labelStyle={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}
                    formatter={(value: number) => value.toLocaleString()}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  />
                  <Legend 
                    wrapperStyle={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Revenue ($)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="users" fill="#10b981" name="Users" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="orders" fill="#f59e0b" name="Orders" radius={[4, 4, 0, 0]} />
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
              <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className={isDarkMode ? 'border-gray-700 hover:bg-gray-750' : ''}>
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
                      <TableHead className={`text-right ${isDarkMode ? 'text-gray-300' : ''}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('sales')}
                          className={`-mr-3 h-8 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
                        >
                          Sales
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className={`text-right ${isDarkMode ? 'text-gray-300' : ''}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('revenue')}
                          className={`-mr-3 h-8 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
                        >
                          Revenue
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className={`text-center ${isDarkMode ? 'text-gray-300' : ''}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('status')}
                          className={`h-8 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
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
                        className={isDarkMode ? 'border-gray-700 hover:bg-gray-750' : ''}
                      >
                        <TableCell className={`font-medium ${isDarkMode ? 'text-gray-200' : ''}`}>
                          {row.product}
                        </TableCell>
                        <TableCell className={`text-right ${isDarkMode ? 'text-gray-300' : ''}`}>
                          {row.sales.toLocaleString()}
                        </TableCell>
                        <TableCell className={`text-right ${isDarkMode ? 'text-gray-300' : ''}`}>
                          ${row.revenue.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(row.status)}
                        </TableCell>
                      </TableRow>
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
                {activityData.map((activity, index) => {
                  const getIcon = () => {
                    switch (activity.icon) {
                      case 'package':
                        return <Package className="h-4 w-4" />;
                      case 'userPlus':
                        return <UserPlus className="h-4 w-4" />;
                      case 'creditCard':
                        return <CreditCard className="h-4 w-4" />;
                      case 'alertCircle':
                        return <AlertCircle className="h-4 w-4" />;
                      default:
                        return <Package className="h-4 w-4" />;
                    }
                  };

                  const getIconBgColor = () => {
                    switch (activity.type) {
                      case 'sale':
                        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
                      case 'user':
                        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
                      case 'order':
                        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
                      case 'alert':
                        return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
                      default:
                        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
                    }
                  };

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getIconBgColor()} transition-all duration-300 hover:scale-110`}>
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
                      {index < activityData.length - 1 && (
                        <div className={`absolute left-[15px] top-8 w-0.5 h-12 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} style={{ marginTop: '8px' }} />
                      )}
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
                {mockQuickStats.map((stat, index) => {
                  const Icon = stat.icon;
                  const sparklineChartData = stat.sparklineData.map((value, i) => ({
                    index: i,
                    value: value
                  }));

                  return (
                    <div
                      key={stat.id}
                      className={`p-4 rounded-lg border ${
                        isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-gray-200'
                      } transition-all hover:shadow-md`}
                      style={{
                        animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${
                            isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                          }`}>
                            <Icon className={`h-4 w-4 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`} />
                          </div>
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {stat.label}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-semibold ${
                          stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {stat.trend === 'up' ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(stat.change)}%
                        </div>
                      </div>

                      <div className="flex items-end justify-between gap-4">
                        <div className={`text-2xl font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {stat.value}
                        </div>

                        <div className="flex-1 max-w-[120px] h-12">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sparklineChartData}>
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke={stat.trend === 'up' ? '#10b981' : '#ef4444'}
                                strokeWidth={2}
                                dot={false}
                                animationDuration={1000}
                                animationBegin={index * 100}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <style jsx>{`
                @keyframes fadeIn {
                  from {
                    opacity: 0;
                    transform: translateY(10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>
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
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getAlertIcon(alert.severity)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <Badge variant={getAlertBadgeVariant(alert.severity)} className="text-xs">
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {alert.timestamp}
                          </span>
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {alert.message}
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