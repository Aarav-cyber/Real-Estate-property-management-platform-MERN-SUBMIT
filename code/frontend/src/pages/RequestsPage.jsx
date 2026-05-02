import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { requestsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Plus, X, Loader2, CheckCircle2, XCircle, Clock, Building2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="card w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl text-white">{title}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg" id="req-modal-close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const statusConfig = {
  pending:  { icon: Clock,         cls: 'badge-yellow', label: 'Pending' },
  accepted: { icon: CheckCircle2,  cls: 'badge-green',  label: 'Accepted' },
  rejected: { icon: XCircle,       cls: 'badge-red',    label: 'Rejected' },
};

export default function RequestsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [form, setForm] = useState({ propertyId: '', message: '' });

  const isOwner = user?.role === 'owner';
  const isTenant = user?.role === 'tenant';

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const res = await requestsAPI.getAll();
      setRequests(res.data.data || []);
    } catch (err) {
      // tenants can't GET /requests (owner-only) — silently ignore
      if (err.response?.status !== 403) toast.error('Failed to load requests');
    } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await requestsAPI.create({ propertyId: form.propertyId, message: form.message });
      toast.success('Request sent to property owner!');
      setShowCreate(false);
      setForm({ propertyId: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally { setSubmitting(false); }
  };

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      if (action === 'accept') await requestsAPI.accept(id);
      else await requestsAPI.reject(id);
      toast.success(`Request ${action}ed!`);
      fetchRequests();
    } catch {
      toast.error(`Failed to ${action} request`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateLease = (req) => {
    navigate('/leases', {
      state: {
        tenantId: req.tenant?._id || req.tenantId,
        propertyId: req.property?._id || req.propertyId
      }
    });
  };

  return (
    <DashboardLayout title="Requests">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-2xl text-white">
              {isOwner ? 'Incoming Rental Requests' : 'Send Rental Request'}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {isOwner ? `${requests.length} requests awaiting action` : 'Request a property from an owner'}
            </p>
          </div>
          {isTenant && (
            <button onClick={() => setShowCreate(true)} className="btn-primary" id="send-request-btn">
              <Plus size={17} /> Send Request
            </button>
          )}
        </div>

        {/* Requests grid / list */}
        {isOwner ? (
          loading ? (
            <div className="card p-8 text-center">
              <Loader2 size={32} className="animate-spin text-primary-400 mx-auto" />
            </div>
          ) : requests.length === 0 ? (
            <div className="card p-16 text-center">
              <ClipboardList size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 font-medium">No requests yet</p>
              <p className="text-gray-600 text-sm mt-1">Requests from tenants will appear here.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {requests.map((req) => {
                const sc = statusConfig[req.status] || statusConfig.pending;
                const StatusIcon = sc.icon;
                return (
                  <div key={req._id} className="card p-5 flex flex-col gap-4 hover:-translate-y-0.5 transition-all duration-300">
                    {/* Property */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center flex-shrink-0">
                        <Building2 size={17} className="text-primary-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Property</p>
                        <p className="text-white font-semibold text-sm truncate">
                          {req.property?.title || req.propertyId || 'Unknown'}
                        </p>
                      </div>
                    </div>

                    {/* Tenant */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent-500/15 flex items-center justify-center flex-shrink-0">
                        <User size={17} className="text-accent-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">Tenant</p>
                        <p className="text-white font-semibold text-sm">{req.tenant?.name || 'N/A'}</p>
                        <p className="text-gray-500 text-xs truncate">{req.tenant?.email || ''}</p>
                      </div>
                    </div>

                    {/* Message */}
                    {req.message && (
                      <p className="text-gray-400 text-xs bg-dark-700/50 rounded-lg px-3 py-2 italic">"{req.message}"</p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className={sc.cls}>
                        <StatusIcon size={11} /> {sc.label}
                      </span>
                      <span className="text-gray-600 text-xs">
                        {req.createdAt ? format(new Date(req.createdAt), 'dd MMM') : ''}
                      </span>
                    </div>

                    {/* Action buttons — only for pending */}
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(req._id, 'accept')}
                          disabled={!!actionLoading}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-green-500/15 border border-green-500/25 text-green-400 hover:bg-green-500/25 transition-all"
                          id={`accept-req-${req._id}`}
                        >
                          {actionLoading === req._id + 'accept' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={13} />}
                          Accept
                        </button>
                        <button
                          onClick={() => handleAction(req._id, 'reject')}
                          disabled={!!actionLoading}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-red-500/15 border border-red-500/25 text-red-400 hover:bg-red-500/25 transition-all"
                          id={`reject-req-${req._id}`}
                        >
                          {actionLoading === req._id + 'reject' ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={13} />}
                          Reject
                        </button>
                      </div>
                    )}

                    {/* Create Lease button — for accepted */}
                    {req.status === 'accepted' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCreateLease(req)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-primary-500/15 border border-primary-500/25 text-primary-400 hover:bg-primary-500/25 transition-all"
                          id={`create-lease-from-req-${req._id}`}
                        >
                          <Plus size={13} /> Create Lease
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Tenant view — just info since GET /requests is owner-only */
          <div className="card p-10 text-center">
            <ClipboardList size={48} className="mx-auto text-primary-500/40 mb-4" />
            <h3 className="text-white font-display font-bold text-xl mb-2">Send a Rental Request</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
              Browse properties, find one you like, and send a request to the owner. They'll accept or reject it.
            </p>
            <button onClick={() => setShowCreate(true)} className="btn-primary mx-auto" id="tenant-send-req-btn">
              <Plus size={17} /> Send Request Now
            </button>
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      {showCreate && (
        <Modal title="Send Rental Request" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4" id="create-request-form">
            <div>
              <label className="label">Property ID</label>
              <input required className="input" placeholder="Property's MongoDB ObjectId" value={form.propertyId}
                onChange={(e) => setForm({ ...form, propertyId: e.target.value })} />
              <p className="text-xs text-gray-600 mt-1">You can find the property ID on the Properties page.</p>
            </div>
            <div>
              <label className="label">Message (optional)</label>
              <textarea
                rows={3}
                className="input resize-none"
                placeholder="Tell the owner why you'd like to rent this property..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center" id="submit-request-btn">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Send Request'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}
