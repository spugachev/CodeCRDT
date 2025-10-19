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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-950' : 'bg-gray-50'}`}>
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Real-time insights and performance metrics</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="dark:border-gray-700"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
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
                      <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
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
              );
            })}
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="dark:bg-gray-900 dark:border-gray-800">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                  <Card className="lg:col-span-2 dark:bg-gray-900 dark:border-gray-800">
                    <CardHeader>
                      <CardTitle className="dark:text-white">Revenue Trend</CardTitle>
                      <CardDescription className="dark:text-gray-400">Monthly revenue over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 flex items-end justify-between gap-2 px-4">
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
                            <div key={item.label} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                                <span className="font-medium text-gray-900 dark:text-white">{item.value}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                <motion.div
                                  className={`h-full ${colors[index]}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${item.value}%` }}
                                  transition={{ duration: 1, delay: index * 0.2 }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-6 pt-6 border-t dark:border-gray-800">
                        <div className="flex justify-center">
                          <div className="relative w-48 h-48">
                            {pieData.map((item, index) => {
                              const colors = ['stroke-blue-500', 'stroke-purple-500', 'stroke-pink-500'];
                              const total = pieData.reduce((sum, d) => sum + d.value, 0);
                              const percentage = (item.value / total) * 100;
                              const prevPercentage = pieData.slice(0, index).reduce((sum, d) => sum + d.value, 0) / total * 100;
                              
                              return (
                                <svg key={item.label} className="absolute inset-0 w-full h-full -rotate-90">
                                  <motion.circle
                                    cx="96"
                                    cy="96"
                                    r="80"
                                    fill="none"
                                    className={colors[index]}
                                    strokeWidth="32"
                                    strokeDasharray={`${percentage * 5.03} ${100 * 5.03}`}
                                    strokeDashoffset={-prevPercentage * 5.03}
                                    initial={{ strokeDasharray: '0 503' }}
                                    animate={{ strokeDasharray: `${percentage * 5.03} ${100 * 5.03}` }}
                                    transition={{ duration: 1, delay: index * 0.2 }}
                                  />
                                </svg>
                              );
                            })}
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
                              className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">{row.product}</td>
                              <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{row.sales.toLocaleString()}</td>
                              <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">{row.revenue}</td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  row.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  row.status === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
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

              <TabsContent value="analytics" className="space-y-4">
                <Card className="dark:bg-gray-900 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Detailed Analytics</CardTitle>
                    <CardDescription className="dark:text-gray-400">In-depth performance metrics and insights</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">User Engagement</h3>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600 dark:text-gray-400">Session Duration</span>
                              <span className="font-medium text-gray-900 dark:text-white">4m 32s</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-blue-500"
                                initial={{ width: 0 }}
                                animate={{ width: '75%' }}
                                transition={{ duration: 1 }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600 dark:text-gray-400">Pages per Session</span>
                              <span className="font-medium text-gray-900 dark:text-white">5.2</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-purple-500"
                                initial={{ width: 0 }}
                                animate={{ width: '65%' }}
                                transition={{ duration: 1, delay: 0.2 }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600 dark:text-gray-400">Bounce Rate</span>
                              <span className="font-medium text-gray-900 dark:text-white">32%</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-pink-500"
                                initial={{ width: 0 }}
                                animate={{ width: '32%' }}
                                transition={{ duration: 1, delay: 0.4 }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Conversion Funnel</h3>
                        <div className="space-y-2">
                          {[
                            { stage: 'Visitors', value: 10000, percentage: 100 },
                            { stage: 'Product Views', value: 7500, percentage: 75 },
                            { stage: 'Add to Cart', value: 3000, percentage: 30 },
                            { stage: 'Checkout', value: 1500, percentage: 15 },
                            { stage: 'Purchase', value: 1200, percentage: 12 },
                          ].map((stage, index) => (
                            <motion.div
                              key={stage.stage}
                              className="flex items-center gap-3"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="w-32 text-sm text-gray-600 dark:text-gray-400">{stage.stage}</div>
                              <div className="flex-1 h-8 bg-gray-200 dark:bg-gray-800 rounded overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-end px-3"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${stage.percentage}%` }}
                                  transition={{ duration: 1, delay: index * 0.1 }}
                                >
                                  <span className="text-xs font-medium text-white">{stage.value.toLocaleString()}</span>
                                </motion.div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports" className="space-y-4">
                <Card className="dark:bg-gray-900 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Generated Reports</CardTitle>
                    <CardDescription className="dark:text-gray-400">Download and view your analytics reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: 'Monthly Revenue Report', date: '2024-01-15', size: '2.4 MB' },
                        { name: 'User Analytics Summary', date: '2024-01-10', size: '1.8 MB' },
                        { name: 'Product Performance', date: '2024-01-05', size: '3.1 MB' },
                        { name: 'Traffic Analysis', date: '2024-01-01', size: '1.2 MB' },
                      ].map((report, index) => (
                        <motion.div
                          key={report.name}
                          className="flex items-center justify-between p-4 border dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
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
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}