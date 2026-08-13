"use client";

import { useState, useEffect } from "react";
import { Marcellus } from "next/font/google";
import PartnerModal, { PartnerType } from "./_components/PartnerModal";

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export default function PartnersManagePage() {
  const [partners, setPartners] = useState<PartnerType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerType | null>(null);

  // Ambil data dari API
  const fetchPartners = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partners`);
      const result = await response.json();
      if (result.success) {
        setPartners(result.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data mitra:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // Handler: Toggle On/Off Status
  const handleToggleStatus = async (partner: PartnerType) => {
    const newStatus = partner.status === "active" ? "inactive" : "active";
    
    // Optimistic UI Update biar kerasa cepat
    setPartners(prev => prev.map(p => p.id === partner.id ? { ...p, status: newStatus } : p));

    try {
      // 1. Ambil token dari Cookies
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('admin_token='))
        ?.split('=')[1];

      const formData = new FormData();
      formData.append("status", newStatus);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partners/${partner.id}`, {
        method: "POST", // Pakai POST ke endpoint update
        body: formData,
        headers: { 
          "Accept": "application/json",
          // 2. Selipin token ke Header
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // Kalau gagal, revert statenya
        fetchPartners();
        alert("Gagal merubah status mitra.");
      }
    } catch (error) {
      console.error(error);
      fetchPartners(); // Revert on error
    }
  };

  // Handler: Delete Partner
  const handleDelete = async (id: number) => {
    if (window.confirm("Yakin ingin menghapus logo mitra ini secara permanen?")) {
      try {
        // 1. Ambil token dari Cookies
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('admin_token='))
          ?.split('=')[1];

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/partners/${id}`, {
          method: "DELETE",
          headers: { 
            "Accept": "application/json",
            // 2. Selipin token ke Header
            "Authorization": `Bearer ${token}`
          }
        });

        const result = await response.json();
        if (response.ok && result.success) {
          setPartners(prev => prev.filter(partner => partner.id !== id));
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
    <div className="space-y-6 animate-fade-in-up pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`${marcellus.className} text-3xl font-bold text-[#1B120B] mb-1`}>
            Mitra Perjalanan
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Kelola logo maskapai dan fasilitas premium yang tampil di halaman depan.
          </p>
        </div>
        
        <button 
          onClick={() => { setEditingPartner(null); setIsModalOpen(true); }}
          className="bg-[#1B120B] hover:bg-[#5C0A2E] text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-[#1B120B]/10 flex items-center justify-center gap-2 shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Tambah Logo Mitra
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
           <svg className="animate-spin h-8 w-8 text-[#C6952F]" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
           <p className="text-gray-500">Belum ada logo mitra yang ditambahkan.</p>
        </div>
      ) : (
        /* Grid Layout untuk Daftar Logo */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {partners.map((partner) => (
            <div key={partner.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all">
              
              {/* Area Preview Logo */}
              <div className={`h-32 relative flex items-center justify-center p-4 border-b border-gray-50 transition-colors ${partner.status === 'active' ? 'bg-[#F6EFDF]/30' : 'bg-gray-100'}`}>
                <div className={`relative w-full h-full transition-all duration-300 ${partner.status === 'active' ? 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100' : 'grayscale opacity-30'}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={partner.image_url} alt={partner.name} className="w-full h-full object-contain" />
                </div>
                
                {/* Overlay Action Buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                  <button onClick={() => { setEditingPartner(partner); setIsModalOpen(true); }} className="w-8 h-8 rounded-full bg-white text-[#C6952F] flex items-center justify-center hover:scale-110 transition-transform" title="Edit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(partner.id)} className="w-8 h-8 rounded-full bg-white text-red-500 flex items-center justify-center hover:scale-110 transition-transform" title="Hapus">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>

              {/* Info Keterangan Bawah */}
              <div className="p-4 flex items-center justify-between bg-white">
                <p className="text-sm font-bold text-[#1B120B] truncate pr-2" title={partner.name}>
                  {partner.name}
                </p>
                
                {/* Toggle Switch */}
                <button 
                  onClick={() => handleToggleStatus(partner)}
                  title={partner.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                  className={`w-10 h-5 rounded-full relative shrink-0 transition-colors ${partner.status === 'active' ? 'bg-[#5C0A2E]' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-[2px] left-[2px] bg-white w-4 h-4 rounded-full transition-transform ${partner.status === 'active' ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PartnerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchPartners} 
        initialData={editingPartner} 
      />

    </div>
  );
}