import BudgetCard from "../Overview/BudgetCard";

const BUDGET_CARDS = [
  {
    icon: "🎄",
    title: "Tết Budget",
    spent: 7000000,
    total: 10000000,
    progress: 70,
    color: "bg-red-500",
  },
  {
    icon: "🛍️",
    title: "Shopping",
    spent: 2500000,
    total: 5000000,
    progress: 50,
    color: "bg-blue-500",
  },
  {
    icon: "🎁",
    title: "Gifts",
    spent: 3200000,
    total: 4000000,
    progress: 80,
    color: "bg-purple-500",
  },
];

export const BudgetCardsSection = () => {
  return (
    <div className="flex flex-col gap-4 flex-1">
      {BUDGET_CARDS.map((budget) => (
        <BudgetCard key={budget.title} {...budget} />
      ))}
    </div>
  );
};
