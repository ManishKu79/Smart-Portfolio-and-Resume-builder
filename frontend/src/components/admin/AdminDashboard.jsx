import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, Layout, TrendingUp, DollarSign, 
  Activity, UserCheck, UserX, Eye, Download, Star
} from 'lucide-react';
import api from '../../services/api';
import Card, { CardContent, CardHeader } from '../ui/Card';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    fetchDashboardData();
    fetchAnalytics();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/admin/analytics?period=${period}`);
      // Process analytics data
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const overviewCards = [
    {
      title: 'Total Users',
      value: stats?.overview?.totalUsers?.toLocaleString() || '0',
      change: `+${stats?.overview?.newUsersToday || 0} today`,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Users',
      value: stats?.overview?.activeUsersToday?.toLocaleString() || '0',
      change: 'last 24 hours',
      icon: UserCheck,
      color: 'bg-green-500'
    },
    {
      title: 'Total Resumes',
      value: stats?.overview?.totalResumes?.toLocaleString() || '0',
      change: `+${stats?.overview?.resumesToday || 0} today`,
      icon: FileText,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Portfolios',
      value: stats?.overview?.totalPortfolios?.toLocaleString() || '0',
      change: `+${stats?.overview?.portfoliosToday || 0} today`,
      icon: Layout,
      color: 'bg-orange-500'
    },
    {
      title: 'Revenue',
      value: `$${stats?.overview?.totalRevenue?.toLocaleString() || '0'}`,
      change: 'this month',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Avg ATS Score',
      value: `${stats?.averages?.atsScore?.toFixed(1) || '0'}%`,
      change: 'across all resumes',
      icon: TrendingUp,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Platform overview and analytics</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="day">Last 24 Hours</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {overviewCards.map((card, index) => (
          <Card key={index} hover>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`${card.color} p-2 rounded-lg text-white`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-500">{card.change}</span>
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{card.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">User Growth</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.charts?.userGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" name="New Users" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resume Creation Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Resume Creation</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.charts?.resumeCreation || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#10B981" name="Resumes Created" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Recent Users</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recent?.users?.slice(0, 5).map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Resumes */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Recent Resumes</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recent?.resumes?.slice(0, 5).map((resume) => (
                <div key={resume._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{resume.title}</p>
                    <p className="text-sm text-gray-500">by {resume.userId?.name || 'Unknown'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Eye className="w-3 h-3" />
                      <span>{resume.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Download className="w-3 h-3" />
                      <span>{resume.downloads || 0}</span>
                    </div>
                    {resume.atsScore > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span>{resume.atsScore}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;