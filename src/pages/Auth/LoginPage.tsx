import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import { useAuthContext } from "../../contexts/AuthContext";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import FallingPetals from "../../components/FallingPetals/FallingPetals";
import FloatingSparkles from "../../components/FloatingSparkles/FloatingSparkles";
import FlyingSwallows from "../../components/FlyingSwallows/FlyingSwallows";
import "./LoginPage.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      {/* Ambient background effects */}
      <FloatingSparkles count={24} />
      <FallingPetals count={14} />
      <FlyingSwallows interval={12} flockSize={3} />

      <div style={{ maxWidth: "28rem", width: "100%" }}>
        {/* Login Card */}
        <div className="login-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="login-label">Email Address</label>
              <div className="relative login-input-wrapper">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                  placeholder="name@example.com"
                />
                <Mail className="login-input-icon" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="login-label" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" className="login-link">
                  Forget password?
                </Link>
              </div>
              <div className="relative login-input-wrapper">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                  placeholder="••••••••"
                />
                <Lock className="login-input-icon" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="login-btn"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Login
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Login */}
          <div>
            <div className="login-divider">
              <div className="login-divider__line" />
              <span className="login-divider__text">Or continue with</span>
            </div>

            <button className="login-social-btn">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
              Google
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="login-footer">
          Don't have an account?{" "}
          <Link to="/register">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;