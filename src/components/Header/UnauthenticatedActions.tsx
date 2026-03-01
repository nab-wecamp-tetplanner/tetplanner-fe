import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { User, ChevronDown } from "lucide-react";

const UnauthenticatedActions: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  // Dùng ReturnType để không bị lỗi 'NodeJS namespace'
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShowDropdown(false), 300);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="p-2.5 bg-stone-100/50 hover:bg-stone-100 rounded-full text-stone-600 transition-all flex items-center gap-1.5 border border-transparent hover:border-stone-200">
        <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center">
          <User size={16} />
        </div>
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${showDropdown ? "rotate-180" : ""}`}
        />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-60 bg-white/95 backdrop-blur-xl border border-stone-100 rounded-[1.5rem] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-2 mb-4">
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">
              Guest Access
            </p>
            <p className="text-xs text-stone-500 font-medium mt-1">
              Sign in to sync your plans.
            </p>
          </div>

          <div className="space-y-2">
            <Link
              to="/login"
              className="block w-full py-2.5 bg-stone-900 text-white text-center text-xs font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all active:scale-95"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="block w-full py-2.5 bg-white text-stone-800 border border-stone-200 text-center text-xs font-black uppercase tracking-widest rounded-xl hover:bg-stone-50 transition-all active:scale-95"
            >
              Create Account
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-stone-50 text-center">
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">
              New to Tết Planner?{" "}
              <Link to="/register" className="text-(--primary) hover:underline">
                Join now
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnauthenticatedActions;
