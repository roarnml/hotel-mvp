
function MetricCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-semibold text-gray-900 mt-2">
        {value}
      </p>
    </div>
  )
}

function ArrivalRow({
  guest,
  room,
  time,
  status,
}: {
  guest: string
  room: string
  time: string
  status: string
}) {
  return (
    <tr>
      <td className="py-3">{guest}</td>
      <td>{room}</td>
      <td>{time}</td>
      <td>
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === "Checked in"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {status}
        </span>
      </td>
    </tr>
  )
}
