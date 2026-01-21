export const Modal = ({
  id,
  title,
  subtitle,
  onClose,
  onDone,
  content,
}: {
  id: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  onDone: () => void;
  onClose: () => void;
}) => {
  return (
    <div
      id={id}
      className="inset-0 z-50 fixed bg-black/50 flex items-center justify-center"
    >
      <div className="rounded-lg max-w-1/2 w-full bg-white text-primary border border-gray-300">
        <div className="p-5">
          <h2 className="font-medium text-xl">{title}</h2>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
        <div className="px-6">{content}</div>
        <div className="border-b border-gray-300 w-full"></div>
        <div className="flex justify-end p-6 gap-2 items-center">
          <button
            onClick={onClose}
            className="hover:cursor-pointer hover:bg-gray-300/80 rounded-lg py-2 px-6 text-sm flex justify-center items-center bg-gray-100 text-primary border-primary border"
          >
            Cancel
          </button>
          <button
            onClick={onDone}
            className="hover:cursor-pointer hover:bg-primary/80 border border-primary rounded-lg py-2 px-6 text-sm flex justify-center items-center bg-primary text-white"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};
