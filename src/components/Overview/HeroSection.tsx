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
    },
    {
      label: "Plans Created",
      value: "12,000+",
      icon: TrendingUp,
    },
    {
      label: "Average Savings",
      value: "30%",
      icon: Sparkles,
    },
  ];

  return (
    // Bỏ background gradient cứng, để nền trong suốt ăn theo Overview
    <section className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b to-transparent">
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6 animate-fade-in">
        {/* Modern Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-(--gradient-bg-1) border border-(--border) text-xs font-bold tracking-widest uppercase text-(--primary-dark) mb-8 shadow-sm">
          <Gift className="w-4 h-4 animate-[swing_3s_ease-in-out_infinite]" />
          <span>Ready for Tet 2026</span>
        </div>

        <h1 className="font-serif text-5xl md:text-7xl text-(--text-heading) mb-6 leading-[1.1] tracking-tight transition-colors duration-500">
          Plan your <span className="text-(--primary)">Tet</span> <br />
          with absolute ease
        </h1>

        <p className="text-lg text-(--text-muted) mb-10 max-w-xl mx-auto leading-relaxed transition-colors duration-500">
          Manage tasks, shopping lists, track your budget in real-time, ensure
          everything is perfectly prepared for the Lunar New Year.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/task"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl transition-all font-bold text-base hover:-translate-y-1"
            // Dùng gradient từ theme
            style={{
              background: "var(--gradient-warm)",
              color: "white",
              boxShadow: "0 4px 20px var(--shadow-accent)",
            }}
          >
            Get started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="px-7 py-4 bg-(--bg-glass) backdrop-blur-md rounded-2xl border border-(--border) shadow-sm flex items-center gap-3 text-sm font-bold text-(--text-heading) hover:bg-(--bg-card) transition-all hover:-translate-y-1">
            <Link
              to="/finance"
              className="group inline-flex items-center gap-3"
            >
              <Sparkles className="w-5 h-5 text-(--primary-light) group-hover:rotate-12 group-hover:scale-110 transition-transform" />
              <span>Expense Tracking</span>
            </Link>
          </div>
        </div>

        {/* Stats Row - Thêm animation delay cho hiệu ứng gõ nhịp (Stagger) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="text-center p-8 rounded-[2.5rem] bg-(--bg-card) border border-(--border) shadow-sm backdrop-blur-sm group hover:scale-105 hover:shadow-[0_8px_30px_var(--shadow-accent) hover:border-(--border-hover) transition-all duration-300 animate-[fadeInUp_0.6s_ease-out_forwards]"
              style={{ animationDelay: `${i * 0.15}s`, opacity: 0 }}
            >
              <div className="h-11 w-11 rounded-2xl bg-(--bg) flex items-center justify-center mx-auto mb-4 border border-(--border) shadow-inner group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300">
                <stat.icon
                  className="w-5 h-5"
                  style={{ color: "var(--primary)" }}
                />
              </div>
              <p className="text-3xl font-black text-(--text-heading) mb-1 tracking-tight">
                {stat.value}
              </p>
              <p className="text-[10px] text-(--text-subtle) font-bold uppercase tracking-[0.2em]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
