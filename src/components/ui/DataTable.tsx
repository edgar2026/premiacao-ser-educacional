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
            <GlassCard className="p-6 rounded-[2rem] border-white/5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="relative group flex-1 max-w-md">
                        <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-off-white/30 text-xl group-focus-within:text-gold transition-colors">search</span>
                        <input
                            className="w-full bg-white/[0.03] border border-white/10 pl-14 py-4 rounded-2xl text-off-white placeholder:text-off-white/20 focus:border-gold/50 outline-none transition-all"
                            placeholder={searchPlaceholder}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="flex gap-3">
                        {/* Placeholder for additional filters if needed */}
                    </div>
                </div>
            </GlassCard>

            {/* Table Container */}
            <GlassCard className="rounded-[2.5rem] overflow-hidden border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/[0.02] border-b border-white/5">
                            <tr>
                                {columns.map((col, idx) => (
                                    <th
                                        key={idx}
                                        className={`px-8 py-6 text-[9px] font-bold uppercase tracking-[0.3em] text-off-white/40 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''} ${col.className || ''}`}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                                {actions && (
                                    <th className="px-8 py-6 text-[9px] font-bold uppercase tracking-[0.3em] text-off-white/40 text-right">
                                        Ações
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item) => (
                                    <tr
                                        key={item.id}
                                        className={`hover:bg-white/[0.02] transition-colors group ${onRowClick ? 'cursor-pointer' : ''}`}
                                        onClick={() => onRowClick?.(item)}
                                    >
                                        {columns.map((col, idx) => (
                                            <td
                                                key={idx}
                                                className={`px-8 py-6 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''} ${col.className || ''}`}
                                            >
                                                {typeof col.accessor === 'function'
                                                    ? col.accessor(item)
                                                    : (item[col.accessor] as React.ReactNode)}
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
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
                                            <span className="material-symbols-outlined text-5xl text-off-white/10">search_off</span>
                                            <p className="text-off-white/30 font-serif italic text-lg">Nenhum registro encontrado</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="p-8 bg-white/[0.01] border-t border-white/5 flex flex-wrap justify-between items-center gap-6">
                        <p className="text-[10px] font-bold text-off-white/20 uppercase tracking-[0.2em]">
                            Exibindo {startIndex + 1} a {Math.min(startIndex + pageSize, filteredData.length)} de {filteredData.length} registros
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-5 py-2.5 border border-white/10 rounded-full text-[10px] font-bold text-off-white/40 hover:bg-white/5 disabled:opacity-20 disabled:hover:bg-transparent transition-colors uppercase tracking-widest"
                            >
                                Anterior
                            </button>
                            <div className="flex gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`size-10 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${currentPage === i + 1 ? 'bg-gold text-navy-deep shadow-lg shadow-gold/20' : 'border border-white/10 text-off-white/40 hover:bg-white/5'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-5 py-2.5 border border-white/10 rounded-full text-[10px] font-bold text-off-white/40 hover:bg-white/5 disabled:opacity-20 disabled:hover:bg-transparent transition-colors uppercase tracking-widest"
                            >
                                Próximo
                            </button>
                        </div>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default DataTable;
