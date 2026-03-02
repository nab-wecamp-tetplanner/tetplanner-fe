import { motion } from "motion/react";

interface StatsCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: StatsCardProps) {
  // Convert hex color to rgba with opacity for background
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-(--bg-card) rounded-2xl py-5 px-5 shadow-sm border border-(--border) hover:shadow-md transition-shadow backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: hexToRgba(color, 0.15) }}
            >
              <div style={{ color }}>{icon}</div>
            </div>
            <p className="text-(--text-muted) text-xs font-medium uppercase tracking-wide\">
              {title}
            </p>
          </div>
          {/* <p className="text-foreground text-2xl font-bold mb-1">{value}%</p> */}
          <p className="text-(--text-muted) text-xs">{subtitle}</p>
        </div>

        {/* Circular Progress */}
        <div className="relative w-18 h-18 shrink-0">
          <svg className="transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="var(--border)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <motion.path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${value}, 100`}
              initial={{ strokeDasharray: "0, 100" }}
              animate={{ strokeDasharray: `${value}, 100` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-(--text-heading)">
            {value}%
          </div>
        </div>
      </div>
    </motion.div>
  );
}
