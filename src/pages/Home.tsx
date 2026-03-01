import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, ShieldCheck, Info, ChevronRight, Lock } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-20 py-10">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-500/50 bg-yellow-500/5 text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
            RAJATHOTSHAV – 25 YEARS CELEBRATION
          </div>
          
          <h1 className="text-[12vw] md:text-[10vw] font-display leading-[0.85] tracking-tighter uppercase bg-gradient-to-b from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-2xl">
            TECHTRECK
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
            The ultimate technical quiz battleground organized by the <br />
            <span className="text-yellow-400 font-black">CSE Department</span> of St Ann's College of Engineering & Technology.
          </p>
        </motion.div>
      </section>

      {/* Info Grid */}
      <section className="grid md:grid-cols-3 gap-6">
        {[
          { icon: Calendar, label: 'DATE', value: 'March 6, 2026' },
          { icon: Clock, label: 'TIME', value: 'Morning Session' },
          { icon: MapPin, label: 'VENUE', value: 'Seminar Hall (131)' }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 text-center space-y-4 border-white/5 hover:border-white/10 transition-all group"
          >
            <item.icon className="w-6 h-6 text-orange-500 mx-auto group-hover:scale-110 transition-transform" />
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
              <p className="text-lg font-black text-white uppercase tracking-tight">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Details Grid */}
      <section className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-10 space-y-6"
        >
          <div className="flex items-center gap-4">
            <ShieldCheck className="w-6 h-6 text-yellow-500" />
            <h3 className="text-2xl font-display uppercase tracking-tight text-yellow-500">About SACET</h3>
          </div>
          <p className="text-gray-300 leading-relaxed">
            St. Ann's College of Engineering & Technology (SACET), Chirala, established in 2001, is a premier institution dedicated to academic excellence. The <span className="text-yellow-400 font-bold">Department of Computer Science and Engineering</span> is renowned for its innovative approach to technical education, preparing students for the dynamic world of technology through events like TECHTRECK.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-10 space-y-6"
        >
          <div className="flex items-center gap-4">
            <Info className="w-6 h-6 text-orange-500" />
            <h3 className="text-2xl font-display uppercase tracking-tight text-orange-500">General Rules</h3>
          </div>
          <ul className="space-y-4 text-gray-300">
            {[
              "Open to all engineering students.",
              "Round 1 is individual; subsequent rounds are team-based.",
              "Malpractice leads to immediate disqualification.",
              "Judge's decision is final and binding.",
              "Report to venue 15 minutes before the start."
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* Navigation Buttons */}
      <section className="flex flex-wrap items-center justify-center gap-6 pt-10">
        <Link to="/round1">
          <button className="px-10 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all">
            Round 1
          </button>
        </Link>
        <Link to="/round2">
          <button className="px-10 py-4 rounded-xl bg-yellow-400 text-black font-black uppercase tracking-widest text-sm hover:bg-yellow-300 shadow-[0_0_30px_rgba(250,204,21,0.3)] transition-all">
            Round 2
          </button>
        </Link>
        <Link to="/round3">
          <button className="px-10 py-4 rounded-xl bg-orange-600 text-white font-black uppercase tracking-widest text-sm hover:bg-orange-500 shadow-[0_0_30px_rgba(234,88,12,0.3)] transition-all">
            Round 3
          </button>
        </Link>
        <Link to="/admin" className="text-gray-400 hover:text-white font-black uppercase tracking-widest text-sm transition-all ml-4">
          Admin Login
        </Link>
      </section>

      {/* Footer */}
      <footer className="pt-20 pb-10 text-center space-y-4 border-t border-white/5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
          © 2026 Sri Aditya College of Engineering & Technology
        </p>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
          Department of CSE - TechTreck 2026
        </p>
        <Link to="/admin" className="block text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-gray-400 transition-colors">
          Organizer Portal
        </Link>
      </footer>
    </div>
  );
}
