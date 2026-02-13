import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Lightbulb,
  Rocket,
  Users,
  Trophy,
  Mail,
  Phone,

  ChevronDown,
  ArrowRight,
  Sparkles,
  Target,
  GraduationCap,
  Shield,
  Briefcase,
  Globe,
  Mic,
  Calendar,
  Star,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

const PROGRAM_THEMES = [
  {
    icon: Shield,
    title: 'IPR & Technology Transfer',
    description: 'Educating students on Intellectual Property Rights, patents, copyrights, and technology transfer mechanisms.',
    iconColor: '#f59e0b',
    bg: 'bg-amber-50',
  },
  {
    icon: Lightbulb,
    title: 'Innovation & Design Thinking',
    description: 'Fostering creative problem-solving through human-centered design thinking methodologies and innovation frameworks.',
    iconColor: '#3b82f6',
    bg: 'bg-blue-50',
  },
  {
    icon: Rocket,
    title: 'Entrepreneurship & Startup',
    description: 'Building entrepreneurial mindset, business model creation, lean startup methodology, and venture development.',
    iconColor: '#10b981',
    bg: 'bg-emerald-50',
  },
  {
    icon: Target,
    title: 'Pre-Incubation & Incubation',
    description: 'Supporting ideas from concept to prototype through mentorship, resources, and structured incubation programs.',
    iconColor: '#8b5cf6',
    bg: 'bg-purple-50',
  },
];

const PROGRAM_DRIVEN_BY = [
  { icon: Calendar, label: 'IIC Calendar Activity', color: 'text-indigo-300' },
  { icon: Mic, label: 'MIC Driven Activity', color: 'text-amber-300' },
  { icon: Zap, label: 'Self Driven Activity', color: 'text-emerald-300' },
  { icon: Star, label: 'Celebration Activity', color: 'text-sky-300' },
];

const PROGRAM_TYPES_BY_LEVEL = [
  {
    level: 'Level 1 — Awareness',
    color: 'bg-blue-600',
    types: ['Expert Talk', 'Exposure Visit', 'Mentoring Session', 'Exhibition'],
  },
  {
    level: 'Level 2 — Engagement',
    color: 'bg-indigo-600',
    types: ['Competition', 'Conference', 'Exposure Visit', 'Seminar', 'Workshop'],
  },
  {
    level: 'Level 3 — Action',
    color: 'bg-violet-600',
    types: ['Bootcamp', 'Competition/Hackathon', 'Demo Day', 'Exhibition', 'Workshop', 'Exposure Visit'],
  },
  {
    level: 'Level 4 — Impact',
    color: 'bg-purple-600',
    types: ['Challenges', 'Competition/Hackathon', 'Tech Fest', 'Bootcamp', 'Workshop', 'Exhibition/Demo Day'],
  },
];


export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setMobileMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      {/* ─── NAVBAR ─── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-200/50 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('#home')}>
            <img src="/ace.jpeg" alt="ACE Logo" className="h-12 w-12 rounded-xl object-contain shadow-md" />
            <div className="hidden sm:block">
              <p className="font-extrabold text-base leading-tight bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
                Adhiyamaan College of Engineering
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Institution's Innovation Council
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollToSection(l.href)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                {l.label}
              </button>
            ))}
            <Button
              onClick={() => navigate('/login')}
              className="ml-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl px-6 font-bold shadow-lg shadow-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-300 active:scale-95"
            >
              Login
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="w-5 flex flex-col gap-1">
              <span className={`h-0.5 bg-slate-700 rounded transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`h-0.5 bg-slate-700 rounded transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`h-0.5 bg-slate-700 rounded transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t mt-2 px-6 py-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollToSection(l.href)}
                className="block w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
              >
                {l.label}
              </button>
            ))}
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold mt-2"
            >
              Login
            </Button>
          </div>
        )}
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-200/40 to-blue-300/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-200/30 to-pink-200/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center pt-24 pb-16">
          {/* Logos */}
          <div className="flex items-center justify-center gap-6 mb-10">
            <img src="/ace.jpeg" alt="ACE Logo" className="h-24 w-24 rounded-2xl object-contain shadow-xl shadow-indigo-200/50 border-2 border-white" />
            <div className="h-16 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent" />
            <img src="/iic.jpg" alt="IIC Logo" className="h-24 w-24 rounded-2xl object-contain shadow-xl shadow-blue-200/50 border-2 border-white" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-100/80 text-indigo-700 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-sm border border-indigo-200/50">
            <Sparkles className="h-3.5 w-3.5" />
            Ministry of Education Initiative
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
            <span className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 bg-clip-text text-transparent">
              Institution's
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Innovation Council
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-4 leading-relaxed font-medium">
            Adhiyamaan College of Engineering (Autonomous)
          </p>
          <p className="text-sm text-slate-400 max-w-xl mx-auto mb-10">
            Affiliated to Anna University, Chennai · Dr. M.G.R. Nagar, Hosur – 635130
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => scrollToSection('#about')}
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl px-8 py-6 text-lg font-bold shadow-xl shadow-indigo-200 transition-all hover:shadow-2xl hover:shadow-indigo-300 active:scale-95 group"
            >
              Explore IIC
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
              size="lg"
              className="rounded-2xl px-8 py-6 text-lg font-bold border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all active:scale-95"
            >
              Portal Login
            </Button>
          </div>

          {/* Scroll Indicator */}
          <button
            onClick={() => scrollToSection('#about')}
            className="mt-16 inline-flex flex-col items-center text-slate-400 hover:text-indigo-500 transition-colors animate-bounce"
          >
            <span className="text-xs font-bold uppercase tracking-widest mb-1">Scroll</span>
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      </section>



      {/* ─── ABOUT SECTION ─── */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-100/80 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              <Users className="h-3.5 w-3.5" />
              About Us
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4">
              Fostering Innovation &{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Entrepreneurship
              </span>
            </h2>
            <p className="text-slate-500 max-w-3xl mx-auto text-lg leading-relaxed">
              The Institution's Innovation Council at ACE, Hosur is established under the initiative of the
              Ministry of Education, Government of India, to cultivate a culture of innovation among students
              and faculty through structured programs and industry collaborations.
            </p>
          </div>

          {/* Mission Card — Program Driven By */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-10 text-white mb-16 shadow-2xl shadow-indigo-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-black mb-4">Our Mission</h3>
                <p className="text-indigo-100 text-lg leading-relaxed">
                  To systematically foster the culture of innovation in our institution by engaging students in
                  new ideas, research, and innovation. We aim to guide students to work on new ideas and
                  processes, mentor them to convert prototypes into products, and create a complete ecosystem
                  that encourages and recognizes innovation.
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-4">Programs Driven By</p>
                <div className="grid grid-cols-2 gap-4">
                  {PROGRAM_DRIVEN_BY.map((item) => (
                    <div key={item.label} className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/20">
                      <item.icon className={`h-8 w-8 mx-auto mb-2 ${item.color}`} />
                      <p className="text-sm font-bold leading-tight">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Program Themes */}
          <h3 className="text-2xl font-black text-slate-900 text-center mb-10">Program Themes</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROGRAM_THEMES.map((theme) => (
              <Card
                key={theme.title}
                className="group border-0 shadow-lg shadow-slate-100 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 hover:-translate-y-2 rounded-2xl overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className={`${theme.bg} w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <theme.icon className="h-7 w-7" style={{ color: theme.iconColor }} />
                  </div>
                  <h4 className="font-bold text-lg text-slate-900 mb-2">{theme.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{theme.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Program Types by Level */}
          <div className="mt-16 bg-slate-50 rounded-3xl p-10">
            <h3 className="text-2xl font-black text-slate-900 text-center mb-3">Program Types</h3>
            <p className="text-slate-400 text-sm text-center mb-8">Activities organized across 4 progressive levels</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PROGRAM_TYPES_BY_LEVEL.map((level) => (
                <div key={level.level} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className={`${level.color} text-white px-4 py-3`}>
                    <p className="font-bold text-sm">{level.level}</p>
                  </div>
                  <div className="p-4 space-y-2">
                    {level.types.map((t) => (
                      <div key={t} className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SDG Alignment */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-black text-slate-900 mb-3">SDG Alignment</h3>
            <p className="text-slate-400 text-sm mb-8 max-w-2xl mx-auto">Our activities are aligned with the United Nations Sustainable Development Goals</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'No Poverty', 'Zero Hunger', 'Good Health', 'Quality Education',
                'Gender Equality', 'Clean Water', 'Clean Energy', 'Economic Growth',
                'Innovation & Infrastructure', 'Reduced Inequalities', 'Sustainable Cities',
                'Responsible Consumption', 'Climate Action', 'Life Below Water',
                'Life on Land', 'Peace & Justice', 'Partnerships',
              ].map((goal, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                >
                  <Globe className="h-3 w-3 text-indigo-400" />
                  SDG {i + 1}: {goal}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONTACT SECTION ─── */}
      <section id="contact" className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-100/80 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              <Mail className="h-3.5 w-3.5" />
              Contact Us
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4">
              Get In{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Touch
              </span>
            </h2>
            <p className="text-slate-500 text-lg">
              Have questions about IIC activities? We'd love to hear from you.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-3xl mx-auto">
            {/* Mr. Mohanraj Card */}
            <Card className="group border-0 shadow-xl shadow-slate-100 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 hover:-translate-y-2 rounded-3xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600" />
              <CardContent className="p-8 text-center">
                <div className="relative mx-auto mb-5">
                  <div className="bg-gradient-to-br from-indigo-100 to-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-indigo-100">
                    <Users className="h-9 w-9 text-indigo-600" />
                  </div>
                </div>
                <h4 className="font-black text-xl text-slate-900 mb-1">Mr. Mohanraj</h4>
                <div className="inline-flex items-center gap-1.5 bg-indigo-100/80 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
                  IIC Coordinator
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 mt-2">
                  <div className="flex items-center justify-center gap-2.5">
                    <div className="bg-emerald-100 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-emerald-600" />
                    </div>
                    <a
                      href="tel:+919791237837"
                      className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                    >
                      +91 97912 37837
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dr. Dhanasekar Card */}
            <Card className="group border-0 shadow-xl shadow-slate-100 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 hover:-translate-y-2 rounded-3xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
              <CardContent className="p-8 text-center">
                <div className="relative mx-auto mb-5">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-100">
                    <GraduationCap className="h-9 w-9 text-blue-600" />
                  </div>
                </div>
                <h4 className="font-black text-xl text-slate-900 mb-1">Dr. Dhanasekaran</h4>
                <div className="inline-flex items-center gap-1.5 bg-blue-100/80 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-5">
                  Dean — Industry Relations
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 mt-2">
                  <div className="flex items-center justify-center gap-2.5">
                    <div className="bg-emerald-100 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-emerald-600" />
                    </div>
                    <a
                      href="tel:+919043793491"
                      className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                    >
                      +91 9043793491
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <div className="rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100">
            <iframe
              title="ACE Location"
              src="https://maps.google.com/maps?q=Adhiyamaan+College+of+Engineering,+Hosur&t=&z=15&ie=UTF8&iwloc=B&output=embed"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Left */}
            <div className="flex items-center gap-3">
              <img src="/ace.jpeg" alt="ACE" className="h-12 w-12 rounded-xl object-contain" />
              <div>
                <p className="font-bold text-base">Adhiyamaan College of Engineering</p>
                <p className="text-slate-400 text-xs">Institution's Innovation Council</p>
              </div>
            </div>

            {/* Center */}
            <div className="text-center">
              <p className="text-slate-400 text-sm">
                © {new Date().getFullYear()} Adhiyamaan College of Engineering. All rights reserved.
              </p>
            </div>

            {/* Right */}
            <div className="text-right">
              <Button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-xl font-bold shadow-lg shadow-indigo-900/30"
              >
                Portal Login <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
