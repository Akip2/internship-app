import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export default function AcademicLevelBox(props: { className?: string, onValueChange: (level: string) => void }) {
    const { className, onValueChange } = props;
    return (
        <Select
            onValueChange={onValueChange}
        >
            <SelectTrigger>
                <SelectValue placeholder="Sélectionner un niveau" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="L1">L1</SelectItem>
                <SelectItem value="L2">L2</SelectItem>
                <SelectItem value="L3">L3</SelectItem>
                <SelectItem value="M1M">M1 MIAGE</SelectItem>
                <SelectItem value="M1S">M1 Sciences Cognitives</SelectItem>
                <SelectItem value="M1T">M1 TAL</SelectItem>
                <SelectItem value="M2M">M2 MIAGE</SelectItem>
                <SelectItem value="M2S">M2 Sciences Cognitives</SelectItem>
                <SelectItem value="M2T">M2 TAL</SelectItem>
            </SelectContent>
        </Select>
    )
}