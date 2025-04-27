import { useRouter } from "next/router";
import EventDetailPage from "@/pages/EventGallery/EventDetailPage";
import ProtectedRoute from "@/pages/protectedRoute";

export default function EventDetail() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <ProtectedRoute>
      <EventDetailPage events={id} />
    </ProtectedRoute>
  );
}
