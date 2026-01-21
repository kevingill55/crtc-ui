export const FormInput = ({
  placeholder,
  value,
  setValue,
  id,
}: {
  id: string;
  placeholder: string;
  value: string;
  setValue: (str: string) => void;
}) => {
  return (
    <input
      id={id}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      type="text"
      placeholder={placeholder}
      className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-1 focus:outline-primary hover:border-gray-500"
    />
  );
};
