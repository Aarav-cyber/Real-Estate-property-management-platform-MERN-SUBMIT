import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import PropertyMap from '../components/PropertyMap';
import { propertiesAPI, requestsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, MapPin, IndianRupee, User, Calendar, 
  ArrowLeft, Share2, Heart, ShieldCheck, Zap, 
  Loader2, MessageSquare, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  const isOwner = user?.role === 'owner';
  const isTenant = user?.role === 'tenant';

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const res = await propertiesAPI.getById(id);
      setProperty(res.data.data);
    } catch (err) {
      toast.error('Failed to load property details');
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    if (!isTenant) {
      toast.error('Only tenants can send rental requests');
      return;
    }
    setRequesting(true);
    try {
      await requestsAPI.create({ propertyId: id });
      toast.success('Rental request sent successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!property) return null;

  return (
    <DashboardLayout title="Property Details">
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Back and Actions */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Listings
          </button>
          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-xl bg-dark-800 border border-white/5 text-gray-400 hover:text-white transition-all">
              <Share2 size={18} />
            </button>
            <button className="p-2.5 rounded-xl bg-dark-800 border border-white/5 text-gray-400 hover:text-accent-500 transition-all">
              <Heart size={18} />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-8"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-xs font-bold w-fit">
                    <Building2 size={12} />
                    <span>Active Listing</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-display font-black text-white">{property.title}</h1>
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin size={18} className="text-primary-500" />
                    <span className="text-lg">{property.location}</span>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-gray-500 text-sm font-medium mb-1">Monthly Rent</p>
                    <div className="flex items-center justify-end gap-1 text-white">
                        <IndianRupee size={24} className="text-primary-400" />
                        <span className="text-4xl font-display font-black tracking-tight">{property.rent?.toLocaleString()}</span>
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/5">
                {[
                    { label: 'Type', value: 'Apartment', icon: Building2 },
                    { label: 'Security', value: 'Verified', icon: ShieldCheck },
                    { label: 'Status', value: property.status || 'Available', icon: Zap },
                    { label: 'Listed by', value: 'Owner', icon: User },
                ].map((item, i) => (
                    <div key={i} className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
                            <item.icon size={14} className="text-primary-500/60" />
                            {item.label}
                        </div>
                        <p className="text-white font-semibold">{item.value}</p>
                    </div>
                ))}
              </div>
            </motion.div>

            {/* Map Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
                <MapPin size={20} className="text-primary-400" />
                Location Map
              </h3>
              <div className="h-[400px] w-full rounded-3xl overflow-hidden border border-white/5 shadow-glow-sm">
                <PropertyMap properties={[property]} />
              </div>
            </motion.div>

            {/* Description / Features */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-8 space-y-6"
            >
              <h3 className="font-display font-bold text-xl text-white">Description</h3>
              <p className="text-gray-400 leading-relaxed">
                Experience luxury living in this beautiful {property.title} located in the heart of {property.location}. 
                This property features modern amenities, spacious interiors, and is perfectly suited for those looking 
                for comfort and convenience. The neighborhood is vibrant with easy access to shopping centers, 
                schools, and public transportation.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                {[
                    'High-speed Internet Connectivity',
                    '24/7 Security & CCTV Surveillance',
                    'Modern Kitchen with Appliances',
                    'Dedicated Parking Space',
                    'Power Backup Facility',
                    'Walking distance to Public Transport'
                ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                        <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                            <CheckCircle2 size={12} />
                        </div>
                        {feature}
                    </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar / CTA */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6 sticky top-24"
            >
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-primary-500/5 border border-primary-500/10">
                    <p className="text-sm text-gray-400 mb-1">Estimated Monthly Rent</p>
                    <div className="flex items-center gap-1 text-white">
                        <IndianRupee size={20} className="text-primary-400" />
                        <span className="text-3xl font-display font-black">{property.rent?.toLocaleString()}</span>
                    </div>
                </div>

                {isTenant ? (
                    <div className="space-y-4">
                        <button 
                            onClick={handleRequest}
                            disabled={requesting}
                            className="btn-primary w-full justify-center h-14 text-base shadow-glow group"
                            id="request-rental-btn"
                        >
                            {requesting ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    <Zap size={18} className="group-hover:scale-125 transition-transform" />
                                    Send Rental Request
                                </>
                            )}
                        </button>
                        <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest font-bold">
                            By clicking, you agree to our rental terms
                        </p>
                    </div>
                ) : isOwner ? (
                    <button 
                        onClick={() => navigate('/properties')}
                        className="btn-secondary w-full justify-center h-14 text-base"
                    >
                        Manage Listing
                    </button>
                ) : (
                    <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/10 text-center">
                        <p className="text-xs text-yellow-500/80 font-medium">Please login as a tenant to send rental requests.</p>
                    </div>
                )}

                <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-dark-700 flex items-center justify-center text-primary-400">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">Listing Agent</p>
                            <p className="text-white font-bold">Property Owner</p>
                        </div>
                    </div>
                    <button className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/5 text-sm text-gray-400 hover:bg-white/5 transition-all">
                        <MessageSquare size={16} />
                        Contact for Details
                    </button>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6 bg-gradient-to-br from-primary-600 to-primary-800 text-white"
            >
              <h4 className="font-display font-bold text-lg mb-2">Need a Lease?</h4>
              <p className="text-primary-100 text-sm mb-4">Once your request is accepted, you can generate a digital lease agreement instantly.</p>
              <button className="w-full py-2.5 rounded-lg bg-white text-primary-600 text-xs font-bold uppercase tracking-wider hover:bg-primary-50 transition-colors">
                Learn More
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
