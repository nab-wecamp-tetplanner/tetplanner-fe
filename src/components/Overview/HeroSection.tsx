import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Gift,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export default function HeroSection() {
  const stats = [
    {
      label: "Active Users",
      value: "2,500+",
      icon: CheckCircle2,
      color: "text-planner-green",
      bg: "bg-planner-green-light",
    },
    {
      label: "Plans Created",
      value: "12,000+",
      icon: TrendingUp,
      color: "text-planner-blue",
      bg: "bg-planner-blue-light",
    },
    {
      label: "Average Savings",
      value: "30%",
      icon: Sparkles,
      color: "text-planner-amber",
      bg: "bg-planner-amber-light",
    },
  ];

  return (
    <section className="relative overflow-hidden pt-16 pb-20 bg-gradient-to-b from-white via-white/80 to-transparent">
      {/* Decorative blobs - Seamless background decorations */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-planner-purple/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-planner-amber/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        {/* Modern Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-xs font-bold tracking-widest uppercase text-primary mb-8 shadow-sm">
          <Gift className="w-4 h-4" />
          <span>Ready for Tet 2026</span>
        </div>

        <h1 className="font-serif text-5xl md:text-7xl text-foreground mb-6 leading-[1.1] tracking-tight">
          Plan your <span className="text-primary">Tet shopping</span> <br />
          with absolute ease
        </h1>

        <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
          Manage shopping lists, track your budget in real-time, and ensure
          everything is perfectly prepared for the Lunar New Year.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/task"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl hover:opacity-95 transition-all font-bold text-base shadow-xl shadow-primary/20 hover:-translate-y-0.5"
          >
            Get started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="px-7 py-4 bg-white/60 backdrop-blur-md rounded-2xl border border-border/50 shadow-sm flex items-center gap-3 text-sm font-bold text-foreground">
            <Sparkles className="w-5 h-5 text-planner-amber" />
            <span>Expense Tracking</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`text-center p-8 rounded-[2.5rem] ${stat.bg} border border-white shadow-sm backdrop-blur-sm group hover:scale-105 transition-transform duration-300`}
            >
              <div
                className={`h-11 w-11 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 border border-border/40 shadow-inner group-hover:rotate-6 transition-transform`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-3xl font-black text-foreground mb-1 tracking-tight">
                {stat.value}
              </p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
