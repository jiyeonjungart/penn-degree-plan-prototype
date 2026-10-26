import { useEffect, useRef, useState } from "react";
import { accountInitials } from "../data";
import { usePlan } from "../planContext";

function formatNotifTime(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function TopBar() {
  const {
    planColumnOpen,
    setPlanColumnOpen,
    reqColumnOpen,
    setReqColumnOpen,
    notifications,
    unreadNotificationCount,
    markNotificationsRead,
    clearNotifications,
  } = usePlan();

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notifOpen) return;
    const onDown = (e: MouseEvent) => {
      if (notifRef.current?.contains(e.target as Node)) return;
      setNotifOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [notifOpen]);

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <img
          className="topbar-logo"
          src="/pdp-logo.svg"
          alt="Penn Degree Plan"
          width={30}
          height={45}
        />
        <span className="topbar-title">Penn Degree Plan</span>
      </div>

      <div className="topbar-right">
        <div className="topbar-columns" role="group" aria-label="Toggle columns">
          <button
            type="button"
            className={`topbar-col-toggle ${planColumnOpen ? "is-open" : "is-closed"}`}
            aria-pressed={planColumnOpen}
            aria-label={
              planColumnOpen
                ? "Hide degree plan column"
                : "Show degree plan column"
            }
            onClick={() => setPlanColumnOpen(!planColumnOpen)}
          >
            <i className="fas fa-calendar-alt" aria-hidden />
            <span>Plan</span>
          </button>
          <button
            type="button"
            className={`topbar-col-toggle ${reqColumnOpen ? "is-open" : "is-closed"}`}
            aria-pressed={reqColumnOpen}
            aria-label={
              reqColumnOpen
                ? "Hide requirements column"
                : "Show requirements column"
            }
            onClick={() => setReqColumnOpen(!reqColumnOpen)}
          >
            <i className="fas fa-list-check" aria-hidden />
            <span>Requirements</span>
          </button>
        </div>

        <div className="topbar-notif" ref={notifRef}>
          <button
            type="button"
            className={`topbar-notif-btn ${notifOpen ? "is-open" : ""}`}
            aria-label={
              unreadNotificationCount > 0
                ? `Notifications, ${unreadNotificationCount} unread`
                : "Notifications"
            }
            aria-expanded={notifOpen}
            onClick={() => {
              setNotifOpen((open) => {
                const next = !open;
                if (next) markNotificationsRead();
                return next;
              });
            }}
          >
            <i className="fas fa-bell" aria-hidden />
            {unreadNotificationCount > 0 && (
              <span className="topbar-notif-badge">
                {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="topbar-notif-panel" role="dialog" aria-label="Notifications">
              <div className="topbar-notif-header">
                <strong>Notifications</strong>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    className="topbar-notif-clear"
                    onClick={clearNotifications}
                  >
                    Clear all
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="topbar-notif-empty">No notifications yet.</div>
              ) : (
                <ul className="topbar-notif-list">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`topbar-notif-item ${n.read ? "" : "is-unread"}`}
                    >
                      <p className="topbar-notif-msg">{n.message}</p>
                      <time dateTime={new Date(n.createdAt).toISOString()}>
                        {formatNotifTime(n.createdAt)}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="topbar-account" title="Account">
          {accountInitials}
        </div>
      </div>
    </header>
  );
}
