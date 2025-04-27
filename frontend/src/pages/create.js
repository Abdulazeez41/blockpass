import CreateEventForm from "@/pages/CreateEvent/CreateEvent";
import ProtectedRoute from "@/pages/protectedRoute";

export default function CreateEventPage() {
  return (
    <ProtectedRoute>
      <CreateEventForm />
    </ProtectedRoute>
  );
}
