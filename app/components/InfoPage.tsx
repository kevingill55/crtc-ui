import { PropsWithChildren } from "react";

export const InfoPage = ({
  title,
  children,
}: PropsWithChildren<{ title: string }>) => {
  return (
    <main className="min-h-screen bg-white text-primary">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-bold text-3xl mb-8">{title}</h1>
        <div className="prose prose-sm text-gray-700 leading-relaxed space-y-4">
          {children}
        </div>
      </div>
    </main>
  );
};
