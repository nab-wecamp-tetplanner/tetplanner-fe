import apiClient from "./apiClient";

// Phải có từ khóa export ở đây
export interface TransactionResponse {
  id: string;
  amount: number;
  type: "income" | "expense";
  note: string;
  transaction_date: string;
  tet_config_id: string;
  category_id?: string;
  category?: {
    id: string;
    name: string;
    icon: string;
  };
}

export const transactionApi = {
  // Lấy danh sách giao dịch dựa trên tet_config_id
  getAll: (tetConfigId: string) => {
    return apiClient.get<TransactionResponse[]>(
      `/budget-transactions?tet_config_id=${tetConfigId}`,
    );
  },

  // Tạo giao dịch thủ công
  create: (data: {
    amount: number;
    type: "income" | "expense";
    note: string;
    transaction_date: string;
    tet_config_id: string;
    category_id?: string;
  }) => {
    return apiClient.post<TransactionResponse>("/budget-transactions", data);
  },

  // Cập nhật giao dịch theo ID

  update: (
    id: string,
    data: {
      note?: string;
      amount?: number;
      category_id?: string;
      transaction_date?: string;
    },
  ) => {
    return apiClient.patch<TransactionResponse>(
      `/budget-transactions/${id}`,
      data,
    );
  },
  delete: (id: string) => {
    return apiClient.delete(`/budget-transactions/${id}`);
  },
};
