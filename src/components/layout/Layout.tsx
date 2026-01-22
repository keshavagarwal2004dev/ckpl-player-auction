import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 w-full px-3 py-4 sm:px-4 sm:py-6 md:container md:mx-auto md:py-8">{children}</main>
      <Footer />
    </div>
  );
}
