"use client";
import Image from "next/image";
import Link from "next/link";

import Navbar from "./components/Navbar";

export default function Welcome() {
  return (
    <main className="h-full min-w-full text-primary">
      <Navbar />
      <div>
        <div className="flex flex-col md:flex-row py-6 md:py-[5vh] justify-center md:gap-16 md:px-32 px-4">
          <div className="md:w-1/3 w-full md:px-0 px-4 md:py-[10vh] md:min-w-[500px]">
            <h1 className="text-4xl text-center font-heading font-bold">
              CHARLES RIVER <br /> TENNIS CLUB
            </h1>
            <p className="font-[500] text-center text-main pt-4 md:pt-6 font-sans text-base md:text-lg">
              <span className="text-classic-tennis font-bold">
                Four Har-Tru green clay courts
              </span>{" "}
              in a wooded residential setting near the Charles River. Open to
              the community in Medway, MA since 1938.
            </p>
            <div className="flex gap-4 items-center justify-center md:py-10 py-6">
              <Link href="/login">
                <button className="hover:cursor-pointer hover:bg-gray-600/20 px-6 py-3 rounded-2xl text-primary bg-gray-200 text-sm md:text-base">
                  Member Login
                </button>
              </Link>
              <Link href="/membership-info">
                <button className="hover:cursor-pointer hover:bg-primary/80 px-6 py-3 rounded-2xl text-white bg-primary text-sm md:text-base">
                  Become a Member
                </button>
              </Link>
            </div>
          </div>
          <div className="flex md:gap-6 gap-2 flex-col">
            <div className="md:w-9/10 w-full">
              <Image
                src="/CRTC_uppercourts.jpg"
                alt="Upper courts at CRTC"
                width={700}
                height={500}
              />
            </div>
            <div className="md:w-9/10 w-full self-end">
              <Image
                src="/CRTC_trees.jpg"
                alt="Trees at CRTC"
                width={800}
                height={500}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-100 p-4 md:p-12 w-full gap-2 md:gap-14 flex-col md:flex-row flex items-center justify-center">
        <div className="hidden md:flex justify-center md:w-4/5 w-full">
          <Image
            src="/CRTC_lowercourts.jpg"
            alt="Lower courts at CRTC"
            width={800}
            height={500}
          />
        </div>
        <div className="flex w-full flex-col items-center">
          <h2 className="text-primary text-2xl font-bold font-heading md:py-8 py-4 text-center md:text-start">
            Classic green clay tennis in a friendly, local community
          </h2>
          <div className="flex flex-col text-main text-sm md:text-md gap-3 md:px-10 px-4 leading-5">
            <div>
              <p>
                • Open daily to members from 8:30am - 10:00pm mid-April to late
                October with evening play under the lights available on 2
                courts.
              </p>
            </div>
            <div>
              <p>
                • Easy to use reservation system allows pre-booking up to 1 week
                in advance.
              </p>
            </div>
            <div>
              <p>
                • Singles, Doubles and Mixed Doubles Adult Leagues available at
                no additional cost.
              </p>
            </div>
            <div>
              <p>
                • Open/Drop-in tennis (TU/THU/SAT/SUN mornings). All levels
                welcome.
              </p>
            </div>
            <div>
              <p>
                • Social tennis events throughout the season (Memorial Day,
                Fourth of July, Wimbledon Whites, Halloween, or just because).
              </p>
            </div>
            <div>
              <p>
                • Club house with refrigerator and restrooms on site as well as
                gas grills, a gazebo and all the fixings for socializing.
              </p>
            </div>
            <div>
              <p>• Guests welcome for a small additional fee</p>
            </div>
            <div>
              <p>
                • Membership manages, operates and maintains the club on a
                not-for-profit basis
              </p>
            </div>
          </div>
        </div>
      </div>
      <footer className="bg-primary text-white w-full md:py-12 md:px-30 p-6 text-sm md:text-base gap-2 flex flex-col md:flex-row justify-between font-main">
        <div className="flex flex-col gap-2">
          <p className="font-[600] font-heading text-lg">
            Charles River Tennis Club
          </p>
          <p>11 Massasoit Street, Medway, MA 02053</p>
          <p className="text-[#D4FC2E]">info@charlesrivertennisclub.com</p>
        </div>
        <div className="flex flex-col justify-center md:items-end">
          <p className="font-[600]">Hours of operation</p>
          <p>April - October</p>
          <p>7 days a week</p>
        </div>
      </footer>
    </main>
  );
}
