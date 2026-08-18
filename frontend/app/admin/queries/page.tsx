"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAdminQueries, updateQueryStatus, submitCustomerQuery } from "lib/api";
import { toast } from "sonner";

export default function AdminProductQueriesPage() {
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    rejected: 0
  });

  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedType, setSelectedType] = useState("All Types");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newProdName, setNewProdName] = useState("");
  const [newQueryType, setNewQueryType] = useState("Product Info");
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const loadQueriesFromDB = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminQueries();
      if (data && data.queries) {
        const formatted = data.queries.map((q: any) => ({
          id: q.query_number || `#INQ-${q.id}`,
          db_id: q.id,
          customer: q.customer_name || "Customer",
          email: q.customer_email || "customer@skipd.in",
          product: q.product_name || "Store Item",
          price: "Inquiry",
          img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100",
          queryText: q.message || q.subject || "Customer Inquiry",
          subject: q.subject,
          type: q.query_type || "General Inquiry",
          status: q.status === "RESOLVED" ? "Resolved" : q.status === "REJECTED" ? "Rejected" : "Pending",
          priority: q.priority || "High",
          priorityColor: q.priority === "High" ? "text-red-500" : "text-amber-500",
          date: q.created_at ? new Date(q.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "Just now"
        }));
        setQueries(formatted);
        setStats({
          total: data.total_queries || formatted.length,
          resolved: data.resolved_count || formatted.filter((f: any) => f.status === "Resolved").length,
          pending: data.pending_count || formatted.filter((f: any) => f.status === "Pending").length,
          rejected: data.rejected_count || formatted.filter((f: any) => f.status === "Rejected").length
        });
      }
    } catch (e) {
      console.warn("Error loading queries from DB:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueriesFromDB();
  }, []);

  const handleStatusChange = async (queryObj: any, newStatus: string) => {
    // Optimistic UI update
    setQueries(prev => prev.map(q => q.id === queryObj.id ? { ...q, status: newStatus } : q));
    toast.success(`Query ${queryObj.id} updated to ${newStatus}`);

    try {
      await updateQueryStatus(queryObj.db_id || queryObj.id, newStatus.toUpperCase());
      loadQueriesFromDB();
    } catch (e) {
      console.error("Status update error:", e);
    }
  };

  const handleCreateNewQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustEmail || !newSubject || !newMessage) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const res = await submitCustomerQuery({
        customer_name: newCustName,
        customer_email: newCustEmail,
        product_name: newProdName || "Store Product",
        query_type: newQueryType,
        subject: newSubject,
        message: newMessage,
        priority: "High"
      });

      if (res && res.status === "success") {
        toast.success("🔥 New Query saved to PostgreSQL Database successfully!");
        setIsModalOpen(false);
        setNewCustName("");
        setNewCustEmail("");
        setNewProdName("");
        setNewSubject("");
        setNewMessage("");
        loadQueriesFromDB();
      }
    } catch (e) {
      toast.error("Failed to create query");
    }
  };

  // Filter queries based on search and dropdown filters
  const filteredQueries = queries.filter(q => {
    const matchesSearch = !searchQuery.trim() || 
      q.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === "All Status" || q.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesType = selectedType === "All Types" || q.type.toLowerCase().includes(selectedType.toLowerCase());

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full text-gray-900 font-sans">
      
      {/* 📍 Top Title Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Product Queries</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Manage all customer queries and 24-hour return requests from PostgreSQL DB</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={loadQueriesFromDB} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-2xs cursor-pointer flex items-center gap-1.5">
            🔄 Refresh DB
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer flex items-center gap-1">
            + New Query
          </button>
        </div>
      </div>

      {/* 📊 4 Top Metric Cards (Dynamic from Neon PostgreSQL DB) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Queries */}
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xl shrink-0">
            ❓
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Queries</p>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">{stats.total}</h3>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{stats.total > 0 ? "100% of all queries" : "0 queries"}</p>
          </div>
        </div>

        {/* Card 2: Resolved */}
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-xl shrink-0">
            ✓
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Resolved</p>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">{stats.resolved}</h3>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">{stats.total > 0 ? `${((stats.resolved / stats.total) * 100).toFixed(1)}% of total` : "0.0%"}</p>
          </div>
        </div>

        {/* Card 3: Pending */}
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center text-xl shrink-0">
            ⏳
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Pending</p>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">{stats.pending}</h3>
            <p className="text-[10px] text-amber-600 font-medium mt-0.5">{stats.total > 0 ? `${((stats.pending / stats.total) * 100).toFixed(1)}% of total` : "0.0%"}</p>
          </div>
        </div>

        {/* Card 4: Rejected */}
        <div className="bg-white border border-gray-200/80 p-5 rounded-2xl shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 font-bold flex items-center justify-center text-xl shrink-0">
            ✕
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Rejected</p>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">{stats.rejected}</h3>
            <p className="text-[10px] text-rose-600 font-medium mt-0.5">{stats.total > 0 ? `${((stats.rejected / stats.total) * 100).toFixed(1)}% of total` : "0.0%"}</p>
          </div>
        </div>

      </div>

      {/* 🔍 Filter Bar Section */}
      <div className="bg-white border border-gray-200/80 p-4 rounded-2xl shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by query, customer or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto text-xs font-bold text-gray-700">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option>All Status</option>
            <option>Pending</option>
            <option>Resolved</option>
            <option>Rejected</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option>All Types</option>
            <option>Product Info</option>
            <option>New Order</option>
            <option>Return &amp; Refund</option>
            <option>General Inquiry</option>
          </select>

          <button
            onClick={() => { setSelectedStatus("All Status"); setSelectedType("All Types"); setSearchQuery(""); }}
            className="bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 font-bold px-3 py-2 rounded-xl transition cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* 📋 Queries Table Connected to PostgreSQL DB */}
      <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3"><input type="checkbox" className="rounded" /></th>
                <th className="px-4 py-3">Query ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Product / Subject</th>
                <th className="px-4 py-3">Query Message</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-xs text-gray-400 font-bold">
                    ⏳ Loading queries from Neon PostgreSQL Database...
                  </td>
                </tr>
              ) : filteredQueries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-xs text-gray-400 font-bold">
                    No queries found in database.
                  </td>
                </tr>
              ) : (
                filteredQueries.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3.5"><input type="checkbox" className="rounded" /></td>
                    <td className="px-4 py-3.5 font-bold font-mono text-gray-900">{q.id}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-gray-900">{q.customer}</p>
                      <p className="text-[10px] text-gray-400">{q.email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-gray-900 text-xs">{q.product}</p>
                      {q.subject && <p className="text-[10px] text-indigo-600 font-medium">{q.subject}</p>}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-gray-800 text-xs max-w-[220px] truncate">{q.queryText}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100">
                        {q.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        q.status === "Resolved" ? "bg-emerald-100 text-emerald-800" :
                        q.status === "Pending" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[11px]">
                      <span className={`text-xs ${q.priorityColor}`}>●</span> {q.priority}
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-[11px]">{q.date}</td>
                    <td className="px-4 py-3.5 text-right space-x-1">
                      <button onClick={() => handleStatusChange(q, "Resolved")} title="Approve / Resolve" className="p-1.5 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-lg cursor-pointer">✓</button>
                      <button onClick={() => handleStatusChange(q, "Rejected")} title="Reject Query" className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg cursor-pointer">✕</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ➕ Modal: Create New Query */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 border border-gray-200">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-black text-lg text-gray-900">Create New Product Query</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateNewQuery} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sachin Rawat"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Customer Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sachin@gmail.com"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Nike Air Force 1"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Query Type</label>
                <select
                  value={newQueryType}
                  onChange={(e) => setNewQueryType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-medium"
                >
                  <option>Product Info</option>
                  <option>New Order</option>
                  <option>Return &amp; Refund</option>
                  <option>General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Size Exchange Inquiry"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Message Details</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Type customer message or query..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl transition shadow-sm"
                >
                  Save to DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
