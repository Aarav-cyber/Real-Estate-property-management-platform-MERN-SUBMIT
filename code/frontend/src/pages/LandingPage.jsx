import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import {
  Building2, ShieldCheck, CreditCard, FileText,
  ArrowRight, Star, Users, TrendingUp, CheckCircle2,
  MapPin, ChevronRight, Zap, Clock, Globe
} from 'lucide-react';

const features = [
  {
    icon: Building2,
    title: 'Smart Property Management',
    desc: 'List, edit and track all your properties in one sleek dashboard with real-time updates.',
    color: 'from-primary-500 to-primary-700',
  },
  {
    icon: FileText,
    title: 'Digital Lease Management',
    desc: 'Create, sign and store lease agreements digitally. Upload documents and manage renewals effortlessly.',
    color: 'from-purple-500 to-purple-700',
  },
  {
    icon: CreditCard,
    title: 'Integrated Payments',
    desc: 'Powered by Razorpay — tenants pay rent online instantly. Owners track every payment in real-time.',
    color: 'from-accent-500 to-accent-600',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access',
    desc: 'Separate portals for owners, managers and tenants. Each user sees exactly what they need.',
    color: 'from-green-500 to-green-700',
  },
  {
    icon: Users,
    title: 'Tenant Requests',
    desc: 'Tenants send rental requests, owners accept or reject — all within seconds.',
    color: 'from-orange-500 to-orange-700',
  },
  {
    icon: Globe,
    title: 'Maps Integration',
    desc: 'Browse properties on an interactive map. Find the perfect location with geo-search.',
    color: 'from-cyan-500 to-cyan-700',
  },
];

const stats = [
  { label: 'Properties Listed', value: '12,000+', icon: Building2 },
  { label: 'Happy Tenants', value: '38,000+', icon: Users },
  { label: 'Payments Processed', value: '₹4.2Cr+', icon: CreditCard },
  { label: 'Cities Covered', value: '50+', icon: MapPin },
];

const steps = [
  { step: '01', title: 'Create Your Account', desc: 'Sign up as an owner or tenant in under 30 seconds.' },
  { step: '02', title: 'List or Browse Properties', desc: 'Owners add properties; tenants browse and send rental requests.' },
  { step: '03', title: 'Sign Leases & Pay Rent', desc: 'Everything from lease creation to Razorpay payments happens in-app.' },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Property Owner, Mumbai',
    text: 'RealEst completely transformed how I manage my 12 properties. Payments, leases and tenant requests — all in one place!',
    rating: 5,
  },
  {
    name: 'Arjun Mehta',
    role: 'Tenant, Bangalore',
    text: 'Finding and renting a property was never this smooth. The online payment system is a game-changer.',
    rating: 5,
  },
  {
    name: 'Rahul Verma',
    role: 'Property Manager, Delhi',
    text: "As a manager, I can handle multiple owners' portfolios without any chaos. Highly recommended.",
    rating: 5,
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-900 overflow-x-hidden">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background orbs */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            className="orb w-[600px] h-[600px] bg-primary-600/20 -top-40 -left-40 pointer-events-none" 
        />
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
            className="orb w-[500px] h-[500px] bg-accent-500/15 top-20 right-0 pointer-events-none" 
        />

        {/* Hero grid pattern */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(97,113,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(97,113,246,0.4) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Badge */}
            <motion.div 
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-primary-300 mb-8"
            >
                <Zap size={14} className="text-primary-400" />
                <span>India's #1 Property Management Platform</span>
                <ChevronRight size={14} />
            </motion.div>

            <motion.h1 
                variants={fadeInUp}
                className="font-display font-black text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-white leading-tight mb-6"
            >
                Manage Properties
                <br />
                <span className="gradient-text">Smarter & Faster</span>
            </motion.h1>

            <motion.p 
                variants={fadeInUp}
                className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            >
                The all-in-one platform for property owners, managers and tenants.
                List properties, manage leases, collect payments — all in one beautiful dashboard.
            </motion.p>

            <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
                <Link to="/register" className="btn-primary text-base px-8 py-4 shadow-glow" id="hero-cta-btn">
                Start For Free <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-secondary text-base px-8 py-4" id="hero-login-btn">
                Sign In to Dashboard
                </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div 
                variants={staggerContainer}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            >
                {stats.map(({ label, value, icon: Icon }) => (
                <motion.div 
                    key={label}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.05 }}
                    className="glass p-4 text-center group hover:bg-primary-500/10 transition-all duration-300"
                >
                    <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-500/25 transition-colors">
                    <Icon size={18} className="text-primary-400" />
                    </div>
                    <p className="text-2xl font-display font-bold text-white">{value}</p>
                    <p className="text-xs text-gray-500 mt-1">{label}</p>
                </motion.div>
                ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce"
        >
          <div className="w-0.5 h-8 bg-gradient-to-b from-primary-500/50 to-transparent rounded-full" />
        </motion.div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary-400 text-sm font-semibold tracking-widest uppercase">Everything you need</span>
            <h2 className="section-title mt-3">Powerful Features Built for <span className="gradient-text">Real Estate</span></h2>
            <p className="section-subtitle">From listing to lease to payment — every step automated and streamlined.</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map(({ icon: Icon, title, desc, color }) => (
              <motion.div 
                key={title} 
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="card p-6 group cursor-default"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-glow-sm group-hover:shadow-glow transition-all duration-300`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-24 relative bg-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-accent-500 text-sm font-semibold tracking-widest uppercase">Simple Process</span>
            <h2 className="section-title mt-3">Up and Running in <span className="gradient-text">3 Steps</span></h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-500/40 via-accent-500/40 to-primary-500/40" />

            {steps.map(({ step, title, desc }, i) => (
              <motion.div 
                key={step} 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/20 flex items-center justify-center text-4xl font-display font-black text-primary-400 border-animated">
                    {step}
                  </div>
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-3">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary-400 text-sm font-semibold tracking-widest uppercase">Testimonials</span>
            <h2 className="section-title mt-3">Loved by Property <span className="gradient-text">Professionals</span></h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map(({ name, role, text, rating }) => (
              <motion.div 
                key={name} 
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                className="card p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-sm font-bold text-white">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{name}</p>
                    <p className="text-xs text-gray-500">{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-24 bg-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary-400 text-sm font-semibold tracking-widest uppercase">Pricing</span>
            <h2 className="section-title mt-3">Simple, <span className="gradient-text">Transparent Pricing</span></h2>
            <p className="section-subtitle">Start free. Scale as you grow.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter', price: 'Free', desc: 'Perfect for new landlords',
                features: ['Up to 2 properties', 'Basic tenant management', 'Email support'],
                cta: 'Get Started', highlight: false,
              },
              {
                name: 'Pro', price: '₹999/mo', desc: 'For growing portfolios',
                features: ['Up to 20 properties', 'Razorpay payments', 'Lease document uploads', 'Priority support'],
                cta: 'Start Pro', highlight: true,
              },
              {
                name: 'Enterprise', price: 'Custom', desc: 'For large portfolios',
                features: ['Unlimited properties', 'Dedicated manager', 'Maps integration', 'Analytics & reports'],
                cta: 'Contact Sales', highlight: false,
              },
            ].map(({ name, price, desc, features, cta, highlight }, i) => (
              <motion.div 
                key={name} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`card p-8 flex flex-col ${highlight ? 'border-primary-500/40 shadow-glow relative' : ''}`}
              >
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-xs font-bold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="font-display font-bold text-xl text-white mb-1">{name}</h3>
                <p className="text-gray-500 text-sm mb-4">{desc}</p>
                <p className="text-4xl font-display font-black text-white mb-6">{price}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle2 size={15} className="text-primary-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" id={`pricing-${name.toLowerCase()}-btn`}
                  className={highlight ? 'btn-primary justify-center' : 'btn-secondary justify-center'}>
                  {cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title mb-4">Ready to Transform Your <span className="gradient-text">Property Business?</span></h2>
            <p className="text-gray-400 text-lg mb-10">Join thousands of property owners already using RealEst.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-base px-10 py-4 shadow-glow" id="footer-cta-btn">
                Get Started Free <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Building2 size={15} className="text-white" />
            </div>
            <span className="font-display font-bold text-white">Real<span className="gradient-text">Est</span></span>
          </div>
          <p className="text-gray-600 text-sm">© {new Date().getFullYear()} RealEst. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
