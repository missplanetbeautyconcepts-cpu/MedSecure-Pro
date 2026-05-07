import { ShieldAlert, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-100 shadow-xl p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <ShieldAlert className="h-8 w-8 text-red-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-slate-500">
            You do not have the required permissions to view this resource. 
            This attempt has been logged for security review.
          </p>
        </div>
        <div className="pt-4">
          <Link to="/">
            <Button className="w-full gap-2">
              <Home className="h-4 w-4" />
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
