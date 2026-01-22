import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full px-3 py-4 sm:px-4 sm:py-6 md:container md:mx-auto md:py-8">{children}</main>
    </div>
  );
}
