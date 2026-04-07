import { Suspense } from "react";
import NewExamContent from "./newtest";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading exam...</div>}>
      <NewExamContent/>
    </Suspense>
  );
}