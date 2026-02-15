import { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';


type Transaction = {
  id: string;
  logo: string;
  title: string;
  category: string;
  amount: string;
  isActive?: boolean;
};

const mockTransactions: Transaction[] = [
  { id: '1', logo: '🛒', title: 'Co.opmart', category: 'Groceries', amount: '-120.000 đ', isActive: true },
  { id: '2', logo: '🚌', title: 'Vé xe Sài Gòn', category: 'Transport', amount: '-250.000 đ' },
  { id: '3', logo: '🎁', title: 'Quà biếu nội ngoại', category: 'Gifts', amount: '-300.000 đ' },
];

const columnHelper = createColumnHelper<Transaction>();
export default function TransactionsTableWidget() {
  const columns = useMemo(() => [
    columnHelper.accessor('title', {
      cell: (info) => (
        <div className="flex items-center gap-3 py-1">
          <span className="text-xl">{info.row.original.logo}</span>
          <div>
            <p className="font-medium text-slate-800 text-sm">{info.getValue()}</p>
            <p className="text-[11px] text-slate-400 md:hidden">{info.row.original.category}</p>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('category', {
      cell: (info) => <span className="text-slate-400 text-sm hidden md:block">{info.getValue()}</span>,
    }),
    columnHelper.accessor('amount', {
      cell: (info) => {
        const amount = info.getValue();
        return (
          <div className="flex items-center justify-end gap-3">
            <span className={`text-md font-bold ${amount.includes('+') ? 'text-emerald-500' : 'text-slate-800'}`}>
              {amount}
            </span>
            <button className="text-slate-400 hover:text-slate-600">⋮</button>
          </div>
        );
      },
    }),
  ], []);

  const table = useReactTable({ data: mockTransactions, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h2 className="font-bold text-slate-800 text-md px-6 mb-4">Recent Transactions</h2>
      <div className="w-full">
        {table.getRowModel().rows.map((row) => {
          const isActive = row.original.isActive;
          return (
            <div key={row.id} className={`flex items-center justify-between px-6 py-3 transition-colors ${
              isActive ? 'bg-white border-l-4 border-orange-500' : 'border-l-4 border-transparent hover:bg-slate-50'
            }`}>
              {row.getVisibleCells().map((cell, idx) => (
                <div key={cell.id} className={`${idx === 0 ? 'flex-1' : idx === 1 ? 'flex-1 text-center' : 'flex-1 text-right'}`}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
