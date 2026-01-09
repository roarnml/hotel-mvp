// src/app/(public)/booking/success/page.tsx
import ClientBookingLayout from "../ClientLayout"
import BookingSuccessPage from "./BookingSuccessPage" // move the existing JSX into a component if needed

export default function BookingSuccessWrapper() {
  return (
    <ClientBookingLayout>
      <BookingSuccessPage />
    </ClientBookingLayout>
  )
}
