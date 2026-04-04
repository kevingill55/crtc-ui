import { PropsWithChildren } from "react";

export function PublicPageLayout({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <div className="w-full mb-12 md:p-0 p-4">
      <div className="pb-2 mb-4 w-full border-b border-zinc-300">
        <h1 className="md:text-3xl text-xl">{title}</h1>
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  );
}

export function PublicSection({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <div>
      <h2 className="text-primary md:text-2xl text-lg font-bold mb-3">
        {title}
      </h2>
      <div className="flex flex-col gap-4 text-main">{children}</div>
    </div>
  );
}
