/* eslint-disable react/no-unescaped-entities */
import { PublicPage } from "@/app/components/PublicPage";

export default function MembershipInfo() {
  return (
    <PublicPage>
      <div className="w-full h-full mb-12">
        <div className="pb-2 mb-4 w-full border-b border-zinc-300">
          <h1 className="text-3xl">Membership Information</h1>
        </div>
        <div>
          <h2 className="text-primary text-2xl font-bold">Joining the Club</h2>
          <div className="flex flex-col gap-4 py-4 text-main">
            <p>
              First time members, please review the{" "}
              <a className="text-blue-500 hover:cursor-pointer">Wait List</a>{" "}
              policy.
            </p>
            <p>
              Previous members in good standing from the prior year have first
              option to sign up for a new season by March 15th, 2026.
            </p>
            <p>
              Mid-season memberships are available at half price for new (first
              time) members starting July 15th.
            </p>
            <p>
              Membership rates are set for the coming season by the Officers &
              Board Members each February. The rates for 2026 will be:
            </p>

            <table className="w-3/4">
              <thead className="bg-stone-200 h-10 border border-stone-200 border-b-0">
                <tr>
                  <th>Plan type</th>
                  <th>Renew by 3/15/2026</th>
                  <th>After 3/15/2026</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-stone-100 border border-stone-200 text-center h-10">
                  <td>Adult</td>
                  <td>$385</td>
                  <td>$410</td>
                </tr>
                <tr className="bg-stone-100 border border-stone-200 border-t-0 text-center h-10">
                  <td>Junior</td>
                  <td>$175</td>
                  <td>$175</td>
                </tr>
              </tbody>
            </table>

            <p>
              The indicated rate schedule is applicable to membership
              applications received or postmarked by March 15th, 2026. After
              that date, fees will increase. Half-season memberships, at
              half-rates, are available starting July 15th, but only for
              applicants who are joining the club for the first time.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <h2 className="text-primary text-2xl font-bold">CRTC Leagues</h2>
          <div className="flex flex-col gap-4 py-4 text-main">
            <div>
              <p>
                CRTC organizes various singles and doubles leagues, wrapping up
                with playoffs in the early Fall. Leagues offered include:
              </p>
              <ul className="mt-2 list-disc pl-10">
                <li>{`Men's Singles Ladder`}</li>
                <li>{`Women's Singles Ladder`}</li>
                <li>{`Men's Doubles`}</li>
                <li>{`Women's Doubles`}</li>
                <li>{`Mixed Doubles`}</li>
              </ul>
            </div>
            <div>
              <p>
                Leagues typically run during the summer months (June-August)
                with post season playoffs in September-October.
              </p>
              <ul className="mt-2 list-disc pl-10">
                <li>{`No additional fee for leagues`}</li>
                <li>{`Communication regarding sign-up, rules and relevant detail will be emailed`}</li>
              </ul>
            </div>
            <p>
              League registration is handled via the website from the Member's
              Area page. Here are the{" "}
              <a className="hover:cursor-pointer text-blue-500">
                League Rules and Regulations.
              </a>
            </p>
          </div>
        </div>
      </div>
    </PublicPage>
  );
}
