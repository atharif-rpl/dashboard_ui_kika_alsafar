"use client";

import { useState, useEffect } from "react";
import { Marcellus } from "next/font/google";
import TestimonialModal, { TestimonialType } from "./_components/TestimonialModal";

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export default function TestimonialsManagePage() {
  const [testimonials, setTestimonials] = useState<TestimonialType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<TestimonialType | null>(null);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/testimonials`);
      const result = await response.json();
      
      if (result.success && result.data) {
        // FIX 1: Format URL gambar di sini agar selalu valid & absolute
        const formattedData = result.data.map((item: any) => {
          const rawImg = item.image_url || item.image || item.avatar || null;
          let finalImg = null;

          if (rawImg) {
            finalImg = rawImg.startsWith('http') 
              ? rawImg 
              : `${process.env.NEXT_PUBLIC_API_URL}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
          }

          return {
            ...item,
            image_url: finalImg
          };
        });

        setTestimonials(formattedData);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Yakin ingin menghapus ulasan ini?")) {
      try {
        const token = document.cookie.split('; ').find(row => row.startsWith('admin_token='))?.split('=')[1];
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/testimonials/${id}`, {
          method: "DELETE",
          headers: { 
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          setTestimonials(prev => prev.filter(item => item.id !== id));
        } else {
          alert("Gagal menghapus data.");
        }
      } catch (error) {
        alert("Gagal terhubung ke server.");
      }
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <svg key={idx} className={`w-4 h-4 ${idx < rating ? 'text-[#C6952F]' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`${marcellus.className} text-3xl font-bold text-[#1B120B] mb-1`}>
            Testimoni Jemaah
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Kelola ulasan dan pengalaman jemaah untuk ditampilkan di beranda.
          </p>
        </div>
        
        <button 
          onClick={() => { setEditingData(null); setIsModalOpen(true); }}
          className="bg-[#1B120B] hover:bg-[#5C0A2E] text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-[#1B120B]/10 flex items-center justify-center gap-2 shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Tambah Testimoni
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
           <svg className="animate-spin h-8 w-8 text-[#C6952F]" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
           <p className="text-gray-500">Belum ada testimoni yang ditambahkan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {testimonials.map((item) => (
            <div key={item.id} className={`bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col relative group transition-all overflow-hidden ${item.is_active === false ? 'opacity-60' : ''}`}>
              
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => { setEditingData(item); setIsModalOpen(true); }} className="w-8 h-8 rounded-full bg-white shadow-md text-[#C6952F] flex items-center justify-center hover:scale-110">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-full bg-white shadow-md text-red-500 flex items-center justify-center hover:scale-110">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

              <div className="h-48 w-full bg-gray-50 relative shrink-0">
                {/* FIX 2: Cek apakah image_url beneran ada dan valid */}
                {item.image_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      // Fallback jika URL gambarnya 404/rusak di server
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <div className="flex gap-1">
                    {renderStars(item.rating)}
                  </div>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1 bg-white">
                <p className="text-sm text-gray-600 italic flex-1 mb-4 line-clamp-4 leading-relaxed">&ldquo;{item.review}&rdquo;</p>
                
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-[15px] font-bold text-[#1B120B] truncate">{item.name}</h4>
                  {item.package_name && <p className="text-[11px] font-bold text-[#C6952F] uppercase tracking-wider mt-1 truncate">{item.package_name}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <TestimonialModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTestimonials} 
        initialData={editingData} 
      />

    </div>
  );
}