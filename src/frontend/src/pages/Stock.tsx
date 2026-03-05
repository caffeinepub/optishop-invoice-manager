import {
  AlertTriangle,
  Loader2,
  LogIn,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { T } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddFrame,
  useDeleteFrame,
  useGetAllFrames,
  useUpdateFrame,
} from "../hooks/useQueries";
import { formatINR } from "../utils/format";

interface FrameFormData {
  frameNumber: string;
  brand: string;
  name: string;
  costPrice: string;
  sellingPrice: string;
  quantity: string;
}

const defaultForm: FrameFormData = {
  frameNumber: "",
  brand: "",
  name: "",
  costPrice: "",
  sellingPrice: "",
  quantity: "1",
};

interface FrameDialogProps {
  open: boolean;
  onClose: () => void;
  editFrame?: T | null;
}

function FrameDialog({ open, onClose, editFrame }: FrameDialogProps) {
  const addFrame = useAddFrame();
  const updateFrame = useUpdateFrame();
  const isEdit = !!editFrame;

  const [form, setForm] = useState<FrameFormData>(
    editFrame
      ? {
          frameNumber: editFrame.frameNumber,
          brand: editFrame.brand,
          name: editFrame.name,
          costPrice: String(editFrame.costPrice),
          sellingPrice: String(editFrame.sellingPrice),
          quantity: String(editFrame.quantity),
        }
      : defaultForm,
  );

  const update = (field: keyof FrameFormData, val: string) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const isPending = addFrame.isPending || updateFrame.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.frameNumber.trim()) {
      toast.error("Frame number is required");
      return;
    }
    if (!form.brand.trim()) {
      toast.error("Brand is required");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Frame name is required");
      return;
    }

    const frame: T = {
      frameNumber: form.frameNumber.trim(),
      brand: form.brand.trim(),
      name: form.name.trim(),
      costPrice: Number.parseFloat(form.costPrice) || 0,
      sellingPrice: Number.parseFloat(form.sellingPrice) || 0,
      quantity: BigInt(Number.parseInt(form.quantity) || 0),
      createdAt: BigInt(Date.now()) * BigInt(1_000_000),
    };

    try {
      if (isEdit && editFrame) {
        await updateFrame.mutateAsync({
          frameNumber: editFrame.frameNumber,
          updatedFrame: frame,
        });
        toast.success(`Frame ${frame.frameNumber} updated`);
      } else {
        await addFrame.mutateAsync(frame);
        toast.success(`Frame ${frame.frameNumber} added to stock`);
      }
      onClose();
    } catch {
      toast.error(`Failed to ${isEdit ? "update" : "add"} frame`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-ocid="stock.add.dialog" className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? "Edit Frame" : "Add New Frame"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update frame details in your stock inventory."
              : "Add a new frame to your stock inventory."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Frame Number *</Label>
              <Input
                value={form.frameNumber}
                onChange={(e) => update("frameNumber", e.target.value)}
                placeholder="e.g. FR-001"
                disabled={isEdit}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Quantity *</Label>
              <Input
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) => update("quantity", e.target.value)}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Brand *</Label>
              <Input
                value={form.brand}
                onChange={(e) => update("brand", e.target.value)}
                placeholder="e.g. Ray-Ban"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Aviator Classic"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Cost Price (₹)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.costPrice}
                onChange={(e) => update("costPrice", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Selling Price (₹)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.sellingPrice}
                onChange={(e) => update("sellingPrice", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="stock.add.submit.button"
              disabled={isPending}
              className="gap-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Update Frame" : "Add Frame"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StockLoginPrompt() {
  const { login, isLoggingIn } = useInternetIdentity();
  return (
    <div className="max-w-md mx-auto mt-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card
          data-ocid="auth.login_prompt.card"
          className="border-0 shadow-lg text-center"
        >
          <CardContent className="pt-10 pb-10 px-8">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold font-display text-foreground mb-2">
              Login Required
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Please log in with Internet Identity to manage stock inventory.
            </p>
            <Button
              data-ocid="auth.login_prompt.button"
              onClick={login}
              disabled={isLoggingIn}
              className="w-full gap-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging in…
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Login with Internet Identity
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function Stock() {
  const { identity } = useInternetIdentity();
  const { data: frames, isLoading } = useGetAllFrames();
  const deleteFrame = useDeleteFrame();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editFrame, setEditFrame] = useState<T | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = (frames ?? []).filter((f) => {
    const q = searchQuery.toLowerCase();
    return (
      f.frameNumber.toLowerCase().includes(q) ||
      f.brand.toLowerCase().includes(q) ||
      f.name.toLowerCase().includes(q)
    );
  });

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFrame.mutateAsync(deleteTarget.frameNumber);
      toast.success(`Frame ${deleteTarget.frameNumber} deleted`);
    } catch {
      toast.error("Failed to delete frame");
    } finally {
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  const lowStockCount = (frames ?? []).filter((f) => f.quantity <= 2).length;

  if (!identity) {
    return <StockLoginPrompt />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 bg-accent rounded-full" />
            <h1 className="text-3xl font-bold font-display text-foreground">
              Stock
            </h1>
            {frames && (
              <Badge variant="secondary" className="ml-1">
                {frames.length} frames
              </Badge>
            )}
          </div>
          {lowStockCount > 0 && (
            <div className="ml-4 pl-3 flex items-center gap-1.5 text-sm text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <span>
                {lowStockCount} frame{lowStockCount > 1 ? "s" : ""} low on stock
              </span>
            </div>
          )}
        </div>
        <Button
          data-ocid="stock.add.button"
          onClick={() => {
            setEditFrame(null);
            setDialogOpen(true);
          }}
          className="gap-2 flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Frame
        </Button>
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
          placeholder="Search by frame no., brand, name..."
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
                data-ocid="stock.empty_state"
                className="text-center py-16 text-muted-foreground"
              >
                <Package className="h-12 w-12 mx-auto mb-3 opacity-25" />
                <p className="text-sm font-medium">
                  {searchQuery
                    ? "No frames match your search"
                    : "No frames in stock"}
                </p>
                <p className="text-xs mt-1 opacity-60">
                  {!searchQuery &&
                    "Add your first frame to start managing inventory"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">
                        Frame No.
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">
                        Brand
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">
                        Name
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">
                        Cost Price
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">
                        Selling Price
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-center">
                        Quantity
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((frame, idx) => {
                      const isLowStock = frame.quantity <= 2;
                      const i = idx + 1;
                      return (
                        <TableRow
                          key={frame.frameNumber}
                          className={`hover:bg-muted/30 ${isLowStock ? "bg-amber-50/50 hover:bg-amber-50" : ""}`}
                        >
                          <TableCell className="font-mono text-xs font-semibold text-primary">
                            {frame.frameNumber}
                          </TableCell>
                          <TableCell className="text-sm">
                            {frame.brand}
                          </TableCell>
                          <TableCell className="text-sm">
                            {frame.name}
                          </TableCell>
                          <TableCell className="text-sm text-right text-muted-foreground">
                            {formatINR(frame.costPrice)}
                          </TableCell>
                          <TableCell className="text-sm text-right font-semibold">
                            {formatINR(frame.sellingPrice)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={isLowStock ? "destructive" : "secondary"}
                              className="min-w-[2.5rem] justify-center"
                            >
                              {isLowStock && (
                                <AlertTriangle className="h-3 w-3 mr-1" />
                              )}
                              {Number(frame.quantity)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 justify-end">
                              <Button
                                data-ocid={`stock.edit.button.${i}`}
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground hover:text-primary"
                                onClick={() => {
                                  setEditFrame(frame);
                                  setDialogOpen(true);
                                }}
                                title="Edit frame"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <AlertDialog
                                open={
                                  deleteOpen &&
                                  deleteTarget?.frameNumber ===
                                    frame.frameNumber
                                }
                                onOpenChange={(v) => {
                                  setDeleteOpen(v);
                                  if (!v) setDeleteTarget(null);
                                }}
                              >
                                <AlertDialogTrigger asChild>
                                  <Button
                                    data-ocid={`stock.delete.button.${i}`}
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => {
                                      setDeleteTarget(frame);
                                      setDeleteOpen(true);
                                    }}
                                    title="Delete frame"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Frame?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove{" "}
                                      <strong>
                                        {frame.brand} {frame.name}
                                      </strong>{" "}
                                      ({frame.frameNumber}) from stock? This
                                      cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel
                                      data-ocid="stock.delete.cancel.button"
                                      onClick={() => setDeleteTarget(null)}
                                    >
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      data-ocid="stock.delete.confirm.button"
                                      onClick={handleDeleteConfirm}
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
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Frame Dialog */}
      {dialogOpen && (
        <FrameDialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setEditFrame(null);
          }}
          editFrame={editFrame}
        />
      )}
    </div>
  );
}
