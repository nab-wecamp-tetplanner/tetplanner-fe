import { useState, useEffect, useMemo } from "react";
// import { useQueryClient } from "@tanstack/react-query";
import { Plus, FolderPlus } from "lucide-react";

import { BudgetOverview } from "../components/Finance/BudgetOverview";
import { CategoryCards } from "../components/Finance/CategoryCards";
import { ShoppingList } from "../components/Finance/ShoppingList";
import { AddItemModal } from "../components/Finance/AddItemModal";
import { AddCategoryModal } from "../components/Finance/AddCategoryModal";
import { AddPhaseModal } from "../components/Finance/AddPhaseModal";
import { TimelinePhasesSection } from "../components/Finance/TimelinePhasesSection";
import { DEFAULT_CATEGORIES } from "../constants/finance";
import financeApi from "../services/financeApi";
import apiClient from "../services/apiClient";
import { SuccessModal } from "../components/Finance/SuccessModal";
import { DeleteConfirmationModal } from "../components/Finance/DeleteConfirmationModal";
import { useAppStore } from "../stores/useAppStore";

import type { ShoppingItem, Budget } from "../types/shopping.types";
import type { Timeline } from "../types/timeline.types";
import type { Category } from "../types/dashboard.types";
import type { CategoryResponse } from "../types/categories.type";
import type { CategoryCreateRequest } from "../types/categories.type";

interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  allocated: number;
}

// const PlanSelector = ({ configs, selectedId, onSelect }: any) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const selectedPlan = configs.find((c: any) => c.id === selectedId);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       )
//         setIsOpen(false);
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center gap-3 px-4 py-2 bg-card border border-border rounded-2xl shadow-sm hover:bg-muted/50 transition-all"
//       >
//         <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
//           <LayoutGrid className="w-4 h-4" />
//         </div>
//         <div className="text-left hidden sm:block">
//           <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground leading-none mb-1">
//             Kế hoạch
//           </p>
//           <p className="text-sm font-bold text-foreground leading-none">
//             {selectedPlan
//               ? `${selectedPlan.name} (${selectedPlan.year})`
//               : "Chọn kế hoạch"}
//           </p>
//         </div>
//         <ChevronDown
//           className={`w-4 h-4 text-muted-foreground ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
//         />
//       </button>

//       {isOpen && (
//         <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in duration-200">
//           {configs.map((config: any) => (
//             <button
//               key={config.id}
//               onClick={() => {
//                 onSelect(config.id);
//                 setIsOpen(false);
//               }}
//               className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors text-left"
//             >
//               <span
//                 className={`text-sm ${selectedId === config.id ? "font-bold text-primary" : "text-foreground"}`}
//               >
//                 {config.name} ({config.year})
//               </span>
//               {selectedId === config.id && (
//                 <Check className="w-4 h-4 text-primary" />
//               )}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

export default function FinanceDashboard() {
  // const queryClient = useQueryClient();

  // Get configId from Zustand store
  const tetConfigId = useAppStore((state) => state.configId);
  // const setConfigId = useAppStore((state) => state.setConfigId);

  // State
  // const [allConfigs, setAllConfigs] = useState<any[]>([]);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [budget, setBudget] = useState<Budget>({ total: 0, used: 0 });

  // Áp dụng chuẩn Category mới
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  const [phases, setPhases] = useState<Timeline[]>([]);
  const [defaultPhaseId, setDefaultPhaseId] = useState<string | null>(null);

  // Modals state
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddPhaseModalOpen, setIsAddPhaseModalOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<Timeline | null>(null);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);

  // Chỉnh sửa state editingCategory dùng chuẩn mới
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: "",
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // // 1. Lấy danh sách kế hoạch
  // useQuery({
  //   queryKey: ["allTetConfigs"],
  //   queryFn: async () => {
  //     const data = await financeApi.getTetConfigs();
  //     if (data && data.length > 0) {
  //       setAllConfigs(data);
  //       if (!tetConfigId) {
  //         const firstId = data[0].id;
  //         setConfigId(firstId);
  //       }
  //     }
  //     return data;
  //   },
  // });
  const transformToUICategory = (cat: CategoryResponse): Category => ({
    ...cat,
    allocated: cat.allocated_budget,
    isDefault: cat.is_system,
    percent: "0%",
    colorClass: `text-${cat.color || "planner-blue"}`,
    bgClass: `bg-${cat.color || "planner-blue"}/20`,
    transactions: [],
  });

  // 2. Tải dữ liệu chính
  useEffect(() => {
    if (!tetConfigId) return;

    const fetchData = async () => {
      try {
        const configId = tetConfigId;
        const [budgetData, itemsData, categoriesData, phasesData] =
          await Promise.all([
            financeApi.getBudget(configId),
            financeApi.getItems(configId),
            financeApi.getCategories(configId) as Promise<CategoryResponse[]>,
            apiClient.get<Timeline[]>(
              `/timeline-phases/tet-config/${configId}`,
            ),
          ]);

        setBudget({ total: budgetData.total, used: budgetData.used });
        setItems(itemsData);
        setPhases(phasesData || []);
        if (phasesData && phasesData.length > 0)
          setDefaultPhaseId(phasesData[0].id);

        // Map data từ API về chuẩn Category mới
        if (categoriesData && categoriesData.length > 0) {
          const mappedCategories: Category[] = categoriesData.map((cat) => ({
            ...cat, // Giữ lại toàn bộ trường từ API (bao gồm tet_config)
            color: cat.color || "#10b981",
            colorClass: `text-${cat.color || "planner-blue"}`,
            bgClass: `bg-${cat.color || "planner-blue"}/20`,
            percent: "0%",
            transactions: [],
            allocated: cat.allocated_budget, // Alias cho logic cũ
            isDefault: cat.is_system, // Alias cho logic cũ
          }));
          setCategories(mappedCategories);
        }
      } catch (err) {
        console.error("Failed to fetch finance data:", err);
      }
    };
    fetchData();
  }, [tetConfigId]);

  // --- HANDLERS (KHÔI PHỤC LẠI ĐẦY ĐỦ) ---

  // const handlePlanChange = (id: string) => {
  //   setConfigId(id);
  //   queryClient.invalidateQueries({ queryKey: ["allTetConfigs"] });
  // };

  const handleEditTotalBudget = async () => {
    if (!tetConfigId) return;
    const newBudgetStr = prompt(
      "Nhập ngân sách tổng mới (VND):",
      budget.total.toString(),
    );
    if (newBudgetStr && !isNaN(Number(newBudgetStr))) {
      try {
        await financeApi.updateBudget(tetConfigId, Number(newBudgetStr));
        setBudget((prev) => ({ ...prev, total: Number(newBudgetStr) }));
        setSuccessModal({
          isOpen: true,
          message: "Cập nhật ngân sách thành công!",
        });
      } catch {
        alert("Lỗi cập nhật ngân sách.");
      }
    }
  };

  const handleAddItem = async (newItem: Omit<ShoppingItem, "id">) => {
    if (!tetConfigId || !defaultPhaseId) return;
    try {
      const created = await financeApi.addItem(
        tetConfigId,
        newItem,
        newItem.timelinePhaseId || defaultPhaseId,
      );
      setItems((prev) => [...prev, created]);
      setSuccessModal({
        isOpen: true,
        message: "Đã thêm món đồ vào danh sách mua sắm!",
      });
      const budgetData = await financeApi.getBudget(tetConfigId);
      setBudget({ total: budgetData.total, used: budgetData.used });
      setIsAddItemModalOpen(false);
    } catch (err) {
      console.error(err);
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
      const [budgetData, itemsData] = await Promise.all([
        financeApi.getBudget(tetConfigId),
        financeApi.getItems(tetConfigId),
      ]);
      setBudget({ total: budgetData.total, used: budgetData.used });
      setItems(itemsData);
      setEditingItem(null);
      setSuccessModal({
        isOpen: true,
        message: "Cập nhật món đồ thành công!",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (itemId: string, currentStatus: string) => {
    if (!tetConfigId) return;
    try {
      const currentItem = items.find((i) => i.id === itemId);
      if (!currentItem) return;
      const res = await financeApi.toggleItemStatus(
        itemId,
        currentStatus !== "purchased",
        tetConfigId,
        currentItem,
      );
      setItems((prev) => prev.map((i) => (i.id === itemId ? res.item : i)));
      setBudget({ total: res.budget.total, used: res.budget.used });
      setSuccessModal({
        isOpen: true,
        message: "Đã cập nhật trạng thái món đồ!",
      });
    } catch (err) {
      console.error(err);
    }
  };

  // FinanceDashboard.tsx

  const handleAddCategory = async (data: CategoryFormData) => {
    // Thay 'any' bằng 'CategoryFormData'
    if (!tetConfigId) return;
    try {
      const requestData: Omit<CategoryCreateRequest, "tet_config_id"> = {
        name: data.name,
        icon: data.icon,
        color: data.color,
        allocated_budget: data.allocated || 0,
      };

      const created = await financeApi.addCategory(tetConfigId, requestData);
      const newCategory = transformToUICategory(created);

      setCategories((prev) => [...prev, newCategory]);
      setSuccessModal({
        isOpen: true,
        message: "Category added successfully!",
      });
      setIsAddCategoryModalOpen(false);
    } catch (err) {
      console.error("Failed to add category:", err);
    }
  };

  const handleEditCategory = async (
    category: Category,
    updates: CategoryFormData,
  ) => {
    // Thay 'any' bằng 'CategoryFormData'
    try {
      await financeApi.updateCategory(category.id, {
        name: updates.name,
        color: updates.color,
        allocated_budget: updates.allocated,
      });

      setCategories((prev) =>
        prev.map((c) =>
          c.id === category.id
            ? {
                ...c,
                name: updates.name,
                color: updates.color,
                allocated: updates.allocated, // Đồng bộ lại alias để giao diện không lỗi
                // Lưu ý: Nếu updates.color là mã Hex, dùng cấu trúc arbitrary của Tailwind
                colorClass: `text-[${updates.color}]`,
                bgClass: `bg-[${updates.color}]/20`,
              }
            : c,
        ),
      );

      setEditingCategory(null);
      setSuccessModal({
        isOpen: true,
        message: "Update categories successfully!",
      });
    } catch (err) {
      // Ép kiểu err để truy cập message nếu cần, hoặc giữ nguyên console.error
      console.error("Update error:", err);
    }
  };

  const handleAddPhase = async (data: Omit<Timeline, "id" | "tet_config">) => {
    if (!tetConfigId) return;
    try {
      // 1. Chỉ định Generic Type <Timeline> để 'res' có kiểu dữ liệu chuẩn
      const res = await apiClient.post<Timeline>("/timeline-phases", {
        ...data,
        tet_config_id: tetConfigId,
      });

      // 2. Bây giờ TypeScript đã biết 'res' là 'Timeline' nên sẽ không báo lỗi unknown[]
      setPhases((prev) => [...prev, res]);

      setSuccessModal({ isOpen: true, message: "Phase added successfully!" });
      setIsAddPhaseModalOpen(false);
    } catch (err) {
      console.error("Failed to add phase:", err);
    }
  };

  const handleUpdatePhase = async (
    data: Omit<Timeline, "id" | "tet_config">,
  ) => {
    if (!editingPhase) return;
    try {
      const res = await apiClient.patch<Timeline>(
        `/timeline-phases/${editingPhase.id}`,
        data,
      );
      setPhases((prev) =>
        prev.map((p) => (p.id === editingPhase.id ? res : p)),
      );
      setEditingPhase(null);
      setSuccessModal({ isOpen: true, message: "Phase updated successfully!" });
    } catch (err) {
      console.error("Update phase failed:", err);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setDeleteModal({
      isOpen: true,
      title: "Delete Item",
      message:
        "Are you sure you want to remove this item from your shopping list?",
      onConfirm: async () => {
        try {
          await financeApi.deleteItem(itemId);
          setItems((prev) => prev.filter((i) => i.id !== itemId));
          const budgetData = await financeApi.getBudget(tetConfigId!);
          setBudget({ total: budgetData.total, used: budgetData.used });
          setSuccessModal({
            isOpen: true,
            message: "Item deleted successfully!",
          });
        } catch (err) {
          console.error(err);
        }
      },
    });
  };

  // For Categories
  const handleDeleteCategory = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    setDeleteModal({
      isOpen: true,
      title: "Delete Category",
      message: `Are you sure you want to delete "${cat?.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await financeApi.deleteCategory(id);
          setCategories((prev) => prev.filter((c) => c.id !== id));
          setSuccessModal({
            isOpen: true,
            message: "Category deleted successfully!",
          });
        } catch (err) {
          console.error(err);
        }
      },
    });
  };

  // Add this new handler for Phases
  const handleDeletePhase = (id: string) => {
    const phase = phases.find((p) => p.id === id);
    setDeleteModal({
      isOpen: true,
      title: "Delete Phase",
      message: `Delete phase "${phase?.name}"? Items linked to this phase might lose their timing info.`,
      onConfirm: async () => {
        try {
          await apiClient.delete(`/timeline-phases/${id}`);
          setPhases((prev) => prev.filter((p) => p.id !== id));
          setSuccessModal({
            isOpen: true,
            message: "Phase deleted successfully!",
          });
        } catch (err) {
          console.error(err);
        }
      },
    });
  };

  const categorySummaries = useMemo(() => {
    return categories.map((cat) => {
      const catItems = items.filter((i) => i.category === cat.id);
      const purchasedTotal = catItems
        .filter((i) => i.status === "purchased")
        .reduce((s, i) => s + i.price * i.quantity, 0);

      const safeColor = cat.color || "#10b981"; // Đảm bảo luôn là string

      return {
        category: cat.name,
        total: purchasedTotal,
        itemCount: catItems.length,
        icon: cat.icon,
        color: safeColor, // Trả về string thay vì string | null
        bgColor: `${safeColor}20`,
      };
    });
  }, [items, categories]);

  const purchasedCount = items.filter((i) => i.status === "purchased").length;

  return (
    <div className="min-h-screen bg-transparent">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 mt-8 gap-4">
          <div>
            <p className="text-sm font-medium text-primary mb-1 uppercase">
              Budget Planner
            </p>
            <h1 className="text-4xl font-serif text-foreground mb-1">
              Shopping Manager
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage your shopping list, budget, and timeline all in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddCategoryModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-xl hover:bg-muted text-sm font-medium"
            >
              <FolderPlus className="w-4 h-4" /> Category
            </button>
            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 text-sm font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
        </div>

        <BudgetOverview
          budget={budget}
          itemCount={items.length}
          purchasedCount={purchasedCount}
          onEditBudget={handleEditTotalBudget}
        />

        <TimelinePhasesSection
          phases={phases}
          onAddPhase={() => setIsAddPhaseModalOpen(true)}
          onEditPhase={(p: Timeline) => {
            // Thay 'any' bằng 'Timeline'
            setEditingPhase(p);
            setIsAddPhaseModalOpen(true);
          }}
          onDeletePhase={handleDeletePhase}
        />

        <CategoryCards
          categorySummaries={categorySummaries}
          categories={categories}
          onDeleteCategory={handleDeleteCategory}
          onEditCategory={setEditingCategory}
        />

        <ShoppingList
          items={items}
          categories={categories}
          onAddItem={() => setIsAddItemModalOpen(true)}
          onEditItem={setEditingItem}
          onToggleStatus={handleToggleStatus}
          onDeleteItem={handleDeleteItem}
        />

        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          title={deleteModal.title}
          message={deleteModal.message}
          onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
          onConfirm={deleteModal.onConfirm}
        />
      </main>

      {/* MODALS */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        message={successModal.message}
      />

      <AddItemModal
        // Dùng editingItem mới đúng logic của món đồ mua sắm
        key={editingItem?.id || (isAddItemModalOpen ? "new" : "closed")}
        isOpen={isAddItemModalOpen || !!editingItem}
        onClose={() => {
          setIsAddItemModalOpen(false);
          setEditingItem(null);
        }}
        onAdd={editingItem ? handleEditItem : handleAddItem}
        categories={categories}
        phases={phases}
        defaultPhaseId={defaultPhaseId}
        initialData={editingItem || undefined}
      />

      <AddCategoryModal
        // PHẢI CÓ KEY NÀY: Nó dùng đúng biến editingCategory
        key={editingCategory?.id || (isAddCategoryModalOpen ? "new" : "closed")}
        isOpen={isAddCategoryModalOpen || !!editingCategory}
        onClose={() => {
          setIsAddCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onAdd={(data) =>
          editingCategory
            ? handleEditCategory(editingCategory, data)
            : handleAddCategory(data)
        }
        initialData={editingCategory || undefined}
      />

      <AddPhaseModal
        isOpen={isAddPhaseModalOpen || !!editingPhase}
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
