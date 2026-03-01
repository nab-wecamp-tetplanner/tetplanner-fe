import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthTypes";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import FallingPetals from "../../components/FallingPetals/FallingPetals";
import FloatingSparkles from "../../components/FloatingSparkles/FloatingSparkles";
import FlyingSwallows from "../../components/FlyingSwallows/FlyingSwallows";
import "./RegisterPage.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuthContext();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error("The confirmation password does not match!");
    }

    setIsSubmitting(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      toast.success(
        "Successfully registered! Please check your email to verify your account.",
      );
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      {/* Ambient background effects */}
      <FloatingSparkles count={24} />
      <FallingPetals count={14} />
      <FlyingSwallows interval={12} flockSize={3} />

      <div style={{ maxWidth: "28rem", width: "100%" }}>
        {/* Register Card */}
        <div className="register-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="register-label">Full Name</label>
              <div className="relative register-input-wrapper">
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="register-input"
                  placeholder="Your name"
                />
                <User className="register-input-icon" />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="register-label">Email Address</label>
              <div className="relative register-input-wrapper">
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="register-input"
                  placeholder="account@example.com"
                />
                <Mail className="register-input-icon" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="register-label">Password</label>
              <div className="relative register-input-wrapper">
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="register-input"
                  placeholder="••••••••"
                />
                <Lock className="register-input-icon" />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="register-label">Confirm Password</label>
              <div className="relative register-input-wrapper">
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="register-input"
                  placeholder="••••••••"
                />
                <Lock className="register-input-icon" />
              </div>
            </div>

            {/* Terms */}
            <div className="register-terms">
              <CheckCircle2 className="w-4 h-4 register-terms__icon" />
              <p className="register-terms__text">
                By creating an account, you agree to our{" "}
                <a href="/terms">Terms of Service</a>{" "}and{" "}
                <a href="/privacy">Privacy Policy</a>.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="register-btn"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Register
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="register-footer">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
