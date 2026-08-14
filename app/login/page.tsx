"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Marcellus } from "next/font/google";

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Simpan token di Cookies (berlaku 1 hari / 86400 detik)
        document.cookie = `admin_token=${result.token}; path=/; max-age=86400; SameSite=Strict`;
        
        // Simpan data user di LocalStorage
        localStorage.setItem("admin_user", JSON.stringify(result.user));

        // Arahkan ke dashboard admin
        router.push("/admin/slidershero");
      } else {
        setErrorMsg(result.message || "Email atau password salah.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f9fa] relative overflow-hidden p-4">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#C6952F] rounded-full blur-[150px] opacity-20"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#5C0A2E] rounded-full blur-[150px] opacity-20"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-10 relative z-10 animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F6EFDF] text-[#5C0A2E] mb-4 shadow-inner">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className={`${marcellus.className} text-3xl font-bold text-[#1B120B] mb-2 tracking-wide`}>
            KIKA ALSAFAR
          </h1>
          <p className="text-sm text-[#5c5142] font-medium uppercase tracking-widest">
            Login Admin
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider ml-1">
              Email Address
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@kikaalsafar.com"
              className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-4 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">
                Password
              </label>
              <button type="button" className="text-xs font-semibold text-gray-400 hover:text-[#C6952F] transition-colors">
                Lupa Password?
              </button>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-4 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#5C0A2E] hover:bg-[#801443] text-white font-bold text-sm rounded-xl px-4 py-4 transition-all duration-300 shadow-lg shadow-[#5C0A2E]/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </>
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-4">
          <p className="text-sm text-gray-500 font-medium">
            Belum punya akses?{" "}
            <Link href="/auth/register" className="text-[#5C0A2E] font-bold hover:text-[#C6952F] transition-colors">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}