import {
  CreateSolanaDataSchema,
  createSolanaDataSchema,
} from "@/lib/validation/solanaData";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import LoadingButton from "./ui/loading-button";
import { Textarea } from "./ui/textarea";
import { useRouter } from "next/navigation";
import { SolanaData } from "@prisma/client";
import { useState } from "react";

interface AddEditSolanaDataDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  solanaDataToEdit?: SolanaData;
}

export default function AddEditSolanaDataDialog({
  open,
  setOpen,
  solanaDataToEdit,
}: AddEditSolanaDataDialogProps) {
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const router = useRouter();
  const form = useForm<CreateSolanaDataSchema>({
    resolver: zodResolver(createSolanaDataSchema),
    defaultValues: {
      title: solanaDataToEdit?.title || "",
      content: solanaDataToEdit?.content || "",
    },
  });
  async function onSubmit(input: CreateSolanaDataSchema) {
    try {
      if (solanaDataToEdit) {
        const response = await fetch("/api/solanaData", {
          method: "PUT",
          body: JSON.stringify({
            id: solanaDataToEdit.id,
            ...input,
          }),
        });
        if (!response.ok) throw Error("Status code: " + response.status);
      } else {
        const response = await fetch("/api/solanaData", {
          method: "POST",
          body: JSON.stringify(input),
        });
        if (!response.ok) throw Error("Status code: " + response.status);
        form.reset();
      }
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    }
  }
  async function deleteSolanaData() {
    if (!solanaDataToEdit) return;
    try {
      setDeleteInProgress(true);
      const response = await fetch("/api/solanaData", {
        method: "DELETE",
        body: JSON.stringify({
          id: solanaDataToEdit.id,
        }),
      });
      if (!response.ok) throw Error("Status code: " + response.status);
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setDeleteInProgress(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {solanaDataToEdit ? "Edit Solana Data" : "Add Solana Data"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solana Data title</FormLabel>
                  <FormControl>
                    <Input placeholder="Solana Data title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solana Data content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Solana Data content" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-1 sm:gap-0">
              {solanaDataToEdit && (
                <LoadingButton
                  variant="destructive"
                  loading={deleteInProgress}
                  disabled={form.formState.isSubmitting}
                  onClick={deleteSolanaData}
                  type="button"
                >
                  Delete solana data
                </LoadingButton>
              )}
              <LoadingButton
                type="submit"
                loading={form.formState.isSubmitting}
                disabled={deleteInProgress}
              >
                Submit
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
