table table with product data, status badges, pagination, and responsive design */}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8">
          {realtimeUpdates.map((update, index) => {
            const getUpdateIcon = () => {
              switch (update.type) {
                case 'success':
                  return <Zap className="h-5 w-5 text-green-500" />;
                case 'warning':
                  return <Activity className="h-5 w-5 text-yellow-500" />;
                case 'info':
                  return <Clock className="h-5 w-5 text-blue-500" />;
              }
            };

            const getBorderColor = () => {
              switch (update.type) {
                case 'success':
                  return 'border-l-green-500';
                case 'warning':
                  return 'border-l-yellow-500';
                case 'info':
                  return 'border-l-blue-500';
              }
            };

            return (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''} border-l-4 ${getBorderColor()} relative overflow-hidden`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.5, 1]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="absolute inset-0 rounded-full bg-current opacity-20"
                        />
                        {getUpdateIcon()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {update.title}
                        </h3>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {update.description}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <Clock className={`h-3 w-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {getTimeAgo(update.timestamp)}
                          </span>
                        </div>
                      </div>

                      <motion.div
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className={`w-2 h-2 rounded-full ${
                          update.type === 'success' ? 'bg-green-500' :
                          update.type === 'warning' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw } from 'lucide-react';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target } from 'lucide-react';
import { Activity, Zap, Clock } from 'lucide-react';
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

interface RealtimeUpdate {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: 'success' | 'warning' | 'info';
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

const mockRealtimeUpdates: RealtimeUpdate[] = [
  {
    id: '1',
    title: 'New Order Received',
    description: 'Premium Plan subscription from Enterprise Corp',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    type: 'success'
  },
  {
    id: '2',
    title: 'High Traffic Alert',
    description: 'User activity increased by 45% in the last hour',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    type: 'warning'
  },
  {
    id: '3',
    title: 'System Update',
    description: 'Dashboard metrics refreshed successfully',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    type: 'info'
  }
];

const pieChartColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const generatePieChartData = (data: TableRow[]): PieChartData[] => {
  return data.map((row, index) => ({
    label: row.product,
    value: row.sales,
    color: pieChartColors[index % pieChartColors.length]
  }));
};

const PieChart = ({ data, isDark }: { data: PieChartData[]; isDark: boolean }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const size = 200;
  const center = size / 2;
  const radius = size / 2 - 10;
  
  let currentAngle = -90;
  
  const slices = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    
    currentAngle = endAngle;
    
    return {
      path,
      color: item.color,
      percentage,
      label: item.label,
      value: item.value
    };
  });
  
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((slice, index) => (
            <motion.path
              key={index}
              d={slice.path}
              fill={slice.color}
              stroke={isDark ? '#1f2937' : '#ffffff'}
              strokeWidth={2}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.6,
                scale: hoveredIndex === index ? 1.05 : 1
              }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer', transformOrigin: `${center}px ${center}px` }}
            />
          ))}
        </svg>
        
        {hoveredIndex !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none`}
          >
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {slices[hoveredIndex].percentage.toFixed(1)}%
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {slices[hoveredIndex].value} orders
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="w-full space-y-2">
        {slices.map((slice, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
              hoveredIndex === index ? (isDark ? 'bg-gray-700' : 'bg-gray-100') : ''
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {slice.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {slice.value}
              </span>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {slice.percentage.toFixed(1)}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const UserChart = ({ data, isDarkMode }: { data: ChartDataPoint[], isDarkMode: boolean }) => {
  const maxUsers = Math.max(...data.map(d => d.users));
  const minUsers = Math.min(...data.map(d => d.users));
  const range = maxUsers - minUsers;
  const padding = range * 0.2;
  const chartMax = maxUsers + padding;
  const chartMin = Math.max(0, minUsers - padding);
  const chartRange = chartMax - chartMin;

  const width = 100;
  const height = 100;

  // Create SVG path for area chart
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * width;
    const normalizedValue = ((point.users - chartMin) / chartRange);
    const y = height - (normalizedValue * height);
    return { x, y, value: point.users };
  });

  const linePath = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full h-64 relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
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

        {/* Animated area fill */}
        <motion.path
          d={areaPath}
          fill="url(#userGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {/* Animated line stroke */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Data points */}
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

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 px-1">
        {data.map((point, index) => (
          index % Math.ceil(data.length / 4) === 0 || index === data.length - 1 ? (
            <motion.span
              key={index}
              className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              {formatDate(point.date)}
            </motion.span>
          ) : null
        ))}
      </div>

      {/* Y-axis reference */}
      <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between">
        <motion.span
          className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {Math.round(chartMax)}
        </motion.span>
        <motion.span
          className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          {Math.round((chartMax + chartMin) / 2)}
        </motion.span>
        <motion.span
          className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(chartMin)}
        </motion.span>
      </div>

      {/* Hover tooltip area */}
      <div className="absolute inset-0 flex">
        {points.map((point, index) => (
          <motion.div
            key={index}
            className="flex-1 group relative cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 + index * 0.05 }}
          >
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className={`px-3 py-2 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className="text-xs font-semibold">{point.value.toLocaleString()} users</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {formatDate(data[index].date)}
                </div>
              </div>
            </div>
          </motion.div>
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
  const [realtimeUpdates, setRealtimeUpdates] = useState<RealtimeUpdate[]>(mockRealtimeUpdates);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      const updateTypes: Array<'success' | 'warning' | 'info'> = ['success', 'warning', 'info'];
      const titles = [
        'New Order Received',
        'User Milestone Reached',
        'Revenue Target Hit',
        'High Traffic Alert',
        'System Update',
        'Performance Optimized'
      ];
      const descriptions = [
        'Premium Plan subscription from Tech Startup',
        'Active users exceeded 2,500 milestone',
        'Monthly revenue goal achieved',
        'User activity spike detected',
        'Real-time data synchronized',
        'Dashboard response time improved'
      ];

      const newUpdate: RealtimeUpdate = {
        id: Date.now().toString(),
        title: titles[Math.floor(Math.random() * titles.length)],
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        timestamp: new Date(),
        type: updateTypes[Math.floor(Math.random() * updateTypes.length)]
      };

      setRealtimeUpdates(prev => [newUpdate, ...prev.slice(0, 2)]);
      setLastUpdateTime(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (timestamp: Date) => {
    const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const getMaxValue = useCallback((data: ChartDataPoint[]) => {
    const maxRevenue = Math.max(...data.map(d => d.revenue));
    const maxUsers = Math.max(...data.map(d => d.users));
    const maxOrders = Math.max(...data.map(d => d.orders));
    return Math.max(maxRevenue, maxUsers, maxOrders);
  }, []);

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
        revenue: row.revenue + Math.floor(Math.random() * 2000 - 1000),
        status: ['active', 'pending', 'inactive'][Math.floor(Math.random() * 3)] as 'active' | 'pending' | 'inactive'
      }));

      setMetrics(updatedMetrics);
      setChartData(updatedChartData);
      setTableData(updatedTableData);
      setIsRefreshing(false);
    }, 1500)</parameter>
</invoke>
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
            const getIcon = () => {
              switch (metric.label) {
                case 'Total Revenue':
                  return <DollarSign className="h-5 w-5" />;
                case 'Active Users':
                  return <Users className="h-5 w-5" />;
                case 'Total Orders':
                  return <ShoppingCart className="h-5 w-5" />;
                case 'Conversion Rate':
                  return <Target className="h-5 w-5" />;
                default:
                  return <TrendingUp className="h-5 w-5" />;
              }
            };

            const formatValue = (value: number, label: string) => {
              if (label === 'Total Revenue') return `$${value.toLocaleString()}`;
              if (label === 'Conversion Rate') return `${value}%`;
              return value.toLocaleString();
            };

            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {metric.label}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${
                      isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getIcon()}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatValue(metric.value, metric.label)}
                    </div>
                    <div className="flex items-center mt-2">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
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
              <div className="w-full h-[300px] relative">
                <svg className="w-full h-full" viewBox="0 0 700 300" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <g className="grid-lines">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={i * 60 + 30}
                        x2="700"
                        y2={i * 60 + 30}
                        stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                        strokeWidth="1"
                      />
                    ))}
                  </g>

                  {/* Revenue line */}
                  <motion.path
                    d={(() => {
                      const maxRevenue = Math.max(...chartData.map(d => d.revenue));
                      const points = chartData.map((d, i) => {
                        const x = (i / (chartData.length - 1)) * 700;
                        const y = 270 - (d.revenue / maxRevenue) * 240;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ');
                      return points;
                    })()}
                    fill="none"
                    stroke={isDarkMode ? '#60a5fa' : '#3b82f6'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />

                  {/* Data points */}
                  {chartData.map((d, i) => {
                    const maxRevenue = Math.max(...chartData.map(d => d.revenue));
                    const x = (i / (chartData.length - 1)) * 700;
                    const y = 270 - (d.revenue / maxRevenue) * 240;
                    return (
                      <g key={i}>
                        <motion.circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill={isDarkMode ? '#60a5fa' : '#3b82f6'}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1, duration: 0.3 }}
                          className="cursor-pointer hover:r-7 transition-all"
                        />
                        <title>{`${d.date}: $${d.revenue.toLocaleString()}`}</title>
                      </g>
                    );
                  })}
                </svg>

                {/* X-axis labels */}
                <div className="flex justify-between mt-2 px-1">
                  {chartData.map((d, i) => (
                    <span
                      key={i}
                      className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  ))}
                </div>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-[300px] flex flex-col justify-between -ml-12">
                  {[0, 1, 2, 3, 4].map((i) => {
                    const maxRevenue = Math.max(...chartData.map(d => d.revenue));
                    const value = maxRevenue - (i * maxRevenue / 4);
                    return (
                      <span
                        key={i}
                        className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                      >
                        ${(value / 1000).toFixed(0)}k
                      </span>
                    );
                  })}
                </div>
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
              <PieChart data={generatePieChartData(tableData)} isDark={isDarkMode} />
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
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Orders</span>
                  </div>
                </div>

                <div className="relative h-80">
                  <div className="absolute inset-0 flex items-end justify-around gap-2 px-4">
                    {chartData.map((dataPoint, index) => {
                      const maxValue = getMaxValue(chartData);
                      const revenueHeight = (dataPoint.revenue / maxValue) * 100;
                      const usersHeight = (dataPoint.users / maxValue) * 100;
                      const ordersHeight = (dataPoint.orders / maxValue) * 100;

                      return (
                        <div key={dataPoint.date} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex items-end justify-center gap-1 h-64">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${revenueHeight}%` }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                                    style={{ minHeight: '4px' }}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-semibold">Revenue</p>
                                  <p>${dataPoint.revenue.toLocaleString()}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${usersHeight}%` }}
                                    transition={{ duration: 0.5, delay: index * 0.1 + 0.05 }}
                                    className="flex-1 bg-green-500 rounded-t hover:bg-green-600 transition-colors cursor-pointer"
                                    style={{ minHeight: '4px' }}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-semibold">Users</p>
                                  <p>{dataPoint.users.toLocaleString()}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${ordersHeight}%` }}
                                    transition={{ duration: 0.5, delay: index * 0.1 + 0.1 }}
                                    className="flex-1 bg-purple-500 rounded-t hover:bg-purple-600 transition-colors cursor-pointer"
                                    style={{ minHeight: '4px' }}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-semibold">Orders</p>
                                  <p>{dataPoint.orders.toLocaleString()}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(dataPoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      );
                    })}
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
            {/* TODO:DataTable Render sor