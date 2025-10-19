import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target } from 'lucide-react';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';

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
interface ActivityEvent {
  id: string;
  type: 'sale' | 'user' | 'system' | 'alert';
  message: string;
  timestamp: string;
  icon?: string;
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
const mockActivityData: ActivityEvent[] = [
  { id: '1', type: 'sale', message: 'New order #1234 - Premium Plan', timestamp: '2 minutes ago' },
  { id: '2', type: 'user', message: 'New user registration: john@example.com', timestamp: '5 minutes ago' },
  { id: '3', type: 'system', message: 'Database backup completed successfully', timestamp: '12 minutes ago' },
  { id: '4', type: 'sale', message: 'Payment received: $299.00', timestamp: '18 minutes ago' },
  { id: '5', type: 'alert', message: 'Server response time increased', timestamp: '25 minutes ago' },
  { id: '6', type: 'user', message: 'User upgraded to Enterprise Plan', timestamp: '32 minutes ago' },
  { id: '7', type: 'sale', message: 'New order #1233 - Basic Plan', timestamp: '45 minutes ago' },
  { id: '8', type: 'system', message: 'System update deployed v2.1.0', timestamp: '1 hour ago' },
  { id: '9', type: 'user', message: 'Password reset requested', timestamp: '1 hour ago' },
  { id: '10', type: 'sale', message: 'Refund processed: $49.00', timestamp: '2 hours ago' }
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'sale':
      return ShoppingCart;
    case 'user':
      return Users;
    case 'system':
      return Target;
    case 'alert':
      return TrendingDown;
    default:
      return Target;
  }
};

const getActivityColor = (type: string, isDarkMode: boolean) => {
  switch (type) {
    case 'sale':
      return isDarkMode ? 'text-green-400' : 'text-green-600';
    case 'user':
      return isDarkMode ? 'text-blue-400' : 'text-blue-600';
    case 'system':
      return isDarkMode ? 'text-purple-400' : 'text-purple-600';
    case 'alert':
      return isDarkMode ? 'text-orange-400' : 'text-orange-600';
    default:
      return isDarkMode ? 'text-gray-400' : 'text-gray-600';
  }
};

const RevenueChart = ({ data, isDarkMode }: { data: ChartDataPoint[], isDarkMode: boolean }) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const minRevenue = Math.min(...data.map(d => d.revenue));
  const range = maxRevenue - minRevenue;
  const padding = range * 0.1;
  
  const chartHeight = 250;
  const chartWidth = 100; // percentage
  
  const getYPosition = (value: number) => {
    const normalizedValue = (value - minRevenue + padding) / (range + 2 * padding);
    return chartHeight - (normalizedValue * chartHeight);
  };
  
  const getXPosition = (index: number) => {
    return (index / (data.length - 1)) * 100;
  };
  
  const pathData = data.map((point, index) => {
    const x = getXPosition(index);
    const y = getYPosition(point.revenue);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  const areaPathData = `${pathData} L ${getXPosition(data.length - 1)} ${chartHeight} L 0 ${chartHeight} Z`;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="w-full">
      <div className="relative" style={{ height: `${chartHeight}px` }}>
        <svg
          viewBox={`0 0 100 ${chartHeight}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = (chartHeight / 4) * i;
            return (
              <line
                key={i}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                strokeWidth="0.2"
              />
            );
          })}
          
          {/* Area gradient */}
          <defs>
            <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Area fill */}
          <path
            d={areaPathData}
            fill="url(#revenueGradient)"
          />
          
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = getXPosition(index);
            const y = getYPosition(point.revenue);
            const isHovered = hoveredPoint === index;
            
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? "1.5" : "0.8"}
                  fill="#3b82f6"
                  stroke={isDarkMode ? '#1f2937' : '#ffffff'}
                  strokeWidth="0.3"
                  vectorEffect="non-scaling-stroke"
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {/* Invisible larger hit area */}
                <circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}
        </svg>
        
        {/* Tooltip */}
        {hoveredPoint !== null && (
          <div
            className={`absolute z-10 px-3 py-2 rounded-lg shadow-lg border transition-opacity duration-200 ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}
            style={{
              left: `${getXPosition(hoveredPoint)}%`,
              top: `${getYPosition(data[hoveredPoint].revenue)}px`,
              transform: 'translate(-50%, -120%)',
              pointerEvents: 'none'
            }}
          >
            <div className="text-xs font-medium mb-1">
              {formatDate(data[hoveredPoint].date)}
            </div>
            <div className="text-sm font-bold flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-blue-500" />
              {formatCurrency(data[hoveredPoint].revenue)}
            </div>
            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {data[hoveredPoint].orders} orders
            </div>
          </div>
        )}
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-4 px-1">
        {data.map((point, index) => {
          if (index % Math.ceil(data.length / 4) === 0 || index === data.length - 1) {
            return (
              <div
                key={index}
                className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {formatDate(point.date)}
              </div>
            );
          }
          return null;
        })}
      </div>
      
      {/* Y-axis labels */}
      <div className="flex justify-between items-center mt-4">
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Min: {formatCurrency(minRevenue)}
        </div>
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Max: {formatCurrency(maxRevenue)}
        </div>
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

const UserAreaChart = ({ data, isDarkMode }: { data: ChartDataPoint[], isDarkMode: boolean }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const maxUsers = Math.max(...data.map(d => d.users));
  const minUsers = Math.min(...data.map(d => d.users));
  const range = maxUsers - minUsers;
  const padding = range * 0.1;
  
  const chartHeight = 200;
  const chartWidth = 100;
  
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * chartWidth;
    const normalizedValue = ((point.users - minUsers + padding) / (range + 2 * padding));
    const y = chartHeight - (normalizedValue * chartHeight);
    return { x, y, ...point };
  });
  
  const pathData = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');
  
  const areaPath = `${pathData} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;
  
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
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        <motion.path
          d={areaPath}
          fill="url(#userGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        
        <motion.path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
        
        {points.map((point, index) => (
          <g key={index}>
            <motion.circle
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === index ? "1.2" : "0.8"}
              fill="#3b82f6"
              stroke={isDarkMode ? "#1f2937" : "#ffffff"}
              strokeWidth="0.3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
              style={{ transformOrigin: `${point.x}px ${point.y}px` }}
            />
          </g>
        ))}
      </svg>
      
      <div className="absolute top-0 left-0 w-full h-full flex justify-between items-end pointer-events-none">
        {points.map((point, index) => (
          <div
            key={index}
            className="flex-1 h-full relative"
            style={{ pointerEvents: 'auto' }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {hoveredIndex === index && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg shadow-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                } text-xs whitespace-nowrap z-10`}
              >
                <div className="font-semibold">{point.users.toLocaleString()} users</div>
                <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex justify-between mt-4">
        {data.map((point, index) => (
          <div
            key={index}
            className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} flex-1 text-center`}
          >
            {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AnalyticsDashboard() {
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Revenue Overview</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Daily revenue trends for the past week
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
                Active users and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserAreaChart data={chartData} isDarkMode={isDarkMode} />
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
                        color: isDarkMode ? '#f3f4f6' : '#111827'
                      }}
                      labelStyle={{
                        color: isDarkMode ? '#f3f4f6' : '#111827',
                        fontWeight: 'bold',
                        marginBottom: '4px'
                      }}
                      formatter={(value: number) => [value, 'Orders']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    />
                    <Bar 
                      dataKey="orders" 
                      fill="#8b5cf6"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={60}
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
                        color: isDarkMode ? '#ffffff' : '#000000'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      formatter={(value: number, name: string) => {
                        if (name === 'revenue') return [`$${value.toLocaleString()}`, 'Revenue'];
                        if (name === 'users') return [value.toLocaleString(), 'Users'];
                        if (name === 'orders') return [value.toLocaleString(), 'Orders'];
                        return [value, name];
                      }}
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
                        onClick={() => {
                          const sorted = [...tableData].sort((a, b) => 
                            a.product.localeCompare(b.product)
                          );
                          setTableData(sorted);
                        }}
                        className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                      >
                        Product
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className={`text-right py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <button
                        onClick={() => {
                          const sorted = [...tableData].sort((a, b) => b.sales - a.sales);
                          setTableData(sorted);
                        }}
                        className="flex items-center justify-end gap-1 hover:opacity-70 transition-opacity ml-auto"
                      >
                        Sales
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className={`text-right py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <button
                        onClick={() => {
                          const sorted = [...tableData].sort((a, b) => b.revenue - a.revenue);
                          setTableData(sorted);
                        }}
                        className="flex items-center justify-end gap-1 hover:opacity-70 transition-opacity ml-auto"
                      >
                        Revenue
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className={`text-center py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}
                    >
                      <td className={`py-4 px-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {row.product}
                      </td>
                      <td className={`py-4 px-4 text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {row.sales.toLocaleString()}
                      </td>
                      <td className={`py-4 px-4 text-right font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        ${row.revenue.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge
                          variant={row.status === 'active' ? 'default' : row.status === 'pending' ? 'secondary' : 'outline'}
                          className={
                            row.status === 'active'
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : row.status === 'pending'
                              ? isDarkMode ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                              : isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-600'
                          }
                        >
                          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
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
                  { stage: 'Visitors', value: 10000, percentage: 100, color: 'bg-blue-500' },
                  { stage: 'Sign Ups', value: 5000, percentage: 50, color: 'bg-indigo-500' },
                  { stage: 'Active Users', value: 2350, percentage: 23.5, color: 'bg-purple-500' },
                  { stage: 'Paying Customers', value: 1543, percentage: 15.4, color: 'bg-pink-500' },
                  { stage: 'Repeat Buyers', value: 892, percentage: 8.9, color: 'bg-rose-500' }
                ].map((item, index) => (
                  <motion.div
                    key={item.stage}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.stage}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.value.toLocaleString()}
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          ({item.percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className={`h-12 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                        className={`h-full ${item.color} flex items-center justify-center`}
                      >
                        {item.percentage > 15 && (
                          <span className="text-white text-xs font-semibold">
                            {item.percentage}%
                          </span>
                        )}
                      </motion.div>
                    </div>
                    {index < 4 && (
                      <div className="flex justify-end mt-1">
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          ↓ {((1 - ([5000, 2350, 1543, 892][index] / [10000, 5000, 2350, 1543][index])) * 100).toFixed(1)}% drop-off
                        </span>
                      </div>
                    )}
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
                            <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 200 200" className="transform -rotate-90">
                      {/* Organic - 40% */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="40"
                        strokeDasharray="201 502"
                        strokeDashoffset="0"
                        className="transition-all duration-500"
                      />
                      {/* Direct - 25% */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="40"
                        strokeDasharray="126 502"
                        strokeDashoffset="-201"
                        className="transition-all duration-500"
                      />
                      {/* Social - 20% */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="40"
                        strokeDasharray="100 502"
                        strokeDashoffset="-327"
                        className="transition-all duration-500"
                      />
                      {/* Referral - 15% */}
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="40"
                        strokeDasharray="75 502"
                        strokeDashoffset="-427"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          100%
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Total Traffic
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Organic Search
                      </span>
                    </div>
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      40%
                    </span>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Direct Traffic
                      </span>
                    </div>
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      25%
                    </span>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Social Media
                      </span>
                    </div>
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      20%
                    </span>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Referral Links
                      </span>
                    </div>
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      15%
                    </span>
                  </motion.div>
                </div>
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
              <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                {mockActivityData.map((activity, index) => {
                  const Icon = getActivityIcon(activity.type);
                  const colorClass = getActivityColor(activity.type, isDarkMode);
                  
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
                      <div className={`p-2 rounded-full ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <Icon className={`h-4 w-4 ${colorClass}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          {activity.message}
                        </p>
                        <p className={`text-xs mt-1 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {activity.timestamp}
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