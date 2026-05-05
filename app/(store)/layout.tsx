import Nav from "@/components/store/Nav";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";
import LiveRevalidator from "@/components/realtime/LiveRevalidator";

const storeTables = ["products", "scents", "signatures"] as const;

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-(--warm-white) text-(--charcoal)">
      <LiveRevalidator channel="store-live" tables={storeTables} />
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
