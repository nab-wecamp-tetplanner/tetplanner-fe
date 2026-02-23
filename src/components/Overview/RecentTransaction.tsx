import { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Transaction } from "../../types/transaction.types";
import apiClient from "../../services/apiClient";
const columnHelper = createColumnHelper<Transaction>();

export default function TransactionsTableWidget({
  tetConfigs,
}: {
  tetConfigs: string[];
}) {
  const [data, setData] = useState<Transaction[]>([]);

  useEffect(() => {
    console.log("Configs in TransactionsTableWidget:", tetConfigs);
    const fetchTransactions = async () => {
      try {
        const promises = tetConfigs.map(async (config) => {
          console.log(`Fetching transactions for config: ${config}`);
          const response = await apiClient.transactions.getByConfig(config);
          return response;
        });
        const results = await Promise.all(promises);
        const allTransactions = results.flat();
        console.log("Fetched transactions:", allTransactions);
        setData(allTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
    if (tetConfigs.length > 0) {
        fetchTransactions();
      }
  }, [tetConfigs]);

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
    <div className="p-4  rounded-3xl">
      <div className="flex justify-between items-center px-4 mb-6">
        <h2 className="font-bold text-slate-800 text-md">
          Recent Transactions
        </h2>
        <button className="text-xs text-[#5B63D3] font-semibold hover:underline tracking-tight">
          View All
        </button>
      </div>

      <div className="w-full space-y-1">
        {table.getRowModel().rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 rounded-2xl transition-all border-l-4 border-transparent hover:border-[#5B63D3]"
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
