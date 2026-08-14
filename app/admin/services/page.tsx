"use client";

import { useState, useEffect } from "react";
import { Marcellus } from "next/font/google";
import ServiceModal, { ServiceType } from "./_components/ServiceModal";

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export default function ServicesManagePage() {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceType | null>(null);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`);
      const result = await response.json();
      if (result.success) {
        setServices(result.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data layanan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Yakin ingin menghapus layanan ini permanen?")) {
      try {
        // 1. Ambil token dari Cookies
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('admin_token='))
          ?.split('=')[1];

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${id}`, {
          method: "DELETE",
          headers: { 
            "Accept": "application/json",
            // 2. Selipin token ke Header
            "Authorization": `Bearer ${token}`
          }
        });
        const result = await response.json();

        if (response.ok && result.success) {
          setServices(prev => prev.filter(service => service.id !== id));
        } else {
          alert("Gagal menghapus data.");
        }
      } catch (error) {
        alert("Gagal terhubung ke server.");
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`${marcellus.className} text-3xl font-bold text-[#1B120B] mb-1`}>
            Layanan Kami
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Kelola kategori utama layanan (Umroh & Umroh Plus) di halaman depan.
          </p>
        </div>
        
        <button 
          onClick={() => { setEditingService(null); setIsModalOpen(true); }}
          className="bg-[#1B120B] hover:bg-[#5C0A2E] text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-[#1B120B]/10 flex items-center justify-center gap-2 shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Tambah Layanan Baru
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
           <svg className="animate-spin h-8 w-8 text-[#C6952F]" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
           <p className="text-gray-500">Belum ada layanan yang ditambahkan.</p>
        </div>
      ) : (
        /* Grid Layout Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {services.map((service) => (
            <div 
              key={service.id} 
              className={`relative rounded-3xl p-8 border group ${
                service.theme === 'dark' 
                  ? 'bg-gradient-to-br from-[#1a0f14] to-[#4a0825] text-white border-transparent' 
                  : 'bg-[#F6EFDF] text-[#1B120B] border-[#C6952F]/20'
              }`}
            >
              
              {/* Action Buttons Overlay */}
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingService(service); setIsModalOpen(true); }} className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110 ${service.theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white hover:bg-gray-50 text-[#C6952F]'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => handleDelete(service.id)} className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110 ${service.theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-red-400' : 'bg-white hover:bg-gray-50 text-red-500'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

              {service.isPopular && (
                <span className="absolute top-8 right-8 bg-[#C6952F] text-[#1B120B] text-[10px] font-bold px-3 py-1 rounded-full tracking-wider group-hover:opacity-0 transition-opacity">
                  PALING DIMINATI
                </span>
              )}

              <div className="flex items-center gap-3 mb-4 mt-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center ${service.theme === 'dark' ? 'bg-[#2a1a21] text-[#C6952F]' : 'bg-[#eaddce] text-[#5C0A2E]'}`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                </span>
                <h2 className={`${marcellus.className} text-2xl`}>{service.title}</h2>
              </div>
              
              <p className={`text-sm mb-6 ${service.theme === 'dark' ? 'text-white/70' : 'text-[#1B120B]/70'}`}>
                {service.description}
              </p>

              <div className="mb-6 flex items-end gap-2">
                <span className={`text-xs font-bold tracking-widest uppercase ${service.theme === 'dark' ? 'text-white/50' : 'text-[#1B120B]/50'}`}>Mulai Dari</span>
                <span className="text-xl font-medium text-[#C6952F]">{service.startingPrice}</span>
              </div>

              <div className={`border-t pt-6 space-y-3 ${service.theme === 'dark' ? 'border-white/10' : 'border-[#C6952F]/20'}`}>
                {service.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${service.theme === 'dark' ? 'bg-white/10 text-white' : 'bg-[#1B120B]/5 text-[#1B120B]'}`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </span>
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}

      <ServiceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchServices} 
        initialData={editingService} 
      />

    </div>
  );
}