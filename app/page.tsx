import Image from "next/image";
import { PublicPage } from "./components/PublicPage";

export default function Welcome() {
  return (
    <PublicPage>
      <div className="py-20 px-4 flex flex-col justify-center gap-4 md:items-center">
        <h1 className="text-primary text-5xl md:font-semibold md:tracking-tight">
          Charles River Tennis Club
        </h1>
        <div className="text-zinc-500 w-9/10 text-md mt-2 md:text-center">
          A friendly clay tennis club located in a wooded, residential area near
          the Charles River. Open to the community in Medway, Massachusetts
          since 1952.
        </div>

        <div className="h-full md:w-full w-9/10 md:flex hidden justify-center items-center my-6">
          <Image
            src="/CRTC_lowercourts.jpg"
            alt="Lower courts at CRTC"
            width={800}
            height={500}
          />
        </div>
      </div>
    </PublicPage>
  );
}
