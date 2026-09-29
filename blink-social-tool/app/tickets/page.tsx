import { prisma } from '@/lib/prisma';
import TicketsTable from '@/components/TicketsTable';

export const revalidate = 0; // Ensures data is always fresh

export default async function TicketsPage() {
  // Fetch all tickets from the database, newest first
  const tickets = await prisma.ticket.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-50 flex-1">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Support Tickets</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage customer inquiries and complaints generated from the Unified Inbox.
        </p>
      </div>

      {/* Render the interactive client-side table */}
      <TicketsTable tickets={tickets} />
    </div>
  );
}