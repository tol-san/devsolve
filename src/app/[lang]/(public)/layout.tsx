import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageBackdrop from "@/components/layout/PageBackdrop";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <PageBackdrop seed={0} />
      <Navbar />
      <main className="flex-1 pt-(--navbar-height)">{children}</main>
      <Footer />
    </div>
  );
}
