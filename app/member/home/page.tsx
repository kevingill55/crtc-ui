"use client";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ProtectedPage from "../../components/ProtectedPage";

export default function Home() {
  return (
    <ProtectedPage title="Home">
      <div className="flex w-full gap-4 justify-between">
        <div className="w-full rounded-xl min-w-100 max-w-150 p-8 bg-white shadow-lg flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-medium">Announcements</h2>
            <p className="text-zinc-600 text-sm">
              The latest news from the club
            </p>
          </div>
          <div className="flex flex-col justify-center items-center py-8">
            <div className="text-lg text-classic-tennis">
              <FontAwesomeIcon icon={faCircleExclamation} />
            </div>
            <div className="">No announcements</div>
            <div className="text-sm text-zinc-600">Check back soon</div>
          </div>
        </div>
        <div className="w-full rounded-xl p-8 min-w-100 max-w-150 bg-white shadow-lg flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-medium">Schedule</h2>
            <p className="text-zinc-600 text-sm">Your upcoming events</p>
          </div>
          <div className="flex flex-col justify-center items-center py-8">
            <div className="text-lg text-classic-tennis">
              <FontAwesomeIcon icon={faCircleExclamation} />
            </div>
            <div className="">No events</div>
            <div className="text-sm text-zinc-600">
              Reserve some court time!
            </div>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
