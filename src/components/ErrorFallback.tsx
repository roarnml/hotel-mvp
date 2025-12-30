export default function ErrorFallback({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
      <h1 className="text-4xl font-bold mb-4 text-red-600">🚧 Coming Soon</h1>
      <p className="text-lg text-gray-700">
        {message || "We are updating this section. Please check back later!"}
      </p>
    </div>
  )
}
