import { PublicPage } from "@/app/components/PublicPage";
import { PublicPageLayout, PublicSection } from "@/app/components/PublicPageLayout";

export default function Directions() {
  return (
    <PublicPage>
      <PublicPageLayout title="Directions & Parking">
        <PublicSection title="Directions">
          <div className="flex flex-col gap-4 md:w-2/3 w-4/5">
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
        </PublicSection>

        <PublicSection title="Parking">
          <div className="flex flex-col gap-2">
            <p>Please park in one of the following areas:</p>
            <ul className="pl-8 list-disc space-y-2">
              <li>
                Along the fence line next to the lower courts (Charles River Rd
                side or Massapoag St side)
              </li>
              <li>
                Along the backside of the lower courts all the way up to the
                upper courts in the grass on Cherokee Lane (park perpendicular
                just off the road as the club abuts private property).
              </li>
              <li>
                Along the fence or in the small gravel lot next to the courts on
                Massapoag St (upper courts)
              </li>
            </ul>
          </div>
        </PublicSection>
      </PublicPageLayout>
    </PublicPage>
  );
}
