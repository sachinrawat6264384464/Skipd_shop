"use client";

import { useEffect, useState } from "react";
import { useAuth } from "components/auth/auth-provider";
import { fetchWalletBalance } from "lib/api";
import Link from "next/link";

interface Transaction {
  id: number;
  amount: number;
  transaction_type: string;
  reference_id: string | null;
  created_at: string;
}

export default function WalletPage() {
  const { user, requireAuth } = useAuth();
  const [balance, setBalance] = useState(0.0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requireAuth();
    
    async function loadWallet() {
      const w = await fetchWalletBalance() as any;
      setBalance(w.balance || 0);
      setTransactions(w.transactions || []);
      setLoading(false);
    }
    loadWallet();
  }, [requireAuth]);

  if (loading) {
    return <div className="min-h-screen p-12 text-center text-gray-500">Loading wallet...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition">
            ←
          </Link>
          <h1 className="text-3xl font-black">My Wallet</h1>
        </div>

        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-20">
            <span className="text-8xl">🪙</span>
          </div>
          <p className="text-emerald-100 font-bold mb-2">Available Balance</p>
          <h2 className="text-5xl font-black">₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h2>
          <p className="mt-4 text-emerald-100 text-sm">Use your wallet balance to get instant discounts on checkout.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold">Transaction History</h3>
          </div>
          
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <span className="text-4xl mb-4 block">💸</span>
              <p>No wallet transactions found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map(txn => (
                <div key={txn.id} className="p-6 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{txn.transaction_type.replace("_", " ")}</p>
                    <p className="text-xs text-gray-500">{new Date(txn.created_at).toLocaleString()}</p>
                    {txn.reference_id && <p className="text-xs text-gray-400 mt-1">Ref: {txn.reference_id}</p>}
                  </div>
                  <div className={`font-black text-lg ${txn.amount >= 0 ? "text-emerald-600" : "text-gray-900"}`}>
                    {txn.amount >= 0 ? "+" : "-"}₹{Math.abs(txn.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
