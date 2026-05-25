import { Suspense } from "react";
import { ChallengeClient } from "./ChallengeClient";

export const metadata = { title: "MFA · Admin" };

export default function ChallengeMfaPage() {
  return (
    <Suspense fallback={null}>
      <ChallengeClient />
    </Suspense>
  );
}
