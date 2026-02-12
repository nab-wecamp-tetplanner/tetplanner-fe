import React, { useState } from "react";
import { Header } from "@/components";

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

interface ActionCardType {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

interface TransactionType {
  id: string;
  isDateGroupRow?: boolean; // Dùng cho các dòng "Date 10/2/2026"
  iconText?: string;
  iconBgClass?: string;
  name: string;
  category?: string;
  date?: string;
  amount: string;
  isIncome: boolean;
}

// ==========================================
// 2. MOCK DATA
// ==========================================

const actionCardsData: ActionCardType[] = [
  {
    title: "Add income",
    description: "Create an income manually",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
    ),
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Add expense",
    description: "Create an expense manually",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 12H4"
        />
      </svg>
    ),
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    title: "Transfer money",
    description: "Select the amount and make a transfer",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    ),
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
];

const transactionsData: TransactionType[] = [
  {
    id: "1",
    isDateGroupRow: true,
    name: "Date 10/2/2026",
    amount: "+$750.00",
    isIncome: true,
  },
  {
    id: "2",
    iconText: "OR",
    iconBgClass: "bg-gray-100 text-gray-600",
    name: "Orlando Rodrigues",
    category: "Housing",
    date: "2024/04/01",
    amount: "+$750.00",
    isIncome: true,
  },
  {
    id: "3",
    iconText: "OR",
    iconBgClass: "bg-gray-100 text-gray-600",
    name: "Orlando Rodrigues",
    category: "Housing",
    date: "2024/04/01",
    amount: "+$750.00",
    isIncome: true,
  },
  {
    id: "4",
    iconText: "N",
    iconBgClass: "bg-red-100 text-red-600 font-bold",
    name: "Netflix",
    category: "Entertainment",
    date: "2024/03/29",
    amount: "-$9.90",
    isIncome: false,
  },
  {
    id: "5",
    iconText: "S",
    iconBgClass: "bg-green-100 text-green-600 font-bold",
    name: "Spotify",
    category: "Entertainment",
    date: "2024/03/29",
    amount: "-$19.90",
    isIncome: false,
  },
  {
    id: "6",
    isDateGroupRow: true,
    name: "Date 10/2/2026",
    amount: "+$750.00",
    isIncome: true,
  },
  {
    id: "7",
    iconText: "CA",
    iconBgClass: "bg-gray-100 text-gray-600",
    name: "Carl Andrew",
    category: "Education",
    date: "2024/03/27",
    amount: "+$400.00",
    isIncome: true,
  },
  {
    id: "8",
    iconText: "CM",
    iconBgClass: "bg-gray-100 text-gray-600",
    name: "Carrefour Market",
    category: "Education",
    date: "2024/03/26",
    amount: "-$64.33",
    isIncome: false,
  },
  {
    id: "9",
    iconText: "a",
    iconBgClass: "bg-gray-800 text-white font-bold",
    name: "Amazon",
    category: "Shopping",
    date: "2024/03/24",
    amount: "-$147.90",
    isIncome: false,
  },
  {
    id: "10",
    iconText: "Sh",
    iconBgClass: "bg-green-100 text-green-700 font-bold",
    name: "Shopify",
    category: "Shopping",
    date: "2024/03/21",
    amount: "-$57.98",
    isIncome: false,
  },
];

// ==========================================
// 3. UI COMPONENTS
// ==========================================

const PageTitle: React.FC = () => (
  <div className="flex flex-col md:flex-row md:items-center justify-between mt-8 mb-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
      Hello, Mark!
    </h1>
    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 text-sm font-medium text-gray-500">
      <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg">
        This month
      </button>
      <button className="px-4 py-2 hover:bg-gray-50 rounded-lg">
        Last month
      </button>
      <button className="px-4 py-2 hover:bg-gray-50 rounded-lg">
        This year
      </button>
      <button className="px-4 py-2 hover:bg-gray-50 rounded-lg">
        Last 12 months
      </button>
      <div className="w-px h-6 bg-gray-200 mx-2"></div>
      <button className="px-4 py-2 flex items-center gap-2 hover:bg-gray-50 rounded-lg">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        Select period
      </button>
    </div>
  </div>
);

const ActionCards: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    {actionCardsData.map((action, index) => (
      <div
        key={index}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md cursor-pointer transition-shadow"
      >
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.iconBg} ${action.iconColor}`}
        >
          {action.icon}
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{action.title}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
        </div>
      </div>
    ))}
  </div>
);

const SearchBar: React.FC = () => {
  const [searchValue, setSearchValue] = useState("Londo");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-teal-500 p-2 mb-6 flex items-center focus-within:ring-1 focus-within:ring-teal-500 transition-all">
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="flex-1 outline-none px-4 text-gray-700"
      />
      {searchValue && (
        <button
          onClick={() => setSearchValue("")}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
      <button className="bg-teal-500 hover:bg-teal-600 transition-colors text-white p-2 rounded-lg ml-2">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    </div>
  );
};

const TransactionTable: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <table className="w-full text-left text-sm whitespace-nowrap">
      <thead>
        <tr className="text-gray-500 border-b border-gray-100">
          <th className="font-medium px-6 py-4 w-2/5">Description</th>
          <th className="font-medium px-6 py-4 w-1/5">Category</th>
          <th className="font-medium px-6 py-4 w-1/5">Date</th>
          <th className="font-medium px-6 py-4">Amount</th>
          <th className="font-medium px-6 py-4 w-10"></th>
        </tr>
      </thead>
      <tbody>
        {transactionsData.map((txn) => (
          <tr
            key={txn.id}
            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
          >
            {/* Description Column */}
            <td className="px-6 py-4 flex items-center gap-4">
              {txn.isDateGroupRow ? (
                <div className="w-8 h-8 rounded-full border-2 border-gray-100 flex-shrink-0"></div>
              ) : (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${txn.iconBgClass}`}
                >
                  {txn.iconText}
                </div>
              )}
              <span
                className={`text-gray-900 ${txn.isDateGroupRow ? "font-bold" : "font-semibold"}`}
              >
                {txn.name}
              </span>
            </td>

            {/* Category Column */}
            <td className="px-6 py-4 text-gray-500">{txn.category || ""}</td>

            {/* Date Column */}
            <td className="px-6 py-4 text-gray-500">{txn.date || ""}</td>

            {/* Amount Column */}
            <td
              className={`px-6 py-4 font-bold ${txn.isIncome ? "text-green-500" : "text-gray-900"}`}
            >
              {txn.amount}
            </td>

            {/* Actions Column */}
            <td className="px-6 py-4 text-gray-400">
              <button className="hover:text-gray-700">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ==========================================
// 4. MAIN PAGE LAYOUT
// ==========================================

export default function Transaction() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-12">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageTitle />
        <ActionCards />
        <SearchBar />
        <TransactionTable />
      </main>
    </div>
  );
}
