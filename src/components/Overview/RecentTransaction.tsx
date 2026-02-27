import { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Transaction } from "../../types/transaction.types";
import apiClient from "../../services/apiClient";
import { useAppStore } from "../../stores/useAppStore";
import { useLoading } from "../../contexts/LoadingContext";
const columnHelper = createColumnHelper<Transaction>();

export default function TransactionsTableWidget() {
  const [data, setData] = useState<Transaction[]>([]);
  const { showLoading, hideLoading } = useLoading();
  const configId = useAppStore((state) => state.configId);
  useEffect(() => {
    console.log("Configs in TransactionsTableWidget:", configId);

    const fetchTransactions = async () => {
      try {
        if (!configId) return;
        showLoading();
        const result = await apiClient.transactions.getByConfig(configId);
        const allTransactions = result.flat();
        console.log("Fetched transactions:", allTransactions);
        setData(allTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        hideLoading();
      }
    };
    if (configId) {
      fetchTransactions();
    }
  }, [configId]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("note", {
        header: "Description",
        cell: (info) => (
          <div className="flex items-center gap-3 py-1">
            <span className="text-xl">
              {info.row.original.type === "expense" ? "💸" : "💰"}
            </span>
            <div>
              <p className="font-medium text-slate-800 text-sm">
                {info.getValue() || "No description"}
              </p>
              <p className="text-[11px] text-slate-400">
                {new Date(
                  info.row.original.transaction_date,
                ).toLocaleDateString("en-US")}
              </p>
            </div>
          </div>
        ),
      }),

      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => (
          <span
            className={`text-[10px] uppercase px-2 py-1 rounded-md font-bold hidden md:inline-block ${
              info.getValue() === "expense"
                ? "bg-rose-50 text-rose-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {info.getValue()}
          </span>
        ),
      }),

      columnHelper.accessor("amount", {
        header: "Amount",
        cell: (info) => {
          const amount = parseFloat(info.getValue());
          const isExpense = info.row.original.type === "expense";

          const formattedAmount = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(amount);

          return (
            <div className="flex items-center justify-end gap-3">
              <span
                className={`text-sm font-bold ${isExpense ? "text-rose-600" : "text-emerald-500"}`}
              >
                {isExpense ? "-" : "+"}
                {formattedAmount}
              </span>
            </div>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-6 bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm">
      <div className="flex justify-between items-center  mb-6">
        <h2 className="font-bold text-lg text-slate-800">
          Recent Transactions
        </h2>
        <button className="text-xs text-planner-purple font-semibold hover:underline">
          View All
        </button>
      </div>

      <div className="w-full space-y-1">
        {table.getRowModel().rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 rounded-2xl transition-all border-l-4 border-transparent "
          >
            {row.getVisibleCells().map((cell, idx) => (
              <div
                key={cell.id}
                className={`${idx === 0 ? "flex-2" : "flex-1"} ${idx === 2 ? "text-right" : ""}`}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ))}
          </div>
        ))}
        {(!data || data.length === 0) && (
          <p className="text-center py-10 text-slate-400 text-sm italic">
            No transactions recorded.
          </p>
        )}
      </div>
    </div>
  );
}
