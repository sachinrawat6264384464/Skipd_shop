"use client";

interface OrderTrackingStepperProps {
  status: string; // PENDING_PAYMENT, PAID, PROCESSING, SHIPPED, DELIVERED
}

export function OrderTrackingStepper({ status }: OrderTrackingStepperProps) {
  const steps = [
    { key: "PAID", label: "Order Placed", desc: "Payment Confirmed" },
    { key: "PROCESSING", label: "Processing", desc: "Packed & Quality Checked" },
    { key: "SHIPPED", label: "Out for Delivery", desc: "In Transit with Carrier" },
    { key: "DELIVERED", label: "Delivered", desc: "Doorstep Received" }
  ];

  const statusOrder = ["PENDING_PAYMENT", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentIdx = Math.max(0, statusOrder.indexOf(status.toUpperCase()));

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <h3 className="font-black text-gray-900 text-sm flex items-center gap-2">
          <span>📦 Order Tracking Stepper Timeline</span>
        </h3>
        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
          LIVE STATUS: {status}
        </span>
      </div>

      {/* Stepper Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {steps.map((step, idx) => {
          const isCompleted = currentIdx >= idx + 1;
          const isCurrent = currentIdx === idx + 1;

          return (
            <div
              key={step.key}
              className={`relative flex flex-col items-center text-center p-3 rounded-2xl border transition ${
                isCurrent
                  ? "bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-200"
                  : isCompleted
                  ? "bg-emerald-50/30 border-emerald-200"
                  : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              {/* Step Circle Badge */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm mb-2 shadow-xs transition ${
                  isCompleted || isCurrent
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? "✓" : idx + 1}
              </div>

              <h4 className={`font-black text-xs ${isCompleted || isCurrent ? "text-gray-900" : "text-gray-500"}`}>
                {step.label}
              </h4>
              <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
