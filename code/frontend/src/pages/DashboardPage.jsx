import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { propertiesAPI, leasesAPI, paymentsAPI, requestsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Building2, FileText, CreditCard, ClipboardList, TrendingUp, Clock, CheckCircle2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

function StatCard({ icon: Icon, label, value, color, trend, to, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={to} className="stat-card group hover:-translate-y-1 transition-all duration-300 hover:shadow-glow">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-glow-sm group-hover:shadow-glow transition-all`}>
          <Icon size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-400 text-xs font-medium mb-1">{label}</p>
          <p className="text-2xl font-display font-bold text-white">{value}</p>
          {trend && <p className="text-xs text-green-400 mt-0.5 flex items-center gap-1"><TrendingUp size={11} />{trend}</p>}
        </div>
      </Link>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="stat-card">
      <div className="w-12 h-12 rounded-2xl bg-dark-600 shimmer" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 rounded bg-dark-600 shimmer" />
        <div className="h-7 w-16 rounded bg-dark-600 shimmer" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ properties: 0, leases: 0, payments: 0, requests: 0 });
  const [recentPayments, setRecentPayments] = useState([]);
  const [recentProperties, setRecentProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pRes, lRes, payRes] = await Promise.all([
          propertiesAPI.getAll(),
          leasesAPI.getAll(),
          paymentsAPI.getAll(),
        ]);
        const props = pRes.data.data || [];
        const leases = lRes.data.data || [];
        const pays = payRes.data.data || [];

        let reqCount = 0;
        if (user?.role === 'owner') {
          try {
            const rRes = await requestsAPI.getAll();
            reqCount = (rRes.data.data || []).length;
          } catch {}
        }

        setStats({ properties: props.length, leases: leases.length, payments: pays.length, requests: reqCount });
        setRecentPayments(pays.slice(0, 5));
        setRecentProperties(props.slice(0, 5));
      } catch (e) {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const statCards = [
    { icon: Building2, label: 'Total Properties', value: stats.properties, color: 'from-primary-500 to-primary-700', to: '/properties', trend: '+12%' },
    { icon: FileText, label: 'Active Leases', value: stats.leases, color: 'from-purple-500 to-purple-700', to: '/leases', trend: '+5%' },
    { icon: CreditCard, label: 'Payments', value: stats.payments, color: 'from-accent-500 to-accent-600', to: '/payments', trend: '+18%' },
    ...(user?.role === 'owner'
      ? [{ icon: ClipboardList, label: 'Requests', value: stats.requests, color: 'from-orange-500 to-orange-700', to: '/requests' }]
      : []),
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h2 className="font-display font-bold text-2xl text-white mb-1">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name}! 👋
            </h2>
            <p className="text-gray-400 text-sm">
                Here's what's happening across your portfolio today,{' '}
                <span className="text-primary-400 capitalize font-medium">{user?.role}</span>.
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-dark-800 rounded-xl border border-white/5 text-sm text-gray-400">
            <Calendar size={16} />
            <span>{format(new Date(), 'eeee, MMMM do')}</span>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          ) : (
            statCards.map((s, i) => <StatCard key={s.label} {...s} index={i} />)
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Properties */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h3 className="font-display font-semibold text-white flex items-center gap-2">
                <Building2 size={16} className="text-primary-400" /> Recent Properties
              </h3>
              <Link to="/properties" className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-dark-600 shimmer" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 rounded bg-dark-600 shimmer" />
                      <div className="h-2 w-24 rounded bg-dark-600 shimmer" />
                    </div>
                  </div>
                ))
              ) : recentProperties.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Building2 size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No properties yet</p>
                </div>
              ) : (
                recentProperties.map((p, idx) => (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + (idx * 0.05) }}
                    key={p._id} 
                    className="p-4 flex items-center gap-3 hover:bg-white/3 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center flex-shrink-0">
                      <Building2 size={16} className="text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{p.title}</p>
                      <p className="text-xs text-gray-500 truncate">{p.location}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary-400 flex-shrink-0">₹{p.rent?.toLocaleString()}</span>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Recent Payments */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h3 className="font-display font-semibold text-white flex items-center gap-2">
                <CreditCard size={16} className="text-accent-500" /> Recent Payments
              </h3>
              <Link to="/payments" className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-dark-600 shimmer" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 rounded bg-dark-600 shimmer" />
                      <div className="h-2 w-24 rounded bg-dark-600 shimmer" />
                    </div>
                  </div>
                ))
              ) : recentPayments.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <CreditCard size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No payments yet</p>
                </div>
              ) : (
                recentPayments.map((pay, idx) => (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + (idx * 0.05) }}
                    key={pay._id} 
                    className="p-4 flex items-center gap-3 hover:bg-white/3 transition-colors cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${pay.status === 'paid' ? 'bg-green-500/15' : 'bg-yellow-500/15'}`}>
                      {pay.status === 'paid'
                        ? <CheckCircle2 size={16} className="text-green-400" />
                        : <Clock size={16} className="text-yellow-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{pay.property?.title || 'Property'}</p>
                      <p className="text-xs text-gray-500">
                        {pay.paymentDate ? format(new Date(pay.paymentDate), 'dd MMM yyyy') : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-white">₹{pay.amount?.toLocaleString()}</p>
                      <span className={`text-xs capitalize ${pay.status === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>{pay.status}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
