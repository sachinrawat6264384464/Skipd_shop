import Footer from "components/layout/footer";

export const metadata = {
  title: "Consumer Policy & Terms of Use | SKIPD Commerce",
  description: "Read SKIPD Commerce terms of service, security policy, privacy policy, and grievance redressal contacts.",
};

export default function TermsPage() {
  return (
    <div className="bg-[#FAFAFA] text-gray-900 min-h-screen flex flex-col justify-between">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8 w-full">
        
        <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-xs space-y-6 text-xs text-gray-700 leading-relaxed">
          <h1 className="text-3xl font-black text-gray-900">Consumer Policy &amp; Terms of Service</h1>
          <p className="text-gray-500 font-semibold">Last Updated: August 12, 2026</p>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">1. Terms of Use</h2>
            <p>
              Welcome to SKIPD Commerce. By accessing or using our storefront website, API endpoints, or mobile applications, you agree to comply with and be bound by these Terms of Service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">2. Privacy &amp; Data Security</h2>
            <p>
              We protect customer data using 256-bit SSL encryption. Payment credentials (credit/debit cards, UPI pins) are processed exclusively through Razorpay's PCI-DSS Level 1 compliant gateway and are never stored on our servers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">3. Cancellation &amp; Refund Policy</h2>
            <p>
              Orders may be cancelled anytime before dispatch. Once delivered, customers have 7 calendar days to initiate a return or size exchange request via our Customer Profile portal (/account).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">4. Grievance Redressal Officer</h2>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
              <p className="font-bold text-gray-900">Grievance Officer: Mr. Rajesh V. Nambiar</p>
              <p>SKIPD Commerce Pvt Ltd, Outer Ring Road, Devarabeesanahalli, Bengaluru 560103, Karnataka</p>
              <p>Email: grievance@skipd.in | Phone: 1800-SKIPD-COMMERCE</p>
            </div>
          </section>
        </div>

      </div>
      <Footer />
    </div>
  );
}
