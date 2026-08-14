"use client";

import { useState, useEffect } from "react";
import { Marcellus } from "next/font/google";
import HeroSliderModal, { HeroSliderType } from "./_components/HeroSliderModal";

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export default function SlidersHeroPage() {
  const [sliders, setSliders] = useState<HeroSliderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<HeroSliderType | null>(null);

  const fetchSliders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sliders`);
      const result = await response.json();
      if (result.success) {
        setSliders(result.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data slide:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Yakin ingin menghapus slide ini permanen?")) {
      try {
        // 1. Ambil token dari Cookies
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('admin_token='))
          ?.split('=')[1];

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sliders/${id}`, {
          method: "DELETE",
          headers: { 
            "Accept": "application/json",
            // 2. Selipin token ke Header
            "Authorization": `Bearer ${token}` 
          }
        });
        const result = await response.json();

        if (response.ok && result.success) {
          setSliders(prev => prev.filter(slide => slide.id !== id));
        } else {
          alert("Gagal menghapus data.");
        }
      } catch (error) {
        alert("Gagal terhubung ke server.");
        console.error(error);
      }
    }
  };

  const handleToggleStatus = async (slide: HeroSliderType) => {
    const newStatus = !slide.isActive;
    
    // Optimistic UI Update
    setSliders(prev => prev.map(s => s.id === slide.id ? { ...s, isActive: newStatus } : s));

    try {
      // 1. Ambil token dari Cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('admin_token='))
        ?.split('=')[1];

      const formData = new FormData();
      formData.append("tagline", slide.tagline);
      formData.append("title", slide.title);
      formData.append("highlightWord", slide.highlightWord);
      formData.append("description", slide.description);
      formData.append("isActive", newStatus ? "true" : "false");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sliders/${slide.id}`, {
        method: "POST", // POST for update
        body: formData,
        headers: { 
          "Accept": "application/json",
          // 2. Selipin token ke Header
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        fetchSliders(); // Revert kalau gagal
        alert("Gagal merubah status slide.");
      }
    } catch (error) {
      console.error(error);
      fetchSliders(); // Revert kalau gagal
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`${marcellus.className} text-3xl font-bold text-[#1B120B] mb-1`}>
            Hero Slider Utama
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Kelola banner carousel yang tampil paling atas di halaman beranda.
          </p>
        </div>
        
        <button 
          onClick={() => { setEditingSlider(null); setIsModalOpen(true); }}
          className="bg-[#1B120B] hover:bg-[#5C0A2E] text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-[#1B120B]/10 flex items-center justify-center gap-2 shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Tambah Slide Baru
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
           <svg className="animate-spin h-8 w-8 text-[#C6952F]" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
        </div>
      ) : sliders.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
           <p className="text-gray-500">Belum ada slide banner yang ditambahkan.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sliders.map((slide, index) => (
            <div key={slide.id} className={`flex flex-col lg:flex-row bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all ${!slide.isActive && 'opacity-60 grayscale-[30%]'}`}>
              
              {/* Visual Preview */}
              <div className="lg:w-2/5 relative min-h-[250px] bg-[#2a1a21] flex items-center justify-center p-6 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('/images/pattern.png')] bg-cover mix-blend-overlay"></div>
                
                <div className="relative z-10 w-full text-center lg:text-left flex flex-col items-center lg:items-start">
                  <div className="inline-flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#C6952F]" />
                    <span className="text-[#C6952F] font-semibold text-[10px] tracking-[0.2em] uppercase">
                      {slide.tagline}
                    </span>
                  </div>
                  <h3 className={`${marcellus.className} text-white text-3xl mb-4 leading-tight`}>
                    {slide.title} <br className="hidden lg:block"/>
                    <span className="text-[#C6952F]">{slide.highlightWord}</span>
                  </h3>
                  <button className="bg-[#C6952F] text-[#1B120B] text-xs font-bold px-4 py-2 rounded-full shrink-0">
                    {slide.buttonText} &rarr;
                  </button>
                </div>

                <div className="absolute right-[-20%] top-[-10%] h-[120%] w-1/2 bg-white/10 rounded-l-full overflow-hidden border-l border-white/20 blur-[1px]">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src={slide.image} alt="Preview" className="w-full h-full object-cover opacity-60" />
                </div>
              </div>

              {/* Info & Action Controls */}
              <div className="lg:w-3/5 p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-400">Slide Order #{index + 1}</span>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${slide.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {slide.isActive ? 'AKTIF' : 'DRAFT'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{slide.description}</p>
                  <div className="mt-4 flex gap-4 text-xs font-medium text-gray-500">
                    <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg> {slide.buttonLink}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                  <button onClick={() => handleToggleStatus(slide)} className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    {slide.isActive ? 'Sembunyikan' : 'Tampilkan'}
                  </button>
                  <button onClick={() => { setEditingSlider(slide); setIsModalOpen(true); }} className="px-4 py-2 text-xs font-bold text-[#C6952F] bg-[#F6EFDF] hover:bg-[#e8dec7] rounded-lg transition-colors">
                    Edit Data
                  </button>
                  <button onClick={() => handleDelete(slide.id)} className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <HeroSliderModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchSliders} 
        initialData={editingSlider} 
      />

    </div>
  );
}