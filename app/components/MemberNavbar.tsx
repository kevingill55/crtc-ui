"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faBookOpen,
  faPlay,
  faCircleDot,
  faPeopleGroup,
  faFileLines,
  faUnlock,
  faBarsStaggered,
  faArrowRight,
  faBookmark,
  faMoon,
  faCalendar,
  faEnvelope,
  faUser,
  faNoteSticky,
} from "@fortawesome/free-solid-svg-icons";

export default function MemberNavbar() {
  const router = useRouter();
  return (
    <nav className="pb-10 pt-5 px-8 w-full flex justify-center text-main text-sm">
      <div className="max-w-[1120px] w-full h-min flex justify-between items-center">
        <div className="gap-2 flex items-center w-min h-min">
          <Link href="/dashboard">
            <div className="flex items-center gap-2 mr-10 hover:cursor-pointer hover:opacity-70">
              <span className="font-bold text-primary font-heading text-nowrap leading-5 text-xl text-center tracking-tight">
                Charles River <br />
                Tennis Club
              </span>
            </div>
          </Link>
          <div className="group relative hover:cursor-pointer hover:text-gray-600  hover:bg-gray-100 rounded-sm bg-transparent px-4 py-2 flex items-center gap-2">
            <span>Tennis</span>
            <div className="transition-transform duration-500 group-hover:rotate-180">
              <FontAwesomeIcon size="xs" icon={faAngleDown} />
            </div>

            <div className="hidden group-hover:block hover:block z-0 absolute w-[325px] top-full pt-4 left-0">
              <div className="shadow-sm border-1 rounded-xl border-gray-300 bg-white">
                <div className="flex flex-col p-2 gap-2 text-gray-400">
                  <div
                    onClick={() => router.push("/membership-info")}
                    className="flex p-1 hover:bg-gray-100 hover:text-classic-tennis rounded-lg items-center gap-2"
                  >
                    <div className="bg-gray-100 p-2 rounded-sm">
                      <FontAwesomeIcon size="lg" icon={faBookmark} />
                    </div>
                    <div>
                      <p className="text-main">Reserve</p>
                      <p className="text-gray-600 text-xs">
                        Reserve court time up to 1 week in advance.
                      </p>
                    </div>
                  </div>
                  <div
                    onClick={() => router.push("/membership-info")}
                    className="flex p-1 hover:bg-gray-100 hover:text-classic-tennis rounded-lg items-center gap-2"
                  >
                    <div className="bg-gray-100 p-2 rounded-sm">
                      <FontAwesomeIcon size="lg" icon={faCalendar} />
                    </div>
                    <div>
                      <p className="text-main">Calendar</p>
                      <p className="text-gray-600 text-xs">
                        View all court availability and events going on at CRTC
                      </p>
                    </div>
                  </div>
                  <div
                    onClick={() => router.push("/leagues")}
                    className="flex p-1 hover:bg-gray-100 hover:text-classic-tennis rounded-lg items-center gap-2"
                  >
                    <div className="bg-gray-100 p-2 rounded-sm">
                      <FontAwesomeIcon size="lg" icon={faMoon} />
                    </div>
                    <div>
                      <p className="text-main">Friday night tennis</p>
                      <p className="text-gray-600 text-xs">
                        Organized fun and competitive play followed by
                        socializing and food and drinks.
                      </p>
                    </div>
                  </div>
                  <div
                    onClick={() => router.push("/open-tennis")}
                    className="flex p-1 hover:bg-gray-100 hover:text-classic-tennis rounded-lg items-center gap-2"
                  >
                    <div className="bg-gray-100 p-2 rounded-sm">
                      <FontAwesomeIcon size="lg" icon={faUnlock} />
                    </div>
                    <div>
                      <p className="text-main">Drop-in tennis</p>
                      <p className="text-gray-600 text-xs">
                        Dedicated open tennis court time
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="group relative hover:cursor-pointer hover:text-gray-600 hover:bg-gray-100 rounded-sm bg-transparent px-4 py-2 flex items-center gap-2">
            <span>Club</span>
            <div className="transition-transform duration-500 group-hover:rotate-180">
              <FontAwesomeIcon size="xs" icon={faAngleDown} />
            </div>

            <div className="hidden group-hover:block hover:block z-0 absolute w-[325px] top-full pt-4 left-0">
              <div className="shadow-sm border-1 rounded-xl border-gray-300 bg-white">
                <div className="flex flex-col p-2 gap-2 text-gray-400">
                  <div className="flex p-1 hover:bg-gray-100 hover:text-classic-tennis rounded-lg items-center gap-2">
                    <div className="bg-gray-100 p-2 rounded-sm">
                      <FontAwesomeIcon size="lg" icon={faPeopleGroup} />
                    </div>
                    <div>
                      <p className="text-main">Members</p>
                      <p className="text-gray-600 text-xs">
                        A simple view of all active CRTC members
                      </p>
                    </div>
                  </div>
                  <div className="flex p-1 hover:bg-gray-100 hover:text-classic-tennis rounded-lg items-center gap-2">
                    <div className="bg-gray-100 p-2 rounded-sm">
                      <FontAwesomeIcon size="lg" icon={faNoteSticky} />
                    </div>
                    <div>
                      <p className="text-main">Meeting notes</p>
                      <p className="text-gray-600 text-xs">
                        Notes from all board and club meetings
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative hover:cursor-pointer hover:text-gray-600  hover:bg-gray-100 rounded-sm bg-transparent px-4 py-2 flex items-center gap-2">
            <span>Admin</span>
            <div className="transition-transform duration-500 group-hover:rotate-180">
              <FontAwesomeIcon size="xs" icon={faAngleDown} />
            </div>

            <div className="hidden group-hover:block hover:block z-0 absolute w-[325px] top-full pt-4 left-0">
              <div className="shadow-sm border-1 rounded-xl border-gray-300 bg-white">
                <div className="flex flex-col p-2 gap-2 text-gray-400">
                  <div
                    onClick={() => router.push("/open-tennis")}
                    className="flex p-1 hover:bg-gray-100 hover:text-classic-tennis rounded-lg items-center gap-2"
                  >
                    <div className="bg-gray-100 p-2 rounded-sm">
                      <FontAwesomeIcon size="lg" icon={faEnvelope} />
                    </div>
                    <div>
                      <p className="text-main">Accounts</p>
                      <p className="text-gray-600 text-xs">
                        Dashboard to view and manage all membership accounts
                      </p>
                    </div>
                  </div>
                  <div
                    onClick={() => router.push("/open-tennis")}
                    className="flex p-1 hover:bg-gray-100 hover:text-classic-tennis rounded-lg items-center gap-2"
                  >
                    <div className="bg-gray-100 p-2 rounded-sm">
                      <FontAwesomeIcon size="lg" icon={faEnvelope} />
                    </div>
                    <div>
                      <p className="text-main">Email</p>
                      <p className="text-gray-600 text-xs">
                        Mass email generator with helpful pre-selected lists
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="group hover:cursor-pointer hover:text-gray-600 hover:bg-gray-100 rounded-sm bg-transparent px-4 py-2 flex items-center gap-2">
            <span>Contact</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-min h-min">
          <Link href="/logout">
            <div className="group hover:cursor-pointer hover:text-gray-600 hover:bg-gray-100 rounded-sm bg-transparent px-4 py-2 flex items-center gap-2">
              <span className="text-nowrap">Log out</span>
            </div>
          </Link>
          <Link href="/join">
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
