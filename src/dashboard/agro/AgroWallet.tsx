import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { getMyWallet } from "../../api/agro.api";
import { Wallet, ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "../../context/ToastContext";

export default function AgroWallet() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [shopBalance, setShopBalance] = useState<number>(0);
  const [pendingEscrow, setPendingEscrow] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getMyWallet();
        if (cancelled) return;
        setShopBalance(res.shopWallet?.balance ?? 0);
        setPendingEscrow(res.pendingEscrowEarnings ?? 0);
      } catch (e: any) {
        if (cancelled) return;
        addToast(
          "error",
          "Wallet error",
          e?.response?.data?.error || "Failed to load wallet information"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [addToast]);

  const formatKes = (n: number) =>
    `KES ${Number(n || 0).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <Layout role="agrovet">
      <div className="space-y-6 animate-fadeInUp">
        <div className="card overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-800 p-6 text-white">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-100/80">
                    SmartLivestock Wallet
                  </p>
                  <h1 className="text-2xl md:text-3xl font-black sora tracking-tight">
                    Agrovet Wallet & Earnings
                  </h1>
                  <p className="text-emerald-100 text-xs mt-1 max-w-xl">
                    Payments from farmers are settled to your SmartLivestock shop
                    wallet. Pending amounts remain in escrow until delivery is
                    confirmed or auto-released.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="card border border-emerald-100 bg-emerald-50/60">
              <div className="card-body flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600">
                    Available balance
                  </p>
                  <p className="text-xl font-black sora text-emerald-900 tabular-nums">
                    {formatKes(shopBalance)}
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    Funds ready for withdrawal to M-Pesa (subject to withdrawal
                    rules).
                  </p>
                </div>
              </div>
            </div>

            <div className="card border border-amber-100 bg-amber-50/70">
              <div className="card-body flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-amber-700">
                    Pending escrow
                  </p>
                  <p className="text-xl font-black sora text-amber-900 tabular-nums">
                    {formatKes(pendingEscrow)}
                  </p>
                  <p className="text-[11px] text-amber-700 mt-1">
                    Earnings for delivered orders that are still in escrow until
                    confirmation or timeout.
                  </p>
                </div>
              </div>
            </div>

            <div className="card border border-gray-100 bg-white/90">
              <div className="card-body flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">
                    Wallet safety
                  </p>
                  <p className="text-xs text-gray-700 mt-1 leading-snug">
                    Wallet balances are maintained on the server and adjusted
                    using secure, transactional updates. This page is
                    read‑only—you cannot change balances from the browser.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

