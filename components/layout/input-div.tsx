import { ChangeEvent } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export default function InputDiv(props: {
    className?: string,
    label: string,
    type: string,
    required?: boolean,
    value: string,
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}) {
    const { className, value, label, type, required, onChange } = props;

    return (
        <div className={"space-y-2 " + className}>
            <Label>{label + (required ? " *" : "")}</Label>
            <Input
                type={type}
                required={required}
                value={value}
                onChange={onChange}
            />
        </div>
    )
}