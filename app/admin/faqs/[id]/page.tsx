"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Marcellus } from "next/font/google";

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export default function EditFaqPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    status: "Publish",
  });

  useEffect(() => {
    const fetchFaq = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faqs`);
        const result = await response.json();

        if (result.success) {
          // Cari FAQ yang ID-nya sama dengan parameter URL
          const targetFaq = result.data.find((item: any) => item.id.toString() === id);
          
          if (targetFaq) {
            setFormData({
              question: targetFaq.question,
              answer: targetFaq.answer,
              status: targetFaq.status,
            });
          } else {
            alert("Data FAQ tidak ditemukan!");
            router.push("/admin/faqs");
          }
        }
      } catch (error) {
        console.error("Gagal mengambil data FAQ:", error);
      } finally {
        setIsFetching(false);
      }
    };

    if (id) fetchFaq();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("admin_token="))
        ?.split("=")[1];

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faqs/${id}`, {
        method: "PUT", // Endpoint update biasanya pakai PUT/PATCH di Laravel
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("FAQ berhasil diperbarui!");
        router.push("/admin/faqs");
      } else {
        alert("Gagal: " + (result.message || "Pastikan data diisi dengan benar"));
      }
    } catch (error) {
      alert("Gagal terhubung ke server Laravel.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <svg className="animate-spin h-10 w-10 text-[#C6952F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up pb-10 max-w-4xl mx-auto">
      <div>
        <Link href="/admin/faqs" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#5C0A2E] transition-colors mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Kembali ke Daftar FAQ
        </Link>
        <h1 className={`${marcellus.className} text-3xl font-bold text-[#1B120B] mb-2`}>
          Edit FAQ
        </h1>
        <p className="text-gray-500 font-medium">
          Perbarui pertanyaan atau jawaban yang sudah ada.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Pertanyaan</label>
          <input
            type="text"
            required
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Jawaban</label>
          <textarea
            required
            rows={5}
            value={formData.answer}
            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all cursor-pointer"
          >
            <option value="Publish">Publish (Tampilkan)</option>
            <option value="Draft">Draft (Sembunyikan)</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
          <button type="button" onClick={() => router.push("/admin/faqs")} className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-[#1B120B] transition-colors">
            Batal
          </button>
          <button type="submit" disabled={isLoading} className="bg-[#1B120B] hover:bg-[#5C0A2E] text-white text-sm font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-[#1B120B]/10 disabled:opacity-70">
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}