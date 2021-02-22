import classNames from "classnames";
import React, { Fragment } from "react";

interface InputGroupProps {
  // className?: string;
  type: string;
  placeholder: string;
  value: string;
  error: string | undefined;
  setValue: (value: string) => void;
  helperText?: string | undefined;
}

const handleKeyDown = (e) => {
  if (e.key === " ") {
    e.preventDefault();
  }
};

const InputGroup: React.FC<InputGroupProps> = ({
  // className,
  type,
  placeholder,
  value,
  error,
  helperText,
  setValue,
}) => {
  const HelperTextComponent = () => {
    return (
      <small
        className={classNames("font-medium text-white", {
          "text-red-400": error,
        })}
      >
        {error ? error : helperText}
      </small>
    );
  };

  return (
    <div
    // className={className}
    >
      {type === "number" ? (
        <Fragment>
          <HelperTextComponent />
          <input
            type={type}
            placeholder={placeholder}
            className="w-full p-2 my-2  rounded outline-none bg-blue-500 focus:bg-blue-400 text-white"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            max={100}
            min={0}
          ></input>
        </Fragment>
      ) : (
        <Fragment>
          <HelperTextComponent />
          <input
            type={type}
            placeholder={placeholder}
            className="w-full p-2 my-2  rounded outline-none bg-blue-500 focus:bg-blue-400 text-white"
            value={value}
            onKeyDown={type === "password" ? null: handleKeyDown}
            onChange={(e) => setValue(e.target.value)}
          ></input>
        </Fragment>
      )}
    </div>
  );
};

export default InputGroup;
