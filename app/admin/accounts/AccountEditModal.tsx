"use client";

export const AccountEditModal = () => {
  return (
    <dialog
      id="waitlist-edit-modal"
      className="rounded-lg z-20 p-6 border-gray-300 bg-white"
    >
      <div></div>
      <div className="flex items-center justify-end gap-4">
        <button
          // onClick={handleOnClick}
          className="hover:cursor-pointer hover:bg-gray-300/80 rounded-lg py-2 px-6 text-sm flex justify-center items-center bg-gray-100 text-primary border-primary border"
        >
          Cancel
        </button>
        <button
          // onClick={handleOnClick}
          className="hover:cursor-pointer hover:bg-primary/80 border border-primary rounded-lg py-2 px-6 text-sm flex justify-center items-center bg-primary text-white"
        >
          Save
        </button>
      </div>
    </dialog>
  );
};
