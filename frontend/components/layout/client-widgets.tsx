"use client";

import dynamic from "next/dynamic";

const WelcomeToast = dynamic(
  () => import("components/welcome-toast").then((mod) => mod.WelcomeToast),
  { ssr: false }
);
const EmailToastListener = dynamic(
  () => import("components/email/email-toast-listener").then((mod) => mod.EmailToastListener),
  { ssr: false }
);
const FloatingChatbot = dynamic(
  () => import("components/chatbot/FloatingChatbot"),
  { ssr: false }
);
const AbandonedReminderModal = dynamic(
  () => import("components/modals/AbandonedReminderModal").then((mod) => mod.AbandonedReminderModal),
  { ssr: false }
);
const SocialProofToast = dynamic(
  () => import("components/social/social-proof-toast").then((mod) => mod.SocialProofToast),
  { ssr: false }
);

export function ClientWidgets() {
  return (
    <>
      <WelcomeToast />
      <EmailToastListener />
      <FloatingChatbot />
      <AbandonedReminderModal />
      <SocialProofToast />
    </>
  );
}
