import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { paymentsAPI, leasesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Plus, X, Loader2, CheckCircle2, Clock, Building2, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function Modal({ title, onClose, children }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="card w-full max-w-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl text-white">{title}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors" id="pay-modal-close">
            <X size={18} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPay, setShowPay] = useState(false);
  const [showIssue, setShowIssue] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ propertyId: '', amount: '', status: 'pending', existingPaymentId: null });
  const [issueForm, setIssueForm] = useState({ tenantId: '', propertyId: '', amount: '' });
  const [ownerLeases, setOwnerLeases] = useState([]);

  const isTenant = user?.role === 'tenant';
  const isOwner = user?.role === 'owner';

  useEffect(() => { 
    fetchPayments(); 
    if (isOwner) fetchLeases();
  }, [isOwner]);

  const fetchLeases = async () => {
    try {
      const res = await leasesAPI.getAll();
      setOwnerLeases(res.data.data || []);
    } catch {
      console.error("Failed to load leases for owner");
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await paymentsAPI.getAll();
      setPayments(res.data.data || []);
    } catch { toast.error('Failed to load payments'); }
    finally { setLoading(false); }
  };

  const handlePayDirect = async (e) => {
    e.preventDefault();
    if (!form.propertyId || !form.amount) { toast.error('All fields required'); return; }
    setSubmitting(true);
    try {
      await paymentsAPI.add({ 
        propertyId: form.propertyId, 
        amount: Number(form.amount), 
        status: form.status,
        existingPaymentId: form.existingPaymentId
      });
      toast.success('Payment recorded!');
      setShowPay(false);
      setForm({ propertyId: '', amount: '', status: 'pending', existingPaymentId: null });
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally { setSubmitting(false); }
  };

  const handleIssuePayment = async (e) => {
    e.preventDefault();
    if (!issueForm.tenantId || !issueForm.propertyId || !issueForm.amount) { 
      toast.error('All fields required'); 
      return; 
    }
    setSubmitting(true);
    try {
      await paymentsAPI.issue({
        tenantId: issueForm.tenantId,
        propertyId: issueForm.propertyId,
        amount: Number(issueForm.amount)
      });
      toast.success('Payment successfully issued!');
      setShowIssue(false);
      setIssueForm({ tenantId: '', propertyId: '', amount: '' });
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue payment');
    } finally { setSubmitting(false); }
  };

  const handlePayNow = (pay) => {
    setForm({
      propertyId: pay.property?._id || pay.propertyId || '',
      amount: pay.amount || '',
      status: 'paid',
      existingPaymentId: pay._id
    });
    setShowPay(true);
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpay = async () => {
    if (!form.propertyId || !form.amount) { toast.error('Fill in Property ID and Amount'); return; }
    
    setSubmitting(true);
    
    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      const res = await loadRazorpay();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Check your internet connection.');
        setSubmitting(false);
        return;
      }
    }

    try {
      const orderRes = await paymentsAPI.createOrder({ amount: Number(form.amount) });
      const order = orderRes.data.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_ShM28qrjEZu7VU',
        amount: order.amount,
        currency: order.currency,
        name: 'RealEst',
        description: 'Rent Payment',
        order_id: order.id,
        handler: async (response) => {
          try {
            await paymentsAPI.verify({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              propertyId: form.propertyId,
              amount: Number(form.amount),
              status: 'paid',
              existingPaymentId: form.existingPaymentId,
            });
            toast.success('Payment verified & saved!');
            setShowPay(false);
            setForm({ propertyId: '', amount: '', status: 'pending', existingPaymentId: null });
            fetchPayments();
          } catch { toast.error('Payment verification failed'); }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#6171f6' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create order');
    } finally { setSubmitting(false); }
  };

  // Totals
  const totalPaid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <DashboardLayout title="Payments">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-2xl text-white">Payment History</h2>
            <p className="text-gray-400 text-sm mt-1">{payments.length} total transactions</p>
          </div>
          {isTenant && (
            <button onClick={() => setShowPay(true)} className="btn-primary" id="make-payment-btn">
              <Plus size={17} /> Make Payment
            </button>
          )}
          {isOwner && (
            <button onClick={() => setShowIssue(true)} className="btn-primary" id="issue-payment-btn">
              <Plus size={17} /> Issue Payment
            </button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Transactions', value: payments.length, icon: CreditCard, color: 'from-primary-500 to-primary-700' },
            { label: 'Total Paid', value: `₹${totalPaid.toLocaleString()}`, icon: CheckCircle2, color: 'from-green-500 to-green-700' },
            { label: 'Pending', value: `₹${totalPending.toLocaleString()}`, icon: Clock, color: 'from-yellow-500 to-yellow-700' },
          ].map((stat, i) => (
            <motion.div 
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="stat-card group"
            >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0 shadow-glow-sm group-hover:shadow-glow transition-all duration-300`}>
                    <stat.icon size={20} className="text-white" />
                </div>
                <div>
                    <p className="text-gray-400 text-xs font-medium mb-1">{stat.label}</p>
                    <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
                </div>
            </motion.div>
          ))}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 size={32} className="animate-spin text-primary-400 mx-auto" />
            </div>
          ) : payments.length === 0 ? (
            <div className="p-16 text-center">
              <CreditCard size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 font-medium">No payments yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/5 bg-dark-700/40">
                  <tr>
                    {['Property', 'Tenant', 'Amount', 'Date', 'Status'].map((h) => (
                      <th key={h} className="table-header text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payments.map((pay, idx) => (
                    <motion.tr 
                        key={pay._id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-white/2 transition-colors"
                    >
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary-500/15 flex items-center justify-center flex-shrink-0">
                            <Building2 size={14} className="text-primary-400" />
                          </div>
                          <span className="text-white font-medium truncate max-w-[120px]">
                            {pay.property?.title || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div>
                          <p className="text-white text-sm">{pay.tenant?.name || 'N/A'}</p>
                          <p className="text-gray-500 text-xs">{pay.tenant?.email || ''}</p>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="font-semibold text-white font-display text-base">
                          ₹{pay.amount?.toLocaleString()}
                        </span>
                      </td>
                      <td className="table-cell text-gray-400">
                        {pay.paymentDate ? format(new Date(pay.paymentDate), 'dd MMM yyyy') : '—'}
                      </td>
                      <td className="table-cell">
                        {pay.status === 'paid' ? (
                          <span className="badge-green"><CheckCircle2 size={11} /> Paid</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="badge-yellow"><Clock size={11} /> Pending</span>
                            {isTenant && (
                              <button 
                                onClick={() => handlePayNow(pay)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 text-[10px] font-bold uppercase tracking-wider transition-all"
                                id={`pay-now-${pay._id}`}
                              >
                                <CreditCard size={10} /> Pay Now
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Payment Modal */}
      <AnimatePresence>
      {showPay && (
        <Modal title="Make a Payment" onClose={() => { setShowPay(false); setForm({ propertyId: '', amount: '', status: 'pending', existingPaymentId: null }); }}>
          <div className="space-y-4">
            <div>
              <label className="label">Property ID</label>
              <input className="input" placeholder="Property's MongoDB ObjectId" value={form.propertyId}
                onChange={(e) => setForm({ ...form, propertyId: e.target.value })} />
            </div>
            <div>
              <label className="label">Amount (₹)</label>
              <div className="relative">
                <IndianRupee size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="number" min="1" className="input pl-9" placeholder="e.g. 25000" value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setForm({ ...form, status: 'pending' })}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${form.status === 'pending' ? 'border-primary-500 bg-primary-500/15 text-primary-300' : 'border-white/10 bg-dark-700 text-gray-400 hover:border-primary-500/30'}`}
                  id="pay-manual-btn"
                >
                  Manual Record
                </button>
                <button
                  onClick={() => setForm({ ...form, status: 'paid' })}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${form.status === 'paid' ? 'border-green-500 bg-green-500/15 text-green-300' : 'border-white/10 bg-dark-700 text-gray-400 hover:border-green-500/30'}`}
                  id="pay-razorpay-btn"
                >
                  Pay via Razorpay
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowPay(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              {form.status === 'paid' ? (
                <button onClick={handleRazorpay} disabled={submitting} className="btn-primary flex-1 justify-center" id="razorpay-pay-btn">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <><CreditCard size={15} /> Pay Now</>}
                </button>
              ) : (
                <button onClick={handlePayDirect} disabled={submitting} className="btn-primary flex-1 justify-center" id="record-payment-btn">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Record Payment'}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {showIssue && (
        <Modal title="Issue Payment" onClose={() => { setShowIssue(false); setIssueForm({ tenantId: '', propertyId: '', amount: '' }); }}>
          <div className="space-y-4">
            <p className="text-gray-400 text-sm mb-4">
              Issue a pending payment for a tenant. They will be able to pay it from their dashboard.
            </p>
            <div>
              <label className="label">Select Lease</label>
              <select 
                className="input cursor-pointer" 
                onChange={(e) => {
                  const lease = ownerLeases.find(l => l._id === e.target.value);
                  if (lease) {
                    setIssueForm({
                      tenantId: lease.tenant?._id || lease.tenant,
                      propertyId: lease.property?._id || lease.property,
                      amount: lease.property?.rent || ''
                    });
                  } else {
                    setIssueForm({ tenantId: '', propertyId: '', amount: '' });
                  }
                }}
              >
                <option value="">-- Select a Lease --</option>
                {ownerLeases.map(lease => (
                  <option key={lease._id} value={lease._id}>
                    {lease.property?.title || 'Property'} - {lease.tenant?.name || 'Tenant'}
                  </option>
                ))}
              </select>
            </div>
            
            {issueForm.propertyId && (
              <div className="p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                <p className="text-xs text-primary-400 mb-1">Selected Tenant</p>
                <p className="text-white text-sm font-medium">
                  {ownerLeases.find(l => (l.property?._id || l.property) === issueForm.propertyId)?.tenant?.name || 'Unknown'}
                </p>
              </div>
            )}
            <div>
              <label className="label">Rent Amount (₹)</label>
              <div className="relative">
                <IndianRupee size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="number" min="1" className="input pl-9" placeholder="e.g. 25000" value={issueForm.amount}
                  onChange={(e) => setIssueForm({ ...issueForm, amount: e.target.value })} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowIssue(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={handleIssuePayment} disabled={submitting} className="btn-primary flex-1 justify-center" id="submit-issue-btn">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Issue Payment'}
              </button>
            </div>
          </div>
        </Modal>
      )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
