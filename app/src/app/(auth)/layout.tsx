export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[#F6F7F8] dark:bg-[#0A0B0D] px-4 py-12">
      {children}
    </div>
  );
}
