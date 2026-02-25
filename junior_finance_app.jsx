"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function JuniorFinance() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    date: "",
    description: "",
    amount: "",
    type: "expense"
  });
  const [editingId, setEditingId] = useState<null | number>(null);

  // Flag pour savoir si on est monté côté client
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // On est sûr d'être dans le navigateur ici
    setIsClient(true);

    if (typeof window === "undefined") return;

    const saved = window.localStorage.getItem("jf_transactions");
    if (saved) {
      const parsed = JSON.parse(saved).map((t: any) => ({
        ...t,
        id: Number(t.id),
        amount: Number(t.amount)
      }));
      setTransactions(parsed);
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (typeof window === "undefined") return;

    window.localStorage.setItem("jf_transactions", JSON.stringify(transactions));
  }, [transactions, isClient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;

    if (editingId !== null) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? { ...t, ...form, amount: Number(form.amount) }
            : t
        )
      );
      setEditingId(null);
    } else {
      setTransactions((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...form,
          amount: Number(form.amount)
        }
      ]);
    }

    setForm({ date: "", description: "", amount: "", type: "expense" });
  };

  const handleDelete = (id: number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Totaux
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Solde cumulatif
  const balanceData = useMemo(() => {
    const sorted = [...transactions]
      .filter((t) => t.date)
      .sort((a, b) => new Date(a.date) as any - (new Date(b.date) as any));

    let runningBalance = 0;

    return sorted.map((t) => {
      if (t.type === "income") {
        runningBalance += t.amount;
      } else {
        runningBalance -= t.amount;
      }

      return {
        date: t.date,
        balance: runningBalance
      };
    });
  }, [transactions]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Junior&apos;s Finance</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-green-100 shadow">
          <p className="text-sm">Total Revenus</p>
          <p className="text-xl font-bold">{totalIncome.toFixed(2)} $</p>
        </div>
        <div className="p-4 rounded-2xl bg-red-100 shadow">
          <p className="text-sm">Total Dépenses</p>
          <p className="text-xl font-bold">{totalExpense.toFixed(2)} $</p>
        </div>
        <div className="p-4 rounded-2xl bg-blue-100 shadow">
          <p className="text-sm">Ce qu&apos;il te reste (Épargne)</p>
          <p className="text-xl font-bold">{balance.toFixed(2)} $</p>
        </div>
      </div>

      {/* Balance Chart */}
      <div className="bg-white p-4 rounded-2xl shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">
          Évolution de ton solde
        </h2>
        <div className="w-full h-80">
          <ResponsiveContainer>
            <LineChart data={balanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#2563eb"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid gap-3 mb-6">
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Montant"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="border p-2 rounded"
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="expense">Dépense</option>
          <option value="income">Revenu</option>
        </select>

        <button type="submit" className="bg-black text-white p-2 rounded-xl">
          {editingId !== null ? "Modifier" : "Ajouter"}
        </button>
      </form>

      {/* Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Date</th>
            <th className="text-left p-2">Description</th>
            <th className="text-left p-2">Montant</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t: any) => (
            <tr key={t.id} className="border-b">
              <td className="p-2">{t.date}</td>
              <td className="p-2">{t.description}</td>
              <td className="p-2">
                {t.type === "income" ? "+" : "-"}
                {t.amount.toFixed(2)} $
              </td>
              <td className="p-2 space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setForm({
                      date: t.date,
                      description: t.description,
                      amount: String(t.amount),
                      type: t.type
                    });
                    setEditingId(t.id);
                  }}
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(t.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
