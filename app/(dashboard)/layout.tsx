import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import {
  getCurrentUserProfile,
  getCurrentWorkspace,
  listUserWorkspaces,
} from "@/lib/supabase/workspace";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [workspaces, { workspaceId }, user] = await Promise.all([
    listUserWorkspaces(),
    getCurrentWorkspace(),
    getCurrentUserProfile(),
  ]);

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-background md:block">
        <Sidebar workspaces={workspaces} activeWorkspaceId={workspaceId} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        <Header user={user} workspaces={workspaces} activeWorkspaceId={workspaceId} />
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
