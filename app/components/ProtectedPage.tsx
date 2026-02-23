import { PropsWithChildren, Suspense } from "react";
import { useProtectedRoute } from "../hooks/useProtectedRoute";
import { Loading } from "./Loading";
import MemberNavbar from "./MemberNavbar";

const ProtectedPage = ({
  title,
  subtitle,
  isAdmin,
  children,
}: PropsWithChildren<{
  title?: string;
  subtitle?: string;
  isAdmin?: boolean;
}>) => {
  const { loading, error, user } = useProtectedRoute({
    isAdmin: isAdmin || false,
  });

  if (loading) {
    return <Loading />;
  }

  // TODO: Build error screen
  if (error || !user) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <main className="h-full min-w-full text-primary">
        <div className="fixed inset-0 -z-10 h-full w-full bg-gray-100 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px]"></div>
        <MemberNavbar />
        <div className="w-full flex justify-center">
          <div className="min-w-[600px] max-w-[1200px] px-8 w-full">
            {title && (
              <div className="pb-2 mb-4 w-full border-b border-zinc-300">
                <h1 className="text-2xl">{title}</h1>
                {subtitle && <p className="text-zinc-600">{subtitle}</p>}
              </div>
            )}
            {children}
          </div>
        </div>
      </main>
    </Suspense>
  );
};

export default ProtectedPage;
