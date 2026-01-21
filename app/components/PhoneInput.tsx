export const PhoneInput = ({
  setPhone,
  phone,
  id,
}: {
  id: string;
  phone: string;
  setPhone: (str: string) => void;
}) => {
  return (
    <input
      id={id}
      type="text"
      value={phone}
      maxLength={12}
      placeholder="xxx-xxx-xxxx"
      className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-1 focus:outline-primary hover:border-gray-500"
      onChange={(e) => {
        if (e.target.value.length < phone.length) {
          setPhone(e.target.value);
          return;
        }

        const validNums = [];
        const newValue = e.target.value.slice();
        for (let i = 0; i < newValue.length; i++) {
          if (Number.isInteger(Number(newValue.charAt(i)))) {
            validNums.push(newValue.charAt(i));
            if (validNums.length === 3 || validNums.length === 7) {
              validNums.push("-");
            }
          }
        }

        setPhone(validNums.slice(0, 12).join(""));
      }}
    />
  );
};
