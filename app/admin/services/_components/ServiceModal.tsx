"use client";

import { useState, useEffect } from "react";

export type ServiceType = {
  id: number;
  title: string;
  startingPrice: string; 
  description: string;
  isPopular: boolean;
  theme: "dark" | "light";
  features: string[];
};

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; 
  initialData?: ServiceType | null;
}

export default function ServiceModal({ isOpen, onClose, onSuccess, initialData }: ServiceModalProps) {
  const [formData, setFormData] = useState<Omit<ServiceType, "id">>({
    title: "",
    startingPrice: "",
    description: "",
    isPopular: false,
    theme: "dark",
    features: [""],
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        startingPrice: initialData.startingPrice,
        description: initialData.description || "",
        isPopular: initialData.isPopular,
        theme: initialData.theme,
        features: initialData.features?.length ? initialData.features : [""],
      });
    } else {
      setFormData({
        title: "",
        startingPrice: "",
        description: "",
        isPopular: false,
        theme: "dark",
        features: [""],
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures.length ? newFeatures : [""] });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.startingPrice) {
      alert("Judul dan Harga Mulai Dari wajib diisi!");
      return;
    }
    
    setIsLoading(true);
    
    // Bersihkan input fitur yang kosong sebelum dikirim
    const cleanedFeatures = formData.features.filter(f => f.trim() !== "");
    const payload = { ...formData, features: cleanedFeatures };

    try {
      // 1. AMBIL TOKEN DARI COOKIES
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('admin_token='))
        ?.split('=')[1];

      const url = initialData 
        ? `${process.env.NEXT_PUBLIC_API_URL}/services/${initialData.id}` 
        : `${process.env.NEXT_PUBLIC_API_URL}/services`;
        
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          // 2. SELIPIN TOKEN KE HEADER
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        alert("Gagal menyimpan: " + (result.message || "Terjadi kesalahan"));
        console.error(result);
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
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
        
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <h3 className="font-bold text-[#1B120B]">
            {initialData ? "Edit Layanan" : "Tambah Layanan Baru"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Nama Layanan</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Contoh: Umroh Plus"
                className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Harga (Mulai Dari)</label>
              <input 
                type="text" 
                value={formData.startingPrice}
                onChange={(e) => setFormData({...formData, startingPrice: e.target.value})}
                placeholder="Contoh: Rp 35 Jt"
                className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Deskripsi Singkat</label>
            <textarea 
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Contoh: Satu perjalanan, dua pengalaman..."
              className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Tema Warna Card</label>
              <select 
                value={formData.theme}
                onChange={(e) => setFormData({...formData, theme: e.target.value as "dark" | "light"})}
                className="w-full bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-[#C6952F]"
              >
                <option value="dark">Dark (Maroon)</option>
                <option value="light">Light (Cream)</option>
              </select>
            </div>
            
            <div className="flex items-center mt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({...formData, isPopular: e.target.checked})}
                    className="sr-only" 
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isPopular ? 'bg-[#C6952F]' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isPopular ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
                <span className="text-sm font-bold text-[#1B120B]">Tandai "Paling Diminati"</span>
              </label>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#5C0A2E] uppercase tracking-wider">Daftar Sub-Paket</label>
              <button type="button" onClick={addFeature} className="text-xs font-bold text-[#C6952F] hover:text-[#5C0A2E] flex items-center gap-1">
                + Tambah Baris
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </span>
                  <input 
                    type="text" 
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder="Contoh: Paket Umroh Reguler"
                    className="flex-1 bg-gray-50 border border-gray-200 text-[#1B120B] text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#C6952F]"
                  />
                  <button 
                    type="button" 
                    onClick={() => removeFeature(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={isLoading} className="bg-[#5C0A2E] hover:bg-[#801443] text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#5C0A2E]/20 disabled:opacity-70">
            {isLoading ? "Menyimpan..." : "Simpan Layanan"}
          </button>
        </div>

      </div>
    </div>
  );
}