import SidebarWrapper from "../components/SidebarWrapper";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // layout.tsx sekarang murni membungkus konten dengan SidebarWrapper
  return <SidebarWrapper>{children}</SidebarWrapper>;
}