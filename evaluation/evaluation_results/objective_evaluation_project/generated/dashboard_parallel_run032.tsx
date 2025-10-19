import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw } from 'lucide-react';

import { ShoppingCart, UserPlus, DollarSign, TrendingUp, Package, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Users, ShoppingCart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target } from 'lucide-react';

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
  { id: '1', product: 'Premium Subscription', sales: 342, revenue: 34200, status: 'active' },
  { id: '2', product: 'Basic Plan', sales: 567, revenue: 28350, status: 'active' },
  { id: '3', product: 'Enterprise License', sales: 89, revenue: 89000, status: 'active' },
  { id: '4', product: 'Starter Pack', sales: 234, revenue: 11700, status: 'pending' },
  { id: '5', product: 'Pro Bundle', sales: 156, revenue: 23400, status: 'active' },
  { id: '6', product: 'Legacy Plan', sales: 45, revenue: 4500, status: 'inactive' }
];
interface GoalData {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
}

const mockGoals: GoalData[] = [
  { id: '1', label: 'Monthly Revenue', current: 145000, target: 200000, unit: '$' },
  { id: '2', label: 'New Customers', current: 850, target: 1000, unit: '' },
  { id: '3', label: 'Product Sales', current: 1543, target: 2000, unit: '' },
  { id: '4', label: 'Customer Satisfaction', current: 4.6, target: 5.0, unit: '/5' }
];
interface ActivityItem {
  id: string;
  type: 'sale' | 'user' | 'revenue' | 'alert' | 'product';
  message: string;
  timestamp: string;
  icon: 'cart' | 'user' | 'dollar' | 'trending' | 'package' | 'alert';
}

const mockActivityData: ActivityItem[] = [
  { id: '1', type: 'sale', message: 'New order #1234 - Premium Subscription', timestamp: '2 minutes ago', icon: 'cart' },
  { id: '2', type: 'user', message: 'New user registration: john.doe@example.com', timestamp: '5 minutes ago', icon: 'user' },
  { id: '3', type: 'revenue', message: 'Revenue milestone reached: $50,000', timestamp: '12 minutes ago', icon: 'dollar' },
  { id: '4', type: 'sale', message: 'Order #1233 completed - Enterprise License', timestamp: '18 minutes ago', icon: 'cart' },
  { id: '5', type: 'product', message: 'Product updated: Pro Bundle', timestamp: '25 minutes ago', icon: 'package' },
  { id: '6', type: 'alert', message: 'Low stock alert: Starter Pack', timestamp: '32 minutes ago', icon: 'alert' },
  { id: '7', type: 'user', message: 'New user registration: jane.smith@example.com', timestamp: '45 minutes ago', icon: 'user' },
  { id: '8', type: 'sale', message: 'New order #1232 - Basic Plan', timestamp: '1 hour ago', icon: 'cart' },
  { id: '9', type: 'revenue', message: 'Daily revenue target achieved', timestamp: '1 hour ago', icon: 'trending' },
  { id: '10', type: 'product', message: 'New product added: Ultimate Package', timestamp: '2 hours ago', icon: 'package' }
];

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

if (typeof document !== 'undefined' && !document.getElementById('fadeInUp-keyframes')) {
  const style = document.createElement('style');
  style.id = 'fadeInUp-keyframes';
  style.textContent = fadeInUpKeyframes;
  document.head.appendChild(style);
}
export default function AnalyticsDashboard() {
  type SortField = 'product' | 'sales' | 'revenue' | 'status';
  type SortDirection = 'asc' | 'desc' | null;
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>(mockMetrics);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(mockChartData);
  const [tableData, setTableData] = useState<TableRow[]>(mockTableData);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);
  const getMaxValue = useCallback((data: ChartDataPoint[]) => {
    const maxUsers = Math.max(...data.map(d => d.users));
    const maxOrders = Math.max(...data.map(d => d.orders));
    return Math.max(maxUsers, maxOrders);
  }, []);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
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
  }, [tableData, sortField, sortDirection]);

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

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
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
              <Card 
                key={metric.id}
                className={`transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
                }`}
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {metric.label}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <Icon className={`h-4 w-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {metric.label.includes('Revenue') ? `$${metric.value.toLocaleString()}` :
                     metric.label.includes('Rate') ? `${metric.value}%` :
                     metric.value.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${trendBgColor}`}>
                      <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                      <span className={`text-xs font-medium ${trendColor}`}>
                        {Math.abs(metric.change)}%
                      </span>
                    </div>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
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
                Daily revenue trends for the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '8px',
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
                    activeDot={{ r: 6, fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>User Activity</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Active users and order volume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-6 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Active Users
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Orders
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {chartData.map((dataPoint, index) => {
                    const maxValue = getMaxValue(chartData);
                    const usersWidth = (dataPoint.users / maxValue) * 100;
                    const ordersWidth = (dataPoint.orders / maxValue) * 100;
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(dataPoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        
                        <div className="space-y-1.5">
                          <div className="relative group">
                            <div className={`h-8 rounded transition-all duration-500 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <div 
                                className="h-full bg-blue-500 rounded transition-all duration-700 ease-out flex items-center justify-end pr-2"
                                style={{ width: `${usersWidth}%` }}
                              >
                                <span className="text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                  {dataPoint.users}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="relative group">
                            <div className={`h-8 rounded transition-all duration-500 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <div 
                                className="h-full bg-green-500 rounded transition-all duration-700 ease-out flex items-center justify-end pr-2"
                                style={{ width: `${ordersWidth}%` }}
                              >
                                <span className="text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                  {dataPoint.orders}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          <Card className={`lg:col-span-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Product Performance</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Top selling products and revenue breakdown
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
                          onClick={() => handleSort('product')}
                          className="h-8 px-2 lg:px-3"
                        >
                          Product
                          {getSortIcon('product')}
                        </Button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('sales')}
                          className="h-8 px-2 lg:px-3"
                        >
                          Sales
                          {getSortIcon('sales')}
                        </Button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('revenue')}
                          className="h-8 px-2 lg:px-3"
                        >
                          Revenue
                          {getSortIcon('revenue')}
                        </Button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('status')}
                          className="h-8 px-2 lg:px-3"
                        >
                          Status
                          {getSortIcon('status')}
                        </Button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedTableData().map((row) => (
                      <TableRow 
                        key={row.id}
                        className={isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'hover:bg-gray-50'}
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
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Sales Distribution</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Revenue by product category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '6px',
                        color: isDarkMode ? '#ffffff' : '#000000'
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Pie
                      data={tableData}
                      dataKey="revenue"
                      nameKey="product"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                    >
                      {tableData.map((entry, index) => {
                        const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];
                        return <Cell key={`cell-${entry.id}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      height={36}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Recent Activity</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Latest transactions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {mockActivityData.map((activity) => {
                  const getIcon = () => {
                    switch (activity.icon) {
                      case 'cart':
                        return <ShoppingCart className="h-4 w-4" />;
                      case 'user':
                        return <UserPlus className="h-4 w-4" />;
                      case 'dollar':
                        return <DollarSign className="h-4 w-4" />;
                      case 'trending':
                        return <TrendingUp className="h-4 w-4" />;
                      case 'package':
                        return <Package className="h-4 w-4" />;
                      case 'alert':
                        return <AlertCircle className="h-4 w-4" />;
                      default:
                        return <ShoppingCart className="h-4 w-4" />;
                    }
                  };

                  const getIconBgColor = () => {
                    switch (activity.type) {
                      case 'sale':
                        return isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600';
                      case 'user':
                        return isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600';
                      case 'revenue':
                        return isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600';
                      case 'alert':
                        return isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600';
                      case 'product':
                        return isDarkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-600';
                      default:
                        return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600';
                    }
                  };

                  return (
                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0 border-gray-200 dark:border-gray-700">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getIconBgColor()}`}>
                        {getIcon()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {activity.message}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Performance Goals</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Progress towards monthly targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockGoals.map((goal) => {
                  const percentage = Math.min((goal.current / goal.target) * 100, 100);
                  const isComplete = percentage >= 100;
                  
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {goal.label}
                        </span>
                        <span className={`text-sm font-semibold ${
                          isComplete 
                            ? 'text-green-600 dark:text-green-400' 
                            : isDarkMode ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      
                      <div className={`w-full h-2 rounded-full overflow-hidden ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            isComplete
                              ? 'bg-green-500'
                              : percentage >= 75
                              ? 'bg-blue-500'
                              : percentage >= 50
                              ? 'bg-yellow-500'
                              : 'bg-orange-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {goal.unit === '$' ? `$${goal.current.toLocaleString()}` : `${goal.current}${goal.unit}`}
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Target: {goal.unit === '$' ? `$${goal.target.toLocaleString()}` : `${goal.target}${goal.unit}`}
                        </span>
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