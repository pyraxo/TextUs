"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { IconName, IconPicker } from "@/components/ui/icon-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CreateSchemeInput } from "@/types/scheme";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const DEFAULT_ICON: IconName = "file-text";

const schemeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  icon: z.string().default(DEFAULT_ICON) as z.ZodType<IconName>,
});

type SchemeFormData = z.infer<typeof schemeFormSchema>;

interface SchemeFormProps {
  defaultValues?: Partial<CreateSchemeInput>;
  onSubmit: (data: SchemeFormData) => void;
  isSubmitting?: boolean;
}

export function SchemeForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: SchemeFormProps) {
  const form = useForm<SchemeFormData>({
    resolver: zodResolver(schemeFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      icon: (defaultValues?.icon || DEFAULT_ICON) as IconName,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter scheme name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter scheme description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel className="pr-4">Icon</FormLabel>
                <FormControl>
                  <IconPicker
                    value={field.value as IconName}
                    onValueChange={field.onChange}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}
