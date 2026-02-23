import { Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "../stores/useAppStore";
import ConfigSelector from "../components/ConfigSelector/ConfigSelector";
import { Loader2 } from "lucide-react";
import apiClient from "../services/apiClient";

const ConfigGuard = () => {
  const configId = useAppStore((state) => state.configId);

  // Fetch configs using TanStack Query and your apiClient
  const { data: configs, isLoading } = useQuery({
    queryKey: ["userConfigs"],
    queryFn: () => apiClient.tetConfigs.getMyConfigs(),
    enabled: !configId, // Only fetch if configId is not yet set in Zustand
  });

  // If configId exists in Zustand -> User has selected a workspace -> Render the protected pages
  if (configId) {
    return <Outlet />;
  }

  // Show a loader while fetching the API for the first time
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // If no configId is selected, force the user to select or create one.
  return <ConfigSelector configs={configs || []} isLoading={isLoading} />;
};

export default ConfigGuard;