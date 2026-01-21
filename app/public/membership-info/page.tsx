import Navbar from "../../components/Navbar";

export default function MembershipInfo() {
  return (
    <main className="h-full min-w-full text-main">
      <Navbar />
      <div className="w-full h-3/4 px-36">
        <div className="bg-linear-to-r rounded-2xl from-blue-100 via-zinc-100 to-blue-100 h-full">
          <div className="py-20 flex flex-col h-full justify-center gap-3 items-center">
            <h1 className="text-primary text-center text-5xl font-semibold tracking-tighter">
              Website under construction
            </h1>
            <p className="text-gray-600">
              This page is under active development and will be ready soon!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
