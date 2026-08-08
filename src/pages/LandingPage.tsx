import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Cpu, Layers, ArrowRight, CheckCircle2, Zap, Database } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <nav className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">AI CreatorHub</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/25 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]" />
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            Powered by Google Gemini 2.5 Flash & Full-Stack Node/Express
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            The Security-First AI Platform for <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Digital Creators</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Create, schedule, and optimize social media posts, blog articles, and video scripts. Supercharged with real Gemini AI function calling, prompt injection defense, and MongoDB database persistence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all group"
            >
              Launch Creator Workspace
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors text-center"
            >
              Sign In Demo Account
            </Link>
          </div>

          <div className="pt-8 text-xs text-slate-400 flex flex-wrap justify-center gap-6">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> JWT Authentication & bcrypt</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Gemini Function Calling</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Prompt Injection Guards</span>
          </div>
        </div>
      </header>

      {/* Feature Grid */}
      <section className="py-16 bg-slate-900/60 border-y border-slate-800/80 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Full-Stack Architecture Highlights</h2>
            <p className="text-slate-400 text-sm mt-2">Built with production-grade engineering principles and Kalvium core capabilities.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Gemini AI & Function Calling</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate captions, rewrite content in 6 tones, extract hashtags, and chat with an AI assistant that queries your real MongoDB stats via function declarations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Layered Prompt Injection Defense</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Server-side prompt defense engine sanitizes input, enforces structural XML boundary wrapping, detects injection attack patterns, and logs suspicious AI requests.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">MongoDB Aggregation & CRUD</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete Mongoose schemas for Users, Content, Media, and AI Requests. Features role-based authorization for Users and Admins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800 text-center text-xs text-slate-400 px-4">
        <p>© 2026 AI CreatorHub — Production Capstone Web Application</p>
      </footer>
    </div>
  );
};
