import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../redux/slices/authSlice";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");
  const dispatch = useDispatch();
  const { loading, error: authError } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidationError("");

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    const resultAction = await dispatch(registerUser({ name, email, password }));
    if (registerUser.fulfilled.match(resultAction)) {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-slate-950 md:p-8">
      <div className="mx-auto grid min-h-[88vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2">
        <div className="relative hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80"
            alt="Minimal scenic background"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/65 via-transparent to-amber-600/25" />
          <div className="absolute bottom-10 left-10 max-w-sm text-white">
            <h1 className="font-serif text-4xl leading-tight">
              &ldquo;Start simple. Shop smarter.&rdquo;
            </h1>
            <p className="mt-4 text-sm text-slate-100">
              Create your account and begin your journey.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center p-8 md:p-12">
          <form onSubmit={handleSubmit} className="w-full max-w-md p-fluid">
            <h2 className="font-serif text-4xl font-semibold text-gray-900 dark:text-slate-100">
              Register
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
              Create your account to continue.
            </p>

            <div className="mt-8 space-y-4">
              <InputText
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-none outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:shadow-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                placeholder="Enter Your Name"
                required
              />

              <InputText
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-none outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:shadow-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                placeholder="Email"
                required
              />

              <Password
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                feedback={false}
                toggleMask
                className="w-full"
                inputClassName="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-none outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:shadow-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                placeholder="Password"
                required
              />

              <Password
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                feedback={false}
                toggleMask
                className="w-full"
                inputClassName="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-none outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:shadow-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                placeholder="Confirm Password"
                required
              />

              {validationError && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {validationError}
                </p>
              )}

              {authError && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {authError}
                </p>
              )}

              <Button
                type="submit"
                label={loading ? "Creating..." : "Create Account"}
                disabled={loading}
                className="w-full !rounded-lg !bg-amber-600 !px-6 !py-3 !font-medium !text-white !shadow-lg !shadow-amber-600/20 transition-all hover:!bg-amber-700"
              />
            </div>

            <p className="mt-6 text-sm text-gray-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
