"use client";

import { SolanaData as SolanaDataModel } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import AddEditSolanaDataDialog from "./AddEditSolanaDataDialog";
import { useState } from "react";

interface SolanaDataProps {
  solanaData: SolanaDataModel;
}

export default function SolanaData({ solanaData }: SolanaDataProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const wasUpdated = solanaData.updatedAt > solanaData.createdAt;
  const createdUpdatedAtTimestamp = (
    wasUpdated ? solanaData.updatedAt : solanaData.createdAt
  ).toDateString();
  return (
    <>
      <Card
        className="cursor-pointer transition-shadow hover:shadow-lg"
        onClick={() => setShowEditDialog(true)}
      >
        <CardHeader>
          <CardTitle>{solanaData.title}</CardTitle>
          <CardDescription>
            {createdUpdatedAtTimestamp}
            {wasUpdated && " (updated)"}
          </CardDescription>
        </CardHeader>
        <CardContent className="sm:block hidden">
          <p className="truncate">{solanaData.content}</p>
        </CardContent>
      </Card>
      <AddEditSolanaDataDialog
        open={showEditDialog}
        setOpen={setShowEditDialog}
        solanaDataToEdit={solanaData}
      />
    </>
  );
}
