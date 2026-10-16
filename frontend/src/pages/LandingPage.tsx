import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, Radio, Camera, Map,
  Wifi, HeartPulse, FileText, Activity, Zap,
  CheckCircle2, Eye, Navigation
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { RoadSafetyPreview } from '../components/RoadSafetyPreview';

/* ─── Animated particle canvas behind the hero ─── */
const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.5,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14, 165, 233, ${p.alpha * 0.35})`;
        ctx.fill();
      });

      // connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(14, 165, 233, ${0.07 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => navigate('/get-started');
  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const featureCards = [
    {
      title: 'AI Road Hazard Detection',
      desc: 'Detect potholes, debris, and lane obstructions using computer vision algorithms and responsive camera processing.',
      icon: Camera,
      gradient: 'from-sky-500 to-blue-600',
      tag: 'YOLO & Vision'
    },
    {
      title: 'Interactive Live Map',
      desc: 'Real-time geospatial tracking of connected vehicles, confirmed hazard markers, and customizable alert buffer radii.',
      icon: Map,
      gradient: 'from-teal-500 to-emerald-600',
      tag: 'Leaflet & OSM'
    },
    {
      title: 'Real-Time V2V Alerts',
      desc: 'Low-latency WebSocket mesh delivers voice chimes and visual warnings to vehicles within 1,000m of verified hazards.',
      icon: Wifi,
      gradient: 'from-blue-600 to-indigo-600',
      tag: 'FastAPI WebSockets'
    },
    {
      title: 'Vehicle Health Telemetry',
      desc: 'Monitor engine temperatures, high-voltage battery levels, tire pressure PSI, and suspension vibration telemetry.',
      icon: HeartPulse,
      gradient: 'from-rose-500 to-pink-600',
      tag: 'Real-Time Sensors'
    },
    {
      title: 'Document & PUC Reminders',
      desc: 'Automated expiration tracking for insurance policies, commercial driving licenses, vehicle fitness, and PUC certificates.',
      icon: FileText,
      gradient: 'from-amber-500 to-orange-600',
      tag: 'Compliance Engine'
    },
    {
      title: 'Intelligent Traffic Simulation',
      desc: 'Interactive sandbox to test hazard avoidance metrics with V2V alerts active versus baseline panic-braking conditions.',
      icon: Activity,
      gradient: 'from-cyan-500 to-teal-600',
      tag: 'Predictive Sandbox'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Detect Road Hazards',
      desc: 'Dashcams, optical sensors, and onboard AI models continuously scan the road for potholes, debris, and stopped vehicles.',
      icon: Eye
    },
    {
      step: '02',
      title: 'Verify Detected Hazards',
      desc: 'Multi-vehicle consensus and automated verification confirm report confidence before broadcasting to the wider network.',
      icon: ShieldCheck
    },
    {
      step: '03',
      title: 'Communicate Across V2V Mesh',
      desc: 'FastAPI WebSockets transmit geospatial warning packets in milliseconds to all registered vehicles approaching the hazard zone.',
      icon: Radio
    },
    {
      step: '04',
      title: 'Send Automatic Warnings',
      desc: 'In-cockpit synthetic voice announcements and dashboard alerts prompt drivers to decelerate safely well before visual sightlines.',
      icon: Zap
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar />

      {/* ── LIGHT HERO ── */}
      <section
        id="overview"
        className="relative pt-28 pb-24 lg:pt-36 lg:pb-36 overflow-hidden bg-gradient-to-br from-sky-50 via-white to-teal-50/40"
      >
        <ParticleCanvas />

        {/* Soft light orbs */}
        <div className="absolute top-[-80px] left-[-100px] w-[500px] h-[500px] rounded-full bg-sky-300/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-80px] w-[400px] h-[400px] rounded-full bg-teal-300/15 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-sky-200/20 blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Hero Content */}
            <div className="lg:col-span-6 space-y-7 text-center lg:text-left">
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-sky-200/80 text-xs font-semibold text-sky-700 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                <span>Next-Gen Connected Vehicle Safety Network</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
                See the Road{' '}
                <span className="relative">
                  <span className="bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                    Ahead.
                  </span>
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-sky-500/0 via-sky-500/50 to-teal-500/0" />
                </span>
                <br />
                <span className="bg-gradient-to-r from-teal-600 via-sky-600 to-sky-700 bg-clip-text text-transparent">
                  Drive Safer.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                AutoPulse AI unites computer vision road hazard detection, sub-second Vehicle-to-Vehicle (V2V) warning broadcasts, and real-time vehicle telematics into an intelligent automotive safety ecosystem.
              </p>

              {/* CTA Buttons */}
              <div className="pt-1 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={handleGetStarted}
                  id="hero-get-started"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-600 via-sky-600 to-teal-600 text-white font-bold text-base shadow-lg shadow-sky-600/30 hover:shadow-xl hover:shadow-sky-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={scrollToFeatures}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-sky-300 hover:text-slate-900 transition-all shadow-sm"
                >
                  <span>Explore Features</span>
                  <Navigation className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Live Metric Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-md mx-auto lg:mx-0">
                {[
                  { val: '18ms', label: 'V2V Latency' },
                  { val: '1,000m', label: 'Warning Radius' },
                  { val: '4-Stage', label: 'Hazard Lifecycle' },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900">{m.val}</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Hero Showcase Visual */}
            <div className="lg:col-span-6">
              {/* Glass card wrapper */}
              <div className="rounded-3xl p-1 bg-gradient-to-br from-sky-200/60 via-teal-200/40 to-slate-200/60 shadow-2xl shadow-sky-200/40">
                <div className="rounded-[22px] bg-white overflow-hidden border border-slate-200/80 shadow-inner">
                  <RoadSafetyPreview />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none pointer-events-none">
          <svg viewBox="0 0 1440 60" className="w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 20C1200 55 900 0 720 10C540 20 240 55 0 20Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              Built for Automotive Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Six Pillars of Proactive Road Safety
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Every component works synchronously to eliminate driving blind spots, prevent high-speed pothole accidents, and keep fleets compliant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureCards.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="group relative bg-slate-50/70 hover:bg-white rounded-3xl p-8 border border-slate-200/80 hover:border-sky-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.gradient} flex items-center justify-center text-white shadow-md`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600">
                        {feat.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/50 flex items-center justify-between text-xs font-semibold text-sky-600 group-hover:translate-x-1 transition-transform">
                    <span>Explore module in dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              End-to-End Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How AutoPulse AI Works
            </h2>
            <p className="text-slate-600 text-base">
              A frictionless four-stage lifecycle transforms raw road observations into high-impact driver safety interventions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div key={idx} className="relative bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-extrabold font-mono text-slate-200">
                        {st.step}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{st.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-normal">{st.desc}</p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-teal-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Automated Process</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Road Safety Preview Section */}
      <section id="preview" className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                Live Interactive Demonstration
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Experience Real-Time Road Hazard Awareness
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Notice how connected vehicles receive hazard notifications hundreds of meters before physical sightlines allow human reaction. Our V2V mesh acts as an extended digital sensory layer for drivers.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { title: 'Prevent Tire & Suspension Damage', desc: 'Advance warning allows gradual, smooth lane changes instead of abrupt swerving.' },
                  { title: 'Zero-Lag Synthetic Voice Alerts', desc: 'Audio chime and voice announcement alert the driver without taking eyes off the road.' },
                  { title: 'Lifecycle Verification', desc: 'Eliminates false alarms via 4-stage statuses: Detected, Pending, Confirmed, and Cleared.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={handleGetStarted}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm shadow hover:bg-slate-800 transition-all"
                >
                  <span>Launch Operations Center</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <RoadSafetyPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action — no Login button */}
      <section className="py-24 relative overflow-hidden text-slate-900 text-center bg-gradient-to-br from-sky-50 via-white to-teal-50/60 border-t border-slate-200/80">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-sky-200/30 blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.06] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-sky-200 text-xs font-semibold text-sky-700 shadow-sm">
            <Radio className="w-3.5 h-3.5 animate-pulse text-sky-500" />
            <span>Ready for Deployment</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Make Every Journey More Aware.
          </h2>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Connect your fleet or personal vehicle to the AutoPulse AI network. Start monitoring active hazards, live telematics, and compliance deadlines in seconds.
          </p>

          <div className="pt-4 flex items-center justify-center">
            <button
              onClick={handleGetStarted}
              id="cta-get-started"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-teal-600 text-white font-bold text-base shadow-xl shadow-sky-600/25 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Access Live Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
