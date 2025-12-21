"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const LOGIN_HREF = "/login";
export const MEMBERSHIP_INFO_HREF = "/membership-info";

function NavLink({ label, href }: { label: string; href: string }) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <Link href={href}>
      <div
        className={`hover:cursor-pointer hover:underline md:text-base text-sm ${
          isActive && "underline"
        }`}
      >
        {label}
      </div>
    </Link>
  );
}

export default function Navbar() {
  return (
    <nav className="md:px-20 px-10 sticky font-temp md:py-6 p-4 bg-gray-100 flex w-full items-center justify-center">
      <div className="flex gap-16 text-md font-[500] tracking-wide">
        <NavLink href={"/"} label="Home" />
        <NavLink href={MEMBERSHIP_INFO_HREF} label="Membership" />
        <NavLink href={LOGIN_HREF} label="Login" />
      </div>
    </nav>
  );
}
