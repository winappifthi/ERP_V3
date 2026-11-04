import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="text-center py-24">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="text-gray-500 mt-2">Page not found.</p>
      <Link to="/app/dashboard" className="inline-block mt-4 text-blue-600 hover:underline text-sm">
        Return to dashboard
      </Link>
    </div>
  );
}