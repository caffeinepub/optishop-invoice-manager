import { Eye, FileText, Printer, Search, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { T__1 } from "../backend.d";
import { printInvoice } from "../components/InvoicePrint";
import { useDeleteInvoice, useGetAllInvoices } from "../hooks/useQueries";
import { formatDate, formatINR, generateInvoiceNumber } from "../utils/format";

function PrescriptionRow({ invoice }: { invoice: T__1 }) {
  const signFmt = (n: number) => (n >= 0 ? `+${n.toFixed(2)}` : n.toFixed(2));

  return (
    <div className="px-4 py-3 bg-muted/30 rounded-lg text-sm">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-muted-foreground">
            <th className="text-left pb-1 font-medium">Eye</th>
            <th className="text-center pb-1 font-medium">Sphere</th>
            <th className="text-center pb-1 font-medium">Cylinder</th>
            <th className="text-center pb-1 font-medium">Axis</th>
            <th className="text-center pb-1 font-medium">Addition</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-0.5 font-medium">Left (OS)</td>
            <td className="text-center py-0.5">
              {signFmt(invoice.leftEye.sphere)}
            </td>
            <td className="text-center py-0.5">
              {signFmt(invoice.leftEye.cylinder)}
            </td>
            <td className="text-center py-0.5">
              {Number(invoice.leftEye.axis)}°
            </td>
            <td className="text-center py-0.5">
              {signFmt(invoice.leftEye.addition)}
            </td>
          </tr>
          <tr>
            <td className="py-0.5 font-medium">Right (OD)</td>
            <td className="text-center py-0.5">
              {signFmt(invoice.rightEye.sphere)}
            </td>
            <td className="text-center py-0.5">
              {signFmt(invoice.rightEye.cylinder)}
            </td>
            <td className="text-center py-0.5">
              {Number(invoice.rightEye.axis)}°
            </td>
            <td className="text-center py-0.5">
              {signFmt(invoice.rightEye.addition)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

interface InvoiceRowProps {
  invoice: T__1;
  invoiceNumber: string;
  index: number;
  onDelete: (id: string) => void;
}

function InvoiceRow({
  invoice,
  invoiceNumber,
  index,
  onDelete,
}: InvoiceRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const idx = index + 1;

  return (
    <>
      <TableRow
        className="hover:bg-muted/30 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <TableCell className="font-mono text-xs font-medium text-muted-foreground">
          {invoiceNumber}
        </TableCell>
        <TableCell>
          <div>
            <p className="font-semibold text-sm">{invoice.customerName}</p>
            <p className="text-xs text-muted-foreground">
              {invoice.mobileNumber}
            </p>
          </div>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {invoice.frameNumber || "—"}
        </TableCell>
        <TableCell className="text-right text-sm font-semibold">
          {formatINR(invoice.grandTotal)}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {formatDate(invoice.createdAt)}
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1 justify-end">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
              title="View prescription"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button
              data-ocid={`invoice.print.button.${idx}`}
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                printInvoice(invoice, invoiceNumber);
              }}
              title="Print invoice"
            >
              <Printer className="h-3.5 w-3.5" />
            </Button>
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  data-ocid={`invoice.delete.button.${idx}`}
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={(e) => e.stopPropagation()}
                  title="Delete invoice"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-ocid="invoice.delete.dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete invoice{" "}
                    <strong>{invoiceNumber}</strong> for{" "}
                    <strong>{invoice.customerName}</strong>? This action cannot
                    be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="invoice.delete.cancel.button">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    data-ocid="invoice.delete.confirm.button"
                    onClick={() => onDelete(invoice.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TableCell>
      </TableRow>
      <AnimatePresence>
        {expanded && (
          <TableRow>
            <TableCell colSpan={6} className="p-0 border-0">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-6 py-4 bg-muted/20 border-t border-border/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PrescriptionRow invoice={invoice} />
                    <div className="text-sm space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Frame</span>
                        <span className="font-medium">
                          {formatINR(invoice.framePrice)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lens</span>
                        <span className="font-medium">
                          {formatINR(invoice.lensPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GST (5%)</span>
                        <span className="font-medium">
                          {formatINR(invoice.gst)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-1.5 mt-1.5">
                        <span className="font-semibold">Grand Total</span>
                        <span className="font-bold text-primary">
                          {formatINR(invoice.grandTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TableCell>
          </TableRow>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: invoices, isLoading } = useGetAllInvoices();
  const deleteInvoice = useDeleteInvoice();

  const sorted = invoices
    ? [...invoices].sort((a, b) => Number(b.createdAt - a.createdAt))
    : [];

  const filtered = sorted.filter((inv) => {
    const q = searchQuery.toLowerCase();
    return (
      inv.customerName.toLowerCase().includes(q) ||
      inv.mobileNumber.includes(q) ||
      inv.frameNumber.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteInvoice.mutateAsync(id);
      toast.success("Invoice deleted");
    } catch {
      toast.error("Failed to delete invoice");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-8 bg-accent rounded-full" />
          <h1 className="text-3xl font-bold font-display text-foreground">
            Invoices
          </h1>
          {invoices && (
            <Badge variant="secondary" className="ml-auto">
              {invoices.length} total
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="relative max-w-sm"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          data-ocid="invoice.search.input"
          placeholder="Search by name, mobile, frame no..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <Card className="border-0 shadow-md overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {["s1", "s2", "s3", "s4", "s5"].map((k) => (
                  <Skeleton key={k} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div
                data-ocid="invoice.empty_state"
                className="text-center py-16 text-muted-foreground"
              >
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-25" />
                <p className="text-sm font-medium">
                  {searchQuery
                    ? "No invoices match your search"
                    : "No invoices yet"}
                </p>
                <p className="text-xs mt-1 opacity-60">
                  {searchQuery
                    ? "Try a different search term"
                    : "Create your first order to get started"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">
                        Invoice #
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">
                        Customer
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">
                        Frame No.
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">
                        Grand Total
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">
                        Date
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((invoice, idx) => {
                      const totalInvoices = sorted.length;
                      const originalIdx = sorted.findIndex(
                        (i) => i.id === invoice.id,
                      );
                      const invNum = generateInvoiceNumber(
                        totalInvoices - originalIdx,
                      );
                      return (
                        <InvoiceRow
                          key={invoice.id}
                          invoice={invoice}
                          invoiceNumber={invNum}
                          index={idx}
                          onDelete={handleDelete}
                        />
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
