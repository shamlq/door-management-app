"use server";

import { PDFDocument, StandardFonts } from "pdf-lib";
import { createClient } from "@/lib/supabase/server";

export async function generateReceiptPdf(
  paymentId: string
) {
  const supabase = await createClient();

  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .single();

  if (!payment) {
  throw new Error("Payment not found");
}

const { data: order } = await supabase
  .from("orders")
  .select("*")
  .eq("id", payment.order_id)
  .single();

if (!order) {
  throw new Error("Order not found");
}

const { data: customer } = await supabase
  .from("customers")
  .select("*")
  .eq("id", order.customer_id)
  .single();

if (!customer) {
  throw new Error("Customer not found");
}

  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage([595, 842]);

  const font = await pdfDoc.embedFont(
    StandardFonts.Helvetica
  );

  page.drawText("V LOCKS", {
    x: 50,
    y: 780,
    size: 20,
    font,
  });

  page.drawText("PAYMENT RECEIPT", {
  x: 50,
  y: 740,
  size: 18,
  font,
});

  page.drawText(
    `Receipt No: ${payment.receipt_no ?? "-"}`,
    {
      x: 50,
      y: 680,
      size: 12,
      font,
    }
  );

  page.drawText(
  `Date: ${new Date(payment.payment_date).toLocaleDateString("en-GB")}`,
  {
    x: 50,
    y: 660,
    size: 12,
    font,
  }
);

page.drawText(
  `Customer: ${customer.name}`,
  {
    x: 50,
    y: 630,
    size: 12,
    font,
  }
);

page.drawText(
  `Phone: ${customer.phone ?? "-"}`,
  {
    x: 50,
    y: 610,
    size: 12,
    font,
  }
);

page.drawText(
  `Order No: ${order.order_number}`,
  {
    x: 50,
    y: 590,
    size: 12,
    font,
  }
);

page.drawText(
  `Project: ${order.project_name}`,
  {
    x: 50,
    y: 570,
    size: 12,
    font,
  }
);

  page.drawText(
  `Payment Amount: Rs. ${payment.amount}`,
  {
    x: 50,
    y: 540,
      size: 12,
      font,
    }
  );

  page.drawText(
  `Discount: Rs. ${payment.discount_amount ?? 0}`,
  {
    x: 50,
    y: 520,
      size: 12,
      font,
    }
  );
  
  page.drawText(
  `Method: ${payment.method ?? "-"}`,
  {
    x: 50,
    y: 500,
    size: 12,
    font,
  }
);

page.drawText(
  `Reference: ${payment.reference_no ?? "-"}`,
  {
    x: 50,
    y: 480,
    size: 12,
    font,
  }
);

  const pdfBytes = await pdfDoc.save();

  return Array.from(pdfBytes);
}