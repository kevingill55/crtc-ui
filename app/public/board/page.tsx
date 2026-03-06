import { PublicPage } from "@/app/components/PublicPage";

export default function Board() {
  return (
    <PublicPage>
      <div className="w-full h-full mb-12">
        <div className="pb-2 mb-4 w-full border-b border-zinc-300">
          <h1 className="text-3xl">Officers & Board</h1>
        </div>
        <div>
          <h2 className="text-primary text-2xl font-bold">Officers</h2>
          <div className="flex flex-col gap-3 py-4 text-main w-2/5">
            <div className="flex justify-between items-center">
              <p>President</p>
              <p className="font-bold">Cindy Gill</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Vice President</p>
              <p className="font-bold">Craig Brooke</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Secretary</p>
              <p className="font-bold">Alex Stalley</p>
            </div>
            <div className="flex justify-between items-center">
              <p>Treasurer</p>
              <p className="font-bold">Tricia Clist</p>
            </div>
          </div>
        </div>
        <div className="my-4">
          <h2 className="text-primary text-2xl font-bold">
            Board of Directors
          </h2>
          <div className="flex flex-col gap-4 py-4 text-main">
            <ul className="list-disc space-y-1 pl-8">
              <li>Janna Joyce</li>
              <li>Phil Balkus</li>
              <li>Jeff Love</li>
              <li>Maria Tagliaferro</li>
              <li>Audrey Desimone</li>
              <li>Jon Feigenbaum</li>
            </ul>
          </div>
        </div>
        <div>
          <h2 className="text-primary text-2xl font-bold">Club Bylaws</h2>
          <div className="flex flex-col gap-4 py-4 text-main">
            <p>
              <a className="text-blue-500 hover:cursor-pointer">Club bylaws</a>
            </p>
          </div>
        </div>
      </div>
    </PublicPage>
  );
}
