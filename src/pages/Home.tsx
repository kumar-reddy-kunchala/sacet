import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Zap, Users, Award, ChevronRight, ScrollText, Gift } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 uppercase">
            SACET<span className="text-indigo-600">RAJATHOTSAV</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Celebrating 25 years of excellence in technical education and innovation. Join us for the grand Silver Jubilee Celebrations.
          </p>
        </motion.div>
      </section>

      {/* TECHTRECK Section */}
      <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-black/5 space-y-8">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-2xl">
            <Zap className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">TECHTRECK</h2>
            <p className="text-gray-500">The Ultimate Technical Quiz Challenge</p>
          </div>
        </div>

        <p className="text-lg text-gray-700 leading-relaxed">
          Step forward and exhibit your technical brilliance in an engaging and competitive environment. 
          Test your knowledge, boost your confidence, and shine among the best minds.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-bold text-xl">
              <ScrollText className="w-5 h-5 text-indigo-600" />
              Rules & Regulations
            </h3>
            <ul className="space-y-3 text-gray-600">
              {[
                "The Screening Test will be conducted for all registered participants.",
                "The Screening Test will consist of 30 MCQs to be completed within 20 minutes.",
                "The Screening Test will be conducted individually.",
                "Based on results, candidates will be shortlisted and grouped into 5 teams (3 members each).",
                "Selected teams will participate in Technical Round and Final Round.",
                "Certificates and prizes will be distributed to 1st and 2nd winners.",
                "Decision of Quiz Committee is final."
              ].map((rule, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-indigo-600 font-bold">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-bold text-xl">
              <Gift className="w-5 h-5 text-indigo-600" />
              Prize Pool
            </h3>
            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
              <p className="text-indigo-900 font-medium leading-relaxed">
                Win exciting cash prizes, certificates, and trophies. 
                Participation certificates will be provided to all.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="grid md:grid-cols-3 gap-6">
        {[
          { 
            title: "Round 1", 
            subtitle: "Qualifying Round", 
            desc: "Individual screening test with 30 MCQs.",
            path: "/round1",
            icon: Zap,
            color: "bg-blue-500"
          },
          { 
            title: "Round 2", 
            subtitle: "Team Technical", 
            desc: "Shortlisted teams battle it out.",
            path: "/round2",
            icon: Users,
            color: "bg-indigo-500"
          },
          { 
            title: "Round 3", 
            subtitle: "Final Round", 
            desc: "The grand finale rapid fire.",
            path: "/round3",
            icon: Award,
            color: "bg-purple-500"
          }
        ].map((round, i) => (
          <Link key={i} to={round.path}>
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 h-full flex flex-col group"
            >
              <div className={`${round.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-indigo-200`}>
                <round.icon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-1">{round.title}</h3>
              <p className="text-indigo-600 font-semibold text-sm mb-4 uppercase tracking-wider">{round.subtitle}</p>
              <p className="text-gray-500 mb-8">{round.desc}</p>
              <div className="mt-auto flex items-center text-gray-900 font-bold group-hover:text-indigo-600 transition-colors">
                Start Round <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </motion.div>
          </Link>
        ))}
      </section>
    </div>
  );
}
