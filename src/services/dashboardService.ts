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
        planned: number;
        used: number;
      }>;
    }>(`/dashboard/trend?tet_config_id=${tetConfigId}&group_by=${groupBy}`);

    console.log("dashboardApi.getSpendingTrend - raw response:", response);

    // Check if response.data exists and is an array
    const dataArray = response.data || response.data || [];
    console.log("dashboardApi.getSpendingTrend - dataArray:", dataArray);

    if (!Array.isArray(dataArray)) {
      console.error("Expected array but got:", typeof dataArray, dataArray);
      return [];
    }

    // Transform backend response to match WeeklyFinanceData format
    return dataArray.map((item) => {
      console.log("Processing item:", item);

      // Format the date to show just the week or day name
      let weekLabel = item.period;
      try {
        const date = new Date(item.period);
        weekLabel = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      } catch (e) {
        console.error("Error parsing date:", e);
      }

      return {
        week: weekLabel,
        // Map API fields: planned -> income, used -> expense
        income: item.planned ?? 0,
        expense: item.used ?? 0,
      };
    });
  },
};

export default dashboardApi;
