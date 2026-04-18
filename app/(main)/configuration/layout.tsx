import ConfigSidebar from "@/components/configuration/ConfigSidebar";

export default function ConfigurationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex min-h-0">
      <ConfigSidebar />
      <div className="flex-1 min-w-0 overflow-auto">{children}</div>
    </div>
  );
}
