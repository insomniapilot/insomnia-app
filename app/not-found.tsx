import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Page Not Found</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            href="/home"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
