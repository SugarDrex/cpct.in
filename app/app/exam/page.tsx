import { Suspense } from "react";
import MockTestContent from "./mocktest";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading exam...</div>}>
      <MockTestContent />
    </Suspense>
  );
}