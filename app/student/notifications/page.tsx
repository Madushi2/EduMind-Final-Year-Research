import ComingSoon from "@/components/admin/ComingSoon";

const icon = (
  <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

export default function StudentNotificationsPage() {
  return <ComingSoon title="Notifications" desc="Draft module for selected course notifications." icon={icon} accent="#dc2626" />;
}
