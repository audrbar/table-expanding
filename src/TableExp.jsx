import React, { useMemo, useReducer } from 'react';
import ReactDOM from 'react-dom/client';

import {
    Column,
    Table,
    ExpandedState,
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getExpandedRowModel,
    flexRender,
} from '@tanstack/react-table';
import { makeData } from './makeData';

export const TableExp = () => {
    const rerender = React.useReducer(() => ({}), {})[1];

    const columns = React.useMemo(
        () => [
            {
                accessorKey: 'firstName',
                header: ({ table }) => (
                    <>
                        <button
                            {...{
                                onClick:
                                    table.getToggleAllRowsExpandedHandler(),
                            }}
                        >
                            {table.getIsAllRowsExpanded() ? '👇' : '👉'}
                        </button>{' '}
                        First Name
                    </>
                ),
                cell: ({ row, getValue }) => (
                    <div
                        style={{
                            // Since rows are flattened by default,
                            // we can use the row.depth property
                            // and paddingLeft to visually indicate the depth
                            // of the row
                            paddingLeft: `${row.depth * 2}rem`,
                        }}
                    >
                        <>
                            {row.getCanExpand() ? (
                                <button
                                    {...{
                                        onClick: row.getToggleExpandedHandler(),
                                        style: { cursor: 'pointer' },
                                    }}
                                >
                                    {row.getIsExpanded() ? '👇' : '👉'}
                                </button>
                            ) : (
                                '🔵'
                            )}{' '}
                            {getValue()}
                        </>
                    </div>
                ),
                footer: (props) => props.column.id,
            },
            {
                accessorFn: (row) => row.lastName,
                id: 'lastName',
                cell: (info) => info.getValue(),
                header: () => <span>Last Name</span>,
                footer: (props) => props.column.id,
            },
            {
                accessorKey: 'age',
                header: () => 'Age',
                footer: (props) => props.column.id,
            },
            {
                accessorKey: 'bookings',
                header: () => <span>Bookings</span>,
                cell: ({ cell }) =>
                    cell
                        .getValue('bookings')
                        .toLocaleDateString('lt-Lt', 'yyyy.MM.dd'),
                filterFn: 'isWithinRange',
                footer: (props) => props.column.id,
            },
            {
                accessorKey: 'visits',
                header: () => <span>Visits</span>,
                footer: (props) => props.column.id,
            },
            {
                accessorKey: 'status',
                header: 'Status',
                footer: (props) => props.column.id,
            },
            {
                accessorKey: 'progress',
                header: 'Profile Progress',
                footer: (props) => props.column.id,
            },
        ],
        []
    );

    const [data, setData] = React.useState(() => makeData(100, 4));
    const refreshData = () => setData(() => makeData(100, 4));

    const [expanded, setExpanded] = React.useState({});

    console.log(data);

    const table = useReactTable({
        data,
        columns,
        state: {
            expanded,
        },
        filterFns: {
            isWithinRange: isWithinRange, //filter function added
        },
        onExpandedChange: setExpanded,
        getSubRows: (row) => row.subRows,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        filterFromLeafRows: true,
    });

    return (
        <div className="p-2">
            <div className="h-2" />
            <table>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div>
                                                {flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext()
                                                )}
                                                {header.column.getCanFilter() ? (
                                                    <div>
                                                        <Filter
                                                            column={
                                                                header.column
                                                            }
                                                            table={table}
                                                        />
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => {
                        return (
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => {
                                    return (
                                        <td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="h-2" />
            <div className="flex items-center gap-2">
                <button
                    className="border rounded p-1"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                >
                    {'<<'}
                </button>
                <button
                    className="border rounded p-1"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    {'<'}
                </button>
                <button
                    className="border rounded p-1"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    {'>'}
                </button>
                <button
                    className="border rounded p-1"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                >
                    {'>>'}
                </button>
                <span className="flex items-center gap-1">
                    <div>Page</div>
                    <strong>
                        {table.getState().pagination.pageIndex + 1} of{' '}
                        {table.getPageCount()}
                    </strong>
                </span>
                <span className="flex items-center gap-1">
                    | Go to page:
                    <input
                        type="number"
                        defaultValue={table.getState().pagination.pageIndex + 1}
                        onChange={(e) => {
                            const page = e.target.value
                                ? Number(e.target.value) - 1
                                : 0;
                            table.setPageIndex(page);
                        }}
                        className="border p-1 rounded w-16"
                    />
                </span>
                <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => {
                        table.setPageSize(Number(e.target.value));
                    }}
                >
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>
            <div>{table.getRowModel().rows.length} Rows</div>
            <div>
                <button onClick={() => rerender()}>Force Rerender</button>
            </div>
            <div>
                <button onClick={() => refreshData()}>Refresh Data</button>
            </div>
            <pre>{JSON.stringify(expanded, null, 2)}</pre>
        </div>
    );
};

function Filter({ column, table }) {
    const firstValue = table
        .getPreFilteredRowModel()
        .flatRows[0]?.getValue(column.id);

    const columnFilterValue = column.getFilterValue();

    return typeof firstValue === 'number' ? (
        <div className="flex space-x-2">
            <input
                type="number"
                value={columnFilterValue?.[0] ?? ''}
                onChange={(e) =>
                    column.setFilterValue((old) => [e.target.value, old?.[1]])
                }
                placeholder={`Min`}
                className="w-24 border shadow rounded"
            />
            <input
                type="number"
                value={columnFilterValue?.[1] ?? ''}
                onChange={(e) =>
                    column.setFilterValue((old) => [old?.[0], e.target.value])
                }
                placeholder={`Max`}
                className="w-24 border shadow rounded"
            />
        </div>
    ) : (
        <input
            type="text"
            value={columnFilterValue ?? ''}
            onChange={(e) => column.setFilterValue(e.target.value)}
            placeholder={`Search...`}
            className="w-36 border shadow rounded"
        />
    );
}

const isWithinRange = (row, columnId, value) => {
    const date = row.getValue(columnId);
    const [start, end] = value; // value => two date input values
    //If one filter defined and date is null filter it
    if ((start || end) && !date) return false;
    if (start && !end) {
        return date.getTime() >= start.getTime();
    } else if (!start && end) {
        return date.getTime() <= end.getTime();
    } else if (start && end) {
        return (
            date.getTime() >= start.getTime() && date.getTime() <= end.getTime()
        );
    } else return true;
};
