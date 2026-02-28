// src/app/(public)/booking/success/page.tsx
import ClientBookingLayout from "../ClientLayout"
import BookingSuccess from "./BookingSuccessPage"

export default function BookingSuccessWrapper() {
  return (
    <ClientBookingLayout>
      <BookingSuccess />
    </ClientBookingLayout>
  )
}