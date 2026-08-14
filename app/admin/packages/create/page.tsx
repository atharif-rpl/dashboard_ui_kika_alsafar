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

export default function CreatePackagePage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    airline: "",
    departure: "",
    price: "",
    totalSeats: "",
    status: "Draft",
    description: "",
  });

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) handleFile(e.target.files[0]);
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      setPreviewImage(URL.createObjectURL(file));
      setImageFile(file);
    } else {
      alert("Mohon upload file gambar (JPG/PNG/WEBP)");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const dataToSend = new FormData();
    dataToSend.append("code", formData.code);
    dataToSend.append("name", formData.name);
    dataToSend.append("airline", formData.airline);
    dataToSend.append("departure", formData.departure);
    dataToSend.append("price", formData.price);
    dataToSend.append("totalSeats", formData.totalSeats);
    dataToSend.append("filledSeats", "0"); // Default 0 saat buat paket baru
    dataToSend.append("status", formData.status);
    dataToSend.append("description", formData.description);
    
    // Kirim gambar kalau ada
    if (imageFile) {
      dataToSend.append("image", imageFile);
    }

    try {
      // 1. Ambil token dari cookie
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('admin_token='))
        ?.split('=')[1];

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/packages`, {
        method: "POST",
        body: dataToSend,
        headers: { 
          "Accept": "application/json",
          // 2. Selipin token ke dalam header biar nggak Unauthorized
          "Authorization": `Bearer ${token}` 
        }
      });

      const result = await response.json();

      if (response.ok) {
        alert("Paket berhasil ditambahkan!");
        router.push("/admin/packages");
      } else {
        alert("Gagal: " + (result.message || "Pastikan kode paket belum pernah dipakai"));
        console.error(result);
      }
    } catch (error) {
      alert("Gagal terhubung ke server Laravel.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-10 max-w-6xl mx-auto">
      
      {/* Tombol Kembali & Header */}
      <div>
        <Link href="/admin/packages" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#5C0A2E] transition-colors mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Kembali ke Daftar Paket
        </Link>
        <h1 className={`${marcellus.className} text-3xl font-bold text-[#1B120B] mb-2`}>
          Tambah Paket Umroh Baru
        </h1>
        <p className="text-gray-500 font-medium">
          Isi detail paket keberangkatan dengan lengkap.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* KOLOM KIRI (Data Utama) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Kode Paket</label>
                  <input 
                    type="text" 
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="Contoh: PKG-001"
                    className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Nama Paket</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Contoh: Umroh Reguler 9 Hari"
                    className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Maskapai</label>
                  <input 
                    type="text" 
                    required
                    value={formData.airline}
                    onChange={(e) => setFormData({...formData, airline: e.target.value})}
                    placeholder="Contoh: Saudia Airlines"
                    className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Tanggal Keberangkatan</label>
                  <input 
                    type="date" 
                    required
                    value={formData.departure}
                    onChange={(e) => setFormData({...formData, departure: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Harga (Mulai Dari)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="28500000"
                      className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Total Kuota / Seat</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={formData.totalSeats}
                    onChange={(e) => setFormData({...formData, totalSeats: e.target.value})}
                    placeholder="45"
                    className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Deskripsi Paket</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Deskripsi fasilitas, hotel, dll..."
                  className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* KOLOM KANAN (Gambar & Status) */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
              <label className="block text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Thumbnail Paket</label>
              
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative w-full h-56 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden ${
                  isDragging ? "border-[#C6952F] bg-[#F6EFDF]/30" : previewImage ? "border-transparent" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                
                {previewImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-semibold">Ganti Gambar</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <svg className="w-8 h-8 mx-auto mb-2 text-[#C6952F]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-[#1B120B] text-sm font-bold">Upload Thumbnail</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
              <label className="block text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Status Visibilitas</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all cursor-pointer"
              >
                <option value="Draft">Draft (Sembunyikan)</option>
                <option value="Publish">Publish (Tampilkan)</option>
              </select>
              <p className="text-xs text-gray-500">
                Paket dengan status <b>Publish</b> akan langsung terlihat oleh pengunjung website.
              </p>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100 mt-6">
          <button 
            type="button"
            onClick={() => router.push("/admin/packages")}
            className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-[#1B120B] transition-colors"
          >
            Batal
          </button>
          <button 
            type="submit"
            disabled={isLoading}
            className="bg-[#1B120B] hover:bg-[#5C0A2E] text-white text-sm font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-[#1B120B]/10 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Menyimpan..." : "Simpan Paket"}
          </button>
        </div>

      </form>
    </div>
  );
}