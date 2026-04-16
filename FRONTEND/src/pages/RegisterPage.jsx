import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import api from "../../api/api";
import SmartImage from "../components/common/SmartImage";

function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState("");

  const validateDetailsForm = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = "Name is required";
    } else if (name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateOtpForm = () => {
    const errors = {};

    if (!otp.trim()) {
      errors.otp = "OTP is required";
    } else if (!/^\d{6}$/.test(otp)) {
      errors.otp = "Please enter a valid 6-digit OTP";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const requestOtp = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!validateDetailsForm()) return;

    try {
      setLoading(true);
      const { data } = await api.post("/users/register/request-otp", {
        name,
        email,
        password,
      });

      setOtpToken(data?.data?.otpToken || "");
      setStep("otp");
      setSuccess("OTP sent to your email.");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!validateOtpForm()) return;

    try {
      setLoading(true);
      await api.post("/users/register/verify-otp", {
        otp,
        otpToken,
      });

      setSuccess("Account created successfully.");
      navigate("/login");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-slate-950 md:p-8">
      <div className="mx-auto grid min-h-[88vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2">
        <div className="relative hidden md:block">
          <SmartImage
            src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80"
            alt="Minimal scenic background"
            wrapperClassName="h-full w-full"
            className="h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/65 via-transparent to-[#1A9E8E]/25" />
          <div className="absolute bottom-10 left-10 max-w-sm text-white">
            <h1 className="font-serif text-4xl leading-tight">
              &ldquo;Start simple. Shop smarter.&rdquo;
            </h1>
            <p className="mt-4 text-sm text-slate-100">
              Create your account and begin your journey.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex items-center justify-center rounded-2xl bg-white px-7 py-4 text-base font-semibold text-slate-900 shadow-2xl shadow-slate-950/30 transition hover:-translate-y-0.5 hover:bg-[#e6f7f5] focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              Explore Shop
            </Link>
            <p className="mt-3 text-sm font-medium text-white/90">
              Browse products first. Create an account only when you&apos;re
              ready.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center p-8 md:p-12">
          <form
            onSubmit={step === "details" ? requestOtp : verifyOtp}
            className="w-full max-w-md p-fluid"
          >
            <h2 className="font-serif text-4xl font-semibold text-gray-900 dark:text-slate-100">
              Register
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
              {step === "details"
                ? "Step 1: Enter details to receive OTP."
                : "Step 2: Enter OTP sent to your email."}
            </p>

            <div className="mt-8 space-y-4">
              {step === "details" ? (
                <>
                  <div className="space-y-1">
                    <InputText
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                        if (validationErrors.name)
                          setValidationErrors((prev) => ({
                            ...prev,
                            name: undefined,
                          }));
                      }}
                      className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 shadow-none outline-none transition focus:ring-2 focus:shadow-none dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 ${
                        validationErrors.name
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-[#1A9E8E] focus:ring-[#1A9E8E]/20 dark:border-slate-700"
                      }`}
                      placeholder="Enter Your Name"
                      aria-invalid={!!validationErrors.name}
                    />
                    {validationErrors.name && (
                      <p className="text-sm text-red-500 dark:text-red-400">
                        {validationErrors.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <InputText
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (validationErrors.email)
                          setValidationErrors((prev) => ({
                            ...prev,
                            email: undefined,
                          }));
                      }}
                      className={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 shadow-none outline-none transition focus:ring-2 focus:shadow-none dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 ${
                        validationErrors.email
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-[#1A9E8E] focus:ring-[#1A9E8E]/20 dark:border-slate-700"
                      }`}
                      placeholder="Email"
                      type="email"
                      aria-invalid={!!validationErrors.email}
                    />
                    {validationErrors.email && (
                      <p className="text-sm text-red-500 dark:text-red-400">
                        {validationErrors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Password
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        if (validationErrors.password)
                          setValidationErrors((prev) => ({
                            ...prev,
                            password: undefined,
                          }));
                      }}
                      feedback={false}
                      toggleMask
                      className="w-full"
                      inputClassName={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 shadow-none outline-none transition focus:ring-2 focus:shadow-none dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 ${
                        validationErrors.password
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-[#1A9E8E] focus:ring-[#1A9E8E]/20 dark:border-slate-700"
                      }`}
                      placeholder="Password"
                      aria-invalid={!!validationErrors.password}
                    />
                    {validationErrors.password && (
                      <p className="text-sm text-red-500 dark:text-red-400">
                        {validationErrors.password}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Password
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        if (validationErrors.confirmPassword)
                          setValidationErrors((prev) => ({
                            ...prev,
                            confirmPassword: undefined,
                          }));
                      }}
                      feedback={false}
                      toggleMask
                      className="w-full"
                      inputClassName={`w-full rounded-lg border bg-white px-4 py-3 text-gray-900 shadow-none outline-none transition focus:ring-2 focus:shadow-none dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 ${
                        validationErrors.confirmPassword
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-200 focus:border-[#1A9E8E] focus:ring-[#1A9E8E]/20 dark:border-slate-700"
                      }`}
                      placeholder="Confirm Password"
                      aria-invalid={!!validationErrors.confirmPassword}
                    />
                    {validationErrors.confirmPassword && (
                      <p className="text-sm text-red-500 dark:text-red-400">
                        {validationErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <InputText
                    value={otp}
                    onChange={(event) => {
                      setOtp(
                        event.target.value.replace(/[^\d]/g, "").slice(0, 6),
                      );
                      if (validationErrors.otp)
                        setValidationErrors((prev) => ({
                          ...prev,
                          otp: undefined,
                        }));
                    }}
                    className={`w-full rounded-lg border bg-white px-4 py-3 text-center text-gray-900 shadow-none outline-none transition focus:ring-2 focus:shadow-none dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 ${
                      validationErrors.otp
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-[#1A9E8E] focus:ring-[#1A9E8E]/20 dark:border-slate-700"
                    }`}
                    placeholder="Enter 6-digit OTP"
                    aria-invalid={!!validationErrors.otp}
                  />
                  {validationErrors.otp && (
                    <p className="text-sm text-red-500 dark:text-red-400">
                      {validationErrors.otp}
                    </p>
                  )}
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}
              {success && (
                <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    {success}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                label={
                  loading
                    ? "Please wait..."
                    : step === "details"
                      ? "Send OTP"
                      : "Verify OTP & Create Account"
                }
                disabled={loading}
                loading={loading}
                className="w-full !rounded-lg !bg-[#1A9E8E] !px-6 !py-3 !font-medium !text-white !shadow-lg !shadow-[#1A9E8E]/20 transition-all hover:!bg-[#168c7e] disabled:opacity-70"
              />

              {step === "otp" && (
                <Button
                  type="button"
                  label="Resend OTP"
                  disabled={loading}
                  onClick={requestOtp}
                  className="w-full !rounded-lg !border !border-[#1A9E8E] !bg-transparent !px-6 !py-3 !font-medium !text-[#1A9E8E] hover:!bg-[#e6f7f5] dark:!text-[#26c9b4] dark:hover:!bg-[#1a2e28]"
                />
              )}
            </div>

            <p className="mt-6 text-sm text-gray-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-[#1A9E8E] hover:text-[#168c7e] dark:text-[#26c9b4] dark:hover:text-[#4dd3c2]"
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
