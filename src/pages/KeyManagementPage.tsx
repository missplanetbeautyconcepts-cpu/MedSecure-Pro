import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Key, ShieldCheck, RefreshCw, AlertTriangle, Lock, Clock, History } from "lucide-react";
import { apiService } from "../services/api";
import { useUIStore } from "../store/uiStore";
import { Button } from "../components/ui/Button";
import { ReAuthModal } from "../components/ui/ReAuthModal";
import { formatDate } from "../lib/utils";

export default function KeyManagementPage() {
  const [isReAuthOpen, setIsReAuthOpen] = useState(false);
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  const { data: pubKeyData, isLoading: isLoadingKey } = useQuery({
    queryKey: ["server_pub_key"],
    queryFn: () => apiService.getServerPubKey().then(res => res.data),
  });

  const onConfirmRotation = async (password: string) => {
    await apiService.rotateKeys({ password });
    addToast("Cryptographic keys rotated successfully", "success");
    queryClient.invalidateQueries({ queryKey: ["server_pub_key"] });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cryptographic Key Management</h1>
        <p className="text-slate-500 text-sm">Manage the hybrid ECC-AES infrastructure keys used for record encryption.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Key Status */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-sky-50 rounded-xl">
                <Lock className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Active Server Public Key</h3>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">ECC Secp256k1</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 flex items-center gap-2">
              <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full status-pulse" />
              <span className="text-[10px] font-bold uppercase">Healthy</span>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Public Key Fingerprint (Primary)</p>
            <code className="block text-sm font-mono text-slate-600 break-all leading-relaxed bg-white p-4 rounded-lg border border-slate-100">
              {pubKeyData?.public_key || "Retrieving cryptographic identity..."}
            </code>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Clock className="h-3 w-3" />
                <span className="text-[10px] font-bold uppercase">Age</span>
              </div>
              <p className="font-bold text-slate-900">14 Days</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <History className="h-3 w-3" />
                <span className="text-[10px] font-bold uppercase">Version</span>
              </div>
              <p className="font-bold text-slate-900">v1.2.4</p>
            </div>
          </div>
        </div>

        {/* Rotation Controls */}
        <div className="bg-slate-900 p-8 rounded-2xl shadow-xl text-white space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-xl">
              <RefreshCw className="h-6 w-6 text-sky-400" />
            </div>
            <div>
              <h3 className="font-bold">Infrastructure Rotation</h3>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">KMS Operation</p>
            </div>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed">
            Key rotation will generate a new secure context for all future medical record encryptions. 
            The existing keys will be archived in the Hardware Security Module (HSM) to ensure legacy records remain accessible to authorized personnel.
          </p>

          <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 flex gap-4">
            <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-500 uppercase">Warning</p>
              <p className="text-xs text-amber-200/80 leading-tight">
                This action is irreversible and will be logged in the permanent audit database. 
                System load may briefly increase during regeneration.
              </p>
            </div>
          </div>

          <Button 
            variant="primary" 
            className="w-full h-14 text-white gap-3 shadow-sky-500/20"
            onClick={() => setIsReAuthOpen(true)}
          >
            <RefreshCw className="h-5 w-5" />
            Initiate Full Key Rotation
          </Button>

          <p className="text-center text-[10px] text-slate-500 uppercase tracking-[0.2em]">
            Protected by Argon2id & ECC Authorization
          </p>
        </div>
      </div>

      <ReAuthModal 
        isOpen={isReAuthOpen}
        onClose={() => setIsReAuthOpen(false)}
        onConfirm={onConfirmRotation}
        title="Infrastructure Authorization"
        description="Rotating the master encryption keys is a critical system operation."
      />
    </div>
  );
}
