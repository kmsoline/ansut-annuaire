import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Navbar from "@/components/Navbar"
import AuthSessionProvider from "@/components/SessionProvider"
import { ToastProviderWrapper } from "@/components/Toast"

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <AuthSessionProvider>
      <ToastProviderWrapper>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
          <Navbar
            userName={session.user?.name}
            userImage={session.user?.image}
            isAdmin={session.user?.role === "admin"}
          />
          <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        </div>
      </ToastProviderWrapper>
    </AuthSessionProvider>
  )
}
