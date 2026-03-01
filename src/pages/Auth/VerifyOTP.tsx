import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader2, ShieldCheck } from "lucide-react";
import apiClient from "../../services/apiClient";
import FallingPetals from "../../components/FallingPetals/FallingPetals";
import FloatingSparkles from "../../components/FloatingSparkles/FloatingSparkles";
import FlyingSwallows from "../../components/FlyingSwallows/FlyingSwallows";
import "./VerifyOTP.css";

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
      console.log("Email: ", email)
      console.log("otp: ", otp)
      await apiClient.auth.verify({ email, otp: otp });
      toast.success("Verification successful! You can now log in.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="verify-page">
      {/* Ambient background effects */}
      <FloatingSparkles count={24} />
      <FallingPetals count={14} />
      <FlyingSwallows interval={12} flockSize={3} />

      <div className="verify-card">
        <div className="verify-icon-wrapper">
          <ShieldCheck />
        </div>
        
        <h2 className="verify-title">Verify Your Account</h2>
        <p className="verify-subtitle">
          A verification code has been sent to <br /> 
          <span className="verify-email">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="verify-input-group">
            <input 
                type="text"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                className="verify-email-input"
            />
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="verify-otp-input"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || otp.length < 4}
            className="verify-btn"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Verify Code"
            )}
          </button>
        </form>

        <div className="verify-resend">
          <p>
            Didn't receive the code?{" "}
            <button 
              onClick={() => toast.info("Resend feature is coming soon!")}
              className="verify-resend-btn"
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