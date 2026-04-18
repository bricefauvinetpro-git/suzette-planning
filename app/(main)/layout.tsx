import { EstablishmentProvider } from "@/lib/establishment-context";
import AppHeader from "@/components/AppHeader";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <EstablishmentProvider>
      <AppHeader />
      {children}
    </EstablishmentProvider>
  );
}
