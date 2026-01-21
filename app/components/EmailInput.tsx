export const emailRegex = new RegExp(
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);

export const EmailInput = ({
  setEmail,
  setEmailError,
  email,
  emailError,
  id,
}: {
  id: string;
  email: string;
  emailError: string;
  setEmail: (str: string) => void;
  setEmailError: (str: string) => void;
}) => {
  return (
    <input
      id={id}
      type="text"
      value={email}
      placeholder="user@email.com"
      className={`px-4 py-2 rounded-lg border border-gray-300 focus:outline-1 focus:outline-primary hover:border-gray-500 ${
        emailError && "border-red-500"
      }`}
      onChange={(e) => {
        if (emailError) setEmailError("");
        setEmail(e.target.value);
      }}
    />
  );
};
