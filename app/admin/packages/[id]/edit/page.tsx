"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Marcellus } from "next/font/google";

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export default function EditPackagePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    airline: "",
    departure: "",
    price: "",
    totalSeats: "",
    filledSeats: "",
    status: "Draft",
    description: "",
  });

  // Fetch data lama berdasarkan ID
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/${id}`);
        const result = await response.json();

        if (result.success) {
          const data = result.data;
          setFormData({
            code: data.code,
            name: data.name,
            airline: data.airline,
            departure: data.departure,
            price: data.price.toString(),
            totalSeats: data.totalSeats.toString(),
            filledSeats: data.filledSeats.toString(),
            status: data.status,
            description: data.description || "",
          });
          setPreviewImage(data.image_url);
        } else {
          alert("Data paket tidak ditemukan!");
          router.push("/admin/packages");
        }
      } catch (error) {
        console.error("Gagal mengambil data paket:", error);
      } finally {
        setIsFetching(false);
      }
    };

    if (id) fetchPackage();
  }, [id, router]);

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
    dataToSend.append("filledSeats", formData.filledSeats);
    dataToSend.append("status", formData.status);
    dataToSend.append("description", formData.description);
    
    // Kirim gambar HANYA kalau admin pilih gambar baru
    if (imageFile) {
      dataToSend.append("image", imageFile);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/${id}`, {
        method: "POST", // Kita pakai POST sesuai rute Laravel untuk Update dengan File
        body: dataToSend,
        headers: { "Accept": "application/json" }
      });

      const result = await response.json();

      if (response.ok) {
        alert("Data paket berhasil diperbarui!");
        router.push("/admin/packages");
      } else {
        alert("Gagal: " + (result.message || "Pastikan kode paket tidak duplikat dengan yang lain"));
        console.error(result);
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
    <div className="space-y-8 animate-fade-in-up pb-10 max-w-6xl mx-auto">
      
      {/* Tombol Kembali & Header */}
      <div>
        <Link href="/admin/packages" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#5C0A2E] transition-colors mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Kembali ke Daftar Paket
        </Link>
        <h1 className={`${marcellus.className} text-3xl font-bold text-[#1B120B] mb-2`}>
          Edit Data Paket Umroh
        </h1>
        <p className="text-gray-500 font-medium">
          Perbarui informasi keberangkatan, harga, atau kuota paket.
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 md:col-span-1">
                  <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Harga (Mulai Dari)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-1">
                  <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Total Kuota</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={formData.totalSeats}
                    onChange={(e) => setFormData({...formData, totalSeats: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all"
                  />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Seat Terisi</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={formData.filledSeats}
                    onChange={(e) => setFormData({...formData, filledSeats: e.target.value})}
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
                  isDragging ? "border-[#C6952F] bg-[#F6EFDF]/30" : "border-transparent"
                }`}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                
                {previewImage && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-semibold">Ganti Gambar</span>
                    </div>
                  </>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-2 text-center">
                *Biarkan jika tidak ingin mengganti gambar
              </p>
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
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>

      </form>
    </div>
  );
}