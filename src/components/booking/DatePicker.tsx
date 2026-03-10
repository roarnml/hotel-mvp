"use client"

import { useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

interface BookingDatePickerProps {
  checkIn: Date | null
  checkOut: Date | null
  onChange: (dates: { checkIn: Date | null; checkOut: Date | null }) => void
}

export default function BookingDatePicker({ checkIn, checkOut, onChange }: BookingDatePickerProps) {
  const [startDate, setStartDate] = useState<Date | null>(checkIn)
  const [endDate, setEndDate] = useState<Date | null>(checkOut)

  const handleChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates
    setStartDate(start)
    setEndDate(end)
    onChange({ checkIn: start, checkOut: end })
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <label className="flex-1">
        <span className="block mb-1 font-medium">Check-in / Check-out</span>
        <DatePicker
          selected={startDate}
          onChange={handleChange}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          minDate={new Date()}
          placeholderText="Select your stay"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>
    </div>
  )
}
