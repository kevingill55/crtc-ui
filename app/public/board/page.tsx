import { PublicPage } from "@/app/components/PublicPage";
import { PublicPageLayout, PublicSection } from "@/app/components/PublicPageLayout";

export default function Board() {
  return (
    <PublicPage>
      <PublicPageLayout title="Officers & Board">
        <PublicSection title="Officers">
          <div className="flex flex-col gap-3 md:w-2/5 w-2/3">
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
        </PublicSection>

        <PublicSection title="Board of Directors">
          <ul className="list-disc space-y-1 pl-8">
            <li>Janna Joyce</li>
            <li>Phil Balkus</li>
            <li>Jeff Love</li>
            <li>Maria Tagliaferro</li>
            <li>Audrey Desimone</li>
            <li>Jon Feigenbaum</li>
          </ul>
        </PublicSection>

        <PublicSection title="Club Bylaws">
          <p>
            <a
              href="/CRTC_By_Laws_Nov2020.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:cursor-pointer"
            >
              Club bylaws
            </a>
          </p>
        </PublicSection>
      </PublicPageLayout>
    </PublicPage>
  );
}
