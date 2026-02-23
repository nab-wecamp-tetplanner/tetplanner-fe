import { createContext, useContext, useState, type ReactNode } from 'react';

interface LoadingContextType {
  showLoading: () => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ 
      showLoading: () => setIsLoading(true), 
      hideLoading: () => setIsLoading(false) 
    }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-[#5B63D3] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[#5B63D3] font-medium animate-pulse">Loading data...</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) throw new Error('useLoading must be used within LoadingProvider');
  return context;
};