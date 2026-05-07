import React, { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";
import { Lock } from "lucide-react";

interface ReAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  title?: string;
  description?: string;
}

export function ReAuthModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Authentication Required",
  description = "Please confirm your password to perform this sensitive action."
}: ReAuthModalProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await onConfirm(password);
      setPassword("");
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center text-center space-y-2 mb-4">
          <div className="p-3 bg-sky-50 rounded-full">
            <Lock className="h-6 w-6 text-sky-600" />
          </div>
          <p className="text-sm text-slate-500">
            {description}
          </p>
        </div>

        <Input
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error || undefined}
          autoFocus
          required
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Confirm Action
          </Button>
        </div>
      </form>
    </Modal>
  );
}
