import { Dialog } from "primereact/dialog";
import { Skeleton } from "primereact/skeleton";
import { Tag } from "primereact/tag";

function UserDetailsDialog({ visible, onHide, user, profileLoading }) {
  const initials = (user?.name || user?.email || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const isBlocked = Number(user?.is_blocked) === 1;
  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const detailRow = (label, value) => (
    <div className="grid grid-cols-[120px_1fr] gap-3 py-2.5 border-b border-gray-100/80 dark:border-gray-800/70">
      <span className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800 dark:text-gray-100 break-all">{value || "-"}</span>
    </div>
  );

  return (
    <Dialog
      header={
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
              {user?.name || "Unnamed User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || "-"}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 pr-3">
            <Tag
              value={user?.role || "customer"}
              className="text-xs px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800/40 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-cyan-200/60 dark:hover:shadow-cyan-900/40"
            />
            <Tag
              value={isBlocked ? "Blocked" : "Active"}
              className={
                isBlocked
                  ? "text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/40 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-amber-200/60 dark:hover:shadow-amber-900/40"
                  : "text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/40 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-200/60 dark:hover:shadow-emerald-900/40"
              }
            />
          </div>
        </div>
      }
      visible={visible}
      style={{ width: "560px" }}
      breakpoints={{ "641px": "95vw" }}
      onHide={onHide}
      dismissableMask
      pt={{
        root: { className: "border-0 shadow-2xl rounded-2xl overflow-hidden admin-dialog" },
        header: { className: "admin-dialog-header px-6 py-4 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur" },
        content: { className: "p-6 bg-gradient-to-b from-white to-gray-50/60 dark:from-gray-950 dark:to-gray-900/60" },
      }}
    >
      {profileLoading ? (
        <div className="space-y-3">
          <Skeleton height="1.25rem" width="65%" />
          <Skeleton height="1.25rem" width="90%" />
          <Skeleton height="1.25rem" width="75%" />
          <Skeleton height="1.25rem" width="80%" />
          <Skeleton height="1.25rem" width="70%" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 shadow-sm">
            <div className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Account
            </div>
            <div className="px-4 pb-3">
              {detailRow("Name", user?.name)}
              {detailRow("Email", user?.email)}
              {detailRow("Role", user?.role)}
              {detailRow("Status", isBlocked ? "Blocked" : "Active")}
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 shadow-sm">
            <div className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Activity
            </div>
            <div className="px-4 pb-3">
              {detailRow("Last Login", formatDate(user?.last_login))}
              {detailRow("Created", formatDate(user?.created_at))}
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}

export default UserDetailsDialog;
