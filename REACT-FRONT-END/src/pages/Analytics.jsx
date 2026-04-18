import Header from '../components/Header';
import StatCard from '../components/StatCard';
import { BarChart3, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Analytics = () => {
  const ticketData = [
    { month: 'Jan', count: 240 },
    { month: 'Feb', count: 310 },
    { month: 'Mar', count: 280 },
    { month: 'Apr', count: 320 },
    { month: 'May', count: 380 },
    { month: 'Jun', count: 420 },
  ];

  const categoryData = [
    { category: 'Infrastructure', tickets: 420 },
    { category: 'Public Safety', tickets: 380 },
    { category: 'Social Services', tickets: 290 },
    { category: 'Health', tickets: 200 },
    { category: 'Waste Mgmt', tickets: 150 },
  ];

  return (
    <div className="animate-fadeIn">
      <Header pageTitle="Analytics" />
      
      <div className="grid grid-cols-2 gap-6 mb-8">
        <StatCard
          title="Tickets This Month"
          value="420"
          icon={<TrendingUp className="text-info" size={24} />}
          subtext="↑ 10.2% growth rate"
          color="text-info"
        />
        <StatCard
          title="Resolution Rate"
          value="89%"
          icon={<BarChart3 className="text-success" size={24} />}
          subtext="Target: 95%"
          color="text-success"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-4">Monthly Ticket Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ticketData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2B6CB0" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2B6CB0" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#2B6CB0" 
                strokeWidth={3}
                dot={{ fill: '#2B6CB0', r: 5 }}
                activeDot={{ r: 7 }}
                name="Tickets"
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-4">Tickets by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              <Bar dataKey="tickets" fill="#2B6CB0" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
