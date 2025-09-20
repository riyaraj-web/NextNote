export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SaaS Notes App
          </h1>
          <p className="text-gray-600 mb-8">
            Welcome to your personal notes management system
          </p>
          <a 
            href="/auth/login"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    </div>
  );
}