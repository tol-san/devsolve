export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-16">
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">{children}</div>
    </div>
  );
}