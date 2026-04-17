"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useI18n } from "@/lib/i18n/context";

interface BookingInfo {
  id: number;
  status: string;
  date: string;
  startTime: string;
  className: string;
  userName: string;
  canCancel: boolean;
  hoursUntilClass: number;
}

export default function CancelPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const { t } = useI18n();
  const [info, setInfo] = useState<BookingInfo | null>(null);
  const [status, setStatus] = useState<"loading" | "loaded" | "cancelling" | "cancelled" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch(`/api/bookings/cancel?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setErrorMsg(d.error || "Booking not found");
          setStatus("error");
          return;
        }
        const data = await res.json();
        setInfo(data);
        if (data.status === "cancelled") {
          setStatus("cancelled");
        } else {
          setStatus("loaded");
        }
      })
      .catch(() => {
        setErrorMsg("Network error");
        setStatus("error");
      });
  }, [token]);

  async function handleCancel() {
    setStatus("cancelling");
    try {
      const res = await fetch(`/api/bookings/cancel?token=${encodeURIComponent(token)}`, {
        method: "POST",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErrorMsg(d.error || "Could not cancel");
        setStatus("error");
        return;
      }
      setStatus("cancelled");
    } catch {
      setErrorMsg("Network error");
      setStatus("error");
    }
  }

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen bg-brand-light flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-sm border border-brand-sage/30 p-8 text-center">
            {status === "loading" && (
              <p className="text-muted-foreground">{t.common.loading}</p>
            )}

            {status === "error" && (
              <>
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-100 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                </div>
                <h2 className="font-heading text-xl font-bold text-brand-deep mb-2">{t.cancel.errorTitle}</h2>
                <p className="text-muted-foreground">{errorMsg}</p>
                <Link href="/" className="inline-block mt-6 text-brand-teal font-medium hover:underline">{t.cancel.backHome}</Link>
              </>
            )}

            {status === "cancelled" && info && (
              <>
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-brand-sage/30 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0d5e42" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h2 className="font-heading text-xl font-bold text-brand-deep mb-2">{t.cancel.cancelledTitle}</h2>
                <p className="text-muted-foreground mb-1">
                  {info.className} · {info.date} · {info.startTime}
                </p>
                <p className="text-sm text-muted-foreground">{t.cancel.cancelledText}</p>
                <Link href="/reservar" className="inline-block mt-6 bg-brand-teal text-brand-cream px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors">
                  {t.cancel.bookAnother}
                </Link>
              </>
            )}

            {status === "loaded" && info && (
              <>
                <h2 className="font-heading text-xl font-bold text-brand-deep mb-4">{t.cancel.title}</h2>
                <div className="bg-brand-light rounded-xl p-4 mb-6 text-left space-y-2">
                  <p className="text-sm"><span className="text-muted-foreground">{t.cancel.class}:</span> <strong>{info.className}</strong></p>
                  <p className="text-sm"><span className="text-muted-foreground">{t.cancel.date}:</span> <strong>{info.date}</strong></p>
                  <p className="text-sm"><span className="text-muted-foreground">{t.cancel.time}:</span> <strong>{info.startTime}</strong></p>
                  <p className="text-sm"><span className="text-muted-foreground">{t.cancel.name}:</span> <strong>{info.userName}</strong></p>
                </div>

                {info.canCancel ? (
                  <button
                    onClick={handleCancel}
                    className="w-full bg-red-600 text-white py-3 rounded-full font-semibold hover:bg-red-700 transition-colors"
                  >
                    {t.cancel.confirmCancel}
                  </button>
                ) : (
                  <div>
                    <p className="text-sm text-red-700 bg-red-50 p-4 rounded-xl">{t.cancel.lockoutMessage}</p>
                  </div>
                )}

                <Link href="/" className="inline-block mt-4 text-sm text-brand-teal font-medium hover:underline">{t.cancel.backHome}</Link>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
