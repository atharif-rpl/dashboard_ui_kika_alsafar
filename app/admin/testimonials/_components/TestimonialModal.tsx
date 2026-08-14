"use client";

import { useState, useRef, useEffect } from "react";

export type TestimonialType = {
  id: number;
  name: string;
  package_name: string;
  review: string;
  rating: number;
  image_url: string;
  is_active: boolean;
};

interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: TestimonialType | null;
}

export default function TestimonialModal({ isOpen, onClose, onSuccess, initialData }: TestimonialModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    package_name: "",
    review: "",
    rating: 5,
    isActive: true,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        package_name: initialData.package_name || "",
        review: initialData.review,
        rating: initialData.rating,
        isActive: initialData.is_active,
      });
      setPreviewImage(initialData.image_url);
      setImageFile(null);
    } else {
      setFormData({
        name: "",
        package_name: "",
        review: "",
        rating: 5,
        isActive: true,
      });
      setPreviewImage(null);
      setImageFile(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        setPreviewImage(URL.createObjectURL(file));
        setImageFile(file);
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.review) {
      alert("Nama dan Review wajib diisi!");
      return;
    }

    setIsLoading(true);

    const dataToSend = new FormData();
    dataToSend.append("name", formData.name);
    dataToSend.append("package_name", formData.package_name);
    dataToSend.append("review", formData.review);
    dataToSend.append("rating", formData.rating.toString());
    dataToSend.append("isActive", formData.isActive ? "1" : "0");
    
    if (imageFile) {
      dataToSend.append("image", imageFile);
    }

    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('admin_token='))
        ?.split('=')[1];

      const url = initialData 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/testimonials/${initialData.id}` 
        : `${process.env.NEXT_PUBLIC_API_URL}/api/testimonials`;

      const response = await fetch(url, {
        method: "POST",
        body: dataToSend,
        headers: { 
          "Accept": "application/json",
          "Authorization": `Bearer ${token}` 
        }
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        alert("Gagal menyimpan data testimoni.");
      }
    } catch (error) {
      alert("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-bold text-[#1B120B]">
            {initialData ? "Edit Testimoni" : "Tambah Testimoni Jemaah"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Foto Profil */}
            <div className="shrink-0 flex flex-col items-center gap-3">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden group relative hover:border-[#C6952F]"
              >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                {previewImage ? (
                   // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-8 h-8 text-gray-400 group-hover:text-[#C6952F] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-[10px] font-bold text-center leading-tight">Ganti<br/>Foto</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 font-medium">Opsional</p>
            </div>

            {/* Input Data */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Nama Jemaah</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Paket (Opsional)</label>
                  <input 
                    type="text" 
                    value={formData.package_name}
                    onChange={(e) => setFormData({...formData, package_name: e.target.value})}
                    placeholder="Cth: Umroh Plus Turki"
                    className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Rating Bintang</label>
                  <select 
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F]"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value="4">⭐⭐⭐⭐ (4/5)</option>
                    <option value="3">⭐⭐⭐ (3/5)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Ulasan / Testimoni</label>
                <textarea 
                  rows={4}
                  value={formData.review}
                  onChange={(e) => setFormData({...formData, review: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F] resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                  className={`w-10 h-5 rounded-full relative transition-colors ${formData.isActive ? 'bg-[#5C0A2E]' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-[2px] left-[2px] bg-white w-4 h-4 rounded-full transition-transform ${formData.isActive ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </button>
                <span className="text-sm font-bold text-gray-700">Tampilkan di Halaman Depan</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={isLoading} className="bg-[#5C0A2E] hover:bg-[#801443] text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#5C0A2E]/20 disabled:opacity-70">
            {isLoading ? "Menyimpan..." : "Simpan Data"}
          </button>
        </div>

      </div>
    </div>
  );
}