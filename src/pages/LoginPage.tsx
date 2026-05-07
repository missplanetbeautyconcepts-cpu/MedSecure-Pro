import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Stethoscope, Lock, User as UserIcon } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useUIStore } from "../store/uiStore";
import { apiService } from "../services/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { getErrorMessage } from "../services/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const addToast = useUIStore((state) => state.addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.login({ username, password });
      setToken(response.access_token);
      addToast("Successfully logged in", "success");
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError(getErrorMessage(err));
      addToast("Login failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-100 rounded-full blur-3xl opacity-20 -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-200 rounded-full blur-3xl opacity-20 -ml-24 -mb-24" />

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8 space-y-8">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 bg-sky-500 rounded-xl shadow-lg shadow-sky-200 flex items-center justify-center text-white font-bold text-xl">
                M
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-4">
                MedSafe <span className="text-sky-600">Core</span>
              </h1>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                Secure Enterprise Portal
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Username"
                placeholder="Hospital ID or Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="pl-10"
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="pl-10"
              />

              {error && (
                <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-center gap-3">
                  <div className="h-2 w-2 bg-red-500 rounded-full" />
                  <p className="text-xs font-medium text-red-700">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Authorize Access
              </Button>
            </form>

            <div className="pt-4 text-center">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
                Protected by ECC-AES Hybrid Encryption
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Unauthorized access to this system is strictly prohibited and subject to legal action under medical privacy regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
