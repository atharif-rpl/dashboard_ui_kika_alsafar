"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Marcellus } from "next/font/google";

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

type FaqType = {
  id: number;
  question: string;
  answer: string;
  status: "Publish" | "Draft";
};

export default function FaqsManagePage() {
  const [faqs, setFaqs] = useState<FaqType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch data dari API Laravel
  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faqs`);
      const result = await response.json();
      
      if (result.success) {
        setFaqs(result.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data FAQ:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  // Fungsi Delete FAQ dengan Token Sanctum
  const handleDelete = async (id: number) => {
    if (window.confirm("Yakin ingin menghapus FAQ ini secara permanen?")) {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('admin_token='))
          ?.split('=')[1];

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faqs/${id}`, {
          method: "DELETE",
          headers: { 
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        
        const result = await response.json();

        if (response.ok && result.success) {
          setFaqs(prev => prev.filter(faq => faq.id !== id));
          alert("FAQ berhasil dihapus!");
        } else {
          alert("Gagal menghapus data: " + (result.message || "Kesalahan sistem"));
        }
      } catch (error) {
        alert("Gagal terhubung ke server Laravel.");
        console.error(error);
      }
    }
  };

  // Logika Filter & Search
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || faq.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in-up pb-10 max-w-[1440px] mx-auto">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`${marcellus.className} text-3xl font-bold text-[#1B120B] mb-1`}>
            Manajemen FAQ
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Kelola daftar pertanyaan yang sering diajukan oleh jemaah.
          </p>
        </div>
        
        <Link 
          href="/admin/faqs/create"
          className="bg-[#5C0A2E] hover:bg-[#801443] text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-[#5C0A2E]/20 flex items-center justify-center gap-2 shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Tambah FAQ Baru
        </Link>
      </div>

      {/* Main Card Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Toolbar: Search & Filter */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 bg-gray-50/30">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              type="text" 
              placeholder="Cari pertanyaan atau jawaban..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-colors shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filter:</span>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#C6952F] font-medium outline-none cursor-pointer min-w-[150px] shadow-sm"
            >
              <option value="all">Semua Status</option>
              <option value="publish">Publish</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-[#5C0A2E] text-[11px] font-bold uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-4">Pertanyaan</th>
                <th className="px-6 py-4">Jawaban</th>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">Aksi</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100 relative">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <svg className="animate-spin h-8 w-8 text-[#C6952F] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm text-gray-500 mt-4">Memuat data FAQ...</p>
                  </td>
                </tr>
              ) : filteredFaqs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <p className="text-gray-500">Tidak ada FAQ yang ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredFaqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5 max-w-xs">
                      <p className="text-sm font-bold text-[#1B120B]">{faq.question}</p>
                    </td>
                    <td className="px-6 py-5 max-w-md">
                      <p className="text-sm text-gray-500 line-clamp-2">{faq.answer}</p>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${
                        faq.status === 'Publish' 
                          ? 'bg-green-50 text-green-700 border border-green-100' 
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${faq.status === 'Publish' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        {faq.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/admin/faqs/${faq.id}/edit`} className="p-2 text-gray-400 hover:text-[#C6952F] bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-all" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </Link>
                        <button onClick={() => handleDelete(faq.id)} className="p-2 text-gray-400 hover:text-red-500 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-all" title="Hapus">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}