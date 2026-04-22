import ComingSoon from "@/components/admin/ComingSoon";

const icon = (
  <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 9h.01M15 9h.01M9 15h6m-8 6h10a2 2 0 002-2V7.5L14.5 3H7a2 2 0 00-2 2v14a2 2 0 002 2zM14 3v5h5" />
  </svg>
);

export default function GenerateQuizPage() {
  return <ComingSoon title="Generate Quiz" desc="Draft module for quiz generation in the selected course." icon={icon} accent="#059669" />;
}
