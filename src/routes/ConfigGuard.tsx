import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAppStore } from "../stores/useAppStore";
import ConfigSelector from "../components/ConfigSelector/ConfigSelector";
import { Loader2 } from "lucide-react";
import apiClient from "../services/apiClient";
import type { TetConfig } from "../types/tetConfig.types";
const ConfigGuard = () => {
  const { configId, clearConfig } = useAppStore();
  const [configs, setConfigs] = useState<TetConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConfigs = async () => {
      setIsLoading(true);
      try {
        // Luôn fetch data mới từ Server khi component này mount
        const response = await apiClient.tetConfigs.getMyConfigs();
        setConfigs(response);

        // Logic kiểm tra: Nếu configId cũ trong store không còn tồn tại trong list mới fetch
        if (configId) {
          const exists = response.some((c: any) => c.id === configId);
          if (!exists) {
            clearConfig(); // Xóa sạch configId sai lệch của account cũ
          }
        }
      } catch (error) {
        console.error("Failed to fetch configs:", error);
        clearConfig();
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfigs();
  }, [clearConfig]); // Chỉ chạy 1 lần khi Guard mount sau khi Login

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // Nếu đã chọn config và config đó vẫn hợp lệ trong danh sách mới fetch
  const isValid = configs.some((c) => c.id === configId);

  if (configId && isValid) {
    return <Outlet />;
  }

  // Nếu chưa chọn hoặc account mới chưa có config hợp lệ -> Hiện màn hình chọn
  return <ConfigSelector configs={configs} isLoading={isLoading} />;
};

export default ConfigGuard;