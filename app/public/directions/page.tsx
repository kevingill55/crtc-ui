import { PublicPage } from "@/app/components/PublicPage";

export default function Clay() {
  return (
    <PublicPage>
      <div className="w-full h-full mb-12">
        <div className="pb-2 mb-4 w-full border-b border-zinc-300">
          <h1 className="text-3xl">Directions & Parking</h1>
        </div>
        <div>
          <h2 className="text-primary text-2xl font-bold">Directions</h2>
          <div className="flex flex-col gap-4 py-4 text-main w-2/3">
            <div className="flex justify-between">
              <p>Physical address</p>
              <p>11 Massasoit Street, Medway, MA 02053</p>
            </div>
            <div className="flex justify-between">
              <p>Mailing address</p>
              <div>
                <p>Charles River Tennis Club</p>
                <p>P.O. Box 77</p>
                <p>Medway, MA 02053</p>
                <p>Email: info@charlesrivertennisclub.com</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <h2 className="text-primary text-2xl font-bold">Parking</h2>
          <div className="flex flex-col gap-4 py-4 text-main">
            <div className="flex flex-col gap-2">
              <p>Please park in one of the following areas:</p>
              <ul className="pl-8 list-disc space-y-2">
                <li>
                  Along the fence line next to the lower courts (Charles River
                  Rd side or Massapoag St side)
                </li>
                <li>
                  Along the backside of the lower courts all the way up to the
                  upper courts in the grass on Cherokee Lane (park perpendicular
                  just off the road as the club abuts private property).
                </li>
                <li>
                  Along the fence or in the small gravel lot next to the courts
                  on Massapoag St (upper courts)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PublicPage>
  );
}
