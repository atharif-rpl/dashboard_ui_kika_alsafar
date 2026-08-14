"use client";

import { useState, useRef, useEffect } from "react";

export type PartnerType = {
  id: number;
  name: string;
  image_url: string; // Dari Laravel namanya image_url
  status: "active" | "inactive";
};

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Panggil ini kalau sukses biar list me-refresh
  initialData?: PartnerType | null;
}

export default function PartnerModal({ isOpen, onClose, onSuccess, initialData }: PartnerModalProps) {
  const [name, setName] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPreviewImage(initialData.image_url);
      setImageFile(null); // Kosongkan file karena kita pake gambar lama
    } else {
      setName("");
      setPreviewImage(null);
      setImageFile(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

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
      alert("Format file tidak didukung. Gunakan format gambar.");
    }
  };

  const handleSubmit = async () => {
    if (!name) {
      alert("Nama mitra wajib diisi.");
      return;
    }
    if (!initialData && !imageFile) {
      alert("Logo mitra wajib diupload untuk data baru.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      // 1. Ambil token dari Cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('admin_token='))
        ?.split('=')[1];

      // Jika ada initialData, berarti proses Edit. Jika tidak, proses Create.
      const url = initialData 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/partners/${initialData.id}` 
        : `${process.env.NEXT_PUBLIC_API_URL}/api/partners`;
      
      const response = await fetch(url, {
        method: "POST", // Tetap POST, Laravel akan handle update-nya
        body: formData,
        headers: { 
          "Accept": "application/json",
          // 2. Selipin token ke Header
          "Authorization": `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess(); // Refresh data di halaman utama
        onClose(); // Tutup modal
      } else {
        alert("Gagal: " + (result.message || "Terjadi kesalahan"));
      }
    } catch (error) {
      alert("Gagal terhubung ke server.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
        
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-bold text-[#1B120B]">
            {initialData ? "Edit Logo Mitra" : "Upload Mitra Baru"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Nama Mitra / Maskapai</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Emirates Airlines"
              className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F] focus:ring-1 focus:ring-[#C6952F] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">File Logo</label>
            
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden ${
                isDragging ? "border-[#C6952F] bg-[#F6EFDF]/30" : previewImage ? "border-transparent bg-[#F6EFDF]/30" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              
              {previewImage ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewImage} alt="Preview" className="w-3/4 h-3/4 object-contain grayscale-0 drop-shadow-md" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-semibold">Ganti Gambar</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <svg className="w-8 h-8 mx-auto mb-2 text-[#C6952F]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-[#1B120B] text-sm font-bold">Upload Logo</p>
                  <p className="text-[10px] text-gray-500">Format PNG Webp tanpa background</p>
                </div>
              )}
            </div>
            {initialData && <p className="text-[10px] text-gray-500 text-center">*Biarkan jika tidak ingin mengganti logo</p>}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={isLoading} className="bg-[#5C0A2E] hover:bg-[#801443] text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#5C0A2E]/20 disabled:opacity-70 disabled:cursor-not-allowed">
            {isLoading ? "Menyimpan..." : "Simpan Logo"}
          </button>
        </div>

      </div>
    </div>
  );
}