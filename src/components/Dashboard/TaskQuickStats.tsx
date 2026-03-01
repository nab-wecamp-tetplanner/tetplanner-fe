import { CheckSquare, ShoppingCart, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import StatsCard from "../Dashboard/StatsCard";
import apiClient from "../../services/apiClient";
import { useAppStore } from "../../stores/useAppStore";
import type { TodoItem } from "../../types/todo.types";

interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
}

interface ShoppingStats {
  totalItems: number;
  completedItems: number;
}

interface BudgetStats {
  total: number;
  used: number;
  percentageUsed: number;
}

export const TaskQuickStats = () => {
  const configId = useAppStore((state) => state.configId);
  const [taskStats, setTaskStats] = useState<TaskStats>({
    totalTasks: 0,
    completedTasks: 0,
    completionPercentage: 0,
  });
  const [shoppingStats, setShoppingStats] = useState<ShoppingStats>({
    totalItems: 0,
    completedItems: 0,
  });
  const [budgetStats, setBudgetStats] = useState<BudgetStats>({
    total: 0,
    used: 0,
    percentageUsed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!configId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch todo items (both tasks and shopping items)
        const todoResponse: TodoItem[] = await apiClient.get(
          `/todo-items?tet_config_id=${configId}`,
        );
        const todoItems = Array.isArray(todoResponse) ? todoResponse : [];

        // Separate tasks and shopping items
        const tasks = todoItems.filter((item: TodoItem) => !item.is_shopping);
        const shoppingItems = todoItems.filter(
          (item: TodoItem) => item.is_shopping,
        );

        // Calculate task stats
        const completedTasks = tasks.filter(
          (task: TodoItem) => task.status === "completed",
        ).length;
        const totalTasks = tasks.length;
        const taskCompletionPercentage =
          totalTasks === 0
            ? 0
            : Math.round((completedTasks / totalTasks) * 100);

        setTaskStats({
          totalTasks,
          completedTasks,
          completionPercentage: taskCompletionPercentage,
        });

        // Calculate shopping stats
        const completedShoppingItems = shoppingItems.filter(
          (item: TodoItem) => item.purchased || item.status === "completed",
        ).length;
        const totalShoppingItems = shoppingItems.length;

        setShoppingStats({
          totalItems: totalShoppingItems,
          completedItems: completedShoppingItems,
        });

        // Fetch budget summary
        const budgetResponse =
          await apiClient.tetConfigs.getBudgetSummary(configId);

        setBudgetStats({
          total: budgetResponse.total_budget || 0,
          used: budgetResponse.used_budget || 0,
          percentageUsed: budgetResponse.percentage_used || 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [configId]);

  const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat("vn-VI").format(Math.floor(value));
    return formatted;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full h-fit">
        <StatsCard
          title="Task"
          value={0}
          subtitle={`Loading...`}
          icon={<CheckSquare size={16} />}
          color="#5051f9"
        />
        <StatsCard
          title="Shopping"
          value={0}
          subtitle={`Loading...`}
          icon={<ShoppingCart size={16} />}
          color="#1ea7ff"
        />
        <StatsCard
          title="Budget"
          value={0}
          subtitle={`Loading...`}
          icon={<DollarSign size={16} />}
          color="#ff614c"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full h-fit">
      <StatsCard
        title="Task"
        value={taskStats.completionPercentage}
        subtitle={`${taskStats.completedTasks}/${taskStats.totalTasks} completed`}
        icon={<CheckSquare size={16} />}
        color="#5051f9"
      />
      <StatsCard
        title="Shopping"
        value={
          shoppingStats.totalItems === 0
            ? 0
            : Math.round(
                (shoppingStats.completedItems / shoppingStats.totalItems) * 100,
              )
        }
        subtitle={`${shoppingStats.completedItems} completed`}
        icon={<ShoppingCart size={16} />}
        color="#1ea7ff"
      />
      <StatsCard
        title="Budget"
        value={budgetStats.percentageUsed}
        subtitle={`${formatCurrency(budgetStats.used)}/${formatCurrency(budgetStats.total)}VND`}
        icon={<DollarSign size={16} />}
        color="#ff614c"
      />
    </div>
  );
};
