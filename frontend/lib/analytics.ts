// GA4 & Meta Pixel eCommerce Event Analytics Helper

export const trackViewItem = (product: { id: number; title: string; price: number }) => {
  console.log("[Analytics Event] view_item:", product);
  if (typeof window !== "undefined") {
    // GA4 Event
    (window as any).gtag?.("event", "view_item", {
      items: [{ item_id: product.id, item_name: product.title, price: product.price }]
    });
    // Meta Pixel Event
    (window as any).fbq?.("track", "ViewContent", {
      content_name: product.title,
      content_ids: [product.id],
      value: product.price,
      currency: "INR"
    });
  }
};

export const trackAddToCart = (product: { id: number; title: string; price: number; quantity: number }) => {
  console.log("[Analytics Event] add_to_cart:", product);
  if (typeof window !== "undefined") {
    (window as any).gtag?.("event", "add_to_cart", {
      items: [{ item_id: product.id, item_name: product.title, price: product.price, quantity: product.quantity }]
    });
    (window as any).fbq?.("track", "AddToCart", {
      content_name: product.title,
      content_ids: [product.id],
      value: product.price * product.quantity,
      currency: "INR"
    });
  }
};

export const trackBeginCheckout = (amount: number) => {
  console.log("[Analytics Event] begin_checkout:", amount);
  if (typeof window !== "undefined") {
    (window as any).gtag?.("event", "begin_checkout", { value: amount, currency: "INR" });
    (window as any).fbq?.("track", "InitiateCheckout", { value: amount, currency: "INR" });
  }
};

export const trackPurchase = (order: { order_number: string; amount: number }) => {
  console.log("[Analytics Event] purchase:", order);
  if (typeof window !== "undefined") {
    (window as any).gtag?.("event", "purchase", {
      transaction_id: order.order_number,
      value: order.amount,
      currency: "INR"
    });
    (window as any).fbq?.("track", "Purchase", {
      value: order.amount,
      currency: "INR"
    });
  }
};
