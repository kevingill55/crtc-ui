import { PublicPage } from "./components/PublicPage";
import { Carousel } from "./components/Carousel";
import Link from "next/link";

const slides = [
  { src: "/CRTC_uppercourts.jpg", alt: "Upper courts at CRTC" },
  { src: "/CRTC_trees.jpg", alt: "Trees at CRTC" },
  { src: "/CRTC_lowercourts.jpg", alt: "Lower courts at CRTC" },
];

export default function Welcome() {
  return (
    <PublicPage>
      <div className="py-10 px-4 flex flex-col justify-center gap-4 md:items-center">
        <h1 className="text-primary text-5xl md:font-semibold md:tracking-tight">
          Charles River Tennis Club
        </h1>

        <div className="text-zinc-600 w-4/5 text-lg mb-4 md:text-center">
          A friendly clay tennis club located in a wooded, residential area near
          the Charles River. Open to the community in Medway, Massachusetts
          since 1952.
        </div>

        <div className="w-full">
          <Carousel slides={slides} />
        </div>

        <div className="w-full gap-4 flex h-[600px]">
          <div className="w-full bg-blue-100 flex-col flex justify-between p-8">
            <div>
              <div className="pb-2 mb-4 border-b border-gray-400">
                <h2 className="text-primary text-3xl md:tracking-tight">
                  Why we love it here
                </h2>
              </div>
              <div className="flex  flex-col gap-2">
                <div>
                  <span className="text-classic-tennis text-sm font-bold">
                    Clay courts
                  </span>
                  <p className="leading-5 mt-1 text-gray-700">
                    On clay, points and games are not won by power and speed
                    alone and there are more frequent, longer rallies. The clay
                    surface helps players learn how to build their points by
                    working the angles and using the entirety of the court.
                    Moving on clay is less strenuous on the body and reduces
                    risk of injury — it is very enjoyable surface to play on!
                  </p>
                </div>
                <div>
                  <span className="text-classic-tennis text-sm font-bold">
                    {`Environment & ambiance`}
                  </span>
                  <p className="leading-5 mt-1 text-gray-700">
                    The club sits in a wooded, residential neighborhood in
                    Medway, Massachusetts — park-like and quiet, with shaded
                    areas and cooler court temperatures. <br /> Additionally,
                    shoes and balls hold up longer and there is plenty of
                    seating for spectators to take in the entertainment.
                  </p>
                </div>
                <div>
                  <span className="text-classic-tennis text-sm font-bold">
                    {`History & values`}
                  </span>
                  <p className="leading-5 mt-1 text-gray-700">
                    Charles River Tennis Club is operated on a not-for-profit
                    basis and is solely managed by members. The club strives to
                    provide low-cost access to high-quality tennis in a
                    friendly, peaceful atmosphere.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Link
                className="text-sm hover:text-blue-300 underline hover:cursor-pointer text-blue-500"
                href={"/public/about"}
              >
                Learn more
              </Link>
            </div>
          </div>
          <div className="w-full flex-col flex justify-between bg-zinc-200 p-8">
            <div>
              <div className="pb-2 mb-4 border-b border-gray-400">
                <h2 className="text-primary text-3xl md:tracking-tight">
                  Membership benefits
                </h2>
              </div>
              <div className="flex flex-col gap-2">
                <div>
                  <span className="text-amber-600 text-sm font-bold">
                    Leagues
                  </span>
                  <p className="leading-5 mt-1 text-gray-700">
                    We offer fun, competitive play for adult singles, doubles
                    and mixed doubles leagues at no additional cost.
                  </p>
                </div>
                <div>
                  <span className="text-amber-600 text-sm font-bold">
                    {`Court time`}
                  </span>
                  <p className="leading-5 mt-1 text-gray-700">
                    Open daily from 8:30am–10:00pm, mid-April through late
                    October, with evening play under the lights on 2 courts and
                    unrestricted reservations available up to a week in advance.
                  </p>
                </div>
                <div>
                  <span className="text-amber-600 text-sm font-bold">
                    Social events
                  </span>
                  <p className="leading-5 mt-1 text-gray-700">
                    Throughout the season there are social events (Memorial Day,
                    Fourth of July, Wimbledon Whites, Halloween, and more) with
                    a club house, gas grills, and a gazebo for hanging out after
                    a match.
                  </p>
                </div>
                <div>
                  <span className="text-amber-600 text-sm font-bold">
                    Open tennis
                  </span>
                  <p className="leading-5 mt-1 text-gray-700">
                    Every week the club facilitates drop-in tennis on Tuesday,
                    Thursday, Saturday and Sunday mornings for all levels.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Link
                className="text-sm underline hover:text-blue-300 hover:cursor-pointer text-blue-500"
                href={"/public/membership-info"}
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicPage>
  );
}
