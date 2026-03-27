import { Outlet } from "react-router";
import { DossiersContext, useDossiersProvider } from "~/hooks/useDossiers";
import { Sidebar } from "~/components/Sidebar";

export default function AppLayout() {
  const dossiersState = useDossiersProvider();

  return (
    <DossiersContext.Provider value={dossiersState}>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </DossiersContext.Provider>
  );
}
