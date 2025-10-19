import { useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  { date: '2024-01-06', revenue: 20000, users: 680, orders: 360 },
  { date: '2024-01-07', revenue: 22000, users: 720, orders: 390 }
];

const mockTableData: TableRow[] = [
  { id: '1', product: 'Premium Plan', sales: 234, revenue: 23400, status: 'active' },
  { id: '2', product: 'Basic Plan', sales: 567, revenue: 11340, status: 'active' },
  { id: '3', product: 'Enterprise Plan', sales: 89, revenue: 17800, status: 'active' },
  { id: '4', product: 'Starter Plan', sales: 432, revenue: 4320, status: 'pending' },
  { id: '5', product: 'Pro Plan', sales: 156, revenue: 15600, status: 'inactive' }
];
const mockTrafficData = [
  { name: 'Organic Search', value: 4200, color: '#3b82f6' },
  { name: 'Direct', value: 2800, color: '#10b981' },
  { name: 'Social Media', value: 1900, color: '#f59e0b' },
  { name: 'Referral', value: 1200, color: '#8b5cf6' },
  { name: 'Email', value: 900, color: '#ec4899' }
];

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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>(mockMetrics);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(mockChartData);
  const [tableData, setTableData] = useState<TableRow[]>(mockTableData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof TableRow; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = useCallback((key: keyof TableRow) => {
    setSortConfig(prevConfig => {
      if (prevConfig?.key === key) {
        return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' };
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getStatusColor = (status: TableRow['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    }
  };

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
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
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Analytics Dashboard
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Real-time insights and performance metrics
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleDarkMode}
              className={isDarkMode ? 'border-gray-700 hover:bg-gray-800' : ''}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={isDarkMode ? 'border-gray-700 hover:bg-gray-800' : ''}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {metrics.map((metric, index) => {
            const Icon = getMetricIcon(metric.label);
            const isPositive = metric.trend === 'up';
            const TrendIcon = isPositive ? TrendingUp : TrendingDown;
            
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
                    <div className="flex items-end justify-between">
                      <div>
                        <div className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatMetricValue(metric.label, metric.value)}
                        </div>
                        <div className="flex items-center mt-2 gap-1">
                          <TrendIcon 
                            className={`h-4 w-4 ${isPositive ? 'text-green-500' : 'text-red-500'}`} 
                          />
                          <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {Math.abs(metric.change)}%
                          </span>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            vs last period
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Revenue Overview</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Daily revenue trends for the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px] md:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
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
                        borderRadius: '8px',
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
                      activeDot={{ r: 6, fill: '#2563eb' }}
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
                Active users and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-[300px] w-full">
                <svg width="100%" height="100%" viewBox="0 0 700 300" preserveAspectRatio="none" className="overflow-visible">
                  <defs>
                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isDarkMode ? "#3b82f6" : "#60a5fa"} stopOpacity="0.6" />
                      <stop offset="100%" stopColor={isDarkMode ? "#3b82f6" : "#60a5fa"} stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={i * 75}
                      x2="700"
                      y2={i * 75}
                      stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Area path */}
                  <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    d={`
                      M 0,${300 - (chartData[0].users / 720) * 250}
                      ${chartData.map((point, i) => {
                        const x = (i / (chartData.length - 1)) * 700;
                        const y = 300 - (point.users / 720) * 250;
                        return `L ${x},${y}`;
                      }).join(' ')}
                      L 700,300
                      L 0,300
                      Z
                    `}
                    fill="url(#userGradient)"
                  />
                  
                  {/* Line path */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    d={`
                      M 0,${300 - (chartData[0].users / 720) * 250}
                      ${chartData.map((point, i) => {
                        const x = (i / (chartData.length - 1)) * 700;
                        const y = 300 - (point.users / 720) * 250;
                        return `L ${x},${y}`;
                      }).join(' ')}
                    `}
                    fill="none"
                    stroke={isDarkMode ? "#3b82f6" : "#2563eb"}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Data points with hover effects */}
                  {chartData.map((point, i) => {
                    const x = (i / (chartData.length - 1)) * 700;
                    const y = 300 - (point.users / 720) * 250;
                    return (
                      <g key={i}>
                        <motion.circle
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1, duration: 0.3 }}
                          cx={x}
                          cy={y}
                          r="6"
                          fill={isDarkMode ? "#1e293b" : "#ffffff"}
                          stroke={isDarkMode ? "#3b82f6" : "#2563eb"}
                          strokeWidth="3"
                          className="cursor-pointer transition-all hover:r-8"
                          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r="20"
                          fill="transparent"
                          className="cursor-pointer"
                        >
                          <title>{`${new Date(point.date).toLocaleDateString()}: ${point.users} users`}</title>
                        </circle>
                      </g>
                    );
                  })}
                </svg>
                
                {/* X-axis labels */}
                <div className="flex justify-between mt-4 px-2">
                  {chartData.map((point, i) => (
                    <span
                      key={i}
                      className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  ))}
                </div>
                
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-[300px] flex flex-col justify-between -ml-12">
                  {[720, 540, 360, 180, 0].map((value, i) => (
                    <span
                      key={i}
                      className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Orders Distribution</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Order volume by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
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
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        color: isDarkMode ? '#ffffff' : '#000000'
                      }}
                      labelStyle={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                    />
                    <Bar 
                      dataKey="orders" 
                      fill="#8b5cf6" 
                      radius={[8, 8, 0, 0]}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className={`lg:col-span-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Performance Comparison</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Multi-metric comparison over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <svg viewBox="0 0 800 300" className="w-full h-full">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <line
                      key={`grid-${i}`}
                      x1="50"
                      y1={50 + i * 40}
                      x2="750"
                      y2={50 + i * 40}
                      stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Revenue line (scaled to fit) */}
                  <motion.polyline
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    points={chartData.map((point, i) => {
                      const x = 50 + (i * 700) / (chartData.length - 1);
                      const y = 250 - (point.revenue / 25000) * 200;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Users line (scaled to fit) */}
                  <motion.polyline
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
                    points={chartData.map((point, i) => {
                      const x = 50 + (i * 700) / (chartData.length - 1);
                      const y = 250 - (point.users / 800) * 200;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Orders line (scaled to fit) */}
                  <motion.polyline
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.4, ease: "easeInOut" }}
                    points={chartData.map((point, i) => {
                      const x = 50 + (i * 700) / (chartData.length - 1);
                      const y = 250 - (point.orders / 450) * 200;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Data points for revenue */}
                  {chartData.map((point, i) => {
                    const x = 50 + (i * 700) / (chartData.length - 1);
                    const y = 250 - (point.revenue / 25000) * 200;
                    return (
                      <motion.circle
                        key={`revenue-point-${i}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 1 + i * 0.1 }}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#3b82f6"
                        className="cursor-pointer hover:r-6 transition-all"
                      />
                    );
                  })}
                  
                  {/* Data points for users */}
                  {chartData.map((point, i) => {
                    const x = 50 + (i * 700) / (chartData.length - 1);
                    const y = 250 - (point.users / 800) * 200;
                    return (
                      <motion.circle
                        key={`users-point-${i}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 1.2 + i * 0.1 }}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#10b981"
                        className="cursor-pointer hover:r-6 transition-all"
                      />
                    );
                  })}
                  
                  {/* Data points for orders */}
                  {chartData.map((point, i) => {
                    const x = 50 + (i * 700) / (chartData.length - 1);
                    const y = 250 - (point.orders / 450) * 200;
                    return (
                      <motion.circle
                        key={`orders-point-${i}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 1.4 + i * 0.1 }}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#f59e0b"
                        className="cursor-pointer hover:r-6 transition-all"
                      />
                    );
                  })}
                  
                  {/* X-axis labels */}
                  {chartData.map((point, i) => {
                    const x = 50 + (i * 700) / (chartData.length - 1);
                    return (
                      <text
                        key={`label-${i}`}
                        x={x}
                        y="280"
                        textAnchor="middle"
                        className={`text-xs ${isDarkMode ? 'fill-gray-400' : 'fill-gray-600'}`}
                      >
                        {new Date(point.date).getDate()}/{new Date(point.date).getMonth() + 1}
                      </text>
                    );
                  })}
                </svg>
                
                {/* Legend */}
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Revenue
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Users
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-500"></div>
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
              Best performing products by sales and revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`text-left py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <button
                        onClick={() => handleSort('product')}
                        className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                      >
                        Product
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className={`text-right py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <button
                        onClick={() => handleSort('sales')}
                        className="flex items-center gap-2 ml-auto hover:opacity-70 transition-opacity"
                      >
                        Sales
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className={`text-right py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <button
                        onClick={() => handleSort('revenue')}
                        className="flex items-center gap-2 ml-auto hover:opacity-70 transition-opacity"
                      >
                        Revenue
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className={`text-center py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center gap-2 mx-auto hover:opacity-70 transition-opacity"
                      >
                        Status
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTableData().map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}
                    >
                      <td className={`py-4 px-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {row.product}
                      </td>
                      <td className={`py-4 px-4 text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formatNumber(row.sales)}
                      </td>
                      <td className={`py-4 px-4 text-right font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {formatCurrency(row.revenue)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(row.status)} capitalize`}
                        >
                          {row.status}
                        </Badge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Conversion Funnel</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                User journey and drop-off rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { stage: 'Visitors', value: 10000, percentage: 100 },
                  { stage: 'Sign Ups', value: 5000, percentage: 50 },
                  { stage: 'Active Users', value: 2350, percentage: 23.5 },
                  { stage: 'Paying Customers', value: 1543, percentage: 15.4 },
                  { stage: 'Repeat Customers', value: 892, percentage: 8.9 }
                ].map((item, index) => (
                  <motion.div
                    key={item.stage}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.stage}
                      </span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.value.toLocaleString()} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="relative h-12 rounded-lg overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${item.percentage}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Traffic Sources</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Visitor sources breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockTrafficData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {mockTrafficData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        color: isDarkMode ? '#ffffff' : '#000000'
                      }}
                      formatter={(value: number) => [`${value.toLocaleString()} visitors`, 'Traffic']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 space-y-2">
                {mockTrafficData.map((source) => (
                  <div key={source.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: source.color }}
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {source.name}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {source.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Recent Activity</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Latest system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                {[
                  { id: '1', type: 'sale', message: 'New order placed - Premium Plan', time: '2 minutes ago', icon: ShoppingCart, color: 'text-green-500' },
                  { id: '2', type: 'user', message: 'New user registration', time: '15 minutes ago', icon: Users, color: 'text-blue-500' },
                  { id: '3', type: 'revenue', message: 'Payment received - $234.00', time: '32 minutes ago', icon: DollarSign, color: 'text-emerald-500' },
                  { id: '4', type: 'sale', message: 'Order completed - Basic Plan', time: '1 hour ago', icon: ShoppingCart, color: 'text-green-500' },
                  { id: '5', type: 'target', message: 'Monthly goal 75% achieved', time: '2 hours ago', icon: Target, color: 'text-purple-500' },
                  { id: '6', type: 'user', message: '5 new users registered', time: '3 hours ago', icon: Users, color: 'text-blue-500' },
                  { id: '7', type: 'revenue', message: 'Payment received - $1,780.00', time: '4 hours ago', icon: DollarSign, color: 'text-emerald-500' },
                  { id: '8', type: 'sale', message: 'New order placed - Enterprise Plan', time: '5 hours ago', icon: ShoppingCart, color: 'text-green-500' }
                ].map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                        isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className={`mt-0.5 ${activity.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {activity.message}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {activity.time}
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