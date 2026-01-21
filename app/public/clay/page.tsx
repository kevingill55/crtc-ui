import { PublicPage } from "@/app/components/PublicPage";

export default function Clay() {
  return (
    <PublicPage>
      <div className="p-24 mt-24 flex flex-col h-full bg-linear-to-r from-amber-50 via bg-blue-50 to-blue-100 justify-center gap-3 items-center">
        <h1 className="text-primary tracking-tight text-center text-5xl font-semibold">
          Website under construction
        </h1>
        <p className="text-gray-600">
          This page is under active development and will be ready soon!
        </p>
      </div>
    </PublicPage>
  );
}
