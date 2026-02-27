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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${color}15` }}
            >
              <div style={{ color }}>{icon}</div>
            </div>
            <p className="text-[#8c97a8] text-[13px]">{title}</p>
          </div>
          <p className="text-[#1e1e1e] text-[28px] mb-1">{value}%</p>
          <p className="text-[#768396] text-[12px]">{subtitle}</p>
        </div>

        {/* Circular Progress */}
        <div className="relative w-16 h-16">
          <svg className="transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#f3f7fd"
              strokeWidth="3"
            />
            <motion.path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeDasharray={`${value}, 100`}
              initial={{ strokeDasharray: "0, 100" }}
              animate={{ strokeDasharray: `${value}, 100` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
