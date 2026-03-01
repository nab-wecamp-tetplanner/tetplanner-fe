import apiClient from "./apiClient";

export const dashboardApi = {
  // Dashboard
  getSpendingTrend: async (
    tetConfigId: string,
    groupBy: "week" | "month" = "week",
  ) => {
    const response = await apiClient.get<{
      data: Array<{
        period: string;
        income: number;
        expense: number;
      }>;
    }>(`/dashboard/trend?tet_config_id=${tetConfigId}&group_by=${groupBy}`);

    // Transform backend response to match WeeklyFinanceData format
    return response.data.map((item) => ({
      week: item.period, // Use 'week' as the key to match chart component
      income: item.income,
      expense: item.expense,
    }));
  },
};

export default dashboardApi;
