import EventGallery from "@/pages/EventGallery/EventGallery";
import ProtectedRoute from "@/pages/protectedRoute";

export default function EventGalleryPage() {
  return (
    <ProtectedRoute>
      <EventGallery />
    </ProtectedRoute>
  );
}
