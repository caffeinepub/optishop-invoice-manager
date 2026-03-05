import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Calendar,
  FileText,
  IndianRupee,
  Printer,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { printInvoice } from "../components/InvoicePrint";
import { useGetSalesSummary } from "../hooks/useQueries";
import { useGetAllInvoices } from "../hooks/useQueries";
import { formatDate, formatINR, generateInvoiceNumber } from "../utils/format";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  "data-ocid"?: string;
}

function StatCard({
  title,
  value,
  icon,
  color,
  bgColor,
  "data-ocid": ocid,
}: StatCardProps) {
  return (
    <motion.div variants={itemVariants}>
      <Card
        data-ocid={ocid}
        className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-200"
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background:
              "radial-gradient(ellipse at top right, currentColor 0%, transparent 70%)",
          }}
        />
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
                {title}
              </p>
              <p className={`text-2xl font-bold font-display ${color}`}>
                {value}
              </p>
            </div>
            <div className={`p-2.5 rounded-xl ${bgColor}`}>{icon}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useGetSalesSummary();
  const { data: invoices, isLoading: invoicesLoading } = useGetAllInvoices();

  const recentInvoices = invoices
    ? [...invoices]
        .sort((a, b) => Number(b.createdAt - a.createdAt))
        .slice(0, 5)
    : [];

  const stats = [
    {
      title: "Today's Sales",
      value: summaryLoading ? null : formatINR(summary?.todayTotal ?? 0),
      icon: <IndianRupee className="h-5 w-5 text-emerald-600" />,
      color: "text-foreground",
      bgColor: "bg-emerald-50",
      ocid: "dashboard.today_sales.card",
    },
    {
      title: "Monthly Sales",
      value: summaryLoading ? null : formatINR(summary?.monthTotal ?? 0),
      icon: <BarChart3 className="h-5 w-5 text-blue-600" />,
      color: "text-foreground",
      bgColor: "bg-blue-50",
      ocid: "dashboard.monthly_sales.card",
    },
    {
      title: "Today's Profit",
      value: summaryLoading ? null : formatINR(summary?.todayProfit ?? 0),
      icon: <TrendingUp className="h-5 w-5 text-amber-600" />,
      color: "text-foreground",
      bgColor: "bg-amber-50",
      ocid: "dashboard.today_profit.card",
    },
    {
      title: "Monthly Profit",
      value: summaryLoading ? null : formatINR(summary?.monthProfit ?? 0),
      icon: <Calendar className="h-5 w-5 text-violet-600" />,
      color: "text-foreground",
      bgColor: "bg-violet-50",
      ocid: "dashboard.monthly_profit.card",
    },
    {
      title: "Total Invoices",
      value: summaryLoading ? null : String(Number(summary?.invoiceCount ?? 0)),
      icon: <FileText className="h-5 w-5 text-teal-600" />,
      color: "text-foreground",
      bgColor: "bg-teal-50",
      ocid: "dashboard.invoice_count.card",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-8 bg-accent rounded-full" />
          <h1 className="text-3xl font-bold font-display text-foreground">
            Dashboard
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-4 pl-3">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        {stats.map((stat) => (
          <StatCard
            key={stat.ocid}
            title={stat.title}
            value={stat.value === null ? "—" : stat.value}
            icon={stat.icon}
            color={stat.color}
            bgColor={stat.bgColor}
            data-ocid={stat.ocid}
          />
        ))}
      </motion.div>

      {/* Recent Invoices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary/70" />
                Recent Invoices
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                Last 5
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {invoicesLoading ? (
              <div className="space-y-3 p-6">
                {["s1", "s2", "s3"].map((k) => (
                  <Skeleton key={k} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : recentInvoices.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">
                  No invoices yet. Create your first order!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentInvoices.map((inv, idx) => {
                  const totalInvoices = invoices?.length ?? 0;
                  const invNum = generateInvoiceNumber(totalInvoices - idx);
                  return (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary/70" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {inv.customerName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {invNum} · {inv.mobileNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">
                            {formatINR(inv.grandTotal)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(inv.createdAt)}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => printInvoice(inv, invNum)}
                          title="Print Invoice"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
