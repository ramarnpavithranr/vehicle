import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Radio, ArrowRight, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-sky-900 to-teal-800 bg-clip-text text-transparent">
                AutoPulse <span className="text-sky-600">AI</span>
              </span>
              <span className="block text-[10px] tracking-wider uppercase font-semibold text-slate-500">
                Intelligent V2V &amp; Road Hazard Network
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('overview')}
              className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors"
            >
              Overview
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('preview')}
              className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors"
            >
              Live Preview
            </button>
          </div>

          {/* Right Action Button */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate('/get-started')}
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 text-white text-sm font-semibold shadow-md shadow-sky-600/25 hover:shadow-lg hover:shadow-sky-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-b border-slate-200 px-4 pt-4 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => scrollToSection('overview')}
            className="block w-full text-left py-2 text-slate-700 font-medium hover:text-sky-600"
          >
            Overview
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="block w-full text-left py-2 text-slate-700 font-medium hover:text-sky-600"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="block w-full text-left py-2 text-slate-700 font-medium hover:text-sky-600"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('preview')}
            className="block w-full text-left py-2 text-slate-700 font-medium hover:text-sky-600"
          >
            Live Preview
          </button>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/get-started');
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 text-white text-sm font-semibold shadow-md text-center flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
