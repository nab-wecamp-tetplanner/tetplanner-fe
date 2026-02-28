import { CheckSquare, ShoppingCart, DollarSign } from "lucide-react";
import StatsCard from "../Dashboard/StatsCard";

export const TaskQuickStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 md:mb-0 w-full h-fit">
      <StatsCard
        title="Task"
        value={40}
        subtitle={`40% completed`}
        icon={<CheckSquare className="w-5 h-5" />}
        color="#5051f9"
      />
      <StatsCard
        title="Shopping"
        value={45}
        subtitle={`5 completed`}
        icon={<ShoppingCart className="w-5 h-5" />}
        color="#1ea7ff"
      />
      <StatsCard
        title="Budget"
        value={60}
        subtitle={`70/100₫`}
        icon={<DollarSign className="w-5 h-5" />}
        color="#ff614c"
      />
    </div>
  );
};
