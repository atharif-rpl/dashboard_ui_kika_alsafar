"use client";

import { useState, useRef, useEffect } from "react";

export type HeroSliderType = {
  id: number;
  tagline: string;
  title: string;
  highlightWord: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  isActive: boolean;
};

interface HeroSliderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: HeroSliderType | null;
}

export default function HeroSliderModal({ isOpen, onClose, onSuccess, initialData }: HeroSliderModalProps) {
  const [formData, setFormData] = useState({
    tagline: "",
    title: "",
    highlightWord: "",
    description: "",
    buttonText: "Pesan Sekarang",
    buttonLink: "/packages",
    isActive: true,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        tagline: initialData.tagline,
        title: initialData.title,
        highlightWord: initialData.highlightWord,
        description: initialData.description,
        buttonText: initialData.buttonText,
        buttonLink: initialData.buttonLink,
        isActive: initialData.isActive,
      });
      setPreviewImage(initialData.image);
      setImageFile(null); 
    } else {
      setFormData({
        tagline: "",
        title: "",
        highlightWord: "",
        description: "",
        buttonText: "Pesan Sekarang",
        buttonLink: "/packages",
        isActive: true,
      });
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
      alert("Mohon upload file gambar.");
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || (!initialData && !imageFile)) {
      alert("Judul dan Gambar wajib diisi!");
      return;
    }

    setIsLoading(true);

    const dataToSend = new FormData();
    dataToSend.append("tagline", formData.tagline);
    dataToSend.append("title", formData.title);
    dataToSend.append("highlightWord", formData.highlightWord);
    dataToSend.append("description", formData.description);
    dataToSend.append("buttonText", formData.buttonText);
    dataToSend.append("buttonLink", formData.buttonLink);
    dataToSend.append("isActive", formData.isActive ? "1" : "0"); 
    
    if (imageFile) {
      dataToSend.append("image", imageFile);
    }

    try {
      // AMBIL TOKEN DARI COOKIES
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('admin_token='))
        ?.split('=')[1];

      const url = initialData 
        ? `${process.env.NEXT_PUBLIC_API_URL}/sliders/${initialData.id}` 
        : `${process.env.NEXT_PUBLIC_API_URL}/sliders`;

      const response = await fetch(url, {
        method: "POST", 
        body: dataToSend,
        headers: { 
          "Accept": "application/json",
          // SELIPIN TOKEN KE HEADER
          "Authorization": `Bearer ${token}` 
        }
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        console.error("DETAIL ERROR VALIDASI LARAVEL:", result.errors || result);
        alert("Gagal menyimpan data! Pastikan ukuran gambar kurang dari 2MB. Cek console (Inspect Element) untuk detailnya.");
      }
    } catch (error) {
      alert("Gagal terhubung ke server Laravel.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
        
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <h3 className="font-bold text-[#1B120B]">
            {initialData ? "Edit Slide Banner" : "Tambah Slide Banner"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kolom Kiri: Teks */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Tagline / Lokasi</label>
                <input 
                  type="text" 
                  value={formData.tagline}
                  onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                  placeholder="Contoh: MASJID NABAWI, MADINAH"
                  className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Judul Utama</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Contoh: Ziarah Penuh"
                    className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#C6952F] uppercase tracking-wider">Teks Emas</label>
                  <input 
                    type="text" 
                    value={formData.highlightWord}
                    onChange={(e) => setFormData({...formData, highlightWord: e.target.value})}
                    placeholder="Contoh: Makna"
                    className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Deskripsi Lengkap</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Menelusuri jejak Rasulullah..."
                  className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Teks Tombol</label>
                  <input 
                    type="text" 
                    value={formData.buttonText}
                    onChange={(e) => setFormData({...formData, buttonText: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Link Tujuan</label>
                  <input 
                    type="text" 
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({...formData, buttonLink: e.target.value})}
                    placeholder="/packages"
                    className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F]"
                  />
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Media & Status */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Gambar Slide</label>
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative w-full h-56 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
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
                      <p className="text-[#1B120B] text-sm font-bold">Upload Gambar</p>
                    </div>
                  )}
                </div>
                {initialData && <p className="text-[10px] text-gray-500 text-center">*Biarkan jika tidak ingin mengganti gambar</p>}
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <p className="text-sm font-bold text-[#1B120B]">Status Slide</p>
                  <p className="text-xs text-gray-500">Tampilkan di halaman utama</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                  className={`w-12 h-6 rounded-full relative transition-colors ${formData.isActive ? 'bg-[#5C0A2E]' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`}></span>
                </button>
              </div>
            </div>
          </div>

        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={isLoading} className="bg-[#5C0A2E] hover:bg-[#801443] text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#5C0A2E]/20 disabled:opacity-70">
            {isLoading ? "Menyimpan..." : "Simpan Slide"}
          </button>
        </div>

      </div>
    </div>
  );
}