import React from "react";

interface ProgressRingProps {
  percentage: number;
  size?: number; // Mặc định 120 là khá to
  strokeWidth?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 120,
  strokeWidth = 12,
}) => {
  // BẢO VỆ: Nếu percentage là NaN hoặc vô hạn, mặc định về 0
  const safePercentage =
    isNaN(percentage) || !isFinite(percentage)
      ? 0
      : Math.min(Math.max(percentage, 0), 100);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Tính toán offset an toàn để tránh lỗi CSS
  const offset = circumference - (safePercentage / 100) * circumference;

  const getColor = () => {
    if (safePercentage >= 100) return "text-destructive stroke-destructive";
    if (safePercentage >= 80) return "text-planner-amber stroke-planner-amber";
    return "text-primary stroke-primary";
  };

  return (
    <div
      className="relative flex-shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Vòng tròn nền (màu xám nhạt) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className="stroke-muted opacity-70"
        />
        {/* Vòng tròn tiến độ (màu động) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={`${getColor()} transition-all duration-700 ease-in-out`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: isNaN(offset) ? circumference : offset,
          }}
        />
      </svg>

      {/* Chữ hiển thị ở giữa */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`text-2xl font-black leading-none ${getColor().split(" ")[0]}`}
        >
          {Math.round(safePercentage)}%
        </span>
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
          Đã dùng
        </span>
      </div>
    </div>
  );
};
