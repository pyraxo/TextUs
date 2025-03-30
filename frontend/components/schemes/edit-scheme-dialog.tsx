"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUpdateScheme } from "@/hooks/use-schemes";
import { Scheme } from "@/types/scheme";
import * as React from "react";
import { toast } from "sonner";
import { SchemeForm } from "./scheme-form";

interface EditSchemeDialogProps {
  children: React.ReactNode;
  scheme: Scheme;
}

export function EditSchemeDialog({ children, scheme }: EditSchemeDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { mutate: updateScheme, isPending } = useUpdateScheme();

  const handleSubmit = React.useCallback(
    (data: any) => {
      updateScheme(
        { slug: scheme.slug, input: data },
        {
          onSuccess: () => {
            setOpen(false);
            toast.success("Scheme updated successfully");
          },
          onError: () => {
            toast.error("Failed to update scheme");
          },
        }
      );
    },
    [updateScheme, scheme.slug]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Scheme</DialogTitle>
        </DialogHeader>
        <SchemeForm
          defaultValues={scheme}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
