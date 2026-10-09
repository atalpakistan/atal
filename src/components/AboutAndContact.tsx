import React from 'react';
import { Mail, Phone, MapPin, Sparkles, ShieldCheck, HeartHandshake } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-4">
        <span className="text-xs uppercase tracking-widest font-bold text-emerald-700">
          Our Brand Mission
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-serif-display text-stone-950">
          Shop Smart. Live Better.
        </h1>
        <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          ATAL is your trusted online store for beauty, cosmetics, perfumes, fashion &amp; electronics—quality products, stylish choices, and easy shopping, all in one place.
        </p>
      </div>

      <div className="relative rounded-3xl overflow-hidden aspect-[16/9] shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85"
          alt="ATAL Store Experience"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            01
          </div>
          <h3 className="text-base font-bold text-stone-900 font-serif-display">Sustainable Sourcing</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            From GOTS certified Portuguese organic terry cotton to vegetable-tanned Tuscan cowhide, our raw materials respect both the artisans and our earth.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
            02
          </div>
          <h3 className="text-base font-bold text-stone-900 font-serif-display">Acoustic Architecture</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Our audio equipment is benchmarked against critical studio monitoring standards, offering transparent fidelity without artificial bass boost.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            03
          </div>
          <h3 className="text-base font-bold text-stone-900 font-serif-display">Lifetime Integrity</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We design objects to age with grace. Hand-cast stoneware, surgical 316L stainless steel, and replaceable componentry endure across generations.
          </p>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = React.useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center space-y-3 mb-12">
        <span className="text-xs uppercase tracking-widest font-bold text-amber-600">
          Client Services
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif-display text-stone-950">
          We Are Here to Assist
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm max-w-md mx-auto">
          Inquire about product sizing, international shipping, corporate capsules, or custom orders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-10 shadow-sm">
        <div className="space-y-6">
          <h3 className="text-lg font-bold font-serif-display text-stone-900">
            Customer Care Concierge
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Our team responds promptly within 4 business hours to all customer inquiries.
          </p>

          <div className="space-y-4 text-xs text-stone-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold block">WhatsApp &amp; Call</span>
                <a href="https://wa.me/923719150297" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-semibold hover:underline">
                  03719150297
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-900">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold block">Email Support</span>
                <a href="mailto:contact.to.atal@gmail.com" className="text-amber-800 font-semibold hover:underline">
                  contact.to.atal@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-900">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold block">Head Office Location</span>
                <span className="text-stone-600 font-medium">Toba Tek Singh, Punjab, Pakistan</span>
              </div>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 rounded-2xl p-6 text-center flex flex-col items-center justify-center space-y-2">
            <Sparkles className="w-8 h-8 text-emerald-600" />
            <h4 className="text-sm font-bold text-emerald-900">Message Received</h4>
            <p className="text-xs text-emerald-700">
              Thank you for contacting us. A dedicated concierge specialist will respond within 4 hours.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                placeholder="Eleanor Vance"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="eleanor@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Message / Question
              </label>
              <textarea
                rows={4}
                required
                placeholder="How may our concierge assist your order?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-stone-950 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
