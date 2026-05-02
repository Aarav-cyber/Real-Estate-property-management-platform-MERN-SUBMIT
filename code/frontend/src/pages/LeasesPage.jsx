import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { leasesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus, Upload, X, Loader2, Calendar, Building2, User, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="card w-full max-w-lg p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl text-white">{title}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg" id="lease-modal-close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function LeasesPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpload, setShowUpload] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ tenantId: '', propertyId: '', startDate: '', endDate: '' });
  const [file, setFile] = useState(null);

  const isOwner = user?.role === 'owner';

  useEffect(() => {
    fetchLeases();

    // If navigated from Requests page with state, pre-fill form and show modal
    if (location.state?.tenantId && location.state?.propertyId) {
      setForm(prev => ({
        ...prev,
        tenantId: location.state.tenantId,
        propertyId: location.state.propertyId
      }));
      setShowCreate(true);
      // Clean up state so it doesn't reopen on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchLeases = async () => {
    try {
      const res = await leasesAPI.getAll();
      setLeases(res.data.data || []);
    } catch { toast.error('Failed to load leases'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await leasesAPI.create(form);
      toast.success('Lease created!');
      setShowCreate(false);
      setForm({ tenantId: '', propertyId: '', startDate: '', endDate: '' });
      fetchLeases();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create lease');
    } finally { setSubmitting(false); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Select a file first'); return; }
    setSubmitting(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('leaseId', showUpload._id);
    try {
      await leasesAPI.upload(formData);
      toast.success('Document uploaded!');
      setShowUpload(null);
      setFile(null);
      fetchLeases();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setSubmitting(false); }
  };

  const statusClass = (s) => s === 'active' ? 'badge-green' : 'badge-blue';

  return (
    <DashboardLayout title="Leases">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-2xl text-white">Lease Agreements</h2>
            <p className="text-gray-400 text-sm mt-1">{leases.length} total leases</p>
          </div>
          {isOwner && (
            <button onClick={() => setShowCreate(true)} className="btn-primary" id="create-lease-btn">
              <Plus size={17} /> Create Lease
            </button>
          )}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 size={32} className="animate-spin text-primary-400 mx-auto" />
            </div>
          ) : leases.length === 0 ? (
            <div className="p-16 text-center">
              <FileText size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 font-medium">No leases found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/5 bg-dark-700/40">
                  <tr>
                    {['Property', 'Tenant', 'Start Date', 'End Date', 'Status', 'Document', isOwner ? 'Actions' : ''].filter(Boolean).map((h) => (
                      <th key={h} className="table-header text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leases.map((lease) => (
                    <tr key={lease._id} className="hover:bg-white/2 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary-500/15 flex items-center justify-center flex-shrink-0">
                            <Building2 size={14} className="text-primary-400" />
                          </div>
                          <span className="font-medium text-white truncate max-w-[150px]">
                            {lease.property?.title || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-accent-500/15 flex items-center justify-center flex-shrink-0">
                            <User size={14} className="text-accent-500" />
                          </div>
                          <div>
                            <p className="text-sm text-white font-medium">{lease.tenant?.name || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{lease.tenant?.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Calendar size={13} />
                          <span>{lease.startDate ? format(new Date(lease.startDate), 'dd MMM yyyy') : '—'}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Calendar size={13} />
                          <span>{lease.endDate ? format(new Date(lease.endDate), 'dd MMM yyyy') : '—'}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={statusClass(lease.status)}>{lease.status}</span>
                      </td>
                      <td className="table-cell">
                        {lease.document ? (
                          <a
                            href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${lease.document}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm"
                            id={`view-doc-${lease._id}`}
                          >
                            <ExternalLink size={13} /> View
                          </a>
                        ) : (
                          <span className="text-gray-600 text-sm">No file</span>
                        )}
                      </td>
                      {isOwner && (
                        <td className="table-cell">
                          <button
                            onClick={() => setShowUpload(lease)}
                            className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 border border-primary-500/20 hover:border-primary-500/40 px-3 py-1.5 rounded-lg transition-all"
                            id={`upload-doc-${lease._id}`}
                          >
                            <Upload size={12} /> Upload Doc
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Lease Modal */}
      {showCreate && (
        <Modal title="Create New Lease" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4" id="create-lease-form">
            <div>
              <label className="label">Tenant ID</label>
              <input required className="input" placeholder="Tenant's MongoDB ObjectId" value={form.tenantId}
                onChange={(e) => setForm({ ...form, tenantId: e.target.value })} />
            </div>
            <div>
              <label className="label">Property ID</label>
              <input required className="input" placeholder="Property's MongoDB ObjectId" value={form.propertyId}
                onChange={(e) => setForm({ ...form, propertyId: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Start Date</label>
                <input required type="date" className="input" value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div>
                <label className="label">End Date</label>
                <input required type="date" className="input" value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center" id="save-lease-btn">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Create Lease'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <Modal title="Upload Lease Document" onClose={() => { setShowUpload(null); setFile(null); }}>
          <form onSubmit={handleUpload} className="space-y-4" id="upload-lease-form">
            <div className="p-4 rounded-xl bg-dark-700 border border-white/5 text-sm text-gray-400">
              Uploading document for:{' '}
              <span className="text-white font-medium">{showUpload.property?.title}</span>
            </div>
            <div>
              <label className="label">Select File (PDF, PNG, JPG)</label>
              <div
                className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary-500/40 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-input').click()}
              >
                <Upload size={28} className="mx-auto text-gray-500 mb-3" />
                {file ? (
                  <p className="text-sm text-primary-400 font-medium">{file.name}</p>
                ) : (
                  <p className="text-sm text-gray-500">Click to select or drag & drop a file</p>
                )}
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setShowUpload(null); setFile(null); }} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center" id="upload-doc-submit">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <><Upload size={15} /> Upload</>}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}
