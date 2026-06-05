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
    size: 14,
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
    `Date: ${payment.payment_date}`,
    {
      x: 50,
      y: 660,
      size: 12,
      font,
    }
  );

  page.drawText(
    `Payment Amount: ₹${payment.amount}`,
    {
      x: 50,
      y: 620,
      size: 12,
      font,
    }
  );

  page.drawText(
    `Discount: ₹${payment.discount_amount ?? 0}`,
    {
      x: 50,
      y: 600,
      size: 12,
      font,
    }
  );

  const pdfBytes = await pdfDoc.save();

  return Array.from(pdfBytes);
}