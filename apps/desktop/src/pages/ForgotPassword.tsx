import { useState } from "react";
import { Link } from "react-router-dom";
import { useSupabase } from "../hooks/useSupabase";
import { motion } from "framer-motion";
import { LoadingSpinner } from "../components/LoadingSpinner";

export function ForgotPassword() {
  const supabase = useSupabase();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '40px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        <h2 style={{ marginBottom: '24px', fontSize: '24px', textAlign: 'center' }}>Reset Password</h2>
        
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--accent-color)', marginBottom: '16px' }}>Check your email for the reset link!</p>
            <Link to="/login" className="btn-secondary" style={{ width: '100%' }}>Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ color: 'var(--error-color)', fontSize: '14px', textAlign: 'center' }}>
                {error}
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? <LoadingSpinner size={20} /> : "Send Reset Link"}
            </button>
          </form>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Remember your password? <Link to="/login">Log in</Link>
        </div>
      </motion.div>
    </div>
  );
}
