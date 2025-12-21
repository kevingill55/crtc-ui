import Navbar from "../components/Navbar";

export default function MembershipInfo() {
  return (
    <main className="h-full min-w-full text-main">
      <Navbar />
      <div className="w-full md:gap-12 gap-4 md:px-14 px-4 md:py-10 py-4 flex flex-wrap justify-center">
        <div className="bg-gray-50 shadow-sm rounded-lg md:px-12 p-4 flex justify-center flex-col md:py-8 md:min-w-[550px] max-w-[750px]">
          <h1 className="text-primary text-xl font-[600] font-heading">
            Becoming a <span className="text-classic-tennis">member</span>
          </h1>
          <div className="border-[0.5px] border-gray-200 mt-4" />

          <ul className="text-sm pl-4 list-disc pt-6 space-y-4">
            <li>
              First time members, please review the{" "}
              <span className="text-secondary underline hover:cursor-pointer">
                wait list
              </span>{" "}
              policy.
            </li>
            <li>
              Previous members in good standing from the prior year have first
              option to sign up for a new season by March 15th, 2025 .
            </li>
            <li>
              Starting July 15th, mid-season memberships are available{" "}
              <span className="font-bold text-classic-tennis">
                to new members
              </span>{" "}
              at half price.
            </li>
            <li>
              Membership rates are set for the coming season by the Officers &
              Board Members each February. The rates for 2025 will be:
              <div className="w-full py-4 px-4">
                <table className="w-full">
                  <thead>
                    <tr className="bg-blue-100 text-primary font-bold">
                      <td className="p-4">Plan type</td>
                      <td className="p-4">Before March 15th, 2025</td>
                      <td className="p-4">After March 15th, 2025</td>
                    </tr>
                  </thead>
                  <tbody className="bg-blue-50 text-main">
                    <tr>
                      <td className="p-4">
                        <span className="underline">Adult</span>
                      </td>
                      <td className="p-4">$385</td>
                      <td className="p-4">$410</td>
                    </tr>
                    <tr>
                      <td className="p-4">
                        <span className="underline">Senior</span> <br />
                        <span className="text-xs no-underline">
                          65 and over by May 1st
                        </span>
                      </td>
                      <td className="p-4">$385</td>
                      <td className="p-4">$410</td>
                    </tr>
                    <tr>
                      <td className="p-4">
                        <span className="underline">Junior</span> <br />
                        <span className="text-xs no-underline">
                          18 and under by May 1st
                        </span>
                      </td>
                      <td className="p-4">$175</td>
                      <td className="p-4">$175</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </li>
            <li>
              The indicated rate schedule is applicable to membership
              applications received or postmarked March 15th, 2025. After that
              date, fees will increase. Half-season memberships, at half-rates,
              are available starting July 15th, but only for applicants who are
              joining the club for the first time.
            </li>
            <li>
              All applicants are welcome, without regard to race, gender, age,
              or other forms of social classification.
            </li>
          </ul>
          <div className="mt-4">
            <p className="hover:cursor-pointer text-sm text-secondary pt-4 underline">
              Membership renewal form
            </p>
            <p className="hover:cursor-pointer text-sm text-secondary pt-4 underline">
              New member application
            </p>
          </div>
        </div>
        <div className="bg-gray-50 shadow-sm rounded-lg md:px-12 flex flex-col p-4 md:py-8 md:min-w-[550px] max-w-[750px] text-main">
          <h1 className="text-primary text-xl font-[600] font-heading">
            <span className="text-classic-tennis">Leagues</span> at CRTC
          </h1>
          <div className="border-[0.5px] border-gray-200 mt-4" />
          <p className="text-sm mt-6">
            CRTC organizes a variety of singles and doubles leagues, wrapping up
            with playoffs in the early fall. Leagues offered include:
          </p>
          <ul className="pl-6 text-sm list-disc pt-4 space-y-2">
            <li>{`Men's singles ladder`}</li>
            <li>{`Men's doubles`}</li>
            <li>{`Women's singles ladder`}</li>
            <li>{`Women's doubles`}</li>
            <li>{`Mixed doubles`}</li>
          </ul>
          <p className="text-sm mt-4">
            Leagues typically run during the summer months, June-August, with
            post-season playoffs concluding around September-October.
          </p>
          <ul className="pl-6 text-sm list-disc pt-4 space-y-2">
            <li>{`No additional fee for leagues`}</li>
            <li>{`Communication regarding sign-up, rules and relevant detail will be emailed`}</li>
            <li>{`League registration is all handled via the website.`}</li>
          </ul>
          <p className="hover:cursor-pointer text-sm text-secondary pt-6 underline">
            League Rules and Regulations
          </p>
          <p className="hover:cursor-pointer text-sm text-secondary pt-4 underline">
            Court Conduct and Rules
          </p>
          <p className="hover:cursor-pointer text-sm text-secondary pt-4 underline">
            Officers, Board Members, and Club By-laws
          </p>
        </div>
      </div>
    </main>
  );
}
