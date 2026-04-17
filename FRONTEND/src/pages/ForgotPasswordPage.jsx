import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import api from "../../api/api";

function ForgotPasswordPage() {
  const [step, setStep] = useState("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validateEmail = () => {
    if (!email.trim()) {
      setValidationErrors({ email: "Email is required" });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationErrors({ email: "Please enter a valid email" });
      return false;
    }
    setValidationErrors({});
    return true;
  };

  const validateOtp = () => {
    if (!otp.trim() || !/^\d{6}$/.test(otp)) {
      setValidationErrors({ otp: "Please enter a valid 6-digit OTP" });
      return false;
    }
    setValidationErrors({});
    return true;
  };

  const validatePasswords = () => {
    const errors = {};
    if (!newPassword) errors.newPassword = "New password is required";
    else if (newPassword.length < 8)
      errors.newPassword = "Password must be at least 8 characters";

    if (!confirmPassword)
      errors.confirmPassword = "Please confirm your password";
    else if (newPassword !== confirmPassword)
      errors.confirmPassword = "Passwords do not match";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const requestOtp = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!validateEmail()) return;

    try {
      setLoading(true);
      const { data } = await api.post("/users/forgot-password/request-otp", {
        email,
      });
      setOtpToken(data?.data?.otpToken || "");
      setStep("verify");
      setSuccess("If email exists, OTP has been sent.");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to request OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!validateOtp()) return;

    try {
      setLoading(true);
      const { data } = await api.post("/users/forgot-password/verify-otp", {
        email,
        otp,
        otpToken,
      });

      setResetToken(data?.data?.resetToken || "");
      setStep("reset");
      setSuccess("OTP verified. Set a new password.");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!validatePasswords()) return;

    try {
      setLoading(true);
      await api.post("/users/forgot-password/reset", {
        resetToken,
        newPassword,
        confirmPassword,
      });
      setSuccess("Password reset successful. You can login now.");
      setStep("done");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-slate-50 to-[#e6f7f5]/50 text-slate-900 dark:from-[#070b12] dark:via-[#0b1220] dark:to-[#0f172a] dark:text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-6 h-80 w-80 rounded-full bg-[#1A9E8E]/30 blur-[120px] dark:bg-emerald-500/20" />
        <div className="absolute bottom-[-3rem] right-[-2rem] h-96 w-96 rounded-full bg-cyan-300/40 blur-[130px] dark:bg-teal-400/15" />
        <div className="absolute left-1/2 top-6 h-28 w-[110vw] -translate-x-1/2 bg-gradient-to-r from-transparent via-slate-900/10 to-transparent opacity-60 dark:via-emerald-300/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_55%)] dark:block hidden" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-4 py-16 md:flex-row md:gap-10 md:px-8">
        <div className="w-full max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-600 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200">
            Recovery Mode
          </span>
          <h2 className="mt-6 font-serif text-5xl font-semibold leading-tight text-slate-900 dark:text-white md:text-6xl">
            Reclaim your account
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-white/70">
            Bold security with a clean, modern flow. Verify in seconds, reset in
            one move.
          </p>

          <div className="mt-8 grid gap-4 text-sm text-slate-700 dark:text-white/80 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-900/10 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-white/50">
                01
              </div>
              Request OTP
            </div>
            <div className="rounded-2xl border border-slate-900/10 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-white/50">
                02
              </div>
              Verify code
            </div>
            <div className="rounded-2xl border border-slate-900/10 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none md:col-span-2">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-white/50">
                03
              </div>
              Set a new password
            </div>
          </div>
        </div>

        <div className="mt-10 w-full max-w-md rounded-[32px] border border-slate-900/10 bg-white/90 p-7 shadow-2xl shadow-slate-900/10 backdrop-blur md:mt-0 md:p-9 dark:border-white/10 dark:bg-gradient-to-b dark:from-[#0f172a]/90 dark:via-[#0b1220]/90 dark:to-[#0b111d]/95 dark:shadow-black/50">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-white/60">
            <span>Forgot Password</span>
            <span className="rounded-full border border-slate-900/10 px-3 py-1 text-[0.7rem] text-slate-500 dark:border-white/10 dark:text-white/70">
              {step === "request" && "Step 1/3"}
              {step === "verify" && "Step 2/3"}
              {step === "reset" && "Step 3/3"}
              {step === "done" && "Done"}
            </span>
          </div>

          <p className="mt-3 text-sm text-slate-600 dark:text-white/70">
            {step === "request" &&
              "Enter your email to receive a one-time code."}
            {step === "verify" && "Enter the OTP sent to your inbox."}
            {step === "reset" && "Choose a strong new password."}
            {step === "done" && "Your password has been updated."}
          </p>

          {step === "request" && (
            <form onSubmit={requestOtp} className="mt-6 space-y-4">
              <InputText
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-none outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-emerald-300 dark:focus:ring-emerald-300/20 dark:shadow-[0_0_0_1px_rgba(16,185,129,0.1)]"
                placeholder="Email address"
                required
              />
              <Button
                type="submit"
                label={loading ? "Please wait..." : "Send OTP"}
                disabled={loading}
                className="w-full !rounded-2xl !bg-gradient-to-r !from-emerald-600 !to-teal-500 !px-6 !py-3 !font-semibold !text-white hover:!from-emerald-500 hover:!to-teal-400 dark:!from-emerald-400 dark:!to-teal-300 dark:!text-slate-900 dark:hover:!from-emerald-300 dark:hover:!to-teal-200 dark:shadow-[0_18px_40px_-18px_rgba(16,185,129,0.7)]"
              />
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={verifyOtp} className="mt-6 space-y-4">
              <InputText
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/[^\d]/g, "").slice(0, 6))
                }
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-center text-lg tracking-[0.45em] text-slate-900 shadow-none outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-emerald-300 dark:focus:ring-emerald-300/20 dark:shadow-[0_0_0_1px_rgba(16,185,129,0.1)]"
                placeholder="------"
                required
              />
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                Code sent to:{" "}
                <span className="font-semibold">{email || "your email"}</span>
              </div>
              <Button
                type="submit"
                label={loading ? "Please wait..." : "Verify OTP"}
                disabled={loading}
                className="w-full !rounded-2xl !bg-gradient-to-r !from-emerald-600 !to-teal-500 !px-6 !py-3 !font-semibold !text-white hover:!from-emerald-500 hover:!to-teal-400 dark:!from-emerald-400 dark:!to-teal-300 dark:!text-slate-900 dark:hover:!from-emerald-300 dark:hover:!to-teal-200 dark:shadow-[0_18px_40px_-18px_rgba(16,185,129,0.7)]"
              />
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={resetPassword} className="mt-6 space-y-4">
              <Password
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                feedback={false}
                toggleMask
                className="w-full"
                inputClassName="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-none outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-emerald-300 dark:focus:ring-emerald-300/20 dark:shadow-[0_0_0_1px_rgba(16,185,129,0.1)]"
                placeholder="New password"
                required
              />
              <Password
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                feedback={false}
                toggleMask
                className="w-full"
                inputClassName="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-none outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-emerald-300 dark:focus:ring-emerald-300/20 dark:shadow-[0_0_0_1px_rgba(16,185,129,0.1)]"
                placeholder="Confirm password"
                required
              />
              <Button
                type="submit"
                label={loading ? "Please wait..." : "Reset Password"}
                disabled={loading}
                className="w-full !rounded-2xl !bg-gradient-to-r !from-emerald-600 !to-teal-500 !px-6 !py-3 !font-semibold !text-white hover:!from-emerald-500 hover:!to-teal-400 dark:!from-emerald-400 dark:!to-teal-300 dark:!text-slate-900 dark:hover:!from-emerald-300 dark:hover:!to-teal-200 dark:shadow-[0_18px_40px_-18px_rgba(16,185,129,0.7)]"
              />
            </form>
          )}

          {error && (
            <p className="mt-4 text-sm text-rose-600 dark:text-rose-300">
              {error}
            </p>
          )}
          {success && (
            <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-300">
              {success}
            </p>
          )}

          <p className="mt-6 text-sm text-slate-600 dark:text-white/70">
            Back to{" "}
            <Link
              to="/login"
              className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-300 dark:hover:text-emerald-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
