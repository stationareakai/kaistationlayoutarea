import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/" });
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        // Sign out immediately — new accounts must wait for admin approval
        await supabase.auth.signOut();
        setInfo(
          "Akun berhasil dibuat. Akses Anda menunggu persetujuan admin — admin akan menetapkan role (Editor / Viewer) sebelum Anda dapat masuk.",
        );
        setMode("login");
      } else {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const userId = signInData.user?.id;
        if (!userId) throw new Error("Gagal masuk");
        // Verify the user has been assigned a role by an admin
        const { data: roles, error: rolesErr } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);
        if (rolesErr) throw rolesErr;
        if (!roles || roles.length === 0) {
          await supabase.auth.signOut();
          setError(
            "Akun Anda belum disetujui admin. Silakan hubungi admin untuk mendapatkan role Editor atau Viewer.",
          );
          return;
        }
        navigate({ to: "/", replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(1200px 600px at 10% 0%, #e8efff 0%, transparent 60%), radial-gradient(900px 500px at 90% 100%, #ffe7e4 0%, transparent 60%), #f5f7fb",
        fontFamily:
          "'Plus Jakarta Sans', system-ui, -apple-system, Segoe UI, sans-serif",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          borderRadius: 20,
          padding: 32,
          boxShadow: "0 30px 80px -20px rgba(20,30,80,0.18), 0 2px 6px rgba(0,0,0,0.04)",
          border: "1px solid rgba(255,255,255,0.6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "linear-gradient(135deg, #ea580c, #b91c1c)",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            KAI
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color: "#0f172a",
                lineHeight: 1.1,
              }}
            >
              KAI Asset
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              Sistem Manajemen Denah Stasiun
            </div>
          </div>
        </div>

        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 26,
            fontWeight: 700,
            color: "#0f172a",
            margin: 0,
          }}
        >
          {mode === "login" ? "Masuk ke akun Anda" : "Buat akun baru"}
        </h1>
        <p style={{ color: "#64748b", fontSize: 14, marginTop: 6, marginBottom: 22 }}>
          {mode === "login"
            ? "Gunakan email dan password Anda."
            : "Akun pertama otomatis menjadi admin."}
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          {mode === "signup" && (
            <Field
              label="Nama Lengkap"
              type="text"
              value={fullName}
              onChange={setFullName}
              placeholder="Nama Anda"
            />
          )}
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="nama@kai.id"
            required
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Minimal 6 karakter"
            required
            minLength={6}
          />

          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                fontSize: 13,
                padding: "10px 12px",
                borderRadius: 10,
              }}
            >
              {error}
            </div>
          )}
          {info && (
            <div
              style={{
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                fontSize: 13,
                padding: "10px 12px",
                borderRadius: 10,
              }}
            >
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6,
              background: "linear-gradient(135deg, #ea580c, #b91c1c)",
              color: "#fff",
              border: 0,
              padding: "12px 14px",
              borderRadius: 12,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 15,
              cursor: loading ? "wait" : "pointer",
              boxShadow: "0 10px 30px -10px rgba(185,28,28,0.5)",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Memproses…" : mode === "login" ? "Masuk" : "Daftar"}
          </button>
        </form>

        <div
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: "1px solid #e2e8f0",
            textAlign: "center",
            fontSize: 13,
            color: "#475569",
          }}
        >
          {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setInfo(null);
            }}
            style={{
              background: "transparent",
              border: 0,
              color: "#b91c1c",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {mode === "login" ? "Daftar di sini" : "Masuk"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        style={{
          border: "1px solid #cbd5e1",
          background: "#fff",
          padding: "11px 13px",
          borderRadius: 10,
          fontSize: 14,
          fontFamily: "inherit",
          outline: "none",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#b91c1c")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
      />
    </label>
  );
}
