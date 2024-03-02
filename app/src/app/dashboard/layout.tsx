export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <main className="flex w-full flex-1 flex-col items-center justify-center px-20">
        <div>"hree will be a sidebar and a header here in the future."</div>
        {children}
      </main>
    </div>
  );
}
