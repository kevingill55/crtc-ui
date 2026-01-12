import Image from "next/image";
import Navbar from "./components/Navbar";

export default function Welcome() {
  return (
    <main className="h-full min-w-full text-primary">
      <Navbar />
      <div className="w-full h-3/4 px-36">
        <div className="bg-linear-to-r rounded-2xl from-blue-100 via-zinc-100 to-blue-100 h-full">
          <div className="py-20 flex flex-col justify-center gap-3 items-center">
            <h1 className="text-primary text-center text-5xl font-semibold tracking-tighter">
              Charles River Tennis Club
            </h1>
            <div className="text-gray-600 w-2/5 text-md text-center">
              A friendly clay tennis club located in a wooded, residential area
              near the Charles River. Open to the community in Medway,
              Massachusetts since 1952.
            </div>
            <div className="h-full w-full flex justify-center items-center mt-10">
              <Image
                src="/CRTC_lowercourts.jpg"
                alt="Lower courts at CRTC"
                width={800}
                height={500}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
