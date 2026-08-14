"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Marcellus } from "next/font/google";

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export default function InputDocumentationPage() {
  const router = useRouter(); 
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "keberangkatan",
    date: "",
    description: "",
  });

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setImageFile(file);
    } else {
      alert("Mohon upload file gambar (JPG/PNG/WEBP)");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile) {
      alert("Tolong upload foto dokumentasi terlebih dahulu!");
      return;
    }

    setIsLoading(true);

    const dataToSend = new FormData();
    dataToSend.append("title", formData.title);
    dataToSend.append("category", formData.category);
    dataToSend.append("date", formData.date);
    dataToSend.append("description", formData.description);
    dataToSend.append("image", imageFile);

    try {
      // 1. Ambil token dari Cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('admin_token='))
        ?.split('=')[1];

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/galleries`, {
        method: "POST",
        body: dataToSend, 
        headers: {
            "Accept": "application/json",
            // 2. Selipin token ke Header
            "Authorization": `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok) {
        alert("Yeay! Dokumentasi berhasil disimpan ke database!");
        // Redirect otomatis ke halaman list galeri
        router.push("/admin/documentation");
      } else {
        alert("Gagal: " + (result.message || "Terjadi kesalahan sistem"));
        console.error(result);
      }
    } catch (error) {
      alert("Gagal terhubung ke server. Pastikan backend Laravel menyala.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-10 max-w-5xl mx-auto">
      
      {/* Tombol Kembali & Header */}
      <div>
        <Link href="/admin/documentation" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#5C0A2E] transition-colors mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Kembali ke Daftar Galeri
        </Link>
        <h1 className={`${marcellus.className} text-3xl font-bold text-[#1B120B] mb-2`}>
          Upload Dokumentasi Baru
        </h1>
        <p className="text-gray-500 font-medium">
          Tambahkan foto galeri, momen keberangkatan, atau fasilitas untuk ditampilkan di Web Profile.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Kolom Kiri: Upload Area (Drag & Drop) */}
            <div className="lg:col-span-5">
              <label className="block text-xs font-bold text-[#5C0A2E] uppercase tracking-wider mb-3">
                Foto Dokumentasi
              </label>
              
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative w-full h-72 md:h-80 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden ${
                  isDragging 
                    ? "border-[#C6952F] bg-[#F6EFDF]/30" 
                    : previewImage ? "border-transparent" : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-[#5C0A2E]/30"
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/jpeg, image/png, image/webp" 
                  className="hidden" 
                />
                
                {previewImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        Ganti Foto
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-4 text-[#C6952F]">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <p className="text-[#1B120B] font-bold mb-1">Klik atau Drag & Drop</p>
                    <p className="text-xs text-gray-500">Format JPG, PNG, atau WEBP (Maks. 5MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Kolom Kanan: Input Form */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">
                  Judul Momen / Kegiatan
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Contoh: Keberangkatan VIP Agustus 2026"
                  className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">
                    Kategori
                  </label>
                  <div className="relative">
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full appearance-none bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all cursor-pointer"
                    >
                      <option value="keberangkatan">Momen Keberangkatan</option>
                      <option value="testimoni">Testimoni Jemaah</option>
                      <option value="fasilitas">Fasilitas Hotel & Bus</option>
                      <option value="ziarah">Ziarah & City Tour</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">
                    Tanggal Kegiatan
                  </label>
                  <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">
                  Deskripsi Singkat (Opsional)
                </label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Tuliskan keterangan singkat mengenai dokumentasi ini..."
                  className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all resize-none"
                />
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
            <button 
              type="button"
              onClick={() => router.push("/admin/documentation")}
              className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-[#1B120B] transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="bg-[#1B120B] hover:bg-[#5C0A2E] text-white text-sm font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-[#1B120B]/10 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  Upload Dokumentasi
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}