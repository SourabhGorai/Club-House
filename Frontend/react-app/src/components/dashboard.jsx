export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="max-w-lg mx-auto mt-20 p-8 bg-white shadow-xl rounded-2xl">
      <h1 className="text-3xl font-bold text-center text-green-600">
        Welcome to Dashboard 🎉
      </h1>

      {user && (
        <p className="text-center text-xl mt-4">
          Logged in as: <span className="font-semibold">{user.username}</span>
        </p>
      )}
    </div>
  );
}
