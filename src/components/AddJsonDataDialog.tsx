import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Form } from "./ui/form";
import LoadingButton from "./ui/loading-button";
import myData from "@/assets/questionAnswers.json";

interface QuestionAnswer {
  question: string;
  answer: string;
}

const typedData: QuestionAnswer[] = myData as QuestionAnswer[];

interface AddJsonDataDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function AddJsonDataDialog({
  open,
  setOpen,
}: AddJsonDataDialogProps) {
  const form = useForm();

  async function addData() {
    try {
      let i = 1;
      for (const item of typedData) {
        const response = await fetch("/api/solanaData", {
          method: "POST",
          body: JSON.stringify({
            title: "Solana Stack Exchange Question " + i,
            content: JSON.stringify(item),
          }),
        });
        i++;
      }
      form.reset();
    } catch (error) {
      console.error(error);
      // alert("Something went wrong. Please try again.");
    }
  }
  // async function addData(input: CreateSolanaDataSchema) {
  //   try {
  //       let i = 1;
  //       for (const { Body, AcceptedAnswerPost, AnswerPosts } of myData.slice(0, 10)) {
  //         if (Body && AcceptedAnswerPost) {
  //           const response = await fetch("/api/solanaData", {
  //             method: "POST",
  //             body: JSON.stringify({
  //               title: "Question " + i,
  //               content: AcceptedAnswerPost.Body,
  //             }),
  //           });
  //           if (!response.ok) throw Error("Status code: " + response.status);
  //         } else if (Body && AnswerPosts) {
  //           const response = await fetch("/api/solanaData", {
  //             method: "POST",
  //             body: JSON.stringify({
  //               title: "Question " + i,
  //               content: AnswerPosts.map((post: any) => post.Body).join("\n"),
  //             }),
  //           });
  //           if (!response.ok) throw Error("Status code: " + response.status);
  //         }
  //         i++;
  //       }
  //       form.reset();
  //   } catch (error) {
  //     console.error(error);
  //     // alert("Something went wrong. Please try again.");
  //   }
  // }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Json Data</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(addData)} className="space-y-3">
            <DialogFooter className="gap-1 sm:gap-0">
              <LoadingButton
                type="submit"
                loading={form.formState.isSubmitting}
                disabled={true}
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
