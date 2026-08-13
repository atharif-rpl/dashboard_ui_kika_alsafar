import { redirect } from "next/navigation";

export default function RootPage() {
  // Otomatis mengarahkan user ke halaman login saat membuka root url (/)
  redirect("/auth/login");
}