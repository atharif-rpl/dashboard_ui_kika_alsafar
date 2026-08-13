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

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      // Setelah register, arahkan ke login
      router.push("/auth/login");
    }, 1500);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f9fa] relative overflow-hidden p-4">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#C6952F] rounded-full blur-[150px] opacity-20"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#5C0A2E] rounded-full blur-[150px] opacity-20"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-10 relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className={`${marcellus.className} text-3xl font-bold text-[#1B120B] mb-2 tracking-wide`}>
            KIKA ALSAFAR
          </h1>
          <p className="text-sm text-[#5c5142] font-medium uppercase tracking-widest">
            Registrasi Admin
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider ml-1">
              Nama Lengkap
            </label>
            <input 
              type="text" 
              required
              placeholder="Masukkan nama lengkap"
              className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider ml-1">
              Email Address
            </label>
            <input 
              type="email" 
              required
              placeholder="admin@kikaalsafar.com"
              className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider ml-1">
              Password
            </label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#5C0A2E] hover:bg-[#801443] text-white font-bold text-sm rounded-xl px-4 py-4 transition-all duration-300 shadow-lg shadow-[#5C0A2E]/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mendaftarkan...
              </>
            ) : (
              "Buat Akun Baru"
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-4">
          <p className="text-sm text-gray-500 font-medium">
            Sudah punya akun?{" "}
            <Link href="/auth/login" className="text-[#5C0A2E] font-bold hover:text-[#C6952F] transition-colors">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}