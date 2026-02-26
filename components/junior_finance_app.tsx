"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function JuniorFinance() {
  const [transactions, setTransactions] = useState<
    { id: number; date: string; description: string; amount: number; type: string }[]
  >([]);
  const [form, setForm] = useState({
    date: "",
    description: "",
    amount: "",
    type: "expense",
  });
  const [editingId, setEditingId] = useState<null | number>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("jf_transactions");
    if (saved) {
      const parsed = JSON.parse(saved).map(
        (t: { id: number; amount: number; date: string; description: string; type: string }) => ({
          ...t,
          id: Number(t.id),
          amount: Number(t.amount),
        })
      );
      setTransactions(parsed);
    }
  }, []);

  useEffect(() => {
    if (!isClient || typeof window === "undefined") return;
    window.localStorage.setItem("jf_transactions", JSON.stringify(transactions));
  }, [transactions, isClient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    if (editingId !== null) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingId ? { ...t, ...form, amount: Number(form.amount) } : t
        )
      );
      setEditingId(null);
    } else {
      setTransactions((prev) => [
        ...prev,
        { id: Date.now(), ...form, amount: Number(form.amount) },
      ]);
    }
    setForm({ date: "", description: "", amount: "", type: "expense" });
  };

  const handleDelete = (id: number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Junior's Finance", 14, 20);
    doc.setFontSize(10);
    doc.text(`Exporté le ${new Date().toLocaleDateString("fr-FR")}`, 14, 28);

    doc.setFontSize(11);
    doc.text(`Total Revenus : ${totalIncome.toFixed(2)} $`, 14, 38);
    doc.text(`Total Dépenses : ${totalExpense.toFixed(2)} $`, 14, 44);
    doc.text(`Épargne : ${balance.toFixed(2)} $`, 14, 50);

    autoTable(doc, {
      startY: 58,
      head: [["Date", "Description", "Type", "Montant ($)"]],
      body: transactions.map((t) => [
        t.date,
        t.description,
        t.type === "income" ? "Revenu" : "Dépense",
        (t.type === "income" ? "" : "-") + t.amount.toFixed(2),
      ]),
      styles: { fontSize: 9 },
    });

    doc.save(`junior-finance-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const balanceData = useMemo(() => {
    const sorted = [...transactions]
      .filter((t) => t.date)
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    let runningBalance = 0;
    return sorted.map((t) => {
      if (t.type === "income") runningBalance += t.amount;
      else runningBalance -= t.amount;
      return { date: t.date, balance: runningBalance };
    });
  }, [transactions]);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto min-h-screen">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-indigo-500/30">
            J
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              Junior&apos;s Finance
            </h1>
            <p className="text-sm text-slate-500">Gère tes revenus et dépenses</p>
          </div>
        </div>
        <button
          type="button"
          onClick={exportPdf}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:from-emerald-600 hover:to-teal-700 transition-all duration-200"
        >
          Exporter en PDF
        </button>
      </header>

      {/* Summary cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-xl shadow-slate-200/50">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">
            Total Revenus
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600">
            {totalIncome.toFixed(2)} $
          </p>
        </div>
        <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-xl shadow-slate-200/50">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-400/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">
            Total Dépenses
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-rose-600">
            {totalExpense.toFixed(2)} $
          </p>
        </div>
        <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-xl shadow-slate-200/50">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-400/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">
            Épargne
          </p>
          <p className={`text-2xl sm:text-3xl font-bold ${balance >= 0 ? "text-violet-600" : "text-rose-600"}`}>
            {balance.toFixed(2)} $
          </p>
        </div>
      </section>

      {/* Chart */}
      <section className="bg-white/80 backdrop-blur border border-white/60 rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-200/50 mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Évolution de ton solde
        </h2>
        <div className="w-full h-72 sm:h-80 rounded-xl bg-slate-50/50 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={balanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)",
                }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ fill: "#6366f1", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }}
              />
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Form */}
      <section className="bg-white/80 backdrop-blur border border-white/60 rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-200/50 mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Ajouter une transaction
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border border-slate-200 p-2.5 rounded-lg bg-white text-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Description</label>
            <input
              type="text"
              placeholder="Ex. Courses, Salaire…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-slate-200 p-2.5 rounded-lg bg-white text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Montant</label>
            <input
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full border border-slate-200 p-2.5 rounded-lg bg-white text-slate-800 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border border-slate-200 p-2.5 rounded-lg bg-white text-slate-800"
            >
              <option value="expense">Dépense</option>
              <option value="income">Revenu</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200"
          >
            {editingId !== null ? "Modifier" : "Ajouter"}
          </button>
        </form>
      </section>

      {/* Table */}
      <section className="bg-white/80 backdrop-blur border border-white/60 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50">
        <div className="px-5 py-4 border-b border-slate-200/80">
          <h2 className="text-lg font-semibold text-slate-800">Historique des transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 text-sm font-semibold">
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Description</th>
                <th className="text-left p-4">Montant</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Aucune transaction. Ajoute-en une avec le formulaire ci-dessus.
                  </td>
                </tr>
              ) : (
                transactions.map((t, i) => (
                  <tr
                    key={t.id}
                    className={`border-t border-slate-100 hover:bg-slate-50/50 transition-colors ${
                      i % 2 === 0 ? "bg-white/50" : "bg-slate-50/30"
                    }`}
                  >
                    <td className="p-4 text-slate-700">{t.date}</td>
                    <td className="p-4 text-slate-700 font-medium">{t.description}</td>
                    <td className={`p-4 font-semibold ${t.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                      {t.type === "income" ? "+" : "−"}
                      {t.amount.toFixed(2)} $
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setForm({
                              date: t.date,
                              description: t.description,
                              amount: String(t.amount),
                              type: t.type,
                            });
                            setEditingId(t.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 font-medium hover:bg-indigo-200 transition"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(t.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-700 font-medium hover:bg-rose-200 transition"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
