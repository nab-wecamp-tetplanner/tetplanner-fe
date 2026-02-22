import React, { useState, useEffect, useMemo } from "react";
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

export default function FinanceDashboard() {
  // State
  const [tetConfigId, setTetConfigId] = useState<string | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [budget, setBudget] = useState<Budget>({ total: 0, used: 0 });
  const [categories, setCategories] = useState<CustomCategory[]>(DEFAULT_CATEGORIES);
  const [phases, setPhases] = useState<TimelinePhase[]>([]);
  const [defaultPhaseId, setDefaultPhaseId] = useState<string | null>(null);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddPhaseModalOpen, setIsAddPhaseModalOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<TimelinePhase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const configs = await apiClient.tetConfigs.getMyConfigs();
        console.log("Existing configs:", configs);

        // TEMPORARY: Always create new config for testing
        const newConfig = await apiClient.tetConfigs.create({
          year: 2025,
          name: `Tết ${new Date().getTime()}`,
          total_budget: 5000000,
        });
        
        const configId = newConfig.id;
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
          phasesData = await apiClient.get(`/timeline-phases?tet_config_id=${configId}`);
          setPhases(phasesData);
          if (phasesData.length > 0) {
            setDefaultPhaseId(phasesData[0].id);
          }
        } catch (err) {
          console.warn("Failed to fetch timeline phases:", err);
        }

        setBudget({ total: budgetData.total, used: budgetData.used });
        setItems(itemsData);

        const backendCategories: CustomCategory[] = categoriesData.map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon || "Package",
          color: cat.color || "planner-blue",
          isDefault: false,
        }));
        setCategories([...DEFAULT_CATEGORIES, ...backendCategories]);

      } catch (err) {
        console.error("Failed to fetch finance data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Computed values
  const purchasedCount = useMemo(
    () => items.filter((i) => i.status === "purchased").length,
    [items],
  );

  const categorySummaries = useMemo<CategorySummary[]>(() => {
    return categories.map((category) => {
      const categoryItems = items.filter((item) => item.category === category.name);
      const total = categoryItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const config = COLOR_CONFIG[category.color] || COLOR_CONFIG["planner-green"];
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
  const handleAddCategory = (newCategory: Omit<CustomCategory, "id" | "isDefault">) => {
    const category: CustomCategory = {
      ...newCategory,
      id: `custom-${Date.now()}`,
      isDefault: false,
    };
    setCategories((prev) => [...prev, category]);
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
      if (newItem.category && !newItem.category.includes('-')) {
        const defaultCat = DEFAULT_CATEGORIES.find(c => c.id === newItem.category);
        if (defaultCat) {
          const backendCat = categories.find(c =>
            c.name.toLowerCase() === defaultCat.name.toLowerCase() && !c.isDefault
          );
          if (backendCat) {
            mappedItem.category = backendCat.id;
          } else {
            const created = await financeApi.addCategory(tetConfigId, {
              name: defaultCat.name,
              icon: defaultCat.icon,
              color: defaultCat.color,
              allocated: 0
            });
            mappedItem.category = created.id;
          }
        }
      }

      const created = await financeApi.addItem(tetConfigId, mappedItem, phaseId);
      setItems((prev) => [...prev, created]);

      const budgetData = await financeApi.getBudget(tetConfigId);
      setBudget({ total: budgetData.total, used: budgetData.used });

      setIsAddItemModalOpen(false);
    } catch (err: any) {
      console.error("Failed to add item:", err);
      alert(`Failed to add item: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleToggleStatus = async (itemId: string, currentStatus: string) => {
    if (!tetConfigId) return;

    try {
      const newPurchased = currentStatus !== "purchased";
      const result = await financeApi.toggleItemStatus(itemId, newPurchased, tetConfigId);

      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? result.item : item))
      );
      setBudget({ total: result.budget.total, used: result.budget.used });
    } catch (err) {
      console.error("Failed to toggle item status:", err);
      alert("Failed to update item. Please try again.");
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
    } catch (err) {
      console.error("Failed to delete item:", err);
      alert("Failed to delete item. Please try again.");
    }
  };

  // Timeline Phase Handlers
  const handleAddPhase = async (phaseData: Omit<TimelinePhase, "id" | "tet_config_id">) => {
    if (!tetConfigId) return;

    try {
      const newPhase = await apiClient.post('/timeline-phases', {
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
      alert(`Failed to create phase: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleUpdatePhase = async (phaseData: Omit<TimelinePhase, "id" | "tet_config_id">) => {
    if (!editingPhase) return;

    try {
      const updatedPhase = await apiClient.patch(`/timeline-phases/${editingPhase.id}`, phaseData);

      setPhases((prev) =>
        prev.map((p) => (p.id === editingPhase.id ? updatedPhase : p))
      );

      setIsAddPhaseModalOpen(false);
      setEditingPhase(null);
    } catch (err: any) {
      console.error("Failed to update phase:", err);
      alert(`Failed to update phase: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (!confirm("Are you sure you want to delete this timeline phase?")) return;

    try {
      await apiClient.delete(`/timeline-phases/${phaseId}`);

      setPhases((prev) => prev.filter((p) => p.id !== phaseId));

      if (defaultPhaseId === phaseId && phases.length > 1) {
        const remainingPhases = phases.filter((p) => p.id !== phaseId);
        setDefaultPhaseId(remainingPhases[0]?.id || null);
      }
    } catch (err: any) {
      console.error("Failed to delete phase:", err);
      alert(`Failed to delete phase: ${err.response?.data?.message || err.message}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
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
        />

        <ShoppingList
          items={items}
          categories={categories}
          onAddItem={() => setIsAddItemModalOpen(true)}
          onToggleStatus={handleToggleStatus}
          onDeleteItem={handleDeleteItem}
        />
      </main>

      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onAdd={handleAddItem}
        categories={categories}
        phases={phases}
        defaultPhaseId={defaultPhaseId}
      />

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
