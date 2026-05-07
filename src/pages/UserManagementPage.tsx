import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, UserPlus, Trash2, Shield, Mail, Key } from "lucide-react";
import { apiService } from "../services/api";
import { useUIStore } from "../store/uiStore";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { DataTable } from "../components/ui/DataTable";
import { Modal } from "../components/ui/Modal";
import { ReAuthModal } from "../components/ui/ReAuthModal";
import { User, UserRole } from "../types";

export default function UserManagementPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiService.getUsers().then(res => res.data),
  });

  const columns = [
    {
      header: "Username",
      accessor: (item: User) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-xs">
            {item.username[0].toUpperCase()}
          </div>
          <span className="font-bold text-slate-900 uppercase tracking-tight">{item.username}</span>
        </div>
      ),
    },
    {
      header: "Access Role",
      accessor: (item: User) => (
        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-widest border border-slate-200">
          {item.role}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: () => (
        <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase text-emerald-600 tracking-wider">
          <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full status-pulse" />
          Active
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: (item: User) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Manage Permissions">
            <Shield className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  const mappedUsers = users.map(u => ({ ...u, id: u.username }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Identity Management</h1>
          <p className="text-slate-500 text-sm">Manage core administrative and medical personnel access.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Provision New User
        </Button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <DataTable 
          data={mappedUsers} 
          columns={columns as any} 
          isLoading={isLoading} 
        />
      </div>

      <CreateUserModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}

function CreateUserModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("doctor");
  const [isReAuthOpen, setIsReAuthOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsReAuthOpen(true);
  };

  const onConfirmCreate = async (reauthPassword: string) => {
    setIsLoading(true);
    try {
      await apiService.createUser({
        username,
        password,
        role
      }, { password: reauthPassword });
      
      addToast(`User ${username} provisioned successfully`, "success");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
      // Reset
      setUsername("");
      setPassword("");
      setRole("doctor");
    } catch (err) {
      addToast("Failed to create user. Verify admin credentials.", "error");
      throw err; // To show error in ReAuthModal
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Provision New Personnel">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Username / System ID" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            placeholder="e.g. dr.smit_77"
          />
          <Input 
            label="Temporary Password" 
            type="password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Access Tier</label>
            <select 
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="doctor">Doctor / Clinician</option>
              <option value="nurse">Nurse / Practitioner</option>
              <option value="lab">Lab Technician</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>

          <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 flex gap-3">
            <Shield className="h-5 w-5 text-sky-600 flex-shrink-0" />
            <p className="text-xs text-sky-700 leading-tight">
              Provisioning a new identity requires secondary administrative authorization. 
              Password policies are strictly enforced.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Prepare Provisioning</Button>
          </div>
        </form>
      </Modal>

      <ReAuthModal 
        isOpen={isReAuthOpen}
        onClose={() => setIsReAuthOpen(false)}
        onConfirm={onConfirmCreate}
        title="Authorize Provisioning"
        description={`Confirming creation of user ${username} with ${role.toUpperCase()} privileges.`}
      />
    </>
  );
}
