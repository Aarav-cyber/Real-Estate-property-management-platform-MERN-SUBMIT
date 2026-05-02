import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import PropertyMap from '../components/PropertyMap';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { propertiesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Building2, Plus, MapPin, Edit2, Trash2, X, Loader2, Search, Users, LayoutGrid, Map as MapIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const libraries = ['places'];

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
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors" id="modal-close">
            <X size={18} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function PropertiesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || "",
    libraries
  });

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid'); // 'grid' or 'map'
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [showAssign, setShowAssign] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', location: '', rent: '', lat: '', lng: '' });
  const [assignForm, setAssignForm] = useState({ tenantId: '', leaseStart: '', leaseEnd: '' });

  const [autocomplete, setAutocomplete] = useState(null);

  const onAutocompleteLoad = (auto) => {
    setAutocomplete(auto);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setForm({
        ...form,
        location: place.formatted_address || place.name,
        lat: lat.toString(),
        lng: lng.toString()
      });
    } else {
      console.log('Autocomplete is not loaded yet!');
    }
  };

  const isOwner = user?.role === 'owner';

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await propertiesAPI.getAll();
      setProperties(res.data.data || []);
    } catch {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await propertiesAPI.create({ 
        ...form, 
        rent: Number(form.rent),
        lat: Number(form.lat) || 12.9716,
        lng: Number(form.lng) || 77.5946
      });
      toast.success('Property added!');
      setShowAdd(false);
      setForm({ title: '', location: '', rent: '', lat: '', lng: '' });
      fetchProperties();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add property');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await propertiesAPI.update(showEdit._id, { 
        ...form, 
        rent: Number(form.rent),
        lat: Number(form.lat),
        lng: Number(form.lng)
      });
      toast.success('Property updated!');
      setShowEdit(null);
      fetchProperties();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property?')) return;
    try {
      await propertiesAPI.delete(id);
      toast.success('Property deleted');
      fetchProperties();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await propertiesAPI.assignTenant(showAssign._id, assignForm);
      toast.success('Tenant assigned & lease created!');
      setShowAssign(null);
      setAssignForm({ tenantId: '', leaseStart: '', leaseEnd: '' });
      fetchProperties();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign tenant');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (p) => {
    setForm({ title: p.title, location: p.location, rent: p.rent, lat: p.lat || '', lng: p.lng || '' });
    setShowEdit(p);
  };

  const filtered = properties.filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Properties">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-2xl text-white">
              {isOwner ? 'My Properties' : 'Available Properties'}
            </h2>
            <p className="text-gray-400 text-sm mt-1">{properties.length} properties found</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex bg-dark-800 rounded-xl p-1 border border-white/5">
                <button 
                    onClick={() => setView('grid')}
                    className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-primary-500 text-white shadow-glow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <LayoutGrid size={18} />
                </button>
                <button 
                    onClick={() => setView('map')}
                    className={`p-2 rounded-lg transition-all ${view === 'map' ? 'bg-primary-500 text-white shadow-glow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <MapIcon size={18} />
                </button>
             </div>
             {isOwner && (
                <button onClick={() => setShowAdd(true)} className="btn-primary" id="add-property-btn">
                <Plus size={17} /> Add Property
                </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by title or location..."
            className="input pl-11 max-w-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="property-search"
          />
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
            {view === 'grid' ? (
                <motion.div 
                    key="grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                >
                    {loading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[...Array(6)].map((_, i) => (
                        <div key={i} className="card p-5 space-y-3">
                            <div className="h-40 rounded-xl bg-dark-600 shimmer" />
                            <div className="h-4 w-3/4 rounded bg-dark-600 shimmer" />
                            <div className="h-3 w-1/2 rounded bg-dark-600 shimmer" />
                        </div>
                        ))}
                    </div>
                    ) : filtered.length === 0 ? (
                    <div className="card p-16 text-center">
                        <Building2 size={48} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400 font-medium">No properties found</p>
                        <p className="text-gray-600 text-sm mt-1">
                        {isOwner ? 'Add your first property to get started.' : 'Check back later for new listings.'}
                        </p>
                    </div>
                    ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map((p, idx) => (
                        <motion.div 
                            key={p._id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="card group overflow-hidden hover:-translate-y-1 transition-all duration-300"
                        >
                            {/* Image area */}
                            <div className="h-40 bg-gradient-to-br from-primary-900/60 to-dark-700 flex items-center justify-center relative">
                            <Building2 size={40} className="text-primary-500/40" />
                            <div className="absolute top-3 right-3">
                                <span className="badge-blue">{p.leases?.length > 0 ? 'Occupied' : 'Available'}</span>
                            </div>
                            </div>

                            <div className="p-5">
                            <h3 className="font-display font-bold text-white text-lg mb-1 truncate">{p.title}</h3>
                            <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
                                <MapPin size={13} /> <span className="truncate">{p.location}</span>
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-primary-400 font-bold text-xl font-display">₹{p.rent?.toLocaleString()}<span className="text-gray-500 text-sm font-normal">/mo</span></span>
                                <div className="flex items-center gap-1 text-gray-500 text-xs">
                                <Users size={12} />
                                <span>{p.leases?.length || 0} lease{p.leases?.length !== 1 ? 's' : ''}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
                                <button 
                                    onClick={() => navigate(`/properties/${p._id}`)} 
                                    className="btn-primary py-2 text-sm justify-center w-full shadow-glow-sm"
                                    id={`view-prop-${p._id}`}
                                >
                                    View Details
                                </button>
                                
                                {isOwner && (
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(p)} className="flex-1 btn-secondary py-2 text-sm justify-center" id={`edit-prop-${p._id}`}>
                                            <Edit2 size={13} /> Edit
                                        </button>
                                        <button onClick={() => { setShowAssign(p); setAssignForm({ tenantId: '', leaseStart: '', leaseEnd: '' }); }}
                                            className="flex-1 btn-secondary py-2 text-sm justify-center text-green-400 border-green-500/30 hover:bg-green-500/10" id={`assign-prop-${p._id}`}>
                                            <Users size={13} /> Assign
                                        </button>
                                        <button onClick={() => handleDelete(p._id)} className="p-2 text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition-colors" id={`delete-prop-${p._id}`}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                             </div>
                            </div>
                        </motion.div>
                        ))}
                    </div>
                    )}
                </motion.div>
            ) : (
                <motion.div 
                    key="map"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-[600px]"
                >
                    <PropertyMap properties={filtered} />
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
      {/* Add Modal */}
      {showAdd && (
        <Modal title="Add New Property" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd} className="space-y-4" id="add-property-form">
            <div>
              <label className="label">Title</label>
              <input required className="input" placeholder="e.g. Luxury 3BHK Apartment" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Location</label>
              {isLoaded ? (
                <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
                    <input 
                        required 
                        className="input" 
                        placeholder="e.g. Koramangala, Bangalore" 
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })} 
                    />
                </Autocomplete>
              ) : (
                <input required className="input" placeholder="e.g. Koramangala, Bangalore" value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })} />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="label">Latitude</label>
                <input type="number" step="any" className="input" placeholder="12.9716" value={form.lat}
                    onChange={(e) => setForm({ ...form, lat: e.target.value })} />
                </div>
                <div>
                <label className="label">Longitude</label>
                <input type="number" step="any" className="input" placeholder="77.5946" value={form.lng}
                    onChange={(e) => setForm({ ...form, lng: e.target.value })} />
                </div>
            </div>
            <div>
              <label className="label">Monthly Rent (₹)</label>
              <input required type="number" min="0" className="input" placeholder="e.g. 25000" value={form.rent}
                onChange={(e) => setForm({ ...form, rent: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center" id="save-property-btn">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Add Property'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <Modal title="Edit Property" onClose={() => setShowEdit(null)}>
          <form onSubmit={handleEdit} className="space-y-4" id="edit-property-form">
            <div>
              <label className="label">Title</label>
              <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Location</label>
              {isLoaded ? (
                <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
                    <input required className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </Autocomplete>
              ) : (
                <input required className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="label">Latitude</label>
                <input type="number" step="any" className="input" value={form.lat}
                    onChange={(e) => setForm({ ...form, lat: e.target.value })} />
                </div>
                <div>
                <label className="label">Longitude</label>
                <input type="number" step="any" className="input" value={form.lng}
                    onChange={(e) => setForm({ ...form, lng: e.target.value })} />
                </div>
            </div>
            <div>
              <label className="label">Monthly Rent (₹)</label>
              <input required type="number" min="0" className="input" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowEdit(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center" id="update-property-btn">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Assign Tenant Modal */}
      {showAssign && (
        <Modal title={`Assign Tenant — ${showAssign.title}`} onClose={() => setShowAssign(null)}>
          <form onSubmit={handleAssign} className="space-y-4" id="assign-tenant-form">
            <div>
              <label className="label">Tenant ID</label>
              <input required className="input" placeholder="MongoDB ObjectId of the tenant" value={assignForm.tenantId}
                onChange={(e) => setAssignForm({ ...assignForm, tenantId: e.target.value })} />
            </div>
            <div>
              <label className="label">Lease Start Date</label>
              <input type="date" className="input" value={assignForm.leaseStart}
                onChange={(e) => setAssignForm({ ...assignForm, leaseStart: e.target.value })} />
            </div>
            <div>
              <label className="label">Lease End Date</label>
              <input type="date" className="input" value={assignForm.leaseEnd}
                onChange={(e) => setAssignForm({ ...assignForm, leaseEnd: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowAssign(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center" id="assign-tenant-btn">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Assign Tenant'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
