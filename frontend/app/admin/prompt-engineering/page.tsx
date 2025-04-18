"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useRubrics } from "@/hooks/use-rubrics";
import { useUploads } from "@/hooks/use-uploads";
import { deleteUpload, renameUpload, uploadFile } from "@/lib/api/uploads";
import { Edit, Trash2, Upload, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const METRICS = [
  { key: "accuracy", label: "Accuracy" },
  { key: "comprehension", label: "Comprehension" },
  { key: "tone", label: "Tone" },
  { key: "chat_handling", label: "Chat Handling" },
];

export default function PromptEngineeringPage() {
  const { rubrics, loading, error, saving, saveRubricPrompt } = useRubrics();
  const [selectedMetric, setSelectedMetric] = useState(METRICS[0].key);
  const [text, setText] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    data: uploads,
    loading: uploadsLoading,
    error: uploadsError,
    refresh: refreshUploads,
  } = useUploads();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [editFileName, setEditFileName] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Find the rubric for the selected metric
  const selectedRubric = useMemo(
    () => rubrics.find((r) => r.id === selectedMetric),
    [rubrics, selectedMetric]
  );

  // When metric or rubrics change, update textarea
  useEffect(() => {
    setText(selectedRubric?.rubric_prompt || "");
    setDirty(false);
    setSaveSuccess(false);
    setSaveError(null);
  }, [selectedRubric]);

  // Handle textarea change
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    setDirty(e.target.value !== (selectedRubric?.rubric_prompt || ""));
    setSaveSuccess(false);
    setSaveError(null);
  }

  // Handle save
  async function handleSave() {
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await saveRubricPrompt(selectedMetric, text);
      setDirty(false);
      setSaveSuccess(true);
    } catch (e: any) {
      setSaveError(e.message || "Failed to save");
    }
  }

  const onUpload = async (
    files: File[],
    { onProgress }: { onProgress: (file: File, progress: number) => void }
  ) => {
    try {
      setIsUploading(true);
      const file = files[0];
      await uploadFile(file);
      toast.success("File uploaded successfully");
      setImportOpen(false);
      setFiles([]);
      refreshUploads();
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const onFileReject = (file: File, message: string) => {
    toast(message, {
      description: `"${
        file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name
      }" has been rejected`,
    });
  };

  // Color bar colors
  const colorBarColors = [
    "#e0edec",
    "#a5c5c4",
    "#6a9e9c",
    "#2f7774",
    "#004d4a",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header content area */}
      <div className="bg-cpf-light-teal pt-8 pb-8">
        <div className="container mx-auto">
          {/* Main heading */}
          <h1 className="text-3xl font-bold mb-2">
            Prompt Engineering Controls
          </h1>

          {/* Subheading */}
          <h2 className="text-sm">
            Configure and manage the AI prompt engineering settings for the
            system
          </h2>
        </div>
      </div>

      <main className="container mx-auto p-6">
        <Card className="w-full border border-gray-200 rounded-lg">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Evaluator Rubric Prompt</h2>
            <Tabs value={selectedMetric} onValueChange={setSelectedMetric}>
              <TabsList>
                {METRICS.map((m) => (
                  <TabsTrigger key={m.key} value={m.key} className="capitalize">
                    {m.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {METRICS.map((m) => (
                <TabsContent value={m.key} key={m.key}>
                  <div>
                    {loading ? (
                      <div className="text-gray-500">Loading...</div>
                    ) : error ? (
                      <div className="text-red-500">{error}</div>
                    ) : (
                      <>
                        <Textarea
                          id="rubric-prompt-textarea"
                          className="w-full mb-4 min-h-[400px]"
                          value={text}
                          onChange={handleChange}
                          disabled={saving}
                        />
                        <div className="flex gap-2 items-center">
                          <Button
                            onClick={handleSave}
                            disabled={!dirty || saving}
                            className="bg-[#0B6160] hover:bg-[#0B6160]/90 text-white"
                          >
                            {saving ? "Saving..." : "Save"}
                          </Button>
                          {saveSuccess && (
                            <span className="text-green-600">Saved!</span>
                          )}
                          {saveError && (
                            <span className="text-red-600">{saveError}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex flex-row justify-start items-center">
          <h2 className="text-2xl font-bold mb-4 mt-8">
            Chat Transcript Database
          </h2>
          <Button
            size="sm"
            className="bg-[#0B6160] hover:bg-[#0B6160]/90 text-white h-8 ml-4 mt-4"
            onClick={() => setImportOpen(true)}
          >
            Import
          </Button>
        </div>

        <Card className="w-full border border-gray-200 rounded-lg">
          <CardContent className="p-0">
            {uploadsLoading ? (
              <div className="p-4 text-gray-500">Loading...</div>
            ) : uploadsError ? (
              <div className="p-4 text-red-600">{uploadsError}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-y border-gray-200">
                    <TableHead className="font-medium text-sm">
                      File Name
                    </TableHead>
                    <TableHead className="font-medium text-sm">
                      Upload Date
                    </TableHead>
                    <TableHead className="font-medium text-sm">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploads && uploads.length > 0 ? (
                    uploads.map((upload: any) => (
                      <TableRow
                        key={upload.id}
                        className="border-b border-gray-200"
                      >
                        <TableCell className="font-normal">
                          {upload.file_name}
                        </TableCell>
                        <TableCell className="font-normal">
                          {new Date(upload.upload_date).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-normal">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => {
                                setSelectedFile(upload);
                                setEditFileName(upload.file_name);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-600/90 text-white h-8"
                              onClick={() => {
                                setSelectedFile(upload);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-gray-400 py-8"
                      >
                        No files uploaded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Import Dialog with Dice UI FileUpload */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import File</DialogTitle>
          </DialogHeader>
          <FileUpload
            accept=".csv,.xlsx"
            maxFiles={1}
            className="w-full max-w-md"
            value={files}
            onValueChange={setFiles}
            onUpload={onUpload}
            onFileReject={onFileReject}
            disabled={isUploading}
          >
            <FileUploadDropzone>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center rounded-full border p-2.5">
                  <Upload className="size-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm">
                  Drag & drop a CSV or Excel file here
                </p>
                <p className="text-muted-foreground text-xs">
                  Or click to browse (max 1 file, .csv or .xlsx only)
                </p>
              </div>
              <FileUploadTrigger asChild>
                <Button variant="outline" size="sm" className="mt-2 w-fit">
                  Browse files
                </Button>
              </FileUploadTrigger>
            </FileUploadDropzone>
            <FileUploadList>
              {files.map((file, index) => (
                <FileUploadItem key={index} value={file}>
                  <div className="flex w-full items-center gap-2">
                    <FileUploadItemPreview />
                    <FileUploadItemMetadata />
                    <FileUploadItemDelete asChild>
                      <Button variant="ghost" size="icon" className="size-7">
                        <X />
                      </Button>
                    </FileUploadItemDelete>
                  </div>
                  <FileUploadItemProgress />
                </FileUploadItem>
              ))}
            </FileUploadList>
          </FileUpload>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setImportOpen(false);
                setFiles([]);
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit (Rename) Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setEditError(null);
            setEditLoading(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              className="border rounded px-3 py-2"
              value={editFileName}
              onChange={(e) => setEditFileName(e.target.value)}
              disabled={editLoading}
              autoFocus
            />
            {editError && (
              <div className="text-red-600 text-sm">{editError}</div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={editLoading}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#0B6160] hover:bg-[#0B6160]/90 text-white"
              onClick={async () => {
                if (!selectedFile) return;
                setEditLoading(true);
                setEditError(null);
                try {
                  await renameUpload(selectedFile.id, {
                    file_name: editFileName,
                  });
                  setEditDialogOpen(false);
                  setSelectedFile(null);
                  refreshUploads();
                  toast.success("File renamed successfully");
                } catch (e: any) {
                  setEditError(e.message || "Failed to rename file");
                } finally {
                  setEditLoading(false);
                }
              }}
              disabled={
                editLoading ||
                !editFileName ||
                editFileName === selectedFile?.file_name
              }
            >
              {editLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setDeleteError(null);
            setDeleteLoading(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{selectedFile?.file_name}</span>?
          </div>
          {deleteError && (
            <div className="text-red-600 text-sm mb-2">{deleteError}</div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-600/90 text-white"
              onClick={async () => {
                if (!selectedFile) return;
                setDeleteLoading(true);
                setDeleteError(null);
                try {
                  await deleteUpload(selectedFile.id);
                  setDeleteDialogOpen(false);
                  setSelectedFile(null);
                  refreshUploads();
                  toast.success("File deleted successfully");
                } catch (e: any) {
                  setDeleteError(e.message || "Failed to delete file");
                } finally {
                  setDeleteLoading(false);
                }
              }}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
