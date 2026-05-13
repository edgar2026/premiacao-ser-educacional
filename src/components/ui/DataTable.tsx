import React, { useState } from 'react';
import GlassCard from './GlassCard';

export interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
    align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    pageSize?: number;
    searchPlaceholder?: string;
    onRowClick?: (item: T) => void;
    actions?: (item: T) => React.ReactNode;
}

const DataTable = <T extends { id: string | number }>({
    data,
    columns,
    pageSize = 10,
    searchPlaceholder = "Buscar...",
    onRowClick,
    actions
}: DataTableProps<T>) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter data based on search term
    const filteredData = data.filter(item => {
        const searchStr = searchTerm.toLowerCase();
        return Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchStr)
        );
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

    return (
        <div className="space-y-6">
            {/* Search and Filters Header */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white border border-brand-gray p-6 rounded-3xl shadow-sm">
                <div className="relative group flex-1 w-full md:max-w-md">
                    <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-brand-text-secondary/40 text-xl group-focus-within:text-brand-blue transition-colors">search</span>
                    <input
                        className="w-full bg-bg-main border border-brand-gray pl-16 py-4 pr-6 rounded-2xl text-brand-dark placeholder:text-brand-text-secondary/40 focus:border-brand-blue/50 outline-none transition-all font-medium text-[15px]"
                        placeholder={searchPlaceholder}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="card-static !p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-bg-main/50 border-b border-brand-gray">
                            <tr>
                                {columns.map((col, idx) => (
                                    <th
                                        key={idx}
                                        className={`px-8 py-6 text-[10px] font-[800] uppercase tracking-[0.2em] text-brand-text-secondary/60 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''} ${col.className || ''}`}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                                {actions && (
                                    <th className="px-8 py-6 text-[10px] font-[800] uppercase tracking-[0.2em] text-brand-text-secondary/60 text-right">
                                        Ações
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-gray">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item) => (
                                    <tr
                                        key={item.id}
                                        className={`hover:bg-brand-blue/5 transition-colors group ${onRowClick ? 'cursor-pointer' : ''}`}
                                        onClick={() => onRowClick?.(item)}
                                    >
                                        {columns.map((col, idx) => (
                                            <td
                                                key={idx}
                                                className={`px-8 py-6 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''} ${col.className || ''}`}
                                            >
                                                <div className="text-[14px] text-brand-dark">
                                                    {typeof col.accessor === 'function'
                                                        ? col.accessor(item)
                                                        : (item[col.accessor] as React.ReactNode)}
                                                </div>
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end gap-2">
                                                    {actions(item)}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + (actions ? 1 : 0)} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <span className="material-symbols-outlined text-5xl text-brand-gray">search_off</span>
                                            <p className="text-brand-text-secondary font-medium text-lg">Nenhum registro encontrado</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="p-8 bg-bg-main/30 border-t border-brand-gray flex flex-col sm:flex-row justify-between items-center gap-6">
                        <p className="text-[11px] font-[800] text-brand-text-secondary/50 uppercase tracking-widest">
                            Exibindo {startIndex + 1} a {Math.min(startIndex + pageSize, filteredData.length)} de {filteredData.length} registros
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="size-11 rounded-xl bg-white border border-brand-gray flex items-center justify-center text-brand-dark disabled:opacity-20 disabled:cursor-not-allowed hover:border-brand-blue/30 transition-all shadow-sm"
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>

                            <div className="flex items-center gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`size-11 rounded-xl font-[800] text-[12px] transition-all ${currentPage === i + 1 ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'bg-white border border-brand-gray text-brand-text-secondary hover:text-brand-blue'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="size-11 rounded-xl bg-white border border-brand-gray flex items-center justify-center text-brand-dark disabled:opacity-20 disabled:cursor-not-allowed hover:border-brand-blue/30 transition-all shadow-sm"
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataTable;
