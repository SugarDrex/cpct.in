"use client";

import { useParams } from "next/navigation";
import DocxViewer from "@/components/DocxViewer";

export default function Preview() {
  const params = useParams();

  return (
    <div className="h-screen">
      <DocxViewer url={`/api/notes/${params.id}`} />
    </div>
  );
}