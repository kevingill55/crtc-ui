import Image from "next/image";
import { PublicPage } from "@/app/components/PublicPage";
import {
  PublicPageLayout,
  PublicSection,
} from "@/app/components/PublicPageLayout";

export default function About() {
  return (
    <PublicPage>
      <PublicPageLayout title="Who We Are">
        <p className="text-main">
          We are the members of the Charles River Tennis Club. The membership
          manages, operates, and maintains the club on a not-for-profit basis.
          We encourage you to read on to learn more about this special
          clay-court facility and our unique approach to enjoying tennis.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { src: "/CRTC_about2.jpg", alt: "CRTC club 2" },
            { src: "/CRTC_about3.jpg", alt: "CRTC club 3" },
            { src: "/CRTC_about4.jpg", alt: "CRTC club 4" },
          ].map((img) => (
            <div key={img.src} className="flex-1">
              <Image
                src={img.src}
                alt={img.alt}
                width={400}
                height={300}
                sizes="(max-width: 768px) 50vw, 33vw"
                className="w-full h-full object-cover rounded"
              />
            </div>
          ))}
        </div>
        <PublicSection title="The Club">
          <p>
            CRTC provides play primarily for adults — we offer no lessons and
            have no provisions for child care — on four green clay courts
            located in a wooded, residential area near the Charles River in
            Medway, MA. Two of the courts are lit for evening play. When weather
            permits, the club is open seven days a week from mid-April to
            mid-October, 8:30am to 10:00pm. Smoking is not allowed anywhere on
            the club grounds.
          </p>
          <p>
            Our chief amenity is the venue itself: an attractive, peaceful, and
            sheltered place to play tennis. Other amenities include outdoor
            tables, chairs, a tent shelter, and a small club house with
            restrooms and a few tennis essentials. Courts are maintained by the
            club daily, and all members are expected to sweep the court and
            clean the lines after their session.
          </p>

          <div className="flex gap-4">
            <div className="flex-1">
              <Image
                src="/CRTC_about1.jpg"
                alt="CRTC club 1"
                width={400}
                height={300}
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div className="flex-1">
              <Image
                src="/CRTC_sign.png"
                alt="CRTC sign"
                width={400}
                height={300}
                className="w-full h-full object-cover rounded"
              />
            </div>
          </div>
        </PublicSection>

        <PublicSection title="Play & Activities">
          <p>
            In addition to privately arranged matches, the club runs a variety
            of singles and doubles leagues, occasional weekend tournaments, and
            round-robin play on Tuesdays, Thursdays, and both weekend mornings.
            Saturday and Sunday mornings are intentionally left unscheduled so
            that anyone can show up and get into a match — members do their best
            to get new arrivals into play as quickly as possible.
          </p>
          <p>
            Members also come together at the start and end of the season for
            work parties to open and close the club, and for a family picnic
            toward the end of summer. During the off-season, the club sponsors
            periodic indoor tennis socials to keep things going through the
            winter.
          </p>
        </PublicSection>

        <PublicSection title="Our Approach">
          <p>
            Club membership offers low-cost access to high quality, competitive
            tennis with congenial friends — all in an atmosphere where we
            control our own destiny.
          </p>
        </PublicSection>
      </PublicPageLayout>
    </PublicPage>
  );
}
