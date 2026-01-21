export const Loading = () => {
  return (
    <main className="h-full min-w-full flex flex-col justify-center items-center">
      <div className="absolute inset-0 -z-10 h-full w-full bg-gray-100 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px]"></div>
      <div className="newtons-cradle">
        <div className="newtons-cradle__dot"></div>
        <div className="newtons-cradle__dot"></div>
        <div className="newtons-cradle__dot"></div>
        <div className="newtons-cradle__dot"></div>
      </div>
      {/* <div className="flex items-center mt-2">
        <span className="font-medium text-primary leading-5 text-lg text-center">
          Charles River Tennis Club
        </span>
      </div> */}
      {/* <div className="flex flex-col items-end text-end leading-5">
        <span>Charles</span>
        <span>River</span>
        <span>Tennis</span>
        <span>Club</span>
      </div> */}
    </main>
  );
};
