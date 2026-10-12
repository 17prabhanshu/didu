export const dynamic = 'force-dynamic';

import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { AdminDataTable } from "@/components/admin/data-table";

export const metadata = { title: 'Subscribers | Admin' };

export default async function AdminSubscribersPage() {
  await requireAuth();

  const subscribers = await db.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  }).catch(() => []);

  const formattedData = subscribers.map((sub: any) => ({
    id: sub.id,
    email: sub.email,
    age: sub.age ?? "N/A",
    status: sub.status,
    subscribedAt: sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString() : "Pending",
  }));

  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' },
    { key: 'age', label: 'Age' },
    { key: 'subscribedAt', label: 'Subscribed Date' },
  ];

  return (
    <div className="container mx-auto py-8">
      <AdminDataTable
        title="Newsletter Subscribers"
        description="Manage verified subscribers and mailing lists"
        data={formattedData}
        columns={columns}
        modelName="newsletterSubscriber"
        entitySlug="subscribers"
      />
    </div>
  );
}
