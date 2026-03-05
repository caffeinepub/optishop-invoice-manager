import {
  Eye,
  FileText,
  Loader2,
  Pencil,
  Printer,
  Search,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateInvoice,
  useDeleteInvoice,
  useGetAllInvoices,
} from "../hooks/useQueries";
import { formatDate, formatINR, generateInvoiceNumber } from "../utils/format";

// ─── Prescription expand row ─────────────────────────────────────────────────

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

// ─── Edit Sheet ───────────────────────────────────────────────────────────────

interface EditForm {
  customerName: string;
  mobileNumber: string;
  frameNumber: string;
  framePrice: string;
  lensPrice: string;
  leftSphere: string;
  leftCylinder: string;
  leftAxis: string;
  leftAddition: string;
  rightSphere: string;
  rightCylinder: string;
  rightAxis: string;
  rightAddition: string;
}

function invoiceToForm(invoice: T__1): EditForm {
  return {
    customerName: invoice.customerName,
    mobileNumber: invoice.mobileNumber,
    frameNumber: invoice.frameNumber,
    framePrice: invoice.framePrice.toString(),
    lensPrice: invoice.lensPrice.toString(),
    leftSphere: invoice.leftEye.sphere.toString(),
    leftCylinder: invoice.leftEye.cylinder.toString(),
    leftAxis: Number(invoice.leftEye.axis).toString(),
    leftAddition: invoice.leftEye.addition.toString(),
    rightSphere: invoice.rightEye.sphere.toString(),
    rightCylinder: invoice.rightEye.cylinder.toString(),
    rightAxis: Number(invoice.rightEye.axis).toString(),
    rightAddition: invoice.rightEye.addition.toString(),
  };
}

interface EditSheetProps {
  invoice: T__1 | null;
  open: boolean;
  onClose: () => void;
}

function EditSheet({ invoice, open, onClose }: EditSheetProps) {
  const [form, setForm] = useState<EditForm | null>(null);
  const deleteInvoice = useDeleteInvoice();
  const createInvoice = useCreateInvoice();
  const isSaving = deleteInvoice.isPending || createInvoice.isPending;

  // Pre-fill form when invoice changes
  useEffect(() => {
    if (invoice) setForm(invoiceToForm(invoice));
  }, [invoice]);

  if (!invoice || !form) return null;

  const framePrice = Number.parseFloat(form.framePrice) || 0;
  const lensPrice = Number.parseFloat(form.lensPrice) || 0;
  const subtotal = framePrice + lensPrice;
  const gst = subtotal * 0.05;
  const grandTotal = subtotal + gst;

  const set =
    (field: keyof EditForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => (prev ? { ...prev, [field]: e.target.value } : prev));

  const handleSave = async () => {
    if (!form) return;
    try {
      const updated: T__1 = {
        id: invoice.id,
        createdAt: invoice.createdAt,
        profit: invoice.profit,
        customerName: form.customerName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        frameNumber: form.frameNumber.trim(),
        framePrice,
        lensPrice,
        gst,
        grandTotal,
        leftEye: {
          sphere: Number.parseFloat(form.leftSphere) || 0,
          cylinder: Number.parseFloat(form.leftCylinder) || 0,
          axis: BigInt(Number.parseInt(form.leftAxis) || 0),
          addition: Number.parseFloat(form.leftAddition) || 0,
        },
        rightEye: {
          sphere: Number.parseFloat(form.rightSphere) || 0,
          cylinder: Number.parseFloat(form.rightCylinder) || 0,
          axis: BigInt(Number.parseInt(form.rightAxis) || 0),
          addition: Number.parseFloat(form.rightAddition) || 0,
        },
      };

      await deleteInvoice.mutateAsync(invoice.id);
      await createInvoice.mutateAsync(updated);
      toast.success("Invoice updated successfully");
      onClose();
    } catch {
      toast.error("Failed to update invoice");
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        data-ocid="invoice.edit.sheet"
        className="w-full sm:max-w-xl overflow-y-auto"
        side="right"
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="font-display text-lg">Edit Invoice</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Update the invoice details below. GST and totals are
            auto-calculated.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 pb-4">
          {/* Customer Info */}
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 border-b pb-1">
              Customer Info
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="edit-name" className="text-xs">
                  Customer Name
                </Label>
                <Input
                  id="edit-name"
                  data-ocid="invoice.edit.customer_name.input"
                  value={form.customerName}
                  onChange={set("customerName")}
                  placeholder="Full name"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="edit-mobile" className="text-xs">
                  Mobile Number
                </Label>
                <Input
                  id="edit-mobile"
                  data-ocid="invoice.edit.mobile.input"
                  value={form.mobileNumber}
                  onChange={set("mobileNumber")}
                  placeholder="10-digit mobile"
                />
              </div>
            </div>
          </section>

          {/* Frame & Lens */}
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 border-b pb-1">
              Frame &amp; Lens
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3 space-y-1.5">
                <Label htmlFor="edit-frame-no" className="text-xs">
                  Frame Number
                </Label>
                <Input
                  id="edit-frame-no"
                  data-ocid="invoice.edit.frame_number.input"
                  value={form.frameNumber}
                  onChange={set("frameNumber")}
                  placeholder="e.g. FR-001"
                />
              </div>
              <div className="col-span-3 sm:col-span-1 space-y-1.5">
                <Label htmlFor="edit-frame-price" className="text-xs">
                  Frame Price (₹)
                </Label>
                <Input
                  id="edit-frame-price"
                  data-ocid="invoice.edit.frame_price.input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.framePrice}
                  onChange={set("framePrice")}
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-3 sm:col-span-1 space-y-1.5">
                <Label htmlFor="edit-lens-price" className="text-xs">
                  Lens Price (₹)
                </Label>
                <Input
                  id="edit-lens-price"
                  data-ocid="invoice.edit.lens_price.input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.lensPrice}
                  onChange={set("lensPrice")}
                  placeholder="0.00"
                />
              </div>
            </div>
          </section>

          {/* Left Eye */}
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 border-b pb-1">
              Left Eye (OS)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-l-sphere" className="text-xs">
                  Sphere
                </Label>
                <Input
                  id="edit-l-sphere"
                  data-ocid="invoice.edit.left_sphere.input"
                  type="number"
                  step="0.25"
                  value={form.leftSphere}
                  onChange={set("leftSphere")}
                  placeholder="+0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-l-cyl" className="text-xs">
                  Cylinder
                </Label>
                <Input
                  id="edit-l-cyl"
                  data-ocid="invoice.edit.left_cylinder.input"
                  type="number"
                  step="0.25"
                  value={form.leftCylinder}
                  onChange={set("leftCylinder")}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-l-axis" className="text-xs">
                  Axis (°)
                </Label>
                <Input
                  id="edit-l-axis"
                  data-ocid="invoice.edit.left_axis.input"
                  type="number"
                  min="0"
                  max="180"
                  value={form.leftAxis}
                  onChange={set("leftAxis")}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-l-add" className="text-xs">
                  Addition
                </Label>
                <Input
                  id="edit-l-add"
                  data-ocid="invoice.edit.left_addition.input"
                  type="number"
                  step="0.25"
                  value={form.leftAddition}
                  onChange={set("leftAddition")}
                  placeholder="0.00"
                />
              </div>
            </div>
          </section>

          {/* Right Eye */}
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 border-b pb-1">
              Right Eye (OD)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-r-sphere" className="text-xs">
                  Sphere
                </Label>
                <Input
                  id="edit-r-sphere"
                  data-ocid="invoice.edit.right_sphere.input"
                  type="number"
                  step="0.25"
                  value={form.rightSphere}
                  onChange={set("rightSphere")}
                  placeholder="+0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-r-cyl" className="text-xs">
                  Cylinder
                </Label>
                <Input
                  id="edit-r-cyl"
                  data-ocid="invoice.edit.right_cylinder.input"
                  type="number"
                  step="0.25"
                  value={form.rightCylinder}
                  onChange={set("rightCylinder")}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-r-axis" className="text-xs">
                  Axis (°)
                </Label>
                <Input
                  id="edit-r-axis"
                  data-ocid="invoice.edit.right_axis.input"
                  type="number"
                  min="0"
                  max="180"
                  value={form.rightAxis}
                  onChange={set("rightAxis")}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-r-add" className="text-xs">
                  Addition
                </Label>
                <Input
                  id="edit-r-add"
                  data-ocid="invoice.edit.right_addition.input"
                  type="number"
                  step="0.25"
                  value={form.rightAddition}
                  onChange={set("rightAddition")}
                  placeholder="0.00"
                />
              </div>
            </div>
          </section>

          {/* Totals Summary */}
          <section className="rounded-lg bg-muted/40 p-4 space-y-2 text-sm">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Calculated Totals
            </h4>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST (5%)</span>
              <span className="font-medium">{formatINR(gst)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-1">
              <span className="font-semibold">Grand Total</span>
              <span className="font-bold text-primary text-base">
                {formatINR(grandTotal)}
              </span>
            </div>
          </section>
        </div>

        <SheetFooter className="flex gap-2 pt-4 border-t">
          <Button
            data-ocid="invoice.edit.cancel.button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            data-ocid="invoice.edit.save.button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ─── Invoice Row ──────────────────────────────────────────────────────────────

interface InvoiceRowProps {
  invoice: T__1;
  invoiceNumber: string;
  index: number;
  isAuthenticated: boolean;
  onDelete: (id: string) => void;
  onEdit: (invoice: T__1) => void;
}

function InvoiceRow({
  invoice,
  invoiceNumber,
  index,
  isAuthenticated,
  onDelete,
  onEdit,
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
              data-ocid={`invoice.edit.button.${idx}`}
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                if (!isAuthenticated) {
                  toast.error("Please log in to edit or delete invoices.");
                  return;
                }
                onEdit(invoice);
              }}
              title="Edit invoice"
            >
              <Pencil className="h-3.5 w-3.5" />
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
            <AlertDialog
              open={deleteOpen && isAuthenticated}
              onOpenChange={(v) => isAuthenticated && setDeleteOpen(v)}
            >
              <AlertDialogTrigger asChild>
                <Button
                  data-ocid={`invoice.delete.button.${idx}`}
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isAuthenticated) {
                      toast.error("Please log in to edit or delete invoices.");
                    }
                  }}
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

// ─── Main Invoices Page ───────────────────────────────────────────────────────

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editInvoice, setEditInvoice] = useState<T__1 | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
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

  const handleEdit = (invoice: T__1) => {
    setEditInvoice(invoice);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    // Keep invoice in state briefly for sheet exit animation
    setTimeout(() => setEditInvoice(null), 300);
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
                          isAuthenticated={isAuthenticated}
                          onDelete={handleDelete}
                          onEdit={handleEdit}
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

      {/* Edit Sheet */}
      <EditSheet
        invoice={editInvoice}
        open={editOpen}
        onClose={handleEditClose}
      />
    </div>
  );
}
