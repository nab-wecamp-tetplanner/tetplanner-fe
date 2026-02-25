import React from "react";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const DeleteConfirmationModal: React.FC<
  DeleteConfirmationModalProps
> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl max-w-[380px] w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 text-center">
          {/* Warning Icon */}
          <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mx-auto mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2 className="font-serif text-2xl text-foreground mb-2">{title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex gap-3 p-8 pt-0">
          <button
            onClick={onClose}
            className="flex-1 py-4 border border-border text-foreground rounded-2xl hover:bg-muted transition-all font-bold text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-4 bg-destructive text-destructive-foreground rounded-2xl hover:opacity-90 transition-all font-bold text-sm shadow-lg shadow-destructive/20"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
