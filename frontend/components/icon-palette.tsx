"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { IconRenderer, useIconPicker } from "./icon-picker";

interface IconPickerCommandPaletteProps {
  value?: string;
  onValueChange?: (value: string) => void;
}

export const IconPickerCommandPalette = ({
  value: controlledValue,
  onValueChange,
}: IconPickerCommandPaletteProps) => {
  const [internalValue, setInternalValue] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { icons } = useIconPicker();

  // Use controlled value if provided, otherwise use internal state
  const value = controlledValue ?? internalValue;
  const setValue = (newValue: string | null) => {
    if (onValueChange) {
      onValueChange(newValue ?? "");
    } else {
      setInternalValue(newValue);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="min-w-[150px]">
          {value ? (
            <>
              <IconRenderer className="size-4 text-zinc-500" icon={value} />
              {value}
            </>
          ) : (
            "Select icon"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full max-w-sm p-0">
        <Command className="w-full max-w-sm">
          <CommandInput placeholder="Search icons..." />
          <CommandList>
            <CommandEmpty>No icons found.</CommandEmpty>
            <CommandGroup>
              {icons.map(({ name, Component, friendly_name }) => (
                <CommandItem
                  key={name}
                  value={friendly_name}
                  onSelect={() => {
                    setValue(value === name ? null : name);
                    setOpen(false);
                  }}
                  className="flex items-center gap-x-2 truncate capitalize"
                >
                  <Component className="size-4" />
                  {friendly_name}
                  <CheckIcon
                    data-selected={value === name}
                    className="ml-auto size-4 opacity-0 data-[selected=true]:opacity-100"
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
