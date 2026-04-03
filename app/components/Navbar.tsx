"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faPeopleGroup,
  faFileLines,
  faArrowRight,
  IconDefinition,
  faBars,
  faMap,
} from "@fortawesome/free-solid-svg-icons";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const NavMenuItem = ({
  router,
  title,
  subtitle,
  route,
  icon,
}: {
  icon: IconDefinition;
  title: string;
  subtitle: string;
  route: string;
  router: AppRouterInstance;
}) => {
  return (
    <div
      onClick={() => router.push(route)}
      className="flex p-1 hover:bg-gray-100 hover:text-primary rounded-lg items-center gap-2"
    >
      <div className="bg-gray-100 p-2 rounded-sm">
        <FontAwesomeIcon size="lg" icon={icon} />
      </div>
      <div>
        <p className="text-main">{title}</p>
        <p className="text-gray-600 text-xs">{subtitle}</p>
      </div>
    </div>
  );
};

export default function Navbar() {
  const router = useRouter();
  return (
    <nav className="md:pb-10 md:pt-5 md:px-8 py-4 px-6 w-full flex md:border-0 border-b border-primary justify-center text-main text-sm">
      <div className="md:hidden flex w-full items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 mr-10 hover:cursor-pointer hover:opacity-70">
            <span className="font-[600] text-primary text-nowrap leading-5 text-center tracking-tight text-xl">
              Charles River <br /> Tennis Club
            </span>
          </div>
        </Link>
        <div>
          <FontAwesomeIcon icon={faBars} size="xl" />
        </div>
      </div>
      <div className="max-w-[1120px] w-full h-min md:flex hidden justify-between items-center">
        <div className="gap-2 flex items-center w-min h-min">
          <Link href="/">
            <div className="flex items-center gap-2 mr-10 hover:cursor-pointer hover:opacity-70">
              <span className="font-bold text-primary text-nowrap leading-5 text-xl text-center tracking-tight">
                Charles River <br />
                Tennis Club
              </span>
            </div>
          </Link>
          <div className="group relative hover:cursor-pointer hover:text-gray-600  hover:bg-white rounded-sm bg-transparent px-4 py-2 flex items-center gap-2">
            <span>About</span>
            <div className="transition-transform duration-500 group-hover:rotate-180">
              <FontAwesomeIcon size="xs" icon={faAngleDown} />
            </div>

            <div className="hidden group-hover:block hover:block z-0 absolute w-[325px] top-full pt-4 left-0">
              <div className="shadow-sm border rounded-xl border-gray-300 bg-white">
                <div className="flex flex-col p-2 gap-2 text-gray-400">
                  <NavMenuItem
                    router={router}
                    route="/public/membership-info"
                    title="Membership Info"
                    icon={faFileLines}
                    subtitle="CRTC memberships and league information"
                  />
                  <NavMenuItem
                    router={router}
                    route="/public/board"
                    title="Officers & Board"
                    icon={faPeopleGroup}
                    subtitle="List of officers, board members and club bylaws"
                  />
                  <NavMenuItem
                    router={router}
                    route="/public/directions"
                    title="Directions and parking"
                    icon={faMap}
                    subtitle="Getting to CRTC"
                  />
                  <NavMenuItem
                    router={router}
                    route="/join"
                    title="Join"
                    icon={faArrowRight}
                    subtitle="New member application for first timers"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="group hover:cursor-pointer hover:text-gray-600 hover:bg-white rounded-sm bg-transparent px-4 py-2 flex items-center gap-2">
            <span>Contact</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-min h-min">
          <Link href="/login">
            <div className="group hover:cursor-pointer hover:text-gray-600 hover:bg-white rounded-sm bg-transparent px-4 py-2 flex items-center gap-2">
              <span className="text-nowrap">Log in</span>
            </div>
          </Link>
          <Link href="/join">
            <div className="group hover:cursor-pointer hover:text-gray-600 hover:bg-gray-100 bg-white rounded-sm shadow-xl border border-gray-300 px-4 py-2 flex items-center gap-2">
              <span>Join</span>
              <FontAwesomeIcon icon={faArrowRight} />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
