import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, FolderPlus } from "lucide-react";
import { BudgetOverview } from "../components/finance/BudgetOverview";
import { CategoryCards } from "../components/finance/CategoryCards";
import { ShoppingList } from "../components/finance/ShoppingList";
import { AddItemModal } from "../components/finance/AddItemModal";
import { AddCategoryModal } from "../components/finance/AddCategoryModal";
import { AddPhaseModal } from "../components/finance/AddPhaseModal";
import { TimelinePhasesSection } from "../components/finance/TimelinePhasesSection";
import { DEFAULT_CATEGORIES, COLOR_CONFIG } from "../constants/finance";
import financeApi from "../services/financeApi";
import apiClient from "../services/apiClient";
import type {
  ShoppingItem,
  Budget,
  CategorySummary,
  CustomCategory,
} from "../types/shopping.types";
import type { TimelinePhase } from "../types/timeline.types";

interface PageHeaderProps {
  onAddItem: () => void;
  onAddCategory: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  onAddItem,
  onAddCategory,
}) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 mt-8">
    <div>
      <p className="text-sm font-medium text-primary mb-1 tracking-wide uppercase">
        Budget Planner
      </p>
      <h1 className="text-4xl font-serif text-foreground mb-1">
        Shopping Manager
      </h1>
      <p className="text-muted-foreground text-sm">
        Theo dõi chi tiêu và quản lý ngân sách mua sắm Tết
      </p>
    </div>
    <div className="mt-4 md:mt-0 flex items-center gap-2">
      <button
        onClick={onAddCategory}
        className="inline-flex items-center gap-2 px-4 py-2.5 border border-border text-foreground rounded-xl hover:bg-muted transition-colors font-medium text-sm"
      >
        <FolderPlus className="w-4 h-4" />
        Add category
      </button>
      <button
        onClick={onAddItem}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium text-sm shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Add item
      </button>
    </div>
  </div>
);

export default function FinanceDashboard() {
  const queryClient = useQueryClient();

  // State
  const [tetConfigId, setTetConfigId] = useState<string | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [budget, setBudget] = useState<Budget>({ total: 0, used: 0 });
  const [categories, setCategories] =
    useState<CustomCategory[]>(DEFAULT_CATEGORIES);
  const [phases, setPhases] = useState<TimelinePhase[]>([]);
  const [defaultPhaseId, setDefaultPhaseId] = useState<string | null>(null);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddPhaseModalOpen, setIsAddPhaseModalOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<TimelinePhase | null>(null);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch tet config (cached)
  const { data: tetConfig, isLoading } = useQuery({
    queryKey: ["tetConfig"],
    queryFn: async () => {
      const configs = await apiClient.tetConfigs.getMyConfigs();
      if (configs && configs.length > 0) {
        return configs[0];
      }
      return await apiClient.tetConfigs.create({
        year: 2025,
        name: `Tết 2025`,
        total_budget: 5000000,
      });
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch data when tetConfig is available
  useEffect(() => {
    if (!tetConfig?.id) return;

    const fetchData = async () => {
      try {
        setError(null);
        const configId = tetConfig.id;
        setTetConfigId(configId);

        // Fetch data with fallbacks
        let budgetData = { total: 5000000, used: 0 };
        let itemsData: ShoppingItem[] = [];
        let categoriesData: any[] = [];
        let phasesData: TimelinePhase[] = [];

        try {
          budgetData = await financeApi.getBudget(configId);
        } catch (err) {
          console.warn("Failed to fetch budget:", err);
        }

        try {
          itemsData = await financeApi.getItems(configId);
        } catch (err) {
          console.warn("Failed to fetch items:", err);
        }

        try {
          categoriesData = await financeApi.getCategories(configId);
        } catch (err) {
          console.warn("Failed to fetch categories:", err);
        }

        try {
          // Fetch timeline phases for this tet config
          phasesData = await apiClient.get<TimelinePhase[]>(
            `/timeline-phases/tet-config/${configId}`,
          );

          setPhases(phasesData || []);
          if (phasesData && phasesData.length > 0) {
            setDefaultPhaseId(phasesData[0].id);
          }
        } catch (err: any) {
          console.warn("Failed to fetch timeline phases:", err);
          setPhases([]);
        }

        setBudget({ total: budgetData.total, used: budgetData.used });
        setItems(itemsData);

        // Map backend categories to frontend format
        const backendCategories: CustomCategory[] = categoriesData.map(
          (cat) => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon || "Package",
            color: cat.color || "planner-blue",
            isDefault: cat.is_system || false, // Use is_system from backend
          }),
        );

        // Use ONLY backend categories (including system categories from backend)
        setCategories(backendCategories);
      } catch (err) {
        console.error("Failed to fetch finance data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      }
    };

    fetchData();
  }, [tetConfig]);

  // Computed values
  const purchasedCount = useMemo(
    () => items.filter((i) => i.status === "purchased").length,
    [items],
  );

  const categorySummaries = useMemo<CategorySummary[]>(() => {
    return categories.map((category) => {
      const categoryItems = items.filter(
        (item) => item.category === category.name,
      );
      const total = categoryItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const config =
        COLOR_CONFIG[category.color] || COLOR_CONFIG["planner-green"];
      return {
        category: category.name,
        total,
        itemCount: categoryItems.length,
        icon: category.icon,
        color: config.tokenColor,
        bgColor: config.tokenBg,
      };
    });
  }, [items, categories]);

  // Handlers
  const handleAddCategory = async (
    newCategory: Omit<CustomCategory, "id" | "isDefault">,
  ) => {
    if (!tetConfigId) return;

    try {
      // Call API to create category
      const created = await financeApi.addCategory(tetConfigId, {
        name: newCategory.name,
        icon: newCategory.icon,
        color: newCategory.color,
        allocated: 0, // Default allocated budget
      });

      // Add to local state
      setCategories((prev) => [...prev, created]);
    } catch (error) {
      console.error("Failed to add category:", error);
      alert("Failed to add category. Please try again.");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await financeApi.deleteCategory(categoryId);
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Failed to delete category. Please try again.");
    }
  };

  const handleAddItem = async (newItem: Omit<ShoppingItem, "id">) => {
    if (!tetConfigId) return;

    const phaseId = newItem.timelinePhaseId || defaultPhaseId;
    if (!phaseId) {
      alert("Please create a timeline phase first!");
      return;
    }

    try {
      let mappedItem = { ...newItem };

      // Map default category to backend UUID
      if (newItem.category && !newItem.category.includes("-")) {
        const defaultCat = DEFAULT_CATEGORIES.find(
          (c) => c.id === newItem.category,
        );
        if (defaultCat) {
          const backendCat = categories.find(
            (c) =>
              c.name.toLowerCase() === defaultCat.name.toLowerCase() &&
              !c.isDefault,
          );
          if (backendCat) {
            mappedItem.category = backendCat.id;
          } else {
            const created = await financeApi.addCategory(tetConfigId, {
              name: defaultCat.name,
              icon: defaultCat.icon,
              color: defaultCat.color,
              allocated: 0,
            });
            mappedItem.category = created.id;
          }
        }
      }

      const created = await financeApi.addItem(
        tetConfigId,
        mappedItem,
        phaseId,
      );
      setItems((prev) => [...prev, created]);

      const budgetData = await financeApi.getBudget(tetConfigId);
      setBudget({ total: budgetData.total, used: budgetData.used });

      setIsAddItemModalOpen(false);
    } catch (err: any) {
      console.error("Failed to add item:", err);
      alert(
        `Failed to add item: ${err.response?.data?.message || err.message}`,
      );
    }
  };

  const handleEditItem = async (updatedItem: Omit<ShoppingItem, "id">) => {
    if (!tetConfigId || !editingItem) return;

    try {
      await financeApi.updateItem(
        editingItem.id,
        updatedItem,
        tetConfigId,
        updatedItem.timelinePhaseId,
      );

      // Refetch all data to update UI
      const [budgetData, itemsData] = await Promise.all([
        financeApi.getBudget(tetConfigId),
        financeApi.getItems(tetConfigId),
      ]);

      setBudget({ total: budgetData.total, used: budgetData.used });
      setItems(itemsData);

      setEditingItem(null);
    } catch (err: any) {
      console.error("Failed to update item:", err);
      alert(
        `Failed to update item: ${err.response?.data?.message || err.message}`,
      );
    }
  };

  const handleToggleStatus = async (itemId: string, currentStatus: string) => {
    if (!tetConfigId) return;

    try {
      const newPurchased = currentStatus !== "purchased";
      const currentItem = items.find((item) => item.id === itemId);
      if (!currentItem) {
        console.error("Item not found:", itemId);
        return;
      }



      const result = await financeApi.toggleItemStatus(
        itemId,
        newPurchased,
        tetConfigId,
        currentItem,
      );

      console.log("Toggle result:", result);
      console.log("Toggle result item ID:", result.item.id);
      console.log("Original item ID:", itemId);
      console.log("IDs match:", result.item.id === itemId);

      setItems((prev) => {
        const updated = prev.map((item) => {
          if (item.id === itemId) {
            console.log("Updating item:", item.id, "→", result.item);
            return result.item;
          }
          return item;
        });
        console.log("Updated items:", updated);
        return updated;
      });
      setBudget({ total: result.budget.total, used: result.budget.used });

      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["tetConfig"] });
    } catch (err: any) {
      console.error("Failed to toggle item status:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to update item. Please try again.";
      alert(errorMessage);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!tetConfigId) return;
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      await financeApi.deleteItem(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));

      const budgetData = await financeApi.getBudget(tetConfigId);
      setBudget({ total: budgetData.total, used: budgetData.used });

      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["tetConfig"] });
    } catch (err) {
      console.error("Failed to delete item:", err);
      alert("Failed to delete item. Please try again.");
    }
  };

  // Timeline Phase Handlers
  const handleAddPhase = async (
    phaseData: Omit<TimelinePhase, "id" | "tet_config_id">,
  ) => {
    if (!tetConfigId) return;

    try {
      const newPhase = await apiClient.post("/timeline-phases", {
        ...phaseData,
        tet_config_id: tetConfigId,
      });

      setPhases((prev) => [...prev, newPhase]);

      if (phases.length === 0) {
        setDefaultPhaseId(newPhase.id);
      }

      setIsAddPhaseModalOpen(false);
    } catch (err: any) {
      console.error("Failed to create phase:", err);
      alert(
        `Failed to create phase: ${err.response?.data?.message || err.message}`,
      );
    }
  };

  const handleUpdatePhase = async (
    phaseData: Omit<TimelinePhase, "id" | "tet_config_id">,
  ) => {
    if (!editingPhase) return;

    try {
      const updatedPhase = await apiClient.patch(
        `/timeline-phases/${editingPhase.id}`,
        phaseData,
      );

      setPhases((prev) =>
        prev.map((p) => (p.id === editingPhase.id ? updatedPhase : p)),
      );

      setIsAddPhaseModalOpen(false);
      setEditingPhase(null);
    } catch (err: any) {
      console.error("Failed to update phase:", err);
      alert(
        `Failed to update phase: ${err.response?.data?.message || err.message}`,
      );
    }
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (!confirm("Are you sure you want to delete this timeline phase?"))
      return;

    try {
      await apiClient.delete(`/timeline-phases/${phaseId}`);

      setPhases((prev) => prev.filter((p) => p.id !== phaseId));

      if (defaultPhaseId === phaseId && phases.length > 1) {
        const remainingPhases = phases.filter((p) => p.id !== phaseId);
        setDefaultPhaseId(remainingPhases[0]?.id || null);
      }
    } catch (err: any) {
      console.error("Failed to delete phase:", err);
      alert(
        `Failed to delete phase: ${err.response?.data?.message || err.message}`,
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-center justify-between">
            <p className="text-destructive text-sm font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-destructive hover:underline text-sm font-medium"
            >
              Retry
            </button>
          </div>
        )}

        <PageHeader
          onAddItem={() => setIsAddItemModalOpen(true)}
          onAddCategory={() => setIsAddCategoryModalOpen(true)}
        />
        <BudgetOverview
          budget={budget}
          itemCount={items.length}
          purchasedCount={purchasedCount}
        />

        <TimelinePhasesSection
          phases={phases}
          onAddPhase={() => setIsAddPhaseModalOpen(true)}
          onEditPhase={(phase) => {
            setEditingPhase(phase);
            setIsAddPhaseModalOpen(true);
          }}
          onDeletePhase={handleDeletePhase}
        />

        <CategoryCards
          categorySummaries={categorySummaries}
          categories={categories}
          onDeleteCategory={handleDeleteCategory}
        />

        <ShoppingList
          items={items}
          categories={categories}
          onAddItem={() => setIsAddItemModalOpen(true)}
          onEditItem={(item) => setEditingItem(item)}
          onToggleStatus={handleToggleStatus}
          onDeleteItem={handleDeleteItem}
        />
      </main>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onAdd={handleAddItem}
        categories={categories}
        phases={phases}
        defaultPhaseId={defaultPhaseId}
      />

      {/* Edit Item Modal */}
      {editingItem && (
        <AddItemModal
          key={editingItem.id}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onAdd={handleEditItem}
          categories={categories}
          phases={phases}
          defaultPhaseId={defaultPhaseId}
          initialData={editingItem}
        />
      )}

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onAdd={handleAddCategory}
      />

      <AddPhaseModal
        isOpen={isAddPhaseModalOpen}
        onClose={() => {
          setIsAddPhaseModalOpen(false);
          setEditingPhase(null);
        }}
        onSave={editingPhase ? handleUpdatePhase : handleAddPhase}
        editingPhase={editingPhase}
      />
    </div>
  );
}
