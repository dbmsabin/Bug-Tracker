"use client";

import { useState, useMemo } from "react";
import { Bug, Severity, Status } from "@/lib/schema";
import { useBugs } from "@/lib/useBugs";
import { BugForm } from "./BugForm";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Search, Trash2, Edit, Bug as BugIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable, SortingState, ColumnDef } from "@tanstack/react-table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function BugTracker() {
  const { bugs, addBug, updateBug, deleteBug, mounted } = useBugs();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState<Severity | "All">("All");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");

  const [formOpen, setFormOpen] = useState(false);
  const [editingBug, setEditingBug] = useState<Bug | undefined>(undefined);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bugToDelete, setBugToDelete] = useState<string | null>(null);

  const filteredBugs = useMemo(() => {
    return bugs.filter(bug => {
      if (severityFilter !== "All" && bug.severity !== severityFilter) return false;
      if (statusFilter !== "All" && bug.status !== statusFilter) return false;
      return true;
    });
  }, [bugs, severityFilter, statusFilter]);

  // Dashboard Stats
  const totalBugs = bugs.length;
  const openBugs = bugs.filter(b => b.status === "Open" || b.status === "In Progress").length;
  const criticalBugs = bugs.filter(b => b.severity === "Critical" && b.status !== "Closed" && b.status !== "Resolved").length;

  const chartData = useMemo(() => {
    const counts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    bugs.forEach(b => {
      if (b.status !== "Closed" && b.status !== "Resolved") {
        counts[b.severity]++;
      }
    });
    return [
      { name: "Low", count: counts.Low, color: "#3b82f6" },
      { name: "Medium", count: counts.Medium, color: "#eab308" },
      { name: "High", count: counts.High, color: "#f97316" },
      { name: "Critical", count: counts.Critical, color: "#ef4444" },
    ];
  }, [bugs]);

  const columns: ColumnDef<Bug>[] = [
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => {
        const severity = row.original.severity;
        const colorMap: Record<Severity, string> = {
          Low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800",
          Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800",
          High: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800",
          Critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
        };
        return <Badge className={colorMap[severity]}>{severity}</Badge>;
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const colorMap: Record<Status, string> = {
          "Open": "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700",
          "In Progress": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800",
          "Resolved": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800",
          "Closed": "bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600"
        };
        return <Badge className={colorMap[status]}>{status}</Badge>;
      }
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString()
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditingBug(row.original); setFormOpen(true); }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => { setBugToDelete(row.original.id); setDeleteConfirmOpen(true); }}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const table = useReactTable({
    data: filteredBugs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    }
  });

  if (!mounted) return null;

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bug Tracker</h1>
          <p className="text-muted-foreground">Manage your bugs and test cases efficiently.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <ThemeToggle />
          <Button className="w-full md:w-auto" onClick={() => { setEditingBug(undefined); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Report Bug
          </Button>
        </div>
      </div>

      {bugs.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed bg-muted/40">
          <BugIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No bugs tracked yet!</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            You currently don't have any bugs in the system. Start by reporting your first bug.
          </p>
          <Button onClick={() => { setEditingBug(undefined); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Report First Bug
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bugs</CardTitle>
                <BugIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalBugs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open / In Progress</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{openBugs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Critical (Active)</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalBugs}</div>
              </CardContent>
            </Card>
            <Card className="col-span-1 md:col-span-2 lg:col-span-1">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm font-medium">Active Bugs by Severity</CardTitle>
              </CardHeader>
              <CardContent className="h-[80px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="count" radius={[4, 4, 4, 4]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search bugs..."
                    className="pl-8"
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                  />
                </div>
                
                <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as Severity | "All")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Severities</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status | "All")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-md border bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead 
                        key={header.id} 
                        className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <CheckCircle2 className="h-8 w-8 mb-2 opacity-20" />
                        <p>No bugs found matching your filters.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <BugForm
        bug={editingBug}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={editingBug ? updateBug : addBug}
      />

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the bug.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              if (bugToDelete) deleteBug(bugToDelete);
              setDeleteConfirmOpen(false);
            }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
