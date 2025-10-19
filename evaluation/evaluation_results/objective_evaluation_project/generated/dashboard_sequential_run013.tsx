import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Moon, Sun, TrendingUp, TrendingDown, Users, DollarSign, ShoppingCart, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricData {
  label: string;
  value: string;
  change: number;
  icon: any;
}

interface ChartDataPoint {
  label: string;
  value: number;
}

interface TableRow {
  id: number;
  product: string;
  sales: number;
  revenue: string;
  status: 'up' | 'down' | 'stable';
}

export default function AnalyticsDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [metrics, setMetrics] = useState<MetricData[]>([
    { label: 'Total Revenue', value: '$45,231', change: 12.5, icon: DollarSign },
    { label: 'Active Users', value: '2,345', change: 8.2, icon: Users },
    { label: 'Total Orders', value: '1,234', change: -3.1, icon: ShoppingCart },
    { label: 'Conversion Rate', value: '3.24%', change: 5.7, icon: Activity },
  ]);

  const [chartData, setChartData] = useState<ChartDataPoint[]>([
    { label: 'Jan', value: 4000 },
    { label: 'Feb', value: 3000 },
    { label: 'Mar', value: 5000 },
    { label: 'Apr', value: 4500 },
    { label: 'May', value: 6000 },
    { label: 'Jun', value: 5500 },
    { label: 'Jul', value: 7000 },
  ]);

  const [pieData, setPieData] = useState<ChartDataPoint[]>([
    { label: 'Desktop', value: 45 },
    { label: 'Mobile', value: 35 },
    { label: 'Tablet', value: 20 },
  ]);

  const [tableData, setTableData] = useState<TableRow[]>([
    { id: 1, product: 'Premium Widget', sales: 1234, revenue: '$12,340', status: 'up' },
    { id: 2, product: 'Standard Package', sales: 987, revenue: '$9,870', status: 'up' },
    { id: 3, product: 'Basic Plan', sales: 756, revenue: '$7,560', status: 'down' },
    { id: 4, product: 'Enterprise Suite', sales: 543, revenue: '$54,300', status: 'up' },
    { id: 5, product: 'Starter Kit', sales: 432, revenue: '$4,320', status: 'stable' },
  ]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.label === 'Total Revenue' 
          ? `$${(Math.random() * 50000 + 40000).toFixed(0)}`
          : metric.label === 'Active Users'
          ? `${(Math.random() * 1000 + 2000).toFixed(0)}`
          : metric.label === 'Total Orders'
          ? `${(Math.random() * 500 + 1000).toFixed(0)}`
          : `${(Math.random() * 2 + 2.5).toFixed(2)}%`,
        change: (Math.random() * 20 - 5),
      })));

      setChartData(prev => prev.map(point => ({
        ...point,
        value: Math.floor(Math.random() * 3000 + 4000),
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const maxChartValue = Math.max(...chartData.map(d => d.value));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-950' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Real-time insights and performance metrics</p>
            </div>
            <Button
              onClick={() => setIsDarkMode(!isDarkMode)}
              variant="outline"
              size="icon"
              className="dark:border-gray-700"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </motion.div>

          {/* Metrics Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card className="dark:bg-gray-900 dark:border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {metric.label}
                    </CardTitle>
                    <metric.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</div>
                    <div className="flex items-center mt-2">
                      {metric.change >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${metric.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">vs last month</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts Section */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Bar Chart */}
            <Card className="lg:col-span-2 dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Revenue Overview</CardTitle>
                <CardDescription className="dark:text-gray-400">Monthly revenue trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {chartData.map((point, index) => (
                    <motion.div
                      key={point.label}
                      className="flex-1 flex flex-col items-center"
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <motion.div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg relative group cursor-pointer"
                        style={{ height: `${(point.value / maxChartValue) * 100}%` }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          ${point.value.toLocaleString()}
                        </div>
                      </motion.div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">{point.label}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Traffic Sources</CardTitle>
                <CardDescription className="dark:text-gray-400">Device breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      {pieData.reduce((acc, item, index) => {
                        const total = pieData.reduce((sum, d) => sum + d.value, 0);
                        const percentage = (item.value / total) * 100;
                        const angle = (percentage / 100) * 360;
                        const prevAngles = pieData.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0);
                        
                        const colors = ['#3b82f6', '#8b5cf6', '#ec4899'];
                        
                        return [
                          ...acc,
                          <motion.circle
                            key={item.label}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={colors[index]}
                            strokeWidth="20"
                            strokeDasharray={`${(angle / 360) * 251.2} 251.2`}
                            strokeDashoffset={-((prevAngles / 360) * 251.2)}
                            initial={{ strokeDasharray: '0 251.2' }}
                            animate={{ strokeDasharray: `${(angle / 360) * 251.2} 251.2` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                          />
                        ];
                      }, [] as JSX.Element[])}
                    </svg>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  {pieData.map((item, index) => {
                    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500'];
                    return (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${colors[index]}`} />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}%</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Data Table */}
          <motion.div variants={itemVariants}>
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Top Products</CardTitle>
                <CardDescription className="dark:text-gray-400">Best performing products this month</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="dark:bg-gray-800">
                    <TabsTrigger value="all">All Products</TabsTrigger>
                    <TabsTrigger value="trending">Trending</TabsTrigger>
                    <TabsTrigger value="declining">Declining</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="mt-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b dark:border-gray-800">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Product</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Sales</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.map((row, index) => (
                            <motion.tr
                              key={row.id}
                              className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">{row.product}</td>
                              <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{row.sales.toLocaleString()}</td>
                              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">{row.revenue}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1">
                                  {row.status === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                                  {row.status === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                                  {row.status === 'stable' && <Activity className="h-4 w-4 text-gray-500" />}
                                  <span className={`text-sm ${
                                    row.status === 'up' ? 'text-green-500' : 
                                    row.status === 'down' ? 'text-red-500' : 
                                    'text-gray-500'
                                  }`}>
                                    {row.status === 'up' ? 'Growing' : row.status === 'down' ? 'Declining' : 'Stable'}
                                  </span>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                  <TabsContent value="trending" className="mt-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b dark:border-gray-800">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Product</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Sales</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.filter(row => row.status === 'up').map((row, index) => (
                            <motion.tr
                              key={row.id}
                              className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">{row.product}</td>
                              <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{row.sales.toLocaleString()}</td>
                              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">{row.revenue}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="h-4 w-4 text-green-500" />
                                  <span className="text-sm text-green-500">Growing</span>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                  <TabsContent value="declining" className="mt-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b dark:border-gray-800">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Product</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Sales</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.filter(row => row.status === 'down').map((row, index) => (
                            <motion.tr
                              key={row.id}
                              className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">{row.product}</td>
                              <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{row.sales.toLocaleString()}</td>
                              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">{row.revenue}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1">
                                  <TrendingDown className="h-4 w-4 text-red-500" />
                                  <span className="text-sm text-red-500">Declining</span>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}