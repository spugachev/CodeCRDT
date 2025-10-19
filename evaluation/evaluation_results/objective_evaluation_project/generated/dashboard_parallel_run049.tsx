: ''}>
                Breakdown by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
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
                      formatter={(value) => (
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>nd and percentages */}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Performance Metrics</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Key performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Customer Satisfaction', value: 92, max: 100, color: 'bg-green-500' },
                  { label: 'Response Time', value: 78, max: 100, color: 'bg-blue-500' },
                  { label: 'Task Completion', value: 85, max: 100, color: 'bg-purple-500' },
                  { label: 'System Uptime', value: 99, max: 100, color: 'bg-emerald-500' }
                ].map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {metric.label}
                      </span>
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {metric.value}%
                      </span>
                    </div>
                    <div className={`w-full h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className={`h-full ${metric.color} transition-all duration-500 ease-out`}
                        style={{ width: `${(metric.value / metric.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Activity Timeline</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Recent activity and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActivityData.map((event, index) => {
                  const getIcon = () => {
                    switch (event.icon) {
                      case 'check':
                        return <CheckCircle className="h-5 w-5" />;
                      case 'clock':
                        return <Clock className="h-5 w-5" />;
                      case 'alert':
                        return <AlertCircle className="h-5 w-5" />;
                      case 'user':
                        return <UserPlus className="h-5 w-5" />;
                      case 'file':
                        return <FileText className="h-5 w-5" />;
                      case 'settings':
                        return <Settings className="h-5 w-5" />;
                      default:
                        return <Clock className="h-5 w-5" />;
                    }
                  };

                  const getIconColor = () => {
                    switch (event.type) {
                      case 'success':
                        return 'text-green-500 bg-green-100 dark:bg-green-900/30';
                      case 'pending':
                        return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
                      case 'warning':
                        return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30';
                      case 'info':
                        return 'text-purple-500 bg-purple-100 dark:bg-purple-900/30';
                      default:
                        return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
                    }
                  };

                  const formatTimestamp = (timestamp: string) => {
                    const date = new Date(timestamp);
                    const now = new Date();
                    const diffMs = now.getTime() - date.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMs / 3600000);
                    const diffDays = Math.floor(diffMs / 86400000);

                    if (diffMins < 60) {
                      return `${diffMins}m ago`;
                    } else if (diffHours < 24) {
                      return `${diffHours}h ago`;
                    } else {
                      return `${diffDays}d ago`;
                    }
                  };

                  return (
                    <div key={event.id} className="flex gap-3 relative">
                      {index !== mockActivityData.length - 1 && (
                        <div
                          className={`absolute left-5 top-10 w-0.5 h-full ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                          }`}
                        />
                      )}
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getIconColor()} relative z-10`}
                      >
                        {getIcon()}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4
                              className={`font-semibold text-sm ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {event.title}
                            </h4>
                            <p
                              className={`text-sm mt-0.5 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}
                            >
                              {event.description}
                            </p>
                          </div>
                          <span
                            className={`text-xs whitespace-nowrap ${
                              isDarkMode ? 'text-gray-500' : 'text-gray-500'
                            }`}
                          >
                            {formatTimestamp(event.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className={isDarkMode ? 'text-white' : ''}>Recent Projects</CardTitle>
                <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                  Overview of project status and values
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <Input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : ''}`}
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'pending' | 'completed') => setStatusFilter(value)}>
                  <SelectTrigger className={`w-full sm:w-[180px] ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className={isDarkMode ? 'bg-gray-700 border-gray-600' : ''}>
                    <SelectItem value="all" className={isDarkMode ? 'text-white focus:bg-gray-600' : ''}>All Status</SelectItem>
                    <SelectItem value="active" className={isDarkMode ? 'text-white focus:bg-gray-600' : ''}>Active</SelectItem>
                    <SelectItem value="pending" className={isDarkMode ? 'text-white focus:bg-gray-600' : ''}>Pending</SelectItem>
                    <SelectItem value="completed" className={isDarkMode ? 'text-white focus:bg-gray-600' : ''}>Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className={isDarkMode ? 'border-gray-700' : ''}>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          Project Name
                          {sortConfig?.key === 'name' ? (
                            sortConfig.direction === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          Status
                          {sortConfig?.key === 'status' ? (
                            sortConfig.direction === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <button
                          onClick={() => handleSort('value')}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          Value
                          {sortConfig?.key === 'value' ? (
                            sortConfig.direction === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead className={isDarkMode ? 'text-gray-300' : ''}>
                        <button
                          onClick={() => handleSort('date')}
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          Date
                          {sortConfig?.key === 'date' ? (
                            sortConfig.direction === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                          )}
                        </button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                            No projects found
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData().map((row) => (
                        <TableRow 
                          key={row.id}
                          className={isDarkMode ? 'border-gray-700 hover:bg-gray-750' : 'hover:bg-gray-50'}
                        >
                          <TableCell className={isDarkMode ? 'text-gray-200' : ''}>
                            {row.name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                row.status === 'active' 
                                  ? 'default' 
                                  : row.status === 'completed' 
                                  ? 'secondary' 
                                  : 'outline'
                              }
                              className={
                                row.status === 'active'
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : row.status === 'completed'
                                  ? 'bg-blue-500 hover:bg-blue-600'
                                  : isDarkMode
                                  ? 'border-yellow-500 text-yellow-500'
                                  : 'border-yellow-600 text-yellow-600'
                              }
                            >
                              {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className={isDarkMode ? 'text-gray-200' : ''}>
                            ${row.value.toLocaleString()}
                          </TableCell>
                          <TableCell className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                            {new Date(row.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedData().length)} of {filteredAndSortedData().length} results
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={
                            currentPage === page 
                              ? '' 
                              : isDarkMode 
                              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                              : ''
                          }
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
                      className={isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';



















































import { CheckCircle, Clock, AlertCircle, UserPlus, FileText, Settings } from 'lucide-react';



import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface MetricData {
  id: string;
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
}

interface ChartDataPoint {
  timestamp: string;
  value: number;
  category: string;
}

interface TableRow {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'completed';
  value: number;
  date: string;
}

interface ActivityEvent {
  id: string;
  type: 'success' | 'pending' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  icon: 'check' | 'clock' | 'alert' | 'user' | 'file' | 'settings';
}

const mockMetrics: MetricData[] = [
  { id: '1', label: 'Total Revenue', value: 45231, change: 12.5, trend: 'up' },
  { id: '2', label: 'Active Users', value: 2350, change: 8.2, trend: 'up' },
  { id: '3', label: 'Conversion Rate', value: 3.24, change: -2.1, trend: 'down' },
  { id: '4', label: 'Avg Session', value: 4.8, change: 5.3, trend: 'up' }
];

const mockChartData: ChartDataPoint[] = [
  { timestamp: '2024-01-01', value: 4200, category: 'Sales' },
  { timestamp: '2024-01-02', value: 3800, category: 'Sales' },
  { timestamp: '2024-01-03', value: 5100, category: 'Sales' },
  { timestamp: '2024-01-04', value: 4600, category: 'Sales' },
  { timestamp: '2024-01-05', value: 5400, category: 'Sales' },
  { timestamp: '2024-01-06', value: 6200, category: 'Sales' },
  { timestamp: '2024-01-07', value: 5800, category: 'Sales' }
];

const mockTableData: TableRow[] = [
  { id: '1', name: 'Project Alpha', status: 'active', value: 12500, date: '2024-01-15' },
  { id: '2', name: 'Project Beta', status: 'completed', value: 8900, date: '2024-01-14' },
  { id: '3', name: 'Project Gamma', status: 'pending', value: 15200, date: '2024-01-13' },
  { id: '4', name: 'Project Delta', status: 'active', value: 9800, date: '2024-01-12' },
  { id: '5', name: 'Project Epsilon', status: 'completed', value: 11300, date: '2024-01-11' }
];
interface PieChartData {
  name: string;
  value: number;
  color: string;
}

const mockPieData: PieChartData[] = [
  { name: 'Sales', value: 35, color: '#3b82f6' },
  { name: 'Marketing', value: 25, color: '#8b5cf6' },
  { name: 'Operations', value: 20, color: '#10b981' },
  { name: 'Support', value: 15, color: '#f59e0b' },
  { name: 'Other', value: 5, color: '#6b7280' }
];

const mockActivityData: ActivityEvent[] = [
  {
    id: '1',
    type: 'success',
    title: 'Project Completed',
    description: 'Project Beta has been successfully completed',
    timestamp: '2024-01-15T10:30:00',
    icon: 'check'
  },
  {
    id: '2',
    type: 'info',
    title: 'New User Registered',
    description: 'John Doe joined the platform',
    timestamp: '2024-01-15T09:15:00',
    icon: 'user'
  },
  {
    id: '3',
    type: 'pending',
    title: 'Report Generation',
    description: 'Monthly analytics report is being generated',
    timestamp: '2024-01-15T08:45:00',
    icon: 'file'
  },
  {
    id: '4',
    type: 'warning',
    title: 'System Alert',
    description: 'Server load exceeded 80% threshold',
    timestamp: '2024-01-15T07:20:00',
    icon: 'alert'
  },
  {
    id: '5',
    type: 'info',
    title: 'Settings Updated',
    description: 'Dashboard preferences have been modified',
    timestamp: '2024-01-14T16:30:00',
    icon: 'settings'
  }
];

const LineChart = ({ data, isDarkMode }: { data: ChartDataPoint[], isDarkMode: boolean }) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const width = 100; // percentage
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getX = (index: number) => {
    return (index / (data.length - 1)) * chartWidth;
  };

  const getY = (value: number) => {
    return chartHeight - ((value - minValue) / valueRange) * chartHeight;
  };

  const pathData = data.map((point, index) => {
    const x = getX(index);
    const y = getY(point.value);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const gradientPathData = `${pathData} L ${getX(data.length - 1)} ${chartHeight} L 0 ${chartHeight} Z`;

  const handlePointHover = (index: number, event: React.MouseEvent) => {
    setHoveredPoint(index);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  return (
    <div className="relative w-full" style={{ height: `${height}px` }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDarkMode ? '#3b82f6' : '#60a5fa'} stopOpacity="0.4" />
            <stop offset="100%" stopColor={isDarkMode ? '#3b82f6' : '#60a5fa'} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = (chartHeight / 4) * i;
            return (
              <line
                key={i}
                x1="0"
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                strokeWidth="1"
              />
            );
          })}

          {/* Gradient area */}
          <motion.path
            d={gradientPathData}
            fill="url(#chartGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Line */}
          <motion.path
            d={pathData}
            fill="none"
            stroke={isDarkMode ? '#3b82f6' : '#2563eb'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />

          {/* Data points */}
          {data.map((point, index) => {
            const x = getX(index);
            const y = getY(point.value);
            return (
              <motion.circle
                key={index}
                cx={x}
                cy={y}
                r={hoveredPoint === index ? 6 : 4}
                fill={isDarkMode ? '#3b82f6' : '#2563eb'}
                stroke={isDarkMode ? '#1f2937' : '#ffffff'}
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onMouseEnter={(e) => handlePointHover(index, e)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
                style={{ pointerEvents: 'all' }}
              />
            );
          })}

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = (chartHeight / 4) * i;
            const value = maxValue - (valueRange / 4) * i;
            return (
              <text
                key={i}
                x="-10"
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className={`text-xs ${isDarkMode ? 'fill-gray-400' : 'fill-gray-600'}`}
              >
                {value.toFixed(0)}
              </text>
            );
          })}

          {/* X-axis labels */}
          {data.map((point, index) => {
            if (index % Math.ceil(data.length / 6) === 0 || index === data.length - 1) {
              const x = getX(index);
              const date = new Date(point.timestamp);
              const label = `${date.getMonth() + 1}/${date.getDate()}`;
              return (
                <text
                  key={index}
                  x={x}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  className={`text-xs ${isDarkMode ? 'fill-gray-400' : 'fill-gray-600'}`}
                >
                  {label}
                </text>
              );
            }
            return null;
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredPoint !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`absolute pointer-events-none z-10 px-3 py-2 rounded-lg shadow-lg ${
            isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'
          }`}
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y - 60}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ${data[hoveredPoint].value.toLocaleString()}
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {new Date(data[hoveredPoint].timestamp).toLocaleDateString()}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default function AnalyticsDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>(mockMetrics);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(mockChartData);
  const [tableData, setTableData] = useState<TableRow[]>(mockTableData);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'completed'>('all');

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleTimeRangeChange = useCallback((range: '7d' | '30d' | '90d') => {
    setSelectedTimeRange(range);
        // Simulate filtering chart data based on time range
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
    const days = daysMap[range];
    
    // Generate mock data for the selected time range
    const today = new Date('2024-01-07');
    const filteredData: ChartDataPoint[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const timestamp = date.toISOString().split('T')[0];
      const baseValue = 4000 + Math.random() * 2000;
      filteredData.push({
        timestamp,
        value: Math.round(baseValue),
        category: 'Sales'
      });
    }
    
    setChartData(filteredData);</parameter>
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'completed'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof TableRow; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleSort = useCallback((key: keyof TableRow) => {
    setSortConfig(prevConfig => {
      if (prevConfig?.key === key) {
        if (prevConfig.direction === 'asc') {
          return { key, direction: 'desc' };
        } else {
          return null;
        }
      }
      return { key, direction: 'asc' };
    });
  }, []);

  const filteredAndSortedData = useCallback(() => {
    let filtered = tableData.filter(row => {
      const matchesSearch = row.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' 
            ? aValue - bValue
            : bValue - aValue;
        }
        
        return 0;
      });
    }

    return filtered;
  }, [tableData, searchQuery, statusFilter, sortConfig]);

  const paginatedData = useCallback(() => {
    const data = filteredAndSortedData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [filteredAndSortedData, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedData().length / itemsPerPage);

  const handleRefreshData = useCallback(() => {
    setTimeout(() => {
      // Update metrics with random changes
      setMetrics(prevMetrics =>
        prevMetrics.map(metric => ({
          ...metric,
          value: metric.value + (Math.random() - 0.5) * metric.value * 0.1,
          change: (Math.random() - 0.5) * 20,
          trend: Math.random() > 0.5 ? 'up' : 'down'
        }))
      );

      // Update chart data with new data point
      setChartData(prevData => {
        const lastPoint = prevData[prevData.length - 1];
        const newTimestamp = new Date(lastPoint.timestamp);
        newTimestamp.setDate(newTimestamp.getDate() + 1);
        
        const newPoint: ChartDataPoint = {
          timestamp: newTimestamp.toISOString().split('T')[0],
          value: Math.floor(Math.random() * 3000) + 3500,
          category: 'Sales'
        };
        
        return [...prevData.slice(1), newPoint];
      });

      // Update table data with random value changes
      setTableData(prevData =>
        prevData.map(row => ({
          ...row,
          value: row.value + (Math.random() - 0.5) * row.value * 0.15
        }))
      );
    }, 500);
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
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={selectedTimeRange === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTimeRangeChange('7d')}
                className={selectedTimeRange === '7d' ? '' : isDarkMode ? 'text-gray-300 border-gray-600 hover:bg-gray-800' : ''}
              >
                7 Days
              </Button>
              <Button
                variant={selectedTimeRange === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTimeRangeChange('30d')}
                className={selectedTimeRange === '30d' ? '' : isDarkMode ? 'text-gray-300 border-gray-600 hover:bg-gray-800' : ''}
              >
                30 Days
              </Button>
              <Button
                variant={selectedTimeRange === '90d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTimeRangeChange('90d')}
                className={selectedTimeRange === '90d' ? '' : isDarkMode ? 'text-gray-300 border-gray-600 hover:bg-gray-800' : ''}
              >
                90 Days
              </Button>
            </div>
            
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
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className={isDarkMode ? 'border-gray-700' : ''}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader className="pb-2">
                  <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {metric.label}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                        className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                      >
                        {metric.label.includes('Rate') || metric.label.includes('Session') 
                          ? `${metric.value}%` 
                          : metric.value.toLocaleString()}
                      </motion.div>
                      <div className="flex items-center gap-1 mt-2">
                        {metric.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {metric.change > 0 ? '+' : ''}{metric.change}%
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
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          <Card className={`lg:col-span-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Revenue Trend</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>
                Daily revenue over selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart data={chartData} isDarkMode={isDarkMode} />
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-white' : ''}>Category Distribution</CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' 