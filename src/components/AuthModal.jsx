import { useState } from "react";
import { supabase } from "../config/supabaseClient";

const AuthModal = ({ onClose }) => {
  // eslint-disable-next-line no-unused-vars -- setIsSignUp is used by the sign-up code below when it is uncommented
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      /* === UNCOMMENT TO ENABLE SIGN UPS ===
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ text: "Success! You can now log in.", type: "success" });
        setIsSignUp(false); // Switch to login screen
      } else {
      ==================================== */

      // Standard Login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      onClose(); // Close modal on successful login

      /* === UNCOMMENT TO ENABLE SIGN UPS ===
      }
      ==================================== */
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "var(--backdrop)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100, // High z-index to sit above everything
      }}
    >
      <div
        style={{
          backgroundColor: "var(--surface)",
          padding: "30px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "350px",
          border: "1px solid var(--border)",
          boxShadow: "0 10px 25px var(--shadow)",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "none",
            border: "none",
            color: "var(--text-faint)",
            cursor: "pointer",
            fontSize: "1.2rem",
          }}
        >
          ✕
        </button>

        <h2
          style={{
            color: "var(--text-strong)",
            marginTop: 0,
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>

        <form
          onSubmit={handleAuth}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid var(--border-strong)",
              backgroundColor: "var(--input-bg)",
              color: "var(--text-strong)",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid var(--border-strong)",
              backgroundColor: "var(--input-bg)",
              color: "var(--text-strong)",
            }}
          />

          {message.text && (
            <div
              style={{
                color:
                  message.type === "error" ? "var(--danger)" : "var(--success)",
                fontSize: "0.85rem",
                textAlign: "center",
              }}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "none",
              cursor: loading ? "wait" : "pointer",
              backgroundColor: "var(--accent)",
              color: "#fff",
              fontWeight: "bold",
              transition: "background-color 0.2s",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>

        {/* === UNCOMMENT TO ENABLE SIGN UPS ===
        <p
          style={{
            color: "var(--text-faint)",
            fontSize: "0.85rem",
            textAlign: "center",
            marginTop: "20px",
            marginBottom: 0,
          }}
        >
          {isSignUp ? "Already have an account? " : "Need an account? "}
          <span
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage({ text: "", type: "" });
            }}
            style={{ color: "var(--accent)", cursor: "pointer" }}
          >
            {isSignUp ? "Log in" : "Sign up"}
          </span>
        </p>
        ==================================== */}
      </div>
    </div>
  );
};

export default AuthModal;
