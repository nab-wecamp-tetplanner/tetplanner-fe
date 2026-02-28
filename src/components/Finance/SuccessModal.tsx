import React from "react";
import { CheckCircle2, X } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl max-w-sm w-full p-8 text-center animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="h-20 w-20 rounded-[2rem] bg-planner-green-light flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-planner-green" />
        </div>

        <h3 className="text-2xl font-serif text-foreground mb-2">Success!</h3>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          {message}
        </p>

        <button
          onClick={onClose}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-lg hover:opacity-90 transition-all"
        >
          Excellent!
        </button>
      </div>
    </div>
  );
};
