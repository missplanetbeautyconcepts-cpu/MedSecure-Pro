import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { 
  ClipboardList, 
  User as UserIcon, 
  Activity, 
  Microscope, 
  Stethoscope, 
  FileText,
  Save,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { apiService } from "../services/api";
import { useUIStore } from "../store/uiStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PatientData } from "../types";
import { cn } from "../lib/utils";

export default function CreateReportPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  const [formData, setFormData] = useState<Partial<PatientData>>({
    patient_name: "",
    age: 0,
    diagnosis: "",
    doctor_notes: "",
    vitals: {
      blood_pressure: "",
      heart_rate: 0,
      temperature: 0,
      respiratory_rate: 0,
    },
    lab_tests: {
      requested: []
    },
  });

  const updateVitals = (field: keyof NonNullable<PatientData["vitals"]>, value: any) => {
    setFormData(prev => ({
      ...prev,
      vitals: { ...prev.vitals!, [field]: value }
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await apiService.createRecord({
        plaintext: JSON.stringify(formData),
        note: `Clinical Report: ${formData.patient_name} - ${new Date().toLocaleDateString()}`
      });
      addToast("Medical report encrypted and saved successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["records"] });
      navigate("/records");
    } catch (error) {
      addToast("Failed to secure report. Check system status.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { title: "Patient Identity", icon: UserIcon },
    { title: "Clinical Vitals", icon: Activity },
    { title: "Diagnosis & Notes", icon: Stethoscope },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans">New Clinical Examination</h1>
          <p className="text-slate-500 text-sm">Drafting a high-sensitivity encrypted patient record.</p>
        </div>
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div 
              key={i} 
              className={cn(
                "h-2 w-12 rounded-full transition-all duration-500",
                step > i ? "bg-sky-500" : "bg-slate-200"
              )} 
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Step Guide */}
        <div className="md:col-span-1 space-y-4">
          {steps.map((s, i) => (
            <div 
              key={i}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all",
                step === i + 1 ? "bg-white border border-slate-100 shadow-sm text-sky-600" : "text-slate-400 opacity-60"
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs",
                step === i + 1 ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-400"
              )}>
                {i + 1}
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">{s.title}</span>
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <UserIcon className="h-5 w-5 text-sky-600" />
                  <h2 className="text-lg font-bold text-slate-900">Patient Identification</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Full Name" 
                    placeholder="Patient Legal Name"
                    value={formData.patient_name}
                    onChange={(e) => setFormData({...formData, patient_name: e.target.value})}
                  />
                  <Input 
                    label="Age" 
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                  />
                  <Input 
                    label="Blood Type" 
                    placeholder="e.g. O+"
                    value={formData.bio_data?.blood_type}
                    onChange={(e) => setFormData({...formData, bio_data: { ...formData.bio_data, blood_type: e.target.value }})}
                  />
                  <Input 
                    label="Allergies" 
                    placeholder="e.g. Penicillin, Pollen"
                    value={formData.bio_data?.allergies}
                    onChange={(e) => setFormData({...formData, bio_data: { ...formData.bio_data, allergies: e.target.value }})}
                  />
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 italic text-xs text-slate-500">
                  Identity data will be masked in audit logs using cryptographic hashing. Only authorized clinicians can decrypt full principal names.
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-900">Baseline Vitals</h2>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <Input 
                    label="Blood Pressure (mmHg)" 
                    placeholder="120/80"
                    value={formData.vitals?.blood_pressure}
                    onChange={(e) => updateVitals("blood_pressure", e.target.value)}
                  />
                  <Input 
                    label="Heart Rate (BPM)" 
                    type="number"
                    value={formData.vitals?.heart_rate}
                    onChange={(e) => updateVitals("heart_rate", parseInt(e.target.value))}
                  />
                  <Input 
                    label="Temperature (°F)" 
                    type="number"
                    value={formData.vitals?.temperature}
                    onChange={(e) => updateVitals("temperature", parseFloat(e.target.value))}
                  />
                  <Input 
                    label="Respiratory Rate" 
                    type="number"
                    value={formData.vitals?.respiratory_rate}
                    onChange={(e) => updateVitals("respiratory_rate", parseInt(e.target.value))}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <Stethoscope className="h-5 w-5 text-sky-600" />
                  <h2 className="text-lg font-bold text-slate-900">Clinical Findings</h2>
                </div>
                <Input 
                  label="Primary Diagnosis" 
                  placeholder="e.g. Type II Diabetes Mellitus"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                />

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diagnostic Requests</label>
                  <div className="flex flex-wrap gap-2 py-2">
                    {["CBC", "Lipid Panel", "Blood Glucose", "X-Ray", "MRI", "ECG"].map((test) => (
                      <button
                        key={test}
                        type="button"
                        onClick={() => {
                          const current = formData.lab_tests?.requested || [];
                          const updated = current.includes(test) 
                            ? current.filter(t => t !== test)
                            : [...current, test];
                          setFormData({...formData, lab_tests: { requested: updated }});
                        }}
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all border",
                          formData.lab_tests?.requested?.includes(test)
                            ? "bg-sky-600 border-sky-600 text-white shadow-lg shadow-sky-600/20"
                            : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                        )}
                      >
                        {test}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-widest text-[10px]">Detailed Clinical Notes</label>
                  <textarea 
                    className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:italic"
                    placeholder="Document symptoms, findings, and recommended treatment plan..."
                    value={formData.doctor_notes}
                    onChange={(e) => setFormData({...formData, doctor_notes: e.target.value})}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            
            {step < 3 ? (
              <Button 
                onClick={() => setStep(s => s + 1)}
                className="gap-2"
                disabled={step === 1 && !formData.patient_name}
              >
                Next Step
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                isLoading={isLoading}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
              >
                <Save className="h-4 w-4" />
                Encrypt & Authorize
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
