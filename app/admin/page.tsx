"use client";

import { useState, useEffect } from "react";
import { Marcellus } from "next/font/google";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const CHART_COLORS = ['#5C0A2E', '#C6952F', '#801443', '#d4af37', '#1B120B'];

// Custom Tooltip buat Chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100">
        <p className="text-sm font-bold text-gray-800 mb-2 capitalize">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-3 text-xs font-medium">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.payload.fill }}></span>
            <span className="text-gray-500">Total:</span>
            <span className="text-[#1B120B] font-bold">{entry.value} Data</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardHome() {
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk nyimpen data asli dari Laravel
  const [stats, setStats] = useState({
    packages: [],
    services: [],
    galleries: [],
    partners: [],
    sliders: []
  });

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Ambil token kalau rute lu nanti butuh autentikasi
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('admin_token='))
          ?.split('=')[1];

        const headers = {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        };

        // Tembak semua API secara paralel biar cepat
        const [resPkg, resSrv, resGal, resPart, resSld] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages`, { headers }).catch(() => null),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, { headers }).catch(() => null),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/galleries`, { headers }).catch(() => null),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/partners`, { headers }).catch(() => null),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/sliders`, { headers }).catch(() => null),
        ]);

        const dataPkg = resPkg?.ok ? await resPkg.json() : { data: [] };
        const dataSrv = resSrv?.ok ? await resSrv.json() : { data: [] };
        const dataGal = resGal?.ok ? await resGal.json() : { data: [] };
        const dataPart = resPart?.ok ? await resPart.json() : { data: [] };
        const dataSld = resSld?.ok ? await resSld.json() : { data: [] };

        setStats({
          packages: dataPkg.data || [],
          services: dataSrv.data || [],
          galleries: dataGal.data || [],
          partners: dataPart.data || [],
          sliders: dataSld.data || []
        });

      } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // --- OLAH DATA UNTUK GRAFIK ---

  // 1. Olah data kategori Galeri untuk Bar Chart
  const galleryCategoryCounts = stats.galleries.reduce((acc: any, curr: any) => {
    const cat = curr.category || 'Lainnya';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  
  const chartDataGalleries = Object.keys(galleryCategoryCounts).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1), 
    total: galleryCategoryCounts[key]
  }));

  // 2. Olah data Status Mitra untuk Pie Chart
  const activePartners = stats.partners.filter((p: any) => p.status === 'active').length;
  const inactivePartners = stats.partners.length - activePartners;
  const pieDataPartners = [
    { name: 'Aktif', value: activePartners },
    { name: 'Non-Aktif', value: inactivePartners },
  ];

  // 3. Ambil 5 Dokumentasi terbaru untuk Tabel
  const recentGalleries = [...stats.galleries]
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <svg className="animate-spin h-10 w-10 text-[#C6952F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className={`${marcellus.className} text-3xl md:text-4xl font-bold text-[#1B120B] mb-2`}>
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Pantau ringkasan data operasional Web Profile Kika Alsafar.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-bold text-gray-600">Database Tersinkronisasi</span>
        </div>
      </div>

      {/* Baris 1: Kartu Metrik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Paket */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100/50 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#5C0A2E]/5 flex items-center justify-center text-[#5C0A2E] group-hover:scale-110 group-hover:bg-[#5C0A2E]/10 transition-all">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#1B120B] tracking-tight mb-1">{stats.packages.length}</h3>
            <p className="text-sm font-medium text-gray-500">Total Paket Tersedia</p>
          </div>
        </div>

        {/* Card 2: Total Layanan */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100/50 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#C6952F]/10 flex items-center justify-center text-[#C6952F] group-hover:scale-110 group-hover:bg-[#C6952F]/20 transition-all">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </div>
            <span className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-100">
              {stats.services.filter((s:any) => s.isPopular).length} Diminati
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#1B120B] tracking-tight mb-1">{stats.services.length}</h3>
            <p className="text-sm font-medium text-gray-500">Layanan Utama</p>
          </div>
        </div>

        {/* Card 3: Total Galeri */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100/50 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-[#1B120B] tracking-tight mb-1">{stats.galleries.length}</h3>
            <p className="text-sm font-medium text-gray-500">Foto Dokumentasi</p>
          </div>
        </div>

        {/* Card 4: Mitra Premium */}
        <div className="relative bg-gradient-to-br from-[#5C0A2E] to-[#801443] p-6 rounded-3xl shadow-[0_8px_25px_rgba(92,10,46,0.3)] flex flex-col justify-between text-white overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-12 translate-x-10 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full translate-y-10 -translate-x-8 group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10 flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-[#C6952F] border border-white/10">
               <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-4xl font-black text-[#F6EFDF] tracking-tight">{activePartners}</h3>
              <p className="text-sm text-[#C6952F] font-medium pb-1">/ {stats.partners.length}</p>
            </div>
            <p className="text-sm font-medium text-white/70">Mitra Maskapai Aktif</p>
          </div>
        </div>

      </div>

      {/* Baris 2: Area Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Grafik Utama: Distribusi Kategori Galeri */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100/50 lg:col-span-2 flex flex-col">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-[#1B120B]">Distribusi Kategori Dokumentasi</h3>
            <p className="text-xs font-medium text-gray-500 mt-1">Jumlah foto berdasarkan kategori galeri</p>
          </div>
          
          <div className="h-[280px] w-full">
            {chartDataGalleries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataGalleries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} allowDecimals={false} />
                  
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#F6EFDF', opacity: 0.4}} />
                  
                  <Bar dataKey="total" radius={[8, 8, 0, 0]} barSize={40}>
                    {chartDataGalleries.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                Belum ada data galeri untuk ditampilkan.
              </div>
            )}
          </div>
        </div>

        {/* Grafik Sekunder: Status Mitra */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100/50 flex flex-col">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-[#1B120B]">Status Mitra</h3>
            <p className="text-xs font-medium text-gray-500 mt-1">Rasio mitra aktif vs non-aktif</p>
          </div>
          
          <div className="h-[240px] w-full flex-1">
            {stats.partners.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieDataPartners}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieDataPartners.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#C6952F' : '#f1f5f9'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                Belum ada data mitra.
              </div>
            )}
          </div>
          
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#C6952F]"></span>
              <span className="text-xs font-bold text-gray-600">Aktif</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200"></span>
              <span className="text-xs font-bold text-gray-600">Non-Aktif</span>
            </div>
          </div>
        </div>

      </div>

      {/* Baris 3: Tabel Data Terbaru */}
      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100/50 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <div>
            <h3 className="text-lg font-bold text-[#1B120B]">Upload Dokumentasi Terbaru</h3>
            <p className="text-xs font-medium text-gray-500 mt-1">Daftar foto galeri yang baru saja ditambahkan</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {recentGalleries.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100">
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Preview</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Judul Momen</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Kategori</th>
                  <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentGalleries.map((item: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-6">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image_url} alt="img" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-[#1B120B]">{item.title}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
             <div className="p-8 text-center text-sm text-gray-400">
                Belum ada data dokumentasi yang diupload.
             </div>
          )}
        </div>
      </div>

    </div>
  );
}