import React from "react";
import { useTheme } from "../../hooks/useTheme";
import type { TetTheme } from "../../contexts/ThemeContext";

const THEMES: {
  id: TetTheme;
  label: string;
  colors: [string, string];
}[] = [
  { id: "spring-blossom", label: "Spring", colors: ["#fbbf24", "#dc2626"] },
  { id: "jade-prosperity", label: "Jade", colors: ["#22c55e", "#ca8a04"] },
  { id: "morning-lantern", label: "Lantern", colors: ["#fb923c", "#dc2626"] },
  { id: "midnight-dragon", label: "Dragon", colors: ["#f59e0b", "#1e293b"] },
  { id: "minimal", label: "Minimal", colors: ["#3b82f6", "#f8fafc"] },
];

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center justify-between bg-accent/20 p-2 rounded-xl border border-accent/30 gap-1">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className="group relative flex items-center justify-center w-8 h-8 transition-transform active:scale-95"
        >
          {/* Tooltip hiện tên khi hover */}
          <span className="absolute bottom-full mb-2 px-2 py-1 bg-stone-800 text-white text-[10px] font-bold rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
            {t.label}
            {/* Mũi tên nhỏ cho tooltip */}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-800"></span>
          </span>

          {/* Chấm tròn màu sắc */}
          <div
            className={`
              relative w-6 h-6 rounded-full overflow-hidden border-2 transition-all duration-300 rotate-45
              ${theme === t.id ? "border-(--primary) scale-110 shadow-md" : "border-white/20 hover:scale-110"}
            `}
          >
            <div className="absolute inset-0 flex">
              <div
                style={{ background: t.colors[0] }}
                className="w-1/2 h-full"
              />
              <div
                style={{ background: t.colors[1] }}
                className="w-1/2 h-full"
              />
            </div>
          </div>

          {/* Dấu tích nhỏ nếu đang chọn */}
          {theme === t.id && (
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-(--primary) rounded-full border border-white shadow-sm flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default ThemeSelector;
