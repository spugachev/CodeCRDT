import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';



import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target } from 'lucide-react';
import { motion } from 'framer-motion';
hoppingCart, Target } from 'lucide-react';
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
interface ActivityEvent {
  id: string;
  type: 'sale' | 'user' | 'system' | 'alert';
  message: string;
  timestamp: string;
}

const mockActivityData: ActivityEvent[] = [
  { id: '1', type: 'sale', message: 'New order #1234 - Premium Plan', timestamp: '2 minutes ago' },
  { id: '2', type: 'user', message: 'New user registration: john@example.com', timestamp: '5 minutes ago' },
  { id: '3', type: 'system', message: 'Database backup completed successfully', timestamp: '12 minutes ago' },
  { id: '4', type: 'sale', message: 'Payment received: $299.00', timestamp: '18 minutes ago' },
  { id: '5', type: 'alert', message: 'Server CPU usage above 80%', timestamp: '25 minutes ago' },
  { id: '6', type: 'user', message: 'User upgraded to Enterprise Plan', timestamp: '32 minutes ago' },
  { id: '7', type: 'sale', message: 'New order #1233 - Basic Plan', timestamp: '45 minutes ago' },
  { id: '8', type: 'system', message: 'Security scan completed', timestamp: '1 hour ago' }
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
interface FunnelStage {
  stage: string;
  value: number;
  color: string;
}

const mockFunnelData: FunnelStage[] = [
  { stage: 'Visitors', value: 10000, color: '#3b82f6' },
  { stage: 'Sign Ups', value: 6500, color: '#8b5cf6' },
  { stage: 'Active Users', value: 4200, color: '#ec4899' },
  { stage: 'Paid Users', value: 2350, color: '#f59e0b' },
  { stage: 'Retained', value: 1890, color: '#10b981' }
];
const ActivityFeed = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'sale':
        return <ShoppingCart className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'system':
        return <Target className="h-4 w-4" />;
      case 'alert':
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'sale':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'user':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'system':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
      case 'alert':
        return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
    }
  };

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
      {mockActivityData.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
            isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
          }`}
        >
          <div className={`p-2 rounded-full ${getEventColor(event.type)}`}>
            {getEventIcon(event.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              {event.message}
            </p>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {event.timestamp}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
const mockTrafficData = [
  { source: 'Organic Search', visitors: 4250, percentage: 42.5, color: '#3b82f6' },
  { source: 'Direct', visitors: 2800, percentage: 28.0, color: '#8b5cf6' },
  { source: 'Social Media', visitors: 1500, percentage: 15.0, color: '#ec4899' },
  { source: 'Referral', visitors: 950, percentage: 9.5, color: '#10b981' },
  { source: 'Email', visitors: 500, percentage: 5.0, color: '#f59e0b' }
];

const RevenueChart = ({ data, isDarkMode }: { data: ChartDataPoint[], isDarkMode: boolean }) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const minRevenue = Math.min(...data.map(d => d.revenue));
  const revenueRange = maxRevenue - minRevenue;
  
  const chartHeight = 250;
  const chartPadding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartWidth = 600;
  
  const getX = (index: number) => {
    const availableWidth = chartWidth - chartPadding.left - chartPadding.right;
    return chartPadding.left + (index / (data.length - 1)) * availableWidth;
  };
  
  const getY = (value: number) => {
    const availableHeight = chartHeight - chartPadding.top - chartPadding.bottom;
    const normalized = (value - minRevenue) / revenueRange;
    return chartHeight - chartPadding.bottom - (normalized * availableHeight);
  };
  
  const pathData = data.map((point, index) => {
    const x = getX(index);
    const y = getY(point.revenue);
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="w-full overflow-x-auto">
      <svg 
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto"
        style={{ minWidth: '300px' }}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = chartHeight - chartPadding.bottom - (ratio * (chartHeight - chartPadding.top - chartPadding.bottom));
          const value = minRevenue + (ratio * revenueRange);
          return (
            <g key={i}>
              <line
                x1={chartPadding.left}
                y1={y}
                x2={chartWidth - chartPadding.right}
                y2={y}
                stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                strokeWidth="1"
              />
              <text
                x={chartPadding.left - 10}
                y={y + 4}
                textAnchor="end"
                className={`text-xs ${isDarkMode ? 'fill-gray-400' : 'fill-gray-600'}`}
              >
                {formatCurrency(value)}
              </text>
            </g>
          );
        })}
        
        {/* Area under the line */}
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${pathData} L ${getX(data.length - 1)} ${chartHeight - chartPadding.bottom} L ${getX(0)} ${chartHeight - chartPadding.bottom} Z`}
          fill="url(#revenueGradient)"
        />
        
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {data.map((point, index) => {
          const x = getX(index);
          const y = getY(point.revenue);
          const isHovered = hoveredPoint === index;
          
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 6 : 4}
                fill="#3b82f6"
                stroke={isDarkMode ? '#1f2937' : '#ffffff'}
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              
              {/* Tooltip */}
              {isHovered && (
                <g>
                  <rect
                    x={x - 60}
                    y={y - 60}
                    width="120"
                    height="50"
                    rx="6"
                    fill={isDarkMode ? '#1f2937' : '#ffffff'}
                    stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                    strokeWidth="1"
                    filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))"
                  />
                  <text
                    x={x}
                    y={y - 40}
                    textAnchor="middle"
                    className={`text-xs font-medium ${isDarkMode ? 'fill-gray-300' : 'fill-gray-600'}`}
                  >
                    {formatDate(point.date)}
                  </text>
                  <text
                    x={x}
                    y={y - 22}
                    textAnchor="middle"
                    className={`text-sm font-bold ${isDarkMode ? 'fill-white' : 'fill-gray-900'}`}
                  >
                    {formatCurrency(point.revenue)}
                  </text>
                </g>
              )}
            </g>
          );
        })}
        
        {/* X-axis labels */}
        {data.map((point, index) => {
          if (index % Math.ceil(data.length / 4) === 0 || index === data.length - 1) {
            const x = getX(index);
            return (
              <text
                key={index}
                x={x}
                y={chartHeight - chartPadding.bottom + 20}
                textAnchor="middle"
                className={`text-xs ${isDarkMode ? 'fill-gray-400' : 'fill-gray-600'}`}
              >
                {formatDate(point.date)}
              </text>
            );
          }
          return null;
        })}
      </svg>
      
      <div className="flex items-center justify-center mt-4 gap-2">
        <TrendingUp className="h-4 w-4 text-green-500" />
        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          +{((data[data.length - 1].revenue - data[0].revenue) / data[0].revenue * 100).toFixed(1)}% from start of period
        </span>
      </div>
    </div>
  );
};

const UserAreaChart = ({ data, isDarkMode }: { data: ChartDataPoint[], isDarkMode: boolean }) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  
  const width = 600;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const maxUsers = Math.max(...data.map(d => d.users));
  const minUsers = Math.min(...data.map(d => d.users));
  
  const getX = (index: number) => (index / (data.length - 1)) * chartWidth;
  const getY = (value: number) => chartHeight - ((value - minUsers) / (maxUsers - minUsers)) * chartHeight;
  
  const pathData = data.map((point, index) => {
    const x = getX(index);
    const y = getY(point.users);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  const areaPath = `${pathData} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;
  
  return (
    <div className="w-full overflow-x-auto">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-auto"
        style={{ minWidth: '300px' }}
      >
        <defs>
          <linearGradient id="userGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = (chartHeight / 4) * i;
            const value = Math.round(maxUsers - ((maxUsers - minUsers) / 4) * i);
            return (
              <g key={i}>
                <line
                  x1="0"
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x="-10"
                  y={y + 4}
                  textAnchor="end"
                  className={`text-xs ${isDarkMode ? 'fill-gray-400' : 'fill-gray-600'}`}
                >
                  {value}
                </text>
              </g>
            );
          })}
          
          {/* Area fill with gradient */}
          <motion.path
            d={areaPath}
            fill="url(#userGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
          
          {/* Line stroke */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = getX(index);
            const y = getY(point.users);
            const isHovered = hoveredPoint === index;
            
            return (
              <g key={index}>
                <motion.circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill="#3b82f6"
                  stroke={isDarkMode ? '#1f2937' : '#ffffff'}
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.3 }}
                />
                
                {/* Tooltip */}
                {isHovered && (
                  <g>
                    <motion.rect
                      x={x - 60}
                      y={y - 60}
                      width="120"
                      height="50"
                      rx="6"
                      fill={isDarkMode ? '#1f2937' : '#ffffff'}
                      stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                      strokeWidth="1"
                      initial={{ opacity: 0, y: y - 50 }}
                      animate={{ opacity: 1, y: y - 60 }}
                      transition={{ duration: 0.2 }}
                      style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
                    />
                    <motion.text
                      x={x}
                      y={y - 42}
                      textAnchor="middle"
                      className={`text-xs font-semibold ${isDarkMode ? 'fill-gray-300' : 'fill-gray-700'}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </motion.text>
                    <motion.text
                      x={x}
                      y={y - 25}
                      textAnchor="middle"
                      className={`text-sm font-bold ${isDarkMode ? 'fill-blue-400' : 'fill-blue-600'}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      {point.users.toLocaleString()} users
                    </motion.text>
                  </g>
                )}
              </g>
            );
          })}
          
          {/* X-axis labels */}
          {data.map((point, index) => {
            if (index % Math.ceil(data.length / 4) === 0 || index === data.length - 1) {
              const x = getX(index);
              return (
                <text
                  key={`label-${index}`}
                  x={x}
                  y={chartHeight + 25}
                  textAnchor="middle"
                  className={`text-xs ${isDarkMode ? 'fill-gray-400' : 'fill-gray-600'}`}
                >
                  {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </text>
              );
            }
            return null;
          })}
        </g>
      </svg>
    </div>
  );
};

export default function AnalyticsDashboard() {
  const [sortColumn, setSortColumn] = useState<keyof TableRow | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = useCallback((column: keyof TableRow) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn]);

  const sortedTableData = useCallback(() => {
    if (!sortColumn) return tableData;
    
    return [...tableData].sort((a, b) => {
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
  }, [tableData, sortColumn, sortDirection]);

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
                          {metric.label.includes('Revenue') ? `$${metric.value.toLocaleString()}` :
                           metric.label.includes('Rate') ? `${metric.value}%` :
                           metric.value.toLocaleString()}
                        </div>
                        <div className={`flex items-center gap-1 mt-2 px-2 py-1 rounded-md ${trendBgColor} w-fit`}>
                          <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                          <span className={`text-xs font-medium ${trendColor}`}>
                            {Math.abs(metric.change)}%
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
                        color: isDarkMode ? '#ffffff' : '#000000'
                      }}
                      labelStyle={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                    />
                    <Bar 
                      dataKey="orders" 
                      fill="#3b82f6" 
                      radius={[8, 8, 0, 0]}
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
                      wrapperStyle={{
                        color: isDarkMode ? '#9ca3af' : '#6b7280'
                      }}
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
              <Table>
                <TableHeader>
                  <TableRow className={isDarkMode ? 'border-gray-700' : ''}>
                    <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('product')}
                        className={`font-semibold ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
                      >
                        Product
                        {sortColumn === 'product' && (
                          sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                        )}
                        {sortColumn !== 'product' && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                      </Button>
                    </TableHead>
                    <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('sales')}
                        className={`font-semibold ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
                      >
                        Sales
                        {sortColumn === 'sales' && (
                          sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                        )}
                        {sortColumn !== 'sales' && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                      </Button>
                    </TableHead>
                    <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('revenue')}
                        className={`font-semibold ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
                      >
                        Revenue
                        {sortColumn === 'revenue' && (
                          sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                        )}
                        {sortColumn !== 'revenue' && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                      </Button>
                    </TableHead>
                    <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('status')}
                        className={`font-semibold ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
                      >
                        Status
                        {sortColumn === 'status' && (
                          sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                        )}
                        {sortColumn !== 'status' && <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />}
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTableData().map((row) => (
                    <TableRow 
                      key={row.id}
                      className={`${isDarkMode ? 'border-gray-700 hover:bg-gray-750' : 'hover:bg-gray-50'} transition-colors`}
                    >
                      <TableCell className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {row.product}
                      </TableCell>
                      <TableCell className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {formatNumber(row.sales)}
                      </TableCell>
                      <TableCell className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {formatCurrency(row.revenue)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(row.status)}
                          className={`capitalize ${
                            row.status === 'active' 
                              ? isDarkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
                              : row.status === 'pending'
                              ? isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-500 text-white'
                              : isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-400 text-white'
                          }`}
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                {mockFunnelData.map((stage, index) => {
                  const percentage = index === 0 ? 100 : ((stage.value / mockFunnelData[0].value) * 100).toFixed(1);
                  const width = index === 0 ? 100 : (stage.value / mockFunnelData[0].value) * 100;
                  const conversionRate = index > 0 ? ((stage.value / mockFunnelData[index - 1].value) * 100).toFixed(1) : null;
                  
                  return (
                    <motion.div
                      key={stage.stage}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            {stage.stage}
                          </span>
                          {conversionRate && (
                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              ({conversionRate}% conversion)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {stage.value.toLocaleString()}
                          </span>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div className={`h-12 rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${width}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                          className="h-full flex items-center justify-center rounded-lg"
                          style={{ backgroundColor: stage.color }}
                        >
                          <Target className="h-5 w-5 text-white opacity-80" />
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
                
                <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Overall Conversion Rate
                    </span>
                    <span className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {((mockFunnelData[mockFunnelData.length - 1].value / mockFunnelData[0].value) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
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
                <div className="relative w-full aspect-square max-w-[240px] mx-auto">
                  <svg viewBox="0 0 200 200" className="transform -rotate-90">
                    {mockTrafficData.reduce((acc, item, index) => {
                      const total = mockTrafficData.reduce((sum, d) => sum + d.visitors, 0);
                      const percentage = (item.visitors / total) * 100;
                      const angle = (percentage / 100) * 360;
                      const startAngle = acc.currentAngle;
                      const endAngle = startAngle + angle;
                      
                      const startRad = (startAngle * Math.PI) / 180;
                      const endRad = (endAngle * Math.PI) / 180;
                      
                      const innerRadius = 60;
                      const outerRadius = 90;
                      
                      const x1 = 100 + outerRadius * Math.cos(startRad);
                      const y1 = 100 + outerRadius * Math.sin(startRad);
                      const x2 = 100 + outerRadius * Math.cos(endRad);
                      const y2 = 100 + outerRadius * Math.sin(endRad);
                      const x3 = 100 + innerRadius * Math.cos(endRad);
                      const y3 = 100 + innerRadius * Math.sin(endRad);
                      const x4 = 100 + innerRadius * Math.cos(startRad);
                      const y4 = 100 + innerRadius * Math.sin(startRad);
                      
                      const largeArc = angle > 180 ? 1 : 0;
                      
                      const pathData = [
                        `M ${x1} ${y1}`,
                        `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
                        `L ${x3} ${y3}`,
                        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
                        'Z'
                      ].join(' ');
                      
                      acc.paths.push(
                        <motion.path
                          key={item.source}
                          d={pathData}
                          fill={item.color}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      );
                      
                      acc.currentAngle = endAngle;
                      return acc;
                    }, { paths: [] as JSX.Element[], currentAngle: 0 }).paths}
                  </svg>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {mockTrafficData.reduce((sum, d) => sum + d.visitors, 0).toLocaleString()}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Visitors
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {mockTrafficData.map((item, index) => (
                    <motion.div
                      key={item.source}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {item.source}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.visitors.toLocaleString()}
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.percentage}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
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
              <ActivityFeed isDarkMode={isDarkMode} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}