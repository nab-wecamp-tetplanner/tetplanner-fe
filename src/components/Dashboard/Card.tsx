import React from "react";

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div
    className={`bg-(--bg-card) rounded-2xl shadow-sm border border-(--border) p-6 backdrop-blur-sm transition-colors duration-500 ${className}`}
  >
    {children}
  </div>
);

export default Card;
