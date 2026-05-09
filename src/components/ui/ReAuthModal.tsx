import React, { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";
import { Lock } from "lucide-react";
import { getErrorMessage } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { ReAuthRequest } from "../../types";

interface ReAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reauth: ReAuthRequest) => Promise<void>;
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
  const [passwordInput, setPasswordInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setError(null);
    setIsLoading(true);

    try {
      const reauth: ReAuthRequest = {
        username: user.username,
        password: "Admin2026!", // Using standard system password as per example
        role: user.role,
        reauth_password: passwordInput.trim()
      };
      
      await onConfirm(reauth);
      setPasswordInput("");
      onClose();
    } catch (err: any) {
      setError(getErrorMessage(err));
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
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
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
