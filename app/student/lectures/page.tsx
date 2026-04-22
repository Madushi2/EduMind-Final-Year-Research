import ComingSoon from "@/components/admin/ComingSoon";

const icon = (
  <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6.5A2.5 2.5 0 016.5 4H20v14H6.5A2.5 2.5 0 004 20.5v-14zM8 8h8M8 12h6" />
  </svg>
);

export default function LecturesPage() {
  return <ComingSoon title="Lectures" desc="Draft module for selected course lectures." icon={icon} accent="#7c3aed" />;
}
