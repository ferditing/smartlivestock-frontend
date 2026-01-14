import Sidebar from "./Sidebar";

export default function Layout({
  role,
  children,
}: {
  role: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar role={role} />
      <main className="flex-1 bg-gray-100 p-6">{children}</main>
    </div>
  );
}
