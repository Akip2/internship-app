import { ChangeEvent } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export default function InputDiv(props: {
  className?: string;
  label: string;
  name?: string;
  type: string;
  required?: boolean;
  value: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const {
    className,
    value,
    label,
    name,
    type,
    required,
    disabled,
    onChange,
  } = props;

  const isReadOnly = disabled || !onChange;

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label htmlFor={name ?? label}>
        {label}
        {required ? " *" : ""}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        value={value}
        disabled={disabled}
        readOnly={isReadOnly}
        min={props.min}
        max={props.max}
        onChange={onChange}
      />
    </div>
  );
}
