"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateScheme } from "@/hooks/use-schemes";
import * as React from "react";
import { toast } from "sonner";
import { SchemeForm } from "./scheme-form";

interface CreateSchemeDialogProps {
  children: React.ReactNode;
}

export function CreateSchemeDialog({ children }: CreateSchemeDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { mutate: createScheme, isPending } = useCreateScheme();

  const handleSubmit = React.useCallback(
    (data: any) => {
      createScheme(data, {
        onSuccess: () => {
          setOpen(false);
          toast.success("Scheme created successfully");
        },
        onError: () => {
          toast.error("Failed to create scheme");
        },
      });
    },
    [createScheme]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Scheme</DialogTitle>
        </DialogHeader>
        <SchemeForm onSubmit={handleSubmit} isSubmitting={isPending} />
      </DialogContent>
    </Dialog>
  );
}
