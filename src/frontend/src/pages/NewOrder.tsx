import {
  CheckCircle2,
  Loader2,
  LogIn,
  PlusCircle,
  Printer,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import type { T__1 } from "../backend.d";
import { printInvoice } from "../components/InvoicePrint";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateInvoice,
  useGetAllFrames,
  useGetAllInvoices,
} from "../hooks/useQueries";
import { formatINR, generateInvoiceNumber } from "../utils/format";

interface EyeForm {
  sphere: string;
  cylinder: string;
  axis: string;
  addition: string;
}

const defaultEye: EyeForm = {
  sphere: "0.00",
  cylinder: "0.00",
  axis: "0",
  addition: "0.00",
};

interface EyeSectionProps {
  label: string;
  side: "left" | "right";
  values: EyeForm;
  onChange: (field: keyof EyeForm, val: string) => void;
}

function EyeSection({ label, side, values, onChange }: EyeSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">
          {side === "left" ? "L" : "R"}
        </span>
        {label}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">
            Sphere
          </Label>
          <Input
            data-ocid={`new_order.${side}_sphere.input`}
            type="number"
            step="0.25"
            value={values.sphere}
            onChange={(e) => onChange("sphere", e.target.value)}
            className="h-9 text-sm"
            placeholder="0.00"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">
            Cylinder
          </Label>
          <Input
            data-ocid={`new_order.${side}_cylinder.input`}
            type="number"
            step="0.25"
            value={values.cylinder}
            onChange={(e) => onChange("cylinder", e.target.value)}
            className="h-9 text-sm"
            placeholder="0.00"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">
            Axis (°)
          </Label>
          <Input
            data-ocid={`new_order.${side}_axis.input`}
            type="number"
            step="1"
            min="0"
            max="180"
            value={values.axis}
            onChange={(e) => onChange("axis", e.target.value)}
            className="h-9 text-sm"
            placeholder="0"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">
            Addition
          </Label>
          <Input
            data-ocid={`new_order.${side}_addition.input`}
            type="number"
            step="0.25"
            value={values.addition}
            onChange={(e) => onChange("addition", e.target.value)}
            className="h-9 text-sm"
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  );
}

function LoginPrompt() {
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
              Please log in with Internet Identity to create invoices.
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

export default function NewOrder() {
  const { identity } = useInternetIdentity();
  const { data: existingInvoices } = useGetAllInvoices();
  const { data: frames } = useGetAllFrames();
  const { actor } = useActor();
  const createInvoice = useCreateInvoice();

  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [frameNumber, setFrameNumber] = useState("");
  const [framePrice, setFramePrice] = useState("");
  const [lensPrice, setLensPrice] = useState("");
  const [leftEye, setLeftEye] = useState<EyeForm>(defaultEye);
  const [rightEye, setRightEye] = useState<EyeForm>(defaultEye);
  const [lookingUp, setLookingUp] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<T__1 | null>(null);
  const [createdInvoiceNum, setCreatedInvoiceNum] = useState("");

  const invoiceCount = existingInvoices?.length ?? 0;
  const nextInvoiceNumber = generateInvoiceNumber(invoiceCount + 1);

  const fp = Number.parseFloat(framePrice) || 0;
  const lp = Number.parseFloat(lensPrice) || 0;
  const subtotal = fp + lp;
  const gst = subtotal * 0.05;
  const grandTotal = subtotal + gst;

  const handleFrameLookup = async () => {
    if (!frameNumber.trim()) {
      toast.error("Enter a frame number to look up");
      return;
    }
    const local = frames?.find((f) => f.frameNumber === frameNumber.trim());
    if (local) {
      setFramePrice(String(local.sellingPrice));
      toast.success(
        `Frame found: ${local.brand} ${local.name} — ₹${local.sellingPrice}`,
      );
      return;
    }
    if (!actor) {
      toast.error("Not connected to backend");
      return;
    }
    setLookingUp(true);
    try {
      const frame = await actor.getFrame(frameNumber.trim());
      setFramePrice(String(frame.sellingPrice));
      toast.success(`Frame found: ${frame.brand} ${frame.name}`);
    } catch {
      toast.error("Frame not found in stock");
    } finally {
      setLookingUp(false);
    }
  };

  const handleEyeChange = (
    side: "left" | "right",
    field: keyof EyeForm,
    val: string,
  ) => {
    if (side === "left") setLeftEye((prev) => ({ ...prev, [field]: val }));
    else setRightEye((prev) => ({ ...prev, [field]: val }));
  };

  const resetForm = () => {
    setCustomerName("");
    setMobileNumber("");
    setFrameNumber("");
    setFramePrice("");
    setLensPrice("");
    setLeftEye(defaultEye);
    setRightEye(defaultEye);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (!mobileNumber.trim()) {
      toast.error("Mobile number is required");
      return;
    }

    const id = crypto.randomUUID();
    const newInvoice: T__1 = {
      id,
      customerName: customerName.trim(),
      mobileNumber: mobileNumber.trim(),
      frameNumber: frameNumber.trim(),
      framePrice: fp,
      lensPrice: lp,
      gst,
      grandTotal,
      profit: 0,
      createdAt: BigInt(Date.now()) * BigInt(1_000_000),
      leftEye: {
        sphere: Number.parseFloat(leftEye.sphere) || 0,
        cylinder: Number.parseFloat(leftEye.cylinder) || 0,
        axis: BigInt(Number.parseInt(leftEye.axis) || 0),
        addition: Number.parseFloat(leftEye.addition) || 0,
      },
      rightEye: {
        sphere: Number.parseFloat(rightEye.sphere) || 0,
        cylinder: Number.parseFloat(rightEye.cylinder) || 0,
        axis: BigInt(Number.parseInt(rightEye.axis) || 0),
        addition: Number.parseFloat(rightEye.addition) || 0,
      },
    };

    try {
      const result = await createInvoice.mutateAsync(newInvoice);
      const invNum = generateInvoiceNumber(invoiceCount + 1);
      setCreatedInvoice(result);
      setCreatedInvoiceNum(invNum);
      toast.success(`Invoice ${invNum} created successfully!`);
      resetForm();
    } catch (error) {
      console.error("Invoice creation error:", error);
      const errMsg = error instanceof Error ? error.message : String(error);
      const isAuthError =
        errMsg.toLowerCase().includes("not authorized") ||
        errMsg.toLowerCase().includes("unauthorized") ||
        errMsg.toLowerCase().includes("anonymous") ||
        errMsg.toLowerCase().includes("access denied") ||
        errMsg.toLowerCase().includes("not registered");
      if (isAuthError) {
        toast.error(
          "Authentication error — please log out and log in again, then retry.",
        );
      } else {
        toast.error(
          "Failed to create invoice. The backend may still be initializing — please wait a moment and try again.",
        );
      }
    }
  };

  if (!identity) {
    return <LoginPrompt />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-8 bg-accent rounded-full" />
          <h1 className="text-3xl font-bold font-display text-foreground">
            New Order
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-4 pl-3">
          Invoice will be numbered{" "}
          <span className="font-semibold text-foreground">
            {nextInvoiceNumber}
          </span>
        </p>
      </motion.div>

      {/* Success Banner */}
      {createdInvoice && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Invoice {createdInvoiceNum} created!
              </p>
              <p className="text-xs text-emerald-600">
                {createdInvoice.customerName} ·{" "}
                {formatINR(createdInvoice.grandTotal)}
              </p>
            </div>
          </div>
          <Button
            data-ocid="new_order.print.button"
            size="sm"
            variant="outline"
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 gap-2"
            onClick={() => printInvoice(createdInvoice, createdInvoiceNum)}
          >
            <Printer className="h-4 w-4" />
            Print Invoice
          </Button>
        </motion.div>
      )}

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="space-y-5"
      >
        {/* Customer Info */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="customerName" className="text-sm font-medium">
                Customer Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customerName"
                data-ocid="new_order.customer_name.input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mobileNumber" className="text-sm font-medium">
                Mobile Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mobileNumber"
                data-ocid="new_order.mobile.input"
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="e.g. 9876543210"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Frame Details */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">
              Frame Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="frameNumber" className="text-sm font-medium">
                Frame Number
              </Label>
              <div className="flex gap-2">
                <Input
                  id="frameNumber"
                  data-ocid="new_order.frame_number.input"
                  value={frameNumber}
                  onChange={(e) => setFrameNumber(e.target.value)}
                  placeholder="e.g. FR-001"
                  className="flex-1"
                />
                <Button
                  type="button"
                  data-ocid="new_order.frame_lookup.button"
                  variant="outline"
                  size="icon"
                  onClick={handleFrameLookup}
                  disabled={lookingUp}
                  title="Look up frame price from stock"
                  className="flex-shrink-0"
                >
                  {lookingUp ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Click search to auto-fill price from stock
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="framePrice" className="text-sm font-medium">
                Frame Price (₹)
              </Label>
              <Input
                id="framePrice"
                data-ocid="new_order.frame_price.input"
                type="number"
                step="0.01"
                min="0"
                value={framePrice}
                onChange={(e) => setFramePrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lensPrice" className="text-sm font-medium">
                Lens Price (₹)
              </Label>
              <Input
                id="lensPrice"
                data-ocid="new_order.lens_price.input"
                type="number"
                step="0.01"
                min="0"
                value={lensPrice}
                onChange={(e) => setLensPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </CardContent>
        </Card>

        {/* Prescription */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">
              Lens Prescription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <EyeSection
                label="Left Eye (OS)"
                side="left"
                values={leftEye}
                onChange={(f, v) => handleEyeChange("left", f, v)}
              />
              <div className="hidden sm:flex items-center justify-center">
                <div className="w-px h-full bg-border" />
              </div>
              <EyeSection
                label="Right Eye (OD)"
                side="right"
                values={rightEye}
                onChange={(f, v) => handleEyeChange("right", f, v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Totals Summary */}
        <Card className="border-0 shadow-md bg-primary/5">
          <CardContent className="pt-5">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Frame Price</span>
                <span className="font-medium">{formatINR(fp)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lens Price</span>
                <span className="font-medium">{formatINR(lp)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST (5%)</span>
                <span className="font-medium">{formatINR(gst)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-base font-bold font-display">
                  Grand Total
                </span>
                <span className="text-xl font-bold text-primary font-display">
                  {formatINR(grandTotal)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          type="submit"
          data-ocid="new_order.submit.button"
          className="w-full h-12 text-base font-semibold gap-2"
          disabled={createInvoice.isPending}
        >
          {createInvoice.isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating Invoice...
            </>
          ) : (
            <>
              <PlusCircle className="h-5 w-5" />
              Create Invoice
            </>
          )}
        </Button>
      </motion.form>
    </div>
  );
}
