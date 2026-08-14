"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Marcellus } from "next/font/google";

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

type GalleryType = {
  id: number;
  title: string;
  category: string;
  date: string;
  description: string;
  image_url: string; 
};

export default function DocumentationManagePage() {
  const [galleries, setGalleries] = useState<GalleryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data dari API Laravel
  const fetchGalleries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/galleries`);
      const result = await response.json();
      
      if (result.success) {
        setGalleries(result.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data galeri:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  // Fungsi Delete yang BENERAN nembak ke Database Laravel
  const handleDelete = async (id: number) => {
    if (window.confirm("Yakin ingin menghapus dokumentasi ini secara permanen?")) {
      try {
        // 1. Ambil token dari Cookies
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('admin_token='))
          ?.split('=')[1];

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/galleries/${id}`, {
          method: "DELETE",
          headers: {
            "Accept": "application/json",
            // 2. Selipin token ke Header
            "Authorization": `Bearer ${token}`
          }
        });
        
        const result = await response.json();

        if (response.ok && result.success) {
          // Kalau API Laravel bilang sukses hapus, baru kita hapus dari tampilan layar
          setGalleries(prev => prev.filter(item => item.id !== id));
          alert("Data berhasil dihapus dari database!");
        } else {
          alert("Gagal menghapus data: " + (result.message || "Kesalahan sistem"));
        }
      } catch (error) {
        alert("Gagal terhubung ke server Laravel.");
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`${marcellus.className} text-3xl font-bold text-[#1B120B] mb-1`}>
            Galeri Dokumentasi
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Kelola foto momen keberangkatan, fasilitas, dan testimoni jemaah.
          </p>
        </div>
        
        <Link 
          href="/admin/documentation/create"
          className="bg-[#1B120B] hover:bg-[#5C0A2E] text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-[#1B120B]/10 flex items-center justify-center gap-2 shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Upload Dokumentasi Baru
        </Link>
      </div>

      {/* Tampilan Loading */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-10 w-10 text-[#C6952F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : galleries.length === 0 ? (
        
        /* State Kosong */
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-lg font-bold text-[#1B120B] mb-2">Belum Ada Dokumentasi</h3>
          <p className="text-sm text-gray-500 mb-6">Kamu belum mengupload foto galeri apapun.</p>
          <Link href="/admin/documentation/create" className="text-[#C6952F] font-bold hover:underline">
            Mulai Upload Sekarang
          </Link>
        </div>

      ) : (

        /* Grid Galeri (Kalau ada datanya) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {galleries.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all flex flex-col">
              
              {/* Image Preview */}
              <div className="relative w-full h-48 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={item.image_url} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#5C0A2E] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
                  {item.category}
                </span>

                {/* Overlay Aksi (Hapus & Edit) */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Link href={`/admin/documentation/${item.id}/edit`} className="w-10 h-10 rounded-full bg-white text-[#C6952F] flex items-center justify-center hover:scale-110 transition-transform shadow-lg" title="Edit">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </Link>
                  <button onClick={() => handleDelete(item.id)} className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg" title="Hapus">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>

              {/* Data Detail */}
              <div className="p-4 flex flex-col flex-1">
                <h4 className="font-bold text-[#1B120B] mb-1 line-clamp-1" title={item.title}>
                  {item.title}
                </h4>
                <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {new Date(item.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {item.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mt-auto">
                    {item.description}
                  </p>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}