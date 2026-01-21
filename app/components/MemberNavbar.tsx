"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faPeopleGroup,
  faBookmark,
  faMoon,
  faCalendar,
  faEnvelope,
  faNoteSticky,
  IconDefinition,
  faListCheck,
} from "@fortawesome/free-solid-svg-icons";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { PropsWithChildren } from "react";

function MemberNavMenuItem({
  route,
  title,
  router,
  subtitle,
  icon,
}: {
  icon: IconDefinition;
  router: AppRouterInstance;
  title: string;
  subtitle: string;
  route: string;
}) {
  return (
    <div
      onClick={() => router.push(route)}
      className="flex p-1 hover:bg-gray-100 hover:text-classic-tennis rounded-lg items-center gap-2"
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
}

function MenuNavAnchor({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <div className="group relative hover:cursor-pointer hover:text-primary hover:bg-white rounded-sm bg-transparent px-4 py-2 flex items-center gap-2">
      <span>{title}</span>
      <div className="transition-transform duration-500 group-hover:rotate-180">
        <FontAwesomeIcon size="xs" icon={faAngleDown} />
      </div>
      {children}
    </div>
  );
}

export default function MemberNavbar() {
  const router = useRouter();
  return (
    <nav className="pb-10 pt-5 px-8 w-full flex justify-center text-main text-sm">
      <div className="max-w-[1120px] w-full h-min flex justify-between items-center">
        <div className="gap-2 flex items-center w-min h-min">
          <Link href="/member/home">
            <div className="flex items-center gap-2 mr-10 hover:cursor-pointer hover:opacity-70">
              <span className="font-bold text-primary text-nowrap leading-5 text-xl text-center tracking-tight">
                Charles River <br />
                Tennis Club
              </span>
            </div>
          </Link>
          <MenuNavAnchor title="Tennis">
            <div className="hidden group-hover:block hover:block z-0 absolute w-[325px] top-full pt-4 left-0">
              <div className="shadow-sm border rounded-xl border-gray-300 bg-white">
                <div className="flex flex-col p-2 gap-2 text-gray-400">
                  <MemberNavMenuItem
                    route="/member/reserve"
                    icon={faBookmark}
                    title="Reserve"
                    router={router}
                    subtitle="Reserve court time up to 1 week in advance"
                  />
                  <MemberNavMenuItem
                    route="/member/calendar"
                    icon={faCalendar}
                    title="Calendar"
                    router={router}
                    subtitle="View all events and court availability at CRTC"
                  />
                  <MemberNavMenuItem
                    route="/member/friday"
                    icon={faMoon}
                    title="Friday night tennis"
                    router={router}
                    subtitle="Organized fun and competitive play followed by
                        socializing and food and drinks"
                  />
                  <MemberNavMenuItem
                    route="/member/open"
                    icon={faBookmark}
                    title="Drop-in tennis"
                    router={router}
                    subtitle="Dedicated open tennis court time"
                  />
                </div>
              </div>
            </div>
          </MenuNavAnchor>
          <MenuNavAnchor title="Club">
            <div className="hidden group-hover:block hover:block z-0 absolute w-[325px] top-full pt-4 left-0">
              <div className="shadow-sm border rounded-xl border-gray-300 bg-white">
                <div className="flex flex-col p-2 gap-2 text-gray-400">
                  <MemberNavMenuItem
                    route="/member/list"
                    icon={faPeopleGroup}
                    title="Members"
                    router={router}
                    subtitle="See all active CRTC members"
                  />
                  <MemberNavMenuItem
                    route="/member/notes"
                    icon={faNoteSticky}
                    title="Meeting notes"
                    router={router}
                    subtitle="Notes from all board and club meetings"
                  />
                </div>
              </div>
            </div>
          </MenuNavAnchor>

          <MenuNavAnchor title="Admin">
            <div className="hidden group-hover:block hover:block z-0 absolute w-[325px] top-full pt-4 left-0">
              <div className="shadow-sm border rounded-xl border-gray-300 bg-white">
                <div className="flex flex-col p-2 gap-2 text-gray-400">
                  <MemberNavMenuItem
                    route="/admin/accounts"
                    icon={faListCheck}
                    title="Accounts"
                    router={router}
                    subtitle="Dashboard to view and manage all membership accounts"
                  />
                  <MemberNavMenuItem
                    route="/admin/email"
                    icon={faEnvelope}
                    title="Email"
                    router={router}
                    subtitle="Mass email generator with helpful pre-selected lists"
                  />
                </div>
              </div>
            </div>
          </MenuNavAnchor>

          <div className="group hover:cursor-pointer hover:text-primary hover:bg-white rounded-sm bg-transparent px-4 py-2 flex items-center gap-2">
            <span>Contact</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-min h-min">
          <Link href="/logout">
            <div className="group hover:cursor-pointer hover:text-primary hover:bg-white rounded-sm bg-transparent px-4 py-2 flex items-center gap-2">
              <span className="text-nowrap">Log out</span>
            </div>
          </Link>
          <Link href="/member/reserve">
            <div className="group hover:cursor-pointer hover:bg-classic-tennis/80 text-white bg-classic-tennis rounded-sm shadow-xl px-4 py-2 flex items-center gap-2">
              <span className="text-nowrap">Reserve</span>
              <FontAwesomeIcon icon={faBookmark} />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
