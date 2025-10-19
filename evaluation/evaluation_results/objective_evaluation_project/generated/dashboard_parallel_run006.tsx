import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { Activity, Wifi, Database } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { motion } from 'framer-motion';
eChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
;

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
  { id: '3', product: 'Enterprise Plan', sales: 89, revenue: 17800, status: 'active' },
  { id: '4', product: 'Starter Plan', sales: 432, revenue: 4320, status: 'pending' },
  { id: '5', product: 'Pro Plan', sales: 156, revenue: 15600, status: 'active' }
];
const mockPieData = [
  { name: 'Premium Plan', value: 234, color: '#3b82f6' },
  { name: 'Basic Plan', value: 567, color: '#10b981' },
  { name: 'Enterprise Plan', value: 89, color: '#f59e0b' },
  { name: 'Starter Plan', value: 432, color: '#8b5cf6' },
  { name: 'Pro Plan', value: 156, color: '#ec4899' }
];

type SortField = 'product' | 'sales' | 'revenue' | 'status';
type SortDirection = 'asc' | 'desc' | null;

const fadeInUpKeyframes = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
export default function AnalyticsDashboard() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState<'online' | 'syncing' | 'connected'>('online');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>(mockMetrics);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(mockChartData);
  const [tableData, setTableData] = useState<TableRow[]>(mockTableData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  
  // Update timestamp periodically
  useState(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Cycle through statuses for demo
      setSystemStatus(prev => {
        if (prev === 'online') return 'syncing';
        if (prev === 'syncing') return 'connected';
        return 'online';
      });
    }, 5000);
    return () => clearInterval(interval);
  });

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const realtimeIndicators = [
    {
      id: '1',
      label: 'System Status',
      status: systemStatus,
      icon: Activity,
      color: systemStatus === 'online' ? 'text-green-500' : systemStatus === 'syncing' ? 'text-blue-500' : 'text-purple-500',
      bgColor: systemStatus === 'online' ? 'bg-green-500/10' : systemStatus === 'syncing' ? 'bg-blue-500/10' : 'bg-purple-500/10'
    },
    {
      id: '2',
      label: 'Data Stream',
      status: 'active',
      icon: Wifi,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      id: '3',
      label: 'Database',
      status: 'connected',
      icon: Database,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    }
  ];
  const [pieData] = useState(mockPieData);
  const maxUsers = Math.max(...chartData.map(d => d.users));
  const minUsers = Math.min(...chartData.map(d => d.users));

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  }, [sortField, sortDirection]);

  const sortedTableData = useCallback(() => {
    if (!sortField || !sortDirection) return tableData;

    return [...tableData].sort((a, b) => {
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
  }, [tableData, sortField, sortDirection])();

  const totalPages = Math.ceil(sortedTableData.length / itemsPerPage);
  const paginatedData = sortedTableData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-4 w-4 ml-1 inline" />;
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="h-4 w-4 ml-1 inline" />;
    }
    return <ChevronDown className="h-4 w-4 ml-1 inline" />;
  };

  const getStatusBadge = (status: TableRow['status']) => {
    const variants = {
      active: 'default',
      pending: 'secondary',
      inactive: 'outline'
    } as const;

    const colors = {
      active: isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800',
      pending: isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
      inactive: isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <p className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Revenue' ? `$${entry.value.toLocaleString()}` : entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
        revenue: row.revenue + Math.floor(Math.random() * 2000 - 1000),
        status: ['active', 'pending', 'inactive'][Math.floor(Math.random() * 3)] as 'active' | 'pending' | 'inactive'
      }));

      setMetrics(updatedMetrics);
      setChartData(updatedChartData);
      setTableData(updatedTableData);
      setIsRefreshing(false);
    }, 1500);
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <style>{fadeInUpKeyframes}</style>
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
            const Icon = 
              metric.label === 'Total Revenue' ? DollarSign :
              metric.label === 'Active Users' ? Users :
              metric.label === 'Total Orders' ? ShoppingCart :
              Target;
            
            const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
            const trendColor = metric.trend === 'up' ? 'text-green-500' : 'text-red-500';
            const trendBgColor = metric.trend === 'up' 
              ? (isDarkMode ? 'bg-green-500/10' : 'bg-green-50')
              : (isDarkMode ? 'bg-red-500/10' : 'bg-red-50');

            return (
              <Card 
                key={metric.id}
                className={`transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.5s ease-out forwards',
                  opacity: 0
                }}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className={`text-sm font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {metric.label}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {metric.label.includes('Revenue') || metric.label.includes('Rate')
                      ? metric.label.includes('Rate')
                        ? `${metric.value}%`
                        : `$${metric.value.toLocaleString()}`
                      : metric.value.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${trendBgColor}`}>
                      <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                      <span className={`text-xs font-medium ${trendColor}`}>
                        {Math.abs(metric.change)}%
                      </span>
                    </div>
                    <span className={`text-xs ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      vs last period
                    </span>
                  </div>
                </CardContent>
              </Card>
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
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
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
              <div className="relative h-64 w-full">
                <svg className="w-full h-full" viewBox="0 0 700 256" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="userGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  
                  <motion.path
                    d={`
                      M 0,${256 - ((chartData[0].users - minUsers) / (maxUsers - minUsers)) * 200}
                      ${chartData.map((point, i) => {
                        const x = (i / (chartData.length - 1)) * 700;
                        const y = 256 - ((point.users - minUsers) / (maxUsers - minUsers)) * 200;
                        return `L ${x},${y}`;
                      }).join(' ')}
                      L 700,256
                      L 0,256
                      Z
                    `}
                    fill="url(#userGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                  
                  <motion.path
                    d={`
                      M 0,${256 - ((chartData[0].users - minUsers) / (maxUsers - minUsers)) * 200}
                      ${chartData.map((point, i) => {
                        const x = (i / (chartData.length - 1)) * 700;
                        const y = 256 - ((point.users - minUsers) / (maxUsers - minUsers)) * 200;
                        return `L ${x},${y}`;
                      }).join(' ')}
                    `}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  
                  {chartData.map((point, i) => {
                    const x = (i / (chartData.length - 1)) * 700;
                    const y = 256 - ((point.users - minUsers) / (maxUsers - minUsers)) * 200;
                    return (
                      <motion.g key={i}>
                        <motion.circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#3b82f6"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 * i }}
                        />
                        <motion.circle
                          cx={x}
                          cy={y}
                          r="8"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          opacity="0"
                          whileHover={{ opacity: 1, scale: 1.5 }}
                        />
                      </motion.g>
                    );
                  })}
                </svg>
                
                <div className="flex justify-between mt-4 px-2">
                  {chartData.map((point, i) => (
                    <motion.div
                      key={i}
                      className="text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * i }}
                    >
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className={`text-sm font-semibold mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {point.users}
                      </div>
                    </motion.div>
                  ))}
                </div>
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
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
                    tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
                    tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend 
                    wrapperStyle={{ 
                      paddingTop: '20px',
                      color: isDarkMode ? '#e5e7eb' : '#374151'
                    }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    name="Revenue"
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                  />
                  <Bar 
                    dataKey="users" 
                    name="Users"
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                  />
                  <Bar 
                    dataKey="orders" 
                    name="Orders"
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th 
                      className={`text-left p-3 font-semibold cursor-pointer hover:bg-opacity-50 ${
                        isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => handleSort('product')}
                    >
                      Product {getSortIcon('product')}
                    </th>
                    <th 
                      className={`text-right p-3 font-semibold cursor-pointer hover:bg-opacity-50 ${
                        isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => handleSort('sales')}
                    >
                      Sales {getSortIcon('sales')}
                    </th>
                    <th 
                      className={`text-right p-3 font-semibold cursor-pointer hover:bg-opacity-50 ${
                        isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => handleSort('revenue')}
                    >
                      Revenue {getSortIcon('revenue')}
                    </th>
                    <th 
                      className={`text-center p-3 font-semibold cursor-pointer hover:bg-opacity-50 ${
                        isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => handleSort('status')}
                    >
                      Status {getSortIcon('status')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, index) => (
                    <tr 
                      key={row.id}
                      className={`border-b transition-colors ${
                        isDarkMode 
                          ? 'border-gray-700 hover:bg-gray-700' 
                          : 'border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <td className={`p-3 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {row.product}
                      </td>
                      <td className={`p-3 text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {row.sales.toLocaleString()}
                      </td>
                      <td className={`p-3 text-right font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        ${row.revenue.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        {getStatusBadge(row.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedTableData.length)} of {sortedTableData.length} products
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={isDarkMode ? 'border-gray-700' : ''}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 ${isDarkMode && currentPage !== page ? 'border-gray-700' : ''}`}
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
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8">
          {realtimeIndicators.map((indicator) => {
            const IconComponent = indicator.icon;
            return (
              <Card 
                key={indicator.id} 
                className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''} relative overflow-hidden`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`relative ${indicator.bgColor} p-3 rounded-lg`}>
                        <IconComponent className={`h-5 w-5 ${indicator.color}`} />
                        {/* Pulse animation */}
                        <span className={`absolute inset-0 rounded-lg ${indicator.bgColor} animate-ping opacity-75`}></span>
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {indicator.label}
                        </p>
                        <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} capitalize`}>
                          {indicator.status}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 ${indicator.color}`}>
                      <div className="relative">
                        <div className={`w-2 h-2 rounded-full ${indicator.color.replace('text-', 'bg-')}`}></div>
                        <div className={`absolute inset-0 w-2 h-2 rounded-full ${indicator.color.replace('text-', 'bg-')} animate-ping`}></div>
                      </div>
                      <span className="text-xs font-medium">Live</span>
                    </div>
                  </div>
                  <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Last updated
                      </span>
                      <span className={`text-xs font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatTimestamp(lastUpdate)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}