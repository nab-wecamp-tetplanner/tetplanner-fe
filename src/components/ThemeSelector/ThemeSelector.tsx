import { useState, useRef, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { Palette, Check } from "lucide-react";

const THEME_OPTIONS = [
  {
    id: "minimal",
    label: "Minimal",
    colors: ["bg-[#ffffff]", "bg-[#111111]", "bg-[#eeeeee]"],
  },
  {
    id: "bloom",
    label: "Bloom",
    colors: ["bg-[#fff0f5]", "bg-[#ff69b4]", "bg-[#ffb6c1]"],
  },
  {
    id: "mai",
    label: "Hoa Mai",
    colors: ["bg-[#fffdf5]", "bg-[#d0021b]", "bg-[#f5a623]"],
  },
];

const ThemeSelector = () => {
  const { theme, changeTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleThemeChange = (themeId: string) => {
    changeTheme(THEME_OPTIONS.find((option) => option.id === themeId)?.id as any);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-md transition-all duration-200 text-text-main hover:text-primary hover:bg-accent/50 ${isOpen ? "bg-accent/50 text-primary" : ""}`}
        aria-label="Change theme"
        title="Change theme"
      >
        <Palette className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 p-2 bg-card rounded-xl border border-border shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Select Appearance
          </div>
          <div className="mt-1 space-y-1">
            {THEME_OPTIONS.map((option) => {
              const isActive = theme === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleThemeChange(option.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-text-main hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1.5">
                      {option.colors.map((colorClass, index) => (
                        <div
                          key={index}
                          className={`w-4 h-4 rounded-full border border-border ${colorClass} ring-1 ring-background`}
                        ></div>
                      ))}
                    </div>
                    <span>{option.label}</span>
                  </div>
                  {isActive && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;