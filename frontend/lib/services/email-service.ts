export interface EmailReceipt {
  to: string;
  subject: string;
  type: "WELCOME" | "ORDER_CONFIRMATION" | "OTP_VERIFICATION" | "PASSWORD_RESET" | "ADMIN_INQUIRY";
  timestamp: string;
  username: string;
  details: any;
}

// 📩 Record and Log Sent Emails (Triggers browser events for live toast notification)
export function recordSentEmail(emailData: EmailReceipt) {
  if (typeof window === "undefined") return;
  try {
    const existing = JSON.parse(localStorage.getItem("skipd_sent_emails") || "[]");
    localStorage.setItem("skipd_sent_emails", JSON.stringify([emailData, ...existing]));

    // Dispatch custom event for real-time notification toasts in UI
    window.dispatchEvent(new CustomEvent("skipd_email_sent", { detail: emailData }));
  } catch (err) {
    console.error("Failed to record sent email:", err);
  }
}

// 📧 1. Welcome Email on Account Creation (Registration / Google Signup)
export function sendWelcomeEmail(email: string, username: string) {
  if (!email) return;
  const emailData: EmailReceipt = {
    to: email,
    subject: `Welcome to E-COM Commerce, ${username}! 🎉`,
    type: "WELCOME",
    timestamp: new Date().toISOString(),
    username: username,
    details: {
      message: `Hi ${username},\n\nWelcome to E-COM Commerce! Your registered account (${email}) has been successfully created.\n\nYour Username: ${username}\nRegistered Email: ${email}\n\nYou can now enjoy fast checkout, track live shipments, and access exclusive deals!`,
      email: email,
      username: username
    }
  };
  recordSentEmail(emailData);

  // Add user to registered users database list in localStorage
  if (typeof window !== "undefined") {
    try {
      const existing = JSON.parse(localStorage.getItem("skipd_registered_users") || "[]");
      if (!existing.some((u: any) => (typeof u === "string" ? u : u.email) === email)) {
        existing.push({ email, username, created_at: new Date().toISOString() });
        localStorage.setItem("skipd_registered_users", JSON.stringify(existing));
      }
    } catch (e) {}
  }
}

// 🧾 2. Order Confirmation & Detailed Invoice Bill Email on Payment Success
export function sendOrderInvoiceEmail(email: string, username: string, order: any) {
  if (!email) return;

  const itemsList = (order.items || []).map((item: any) => ({
    title: item.title || item.name || "E-COM Product",
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 1),
    total: Number(item.price || 0) * Number(item.quantity || 1),
    image: item.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
  }));

  const expectedDeliveryDate = new Date();
  expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 3);
  const deliveryFormatted = expectedDeliveryDate.toLocaleDateString("en-IN", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const emailData: EmailReceipt = {
    to: email,
    subject: `Payment Successful! Invoice for Order #${order.order_number} 🧾`,
    type: "ORDER_CONFIRMATION",
    timestamp: new Date().toISOString(),
    username: username || "Valued Customer",
    details: {
      order_number: order.order_number,
      total_amount: order.total_amount,
      payment_method: order.payment_method,
      items: itemsList,
      shipping_address: order.shipping_address,
      expected_delivery: `${deliveryFormatted} (3-4 Business Days via BlueDart Express)`,
      owner_contact: {
        owner_name: "Sachin Rawat (Store Founder & Owner)",
        phone: "+91 98765 43210",
        email: "owner@ecom.botmartz.com / support@ecom.botmartz.com",
        helpdesk: "https://ecom.botmartz.com/help"
      }
    }
  };
  recordSentEmail(emailData);

  // 🔔 Send Order Notification to Admin Panel (Queries / Orders)
  sendAdminNotification({
    type: "NEW_ORDER",
    title: `🛒 Order #${order.order_number} Confirmed for ${username}`,
    message: `Customer ${username} (${email}) paid ₹${order.total_amount}. Delivery expected by ${deliveryFormatted}.`,
    customer_email: email,
    amount: order.total_amount,
    date: new Date().toISOString()
  });
}

// 🔒 3. Forgot Password OTP Verification Email
export function sendForgotOTPNotification(email: string, otpCode: string) {
  if (!email) return;
  const emailData: EmailReceipt = {
    to: email,
    subject: `E-COM Password Reset Verification Code: ${otpCode} 🔒`,
    type: "OTP_VERIFICATION",
    timestamp: new Date().toISOString(),
    username: email.split("@")[0] || "User",
    details: {
      otp: otpCode,
      message: `Your 6-digit password reset verification code is ${otpCode}. Valid for 1 minute. Do not share this code with anyone.`
    }
  };
  recordSentEmail(emailData);
}

// 🔔 4. Admin Panel Notifications & Inquiries
export function sendAdminNotification(notification: {
  type: "NEW_ORDER" | "INQUIRY" | "RETURN_REQUEST";
  title: string;
  message: string;
  customer_email: string;
  amount?: number;
  date: string;
}) {
  if (typeof window === "undefined") return;
  try {
    const existing = JSON.parse(localStorage.getItem("skipd_admin_inquiries") || "[]");
    localStorage.setItem("skipd_admin_inquiries", JSON.stringify([notification, ...existing]));
    window.dispatchEvent(new CustomEvent("skipd_admin_notification_added", { detail: notification }));
  } catch (err) {}
}

// 📢 5. Promotional Marketing & Push Notification Campaign Emails
export function sendCampaignPromotionalEmail(campaign: {
  title: string;
  subtitle?: string;
  type: string;
  discountOffer: string;
  startDate?: string;
  endDate?: string;
}) {
  if (typeof window === "undefined") return;
  try {
    // Gather registered customers
    const registeredUsers = JSON.parse(localStorage.getItem("skipd_registered_users") || "[]");
    const sampleEmails = ["sachinrawat6264384464@gmail.com", "customer@ecom.botmartz.com", "amit@gmail.com", "priya@yahoo.com"];

    const userEmails = registeredUsers.map((u: any) => typeof u === "string" ? u : u.email).filter(Boolean);
    const targetEmails = Array.from(new Set([...userEmails, ...sampleEmails]));

    targetEmails.forEach((email: string) => {
      const username = email.split("@")[0] || "Valued Customer";
      const emailData: EmailReceipt = {
        to: email,
        subject: `🔥 Campaign Alert: ${campaign.title} (${campaign.discountOffer})`,
        type: "WELCOME",
        timestamp: new Date().toISOString(),
        username: username,
        details: {
          message: `Hi ${username},\n\n🎉 ${campaign.title} is now LIVE on E-COM Commerce!\n\nDiscount Offer: ${campaign.discountOffer}\nTagline: ${campaign.subtitle || "Exclusive Limited Time Offer"}\nValid Dates: ${campaign.startDate || "May 25, 2025"} to ${campaign.endDate || "May 31, 2025"}\n\nVisit E-COM Commerce now to grab deals: https://ecom.botmartz.com/deals`,
          campaign_title: campaign.title,
          discount: campaign.discountOffer,
          email: email
        }
      };
      recordSentEmail(emailData);
    });
  } catch (err) {
    console.error("Failed to send campaign promotional emails:", err);
  }
}
