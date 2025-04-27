import Tickets from "@/pages/MyTicket/MyTickets";
import ProtectedRoute from "@/pages/protectedRoute";

export default function MyTicketsPage() {
  return (
    <ProtectedRoute>
      <Tickets />
    </ProtectedRoute>
  );
}
