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
  status: 'success' | 'warning' | 'danger';
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
    { id: 1, product: 'Premium Subscription', sales: 1234, revenue: '$12,340', status: 'success' },
    { id: 2, product: 'Basic Plan', sales: 856, revenue: '$8,560', status: 'success' },
    { id: 3, product: 'Enterprise License', sales: 432, revenue: '$43,200', status: 'warning' },
    { id: 4, product: 'Add-on Features', sales: 289, revenue: '$2,890', status: 'success' },
    { id: 5, product: 'Consulting Services', sales: 156, revenue: '$15,600', status: 'danger' },
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
          ? `$${(Math.random() * 10000 + 40000).toFixed(0)}`
          : metric.label === 'Active Users'
          ? `${(Math.random() * 500 + 2000).toFixed(0)}`
          : metric.label === 'Total Orders'
          ? `${(Math.random() * 300 + 1000).toFixed(0)}`
          : `${(Math.random() * 2 + 2.5).toFixed(2)}%`,
        change: (Math.random() * 20 - 5),
      })));

      setChartData(prev => prev.map(point => ({
        ...point,
        value: Math.floor(Math.random() * 3000 + 3000),
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-950' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
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

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
        >
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="dark:bg-gray-900 dark:border-gray-800 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {metric.label}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      {metric.value}
                    </div>
                    <div className="flex items-center mt-2">
                      {metric.change >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          metric.change >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {metric.change >= 0 ? '+' : ''}
                        {metric.change.toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">vs last month</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="dark:bg-gray-900 dark:border-gray-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Revenue Trend</CardTitle>
                  <CardDescription className="dark:text-gray-400">Monthly revenue over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 md:h-80 flex items-end justify-between gap-2 md:gap-4">
                    {chartData.map((point, index) => (
                      <motion.div
                        key={index}
                        initial={{ height: 0 }}
                        animate={{ height: `${(point.value / maxChartValue) * 100}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg relative group cursor-pointer hover:from-blue-600 hover:to-blue-500 transition-colors"
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          ${point.value.toLocaleString()}
                        </div>
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400">
                          {point.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-8 pt-4 border-t dark:border-gray-800" />
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Traffic Sources</CardTitle>
                  <CardDescription className="dark:text-gray-400">User distribution by device</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pieData.map((item, index) => {
                      const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500'];
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{item.value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.value}%` }}
                              transition={{ duration: 0.8, delay: index * 0.1 }}
                              className={`${colors[index]} h-2 rounded-full`}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="mt-6 pt-6 border-t dark:border-gray-800">
                    <div className="flex justify-center">
                      <div className="relative w-40 h-40">
                        <svg className="transform -rotate-90 w-40 h-40">
                          {pieData.map((item, index) => {
                            const total = pieData.reduce((sum, d) => sum + d.value, 0);
                            const percentage = (item.value / total) * 100;
                            const circumference = 2 * Math.PI * 60;
                            const offset = pieData.slice(0, index).reduce((sum, d) => sum + (d.value / total) * circumference, 0);
                            const colors = ['stroke-blue-500', 'stroke-purple-500', 'stroke-pink-500'];
                            
                            return (
                              <motion.circle
                                key={index}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
                                transition={{ duration: 1, delay: index * 0.2 }}
                                cx="80"
                                cy="80"
                                r="60"
                                className={colors[index]}
                                strokeWidth="20"
                                fill="none"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                style={{ transformOrigin: '80px 80px', transform: `rotate(${(offset / circumference) * 360}deg)` }}
                              />
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Top Products</CardTitle>
                <CardDescription className="dark:text-gray-400">Best performing products this month</CardDescription>
              </CardHeader>
              <CardContent>
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
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">{row.product}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{row.sales.toLocaleString()}</td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">{row.revenue}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                row.status === 'success'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : row.status === 'warning'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}
                            >
                              {row.status === 'success' ? 'Active' : row.status === 'warning' ? 'Pending' : 'Low Stock'}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Detailed Analytics</CardTitle>
                <CardDescription className="dark:text-gray-400">In-depth performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Engagement</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Avg. Session Duration', value: '4m 32s' },
                        { label: 'Bounce Rate', value: '42.3%' },
                        { label: 'Pages per Session', value: '3.8' },
                      ].map((metric, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{metric.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Conversion Metrics</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Cart Abandonment', value: '68.5%' },
                        { label: 'Checkout Completion', value: '31.5%' },
                        { label: 'Return Customer Rate', value: '24.8%' },
                      ].map((metric, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{metric.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white">Generated Reports</CardTitle>
                <CardDescription className="dark:text-gray-400">Download and view your analytics reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Monthly Revenue Report', date: '2024-01-15', size: '2.4 MB' },
                    { name: 'User Activity Analysis', date: '2024-01-10', size: '1.8 MB' },
                    { name: 'Product Performance', date: '2024-01-05', size: '3.1 MB' },
                  ].map((report, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{report.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{report.date} • {report.size}</p>
                      </div>
                      <Button variant="outline" size="sm" className="dark:border-gray-700">
                        Download
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}