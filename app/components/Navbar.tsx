"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faPeopleGroup,
  faFileLines,
  faArrowRight,
  IconDefinition,
  faBars,
  faMap,
  faCircleInfo,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const NavMenuItem = ({
  router,
  title,
  subtitle,
  route,
  icon,
  onNavigate,
}: {
  icon: IconDefinition;
  title: string;
  subtitle: string;
  route: string;
  router: AppRouterInstance;
  onNavigate?: () => void;
}) => {
  return (
    <div
      onClick={() => {
        router.push(route);
        onNavigate?.();
      }}
      className="flex p-1 hover:bg-gray-100 hover:text-primary rounded-lg items-center gap-2 cursor-pointer"
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

const navItems = [
  {
    route: "/public/membership-info",
    title: "Membership Info",
    icon: faFileLines,
    subtitle: "CRTC memberships and league information",
  },
  {
    route: "/public/about",
    title: "Who We Are",
    icon: faCircleInfo,
    subtitle: "About the club and how we operate",
  },
  {
    route: "/public/board",
    title: "Officers & Board",
    icon: faPeopleGroup,
    subtitle: "List of officers, board members and club bylaws",
  },
  {
    route: "/public/directions",
    title: "Directions and parking",
    icon: faMap,
    subtitle: "Getting to CRTC",
  },
  {
    route: "/join",
    title: "Join",
    icon: faArrowRight,
    subtitle: "New member application for first timers",
  },
];

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = () => setMobileOpen(false);

  const sheet = mounted
    ? createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={close}
            className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${
              mobileOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          />
          {/* Sheet */}
          <div
            className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
              mobileOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="font-semibold text-primary text-lg tracking-tight">
                Menu
              </span>
              <div
                role="button"
                onClick={close}
                className="w-11 h-11 flex items-center justify-center cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} size="lg" />
              </div>
            </div>
            <div className="flex flex-col py-2 px-2 flex-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavMenuItem
                  key={item.route}
                  router={router}
                  route={item.route}
                  title={item.title}
                  icon={item.icon}
                  subtitle={item.subtitle}
                  onNavigate={close}
                />
              ))}
            </div>
            <div className="px-4 py-5 border-t border-gray-100 flex gap-3">
              <Link href="/login" onClick={close} className="flex-1">
                <div className="text-center border border-gray-300 rounded px-4 py-3 text-primary font-medium">
                  Log in
                </div>
              </Link>
              <Link href="/join" onClick={close} className="flex-1">
                <div className="text-center bg-primary text-white rounded px-4 py-3 font-medium flex items-center justify-center gap-2">
                  Join <FontAwesomeIcon icon={faArrowRight} />
                </div>
              </Link>
            </div>
          </div>
        </>,
        document.body
      )
    : null;

  return (
    <>
      {/* ── Mobile navbar bar ── */}
      <nav className="md:hidden flex items-center justify-between py-3 px-5 border-b border-primary bg-white">
        <Link href="/" onClick={close}>
          <span className="font-semibold text-primary text-lg">CRTC</span>
        </Link>
        <div
          role="button"
          onClick={() => setMobileOpen(true)}
          className="w-11 h-11 flex items-center justify-end cursor-pointer"
        >
          <FontAwesomeIcon icon={faBars} size="lg" />
        </div>
      </nav>

      {sheet}

      {/* ── Desktop navbar ── */}
      <nav className="hidden md:flex md:pb-10 md:pt-5 md:px-8 w-full justify-center text-main text-sm">
        <div className="max-w-[1120px] w-full h-min flex justify-between items-center">
          <div className="gap-2 flex items-center w-min h-min">
            <Link href="/">
              <div className="flex items-center gap-2 mr-10 hover:cursor-pointer hover:opacity-70">
                <span className="font-bold text-primary text-nowrap leading-5 text-xl text-center tracking-tight">
                  Charles River <br />
                  Tennis Club
                </span>
              </div>
            </Link>
            <div className="group relative hover:cursor-pointer hover:text-gray-600 hover:bg-white rounded-sm bg-transparent px-4 py-2 flex items-center gap-2">
              <span>About</span>
              <div className="transition-transform duration-500 group-hover:rotate-180">
                <FontAwesomeIcon size="xs" icon={faAngleDown} />
              </div>
              <div className="hidden group-hover:block hover:block z-10 absolute w-[325px] top-full pt-4 left-0">
                <div className="shadow-sm border rounded-xl border-gray-300 bg-white">
                  <div className="flex flex-col p-2 gap-2 text-gray-400">
                    {navItems.map((item) => (
                      <NavMenuItem
                        key={item.route}
                        router={router}
                        route={item.route}
                        title={item.title}
                        icon={item.icon}
                        subtitle={item.subtitle}
                      />
                    ))}
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
    </>
  );
}
