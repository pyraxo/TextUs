"use client";

import { CreateSchemeDialog } from "@/components/schemes/create-scheme-dialog";
import { EditSchemeDialog } from "@/components/schemes/edit-scheme-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon, IconName } from "@/components/ui/icon-picker";
import { useDeleteScheme, useSchemes } from "@/hooks/use-schemes";
import { ArrowLeft, Edit2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const DEFAULT_ICON: IconName = "file-text";

export default function SchemesPage() {
  const { data: schemes } = useSchemes();
  const { mutate: deleteScheme } = useDeleteScheme();

  const handleDelete = (slug: string) => {
    deleteScheme(slug, {
      onSuccess: () => {
        toast.success("Scheme deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete scheme");
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header content area */}
      <div className="bg-cpf-light-teal pt-10 pb-12">
        <div className="container mx-auto px-4 md:px-8">
          {/* Back button */}
          <Link
            href="/trainer"
            className="inline-flex items-center text-muted-background hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>

          {/* Main heading */}
          <h1 className="text-5xl font-bold mb-6 text-foreground">
            Manage Schemes
          </h1>

          {/* Subheading */}
          <h2 className="text-xl font-normal text-foreground">
            Which scheme would you like to manage today?
          </h2>
        </div>
      </div>

      {/* Schemes grid */}
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="mb-6">
          <CreateSchemeDialog>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Scheme
            </Button>
          </CreateSchemeDialog>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {schemes &&
            schemes.map((scheme) => (
              <Card
                key={scheme.slug}
                className="h-full overflow-hidden rounded-lg hover:shadow-md transition-shadow border-0 group relative"
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <EditSchemeDialog scheme={scheme}>
                    <Button size="icon" variant="ghost">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </EditSchemeDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Scheme</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this scheme? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(scheme.slug)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <Link href={`/trainer/schemes/${scheme.slug}`}>
                  <CardContent className="p-0 h-full">
                    <div className="px-6 py-6 h-full flex flex-col">
                      <div className="flex items-center gap-4 mb-3">
                        <Icon
                          name={(scheme.icon || DEFAULT_ICON) as IconName}
                          className="h-8 w-8 stroke-[2px]"
                        />
                        <h3 className="text-xl font-bold text-card-foreground">
                          {scheme.name}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {scheme.description}
                      </p>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
