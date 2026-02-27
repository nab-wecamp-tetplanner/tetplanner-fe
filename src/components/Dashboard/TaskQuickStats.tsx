import { CheckSquare, ShoppingCart, DollarSign } from "lucide-react";
import StatsCard from "../Dashboard/StatsCard";

export const TaskQuickStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 md:mb-0 w-full h-fit">
      <StatsCard
        title="Công việc"
        value={40}
        subtitle={`40% hoàn thành`}
        icon={<CheckSquare className="w-5 h-5" />}
        color="#5051f9"
      />
      <StatsCard
        title="Mua sắm"
        value={45}
        subtitle={`5 đã mua`}
        icon={<ShoppingCart className="w-5 h-5" />}
        color="#1ea7ff"
      />
      <StatsCard
        title="Ngân sách"
        value={60}
        subtitle={`70₫ / 100₫`}
        icon={<DollarSign className="w-5 h-5" />}
        color="#ff614c"
      />
    </div>
  );
};
