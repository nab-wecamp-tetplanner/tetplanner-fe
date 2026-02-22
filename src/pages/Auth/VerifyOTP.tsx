import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader2, ShieldCheck } from "lucide-react";
import apiClient from "../../services/apiClient";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // Retrieve email from navigation state
  const email = location.state?.email;
  const [currentEmail, setCurrentEmail] = useState(email || "");

  useEffect(() => {
    if (!email) {
      toast.error("Email information not found. Please enter your email again.");
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      toast.error("Please enter a valid OTP code.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Call verify endpoint from your refactored apiClient
      await apiClient.auth.verify({ email, code: otp });
      toast.success("Verification successful! You can now log in.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card rounded-2xl border border-border p-8 shadow-sm text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-6">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Account</h2>
        <p className="text-sm text-muted-foreground mb-8">
          A verification code has been sent to <br /> 
          <span className="font-semibold text-gray-900">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center flex-col items-center gap-4">
            <input 
                type="text"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                className="w-full text-center text-xl font-bold py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full text-center text-3xl tracking-[0.5em] font-bold py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || otp.length < 4}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Verify Code"
            )}
          </button>
        </form>

        <div className="mt-8">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?{" "}
            <button 
              onClick={() => toast.info("Resend feature is coming soon!")}
              className="text-blue-600 hover:underline font-semibold"
            >
              Resend OTP
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;