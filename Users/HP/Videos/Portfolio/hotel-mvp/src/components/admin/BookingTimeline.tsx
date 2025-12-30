import {
  FiClock,
  FiCreditCard,
  FiLogIn,
  FiLogOut,
  FiXCircle,
} from "react-icons/fi"

type TimelineStatus =
  | "CREATED"
  | "PAID"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "CANCELLED"

interface TimelineEvent {
  label: string
  time: string
  status: TimelineStatus
}

export default function BookingTimeline({
  events,
}: {
  events: TimelineEvent[]
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Booking Timeline
      </h2>

      <ol className="space-y-4">
        {events.map((event, i) => (
          <li key={i} className="flex items-start gap-4">
            <div className="mt-1">{iconMap[event.status]}</div>

            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {event.label}
              </p>
              <p className="text-xs text-gray-500">
                {event.time}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* --- Icons --- */

const iconStyle =
  "w-8 h-8 rounded-full flex items-center justify-center text-white"

const iconMap: Record<TimelineStatus, JSX.Element> = {
  CREATED: (
    <div className={`${iconStyle} bg-gray-400`}>
      <FiClock size={16} />
    </div>
  ),
  PAID: (
    <div className={`${iconStyle} bg-blue-600`}>
      <FiCreditCard size={16} />
    </div>
  ),
  CHECKED_IN: (
    <div className={`${iconStyle} bg-green-600`}>
      <FiLogIn size={16} />
    </div>
  ),
  CHECKED_OUT: (
    <div className={`${iconStyle} bg-indigo-600`}>
      <FiLogOut size={16} />
    </div>
  ),
  CANCELLED: (
    <div className={`${iconStyle} bg-red-600`}>
      <FiXCircle size={16} />
    </div>
  ),
}
