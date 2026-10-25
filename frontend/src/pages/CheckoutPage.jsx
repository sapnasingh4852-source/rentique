import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
  Wallet
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const UPI_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,255}@[a-zA-Z]{2,64}$/;

const PAYMENT_OPTIONS = [
  { id: 'UPI', label: 'UPI', note: 'GPay, PhonePe, Paytm', icon: Smartphone },
  { id: 'CARD', label: 'Card', note: 'Visa, Mastercard, RuPay', icon: CreditCard },
  { id: 'COD', label: 'Cash on delivery', note: 'Pay when it arrives', icon: Banknote }
];

const DEMO_PINCODES = ['560038', '110001', '400001'];

const formatINR = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const detectCardBrand = (digits) => {
  if (/^3[47]/.test(digits)) return 'AMEX';
  if (/^3(?:0[0-5]|[68])/.test(digits)) return 'DINERS';
  if (/^4/.test(digits)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'MASTERCARD';
  if (/^(60|65|81|82)/.test(digits)) return 'RUPAY';
  return 'CARD';
};

const luhnValid = (digits) => {
  let sum = 0;
  let double = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let value = Number(digits[index]);
    if (double) {
      value *= 2;
      if (value > 9) value -= 9;
    }
    sum += value;
    double = !double;
  }
  return sum % 10 === 0;
};

const formatCardNumber = (value) =>
  String(value)
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ');

const formatExpiry = (value) => {
  const digits = String(value).replace(/\D/g, '').slice(0, 4);
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const isExpiryValid = (value) => {
  const match = /^(\d{2})\/(\d{2})$/.exec(String(value).trim());
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
};

const getSizes = (product) => {
  if (!product) return [];
  if (Array.isArray(product.size)) return product.size.filter(Boolean);
  return product.size ? [product.size] : [];
};

export default function CheckoutPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const duration = useMemo(() => {
    const parsed = Number.parseInt(searchParams.get('duration') || '3', 10);
    return Number.isInteger(parsed) && parsed >= 1 && parsed <= 30 ? parsed : 3;
  }, [searchParams]);
  const initialRefund = searchParams.get('refund') === 'ORIGINAL_PAYMENT_METHOD'
    ? 'ORIGINAL_PAYMENT_METHOD'
    : 'APP_WALLET';
  const sizeParam = searchParams.get('size') || '';

  const [product, setProduct] = useState(null);
  const [quote, setQuote] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [coverage, setCoverage] = useState({ accepted: [], rejected: [] });

  const [delivery, setDelivery] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [pincodeState, setPincodeState] = useState({ status: 'idle', result: null });
  const [selectedSize, setSelectedSize] = useState('');
  const [refundPreference, setRefundPreference] = useState(initialRefund);

  const [method, setMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    if (!user) return;
    setDelivery((previous) => ({
      fullName: previous.fullName || user.name || '',
      phone: previous.phone || String(user.phone || '').replace(/\D/g, '').slice(-10),
      addressLine1: previous.addressLine1 || user.address?.street || '',
      addressLine2: previous.addressLine2 || '',
      city: previous.city || user.address?.city || '',
      state: previous.state || user.address?.state || '',
      pincode: previous.pincode || user.address?.pincode || ''
    }));
  }, [user]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoadingPage(true);
      setLoadError('');
      try {
        const [productResponse, quoteResponse] = await Promise.all([
          api.get(`/products/${id}`),
          api.get('/rentals/quote', { params: { productId: id, rentalDurationDays: duration } })
        ]);
        if (!active) return;
        if (!productResponse.data.success || !quoteResponse.data.success) {
          throw new Error('Checkout could not be prepared.');
        }
        const loadedProduct = productResponse.data.product;
        setProduct(loadedProduct);
        setQuote(quoteResponse.data.quote);
        const sizes = getSizes(loadedProduct);
        setSelectedSize((previous) => {
          const candidate = String(previous || sizeParam || '').toLowerCase();
          return sizes.find((size) => size.toLowerCase() === candidate) || sizes[0] || 'Free Size';
        });
      } catch (error) {
        if (!active) return;
        setLoadError(
          error.response?.data?.message || 'We could not prepare this checkout. Please try again.'
        );
      } finally {
        if (active) setLoadingPage(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [id, duration, sizeParam]);

  useEffect(() => {
    api
      .get('/delivery/coverage')
      .then(({ data }) => {
        if (data.success) setCoverage({ accepted: data.accepted || [], rejected: data.rejected || [] });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const clean = delivery.pincode.replace(/\D/g, '').slice(0, 6);
    if (clean.length !== 6) {
      setPincodeState({ status: 'idle', result: null });
      return undefined;
    }

    let active = true;
    setPincodeState({ status: 'checking', result: null });
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/delivery/serviceability', { params: { pincode: clean } });
        if (!active) return;
        setPincodeState({ status: data.serviceable ? 'serviceable' : 'unserviceable', result: data });
        if (data.serviceable) {
          setDelivery((previous) => ({ ...previous, city: data.city, state: data.state }));
        }
      } catch (error) {
        if (active) setPincodeState({ status: 'idle', result: null });
      }
    }, 450);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [delivery.pincode]);

  useEffect(() => {
    if (method === 'COD' && pincodeState.result && !pincodeState.result.codAvailable) {
      setMethod('UPI');
    }
  }, [method, pincodeState.result]);

  const sizes = getSizes(product);
  const pricing = quote?.pricing;
  const totalPayable = pricing?.customerInitialPayment || 0;
  const cardDigits = card.number.replace(/\D/g, '');
  const cardBrand = detectCardBrand(cardDigits);
  const cvvLength = cardBrand === 'AMEX' ? 4 : 3;
  const codAvailable = pincodeState.result ? pincodeState.result.codAvailable !== false : true;
  const isServiceable = pincodeState.status === 'serviceable';
  const heroImage =
    product?.listingImages?.[0]?.cardUrl ||
    product?.listingImages?.[0]?.secureUrl ||
    '';

  const updateDelivery = (field, value) => {
    setDelivery((previous) => ({ ...previous, [field]: value }));
  };

  const useDemoCard = () => {
    setCard({
      number: '4111 1111 1111 1111',
      name: card.name || user?.name || '',
      expiry: '12/30',
      cvv: '123'
    });
  };

  const validateForm = () => {
    if (delivery.fullName.trim().length < 2) return 'Enter the full name of the person receiving the order.';
    if (!/^[6-9]\d{9}$/.test(delivery.phone)) return 'Enter a valid 10-digit Indian mobile number.';
    if (delivery.addressLine1.trim().length < 8) return 'Enter the flat, building and street in address line 1.';
    if (!delivery.city.trim() || !delivery.state.trim()) return 'Enter the city and state for delivery.';
    if (!/^[1-9]\d{5}$/.test(delivery.pincode)) return 'Enter a valid 6-digit pincode.';
    if (!isServiceable) return 'This pincode is not serviceable yet. Check delivery availability above.';
    if (!selectedSize) return 'Choose a size before continuing.';

    if (method === 'UPI' && !UPI_REGEX.test(upiId.trim())) {
      return 'Enter a valid UPI ID, for example name@okhdfcbank.';
    }

    if (method === 'CARD') {
      if (cardDigits.length < 13 || cardDigits.length > 19 || !luhnValid(cardDigits)) {
        return 'Enter a valid card number.';
      }
      if (card.name.trim().length < 2) return 'Enter the name printed on the card.';
      if (!isExpiryValid(card.expiry)) return 'Enter a valid future expiry date in MM/YY format.';
      if (!new RegExp(`^\\d{${cvvLength}}$`).test(card.cvv)) return `Enter the ${cvvLength}-digit CVV.`;
    }

    if (method === 'COD' && !codAvailable) {
      return 'Cash on delivery is not available for this pincode. Choose UPI or card.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payment =
      method === 'UPI'
        ? { method: 'UPI', upiId: upiId.trim() }
        : method === 'CARD'
          ? {
              method: 'CARD',
              cardLast4: cardDigits.slice(-4),
              cardBrand,
              cardHolderName: card.name.trim()
            }
          : { method: 'COD' };

    setSubmitting(true);
    try {
      const { data } = await api.post('/rentals', {
        productId: id,
        rentalDurationDays: duration,
        size: selectedSize,
        refundPreference: method === 'COD' ? 'APP_WALLET' : refundPreference,
        delivery,
        payment
      });
      if (data.success) {
        setConfirmation(data.rental);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      setFormError(error.response?.data?.message || 'Checkout could not be completed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="shell py-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="h-8 w-1/3 animate-pulse rounded bg-plum/10" />
            <div className="h-56 animate-pulse rounded-3xl bg-plum-mist" />
            <div className="h-72 animate-pulse rounded-3xl bg-plum-mist" />
          </div>
          <div className="h-80 animate-pulse rounded-3xl bg-plum-mist" />
        </div>
      </div>
    );
  }

  if (loadError || !product || !quote) {
    return (
      <div className="shell py-20 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-rani" />
        <p className="mt-3 font-display text-2xl text-plum">Checkout is not available.</p>
        <p className="mt-2 text-xs text-muted">{loadError || 'This piece could not be loaded.'}</p>
        <Link to="/catalog" className="btn-primary mt-6">
          Back to the catalog <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (confirmation) {
    const isCod = confirmation.paymentMethod === 'COD';
    const payment = confirmation.payment || {};
    const confirmedTotal = confirmation.pricing?.totalPaidInitial || 0;
    const etaDays = confirmation.delivery?.etaDays;

    return (
      <div className="shell py-10 lg:py-14">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-line bg-surface shadow-lift">
          <div className="relative overflow-hidden bg-plum-deep px-6 py-10 text-center text-paper sm:px-10">
            <div className="jaali-pattern absolute inset-0 opacity-20" aria-hidden="true" />
            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-gold/15 text-gold">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="eyebrow mt-5 text-gold">Rental reserved</p>
              <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                {isCod ? 'Order confirmed. Pay on delivery.' : 'Payment successful.'}
              </h1>
              <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-paper/65">
                {isCod
                  ? `Keep ${formatINR(confirmedTotal)} ready in cash. The dispatch studio will upload the condition record before your outfit leaves.`
                  : `Your payment is confirmed. The dispatch studio will upload the condition record before your outfit leaves.`}
              </p>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-paper/20 bg-paper/10 px-4 py-1.5 font-mono text-xs tracking-wide">
                {confirmation.rentalNumber}
              </p>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2">
            <div>
              <p className="eyebrow text-saffron">The piece</p>
              <div className="mt-3 flex gap-3">
                {heroImage && (
                  <img
                    src={heroImage}
                    alt={product.title}
                    className="h-24 w-20 rounded-xl border border-line object-cover"
                  />
                )}
                <div>
                  <p className="font-display text-lg font-semibold leading-tight text-plum">{product.title}</p>
                  <p className="mt-1 text-[10.5px] text-muted">
                    Size {confirmation.size || selectedSize} · {duration} days
                  </p>
                  <p className="mt-1 text-[10.5px] text-muted">
                    Due back{' '}
                    {new Date(confirmation.dueDate).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-line bg-paper p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-muted">Payment</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${
                      isCod ? 'bg-saffron/10 text-saffron-deep' : 'bg-forest-soft text-forest'
                    }`}
                  >
                    {isCod ? 'Pay on delivery' : 'Paid'}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {formatINR(confirmedTotal)}
                  <span className="ml-2 text-[10.5px] font-normal text-muted">
                    {isCod
                      ? 'due in cash'
                      : `${confirmation.paymentMethod} · ${payment.maskedInstrument || 'demo gateway'}`}
                  </span>
                </p>
                <p className="mt-1 font-mono text-[9.5px] text-muted">{payment.transactionId}</p>
              </div>
            </div>

            <div>
              <p className="eyebrow text-saffron">Delivering to</p>
              <div className="mt-3 rounded-2xl border border-line bg-paper p-4 text-[11px] leading-relaxed text-ink">
                <p className="font-semibold">{confirmation.delivery?.fullName}</p>
                <p className="mt-1 text-muted">{confirmation.delivery?.phone}</p>
                <p className="mt-2">
                  {confirmation.delivery?.addressLine1}
                  {confirmation.delivery?.addressLine2 ? `, ${confirmation.delivery.addressLine2}` : ''}
                </p>
                <p>
                  {confirmation.delivery?.city}, {confirmation.delivery?.state} —{' '}
                  <span className="font-semibold">{confirmation.delivery?.pincode}</span>
                </p>
                {etaDays && (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-forest-soft px-2.5 py-1 text-[9.5px] font-semibold text-forest">
                    <Truck className="h-3 w-3" />
                    Arrives in {etaDays} {etaDays === 1 ? 'day' : 'days'}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-xl border border-line px-3.5 py-3 text-[10px] text-muted">
                <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-plum" />
                <p>
                  Deposit refund ·{' '}
                  <span className="font-semibold text-ink">
                    {confirmation.refundPreference === 'APP_WALLET'
                      ? 'Rentique wallet (instant)'
                      : 'Original payment source'}
                  </span>
                  . No deduction is made without an inspection record.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-line p-6 sm:flex-row sm:justify-center sm:p-7">
            <button type="button" onClick={() => navigate('/dashboard')} className="btn-dark justify-center">
              Go to my wardrobe <ArrowRight className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => navigate('/catalog')} className="btn-outline justify-center">
              Keep browsing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="border-b border-line bg-surface">
        <div className="shell flex items-center gap-1.5 py-3.5 text-[10px] text-muted">
          <Link to="/catalog" className="hover:text-plum">Rent</Link>
          <ChevronRight className="h-2.5 w-2.5" />
          <Link to={`/product/${product._id}`} className="max-w-[180px] truncate hover:text-plum">
            {product.title}
          </Link>
          <ChevronRight className="h-2.5 w-2.5" />
          <span className="font-semibold text-plum">Secure checkout</span>
        </div>
      </div>

      <div className="shell py-6 lg:py-9">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow text-saffron">Checkout</p>
            <h1 className="display-title mt-2 text-3xl text-plum sm:text-[38px]">Reserve it, delivered.</h1>
            <p className="mt-1.5 text-[11px] text-muted">
              Delivery address, pincode availability and payment — all in one step.
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
            <Lock className="h-3 w-3 text-forest" /> Secure demo gateway
          </div>
        </div>

        <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-saffron/25 bg-saffron/5 px-4 py-3.5">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />
          <p className="text-[10.5px] leading-relaxed text-ink/80">
            <span className="font-semibold text-ink">Demo payment gateway.</span> No real money moves. Card
            number and CVV are validated in your browser and never sent or stored — Rentique only receives the
            card brand, last four digits and cardholder name.
          </p>
        </div>

        <form id="checkout-form" onSubmit={handleSubmit} noValidate className="mt-6">
          <div className="grid items-start gap-5 lg:grid-cols-[1.22fr_0.78fr]">
            <div className="space-y-5">
              {/* Delivery address */}
              <section className="rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-saffron">Step 01</p>
                    <h2 className="mt-1 font-display text-xl font-semibold text-plum">Delivery address</h2>
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-plum-mist text-plum">
                    <MapPin className="h-4 w-4" />
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-medium text-ink">Full name</span>
                    <input
                      type="text"
                      value={delivery.fullName}
                      onChange={(event) => updateDelivery('fullName', event.target.value)}
                      placeholder="Ananya Sharma"
                      autoComplete="name"
                      className="field"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-medium text-ink">Mobile number</span>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-xl border border-line bg-paper px-3 py-2.5 text-xs text-muted">+91</span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={delivery.phone}
                        onChange={(event) =>
                          updateDelivery('phone', event.target.value.replace(/\D/g, '').slice(0, 10))
                        }
                        placeholder="98765 43210"
                        autoComplete="tel-national"
                        className="field flex-1"
                      />
                    </div>
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-[10px] font-medium text-ink">Address line 1</span>
                    <input
                      type="text"
                      value={delivery.addressLine1}
                      onChange={(event) => updateDelivery('addressLine1', event.target.value)}
                      placeholder="Flat / house no., building, street"
                      autoComplete="address-line1"
                      className="field"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-[10px] font-medium text-ink">
                      Address line 2 <span className="font-normal text-muted">(optional)</span>
                    </span>
                    <input
                      type="text"
                      value={delivery.addressLine2}
                      onChange={(event) => updateDelivery('addressLine2', event.target.value)}
                      placeholder="Area, landmark, apartment gate"
                      autoComplete="address-line2"
                      className="field"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-medium text-ink">City</span>
                    <input
                      type="text"
                      value={delivery.city}
                      onChange={(event) => updateDelivery('city', event.target.value)}
                      placeholder="Bengaluru"
                      autoComplete="address-level2"
                      className="field"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-medium text-ink">State</span>
                    <input
                      type="text"
                      value={delivery.state}
                      onChange={(event) => updateDelivery('state', event.target.value)}
                      placeholder="Karnataka"
                      autoComplete="address-level1"
                      className="field"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-[10px] font-medium text-ink">Pincode</span>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={delivery.pincode}
                        onChange={(event) =>
                          updateDelivery('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))
                        }
                        placeholder="6-digit delivery pincode"
                        autoComplete="postal-code"
                        maxLength={6}
                        className="field pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {pincodeState.status === 'checking' && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted" />
                        )}
                        {pincodeState.status === 'serviceable' && (
                          <CheckCircle2 className="h-4 w-4 text-forest" />
                        )}
                        {pincodeState.status === 'unserviceable' && (
                          <AlertCircle className="h-4 w-4 text-rani" />
                        )}
                      </span>
                    </div>
                  </label>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[9px] text-muted">
                  <span className="font-semibold uppercase tracking-[0.1em]">Try a demo pincode</span>
                  {DEMO_PINCODES.map((pincode) => {
                    const entry = coverage.accepted.find((item) => item.pincode === pincode);
                    if (!entry) return null;
                    return (
                      <button
                        key={entry.pincode}
                        type="button"
                        onClick={() => {
                          updateDelivery('pincode', entry.pincode);
                          updateDelivery('city', entry.city);
                          updateDelivery('state', entry.state);
                        }}
                        className="rounded-full border border-line bg-paper px-2.5 py-1 font-medium text-plum transition hover:border-plum/40"
                      >
                        {entry.pincode} · {entry.city}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => updateDelivery('pincode', '999999')}
                    className="rounded-full border border-rani/20 bg-rani/5 px-2.5 py-1 font-medium text-rani transition hover:border-rani/40"
                  >
                    999999 · rejected
                  </button>
                </div>

                {pincodeState.status === 'serviceable' && pincodeState.result && (
                  <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-forest/20 bg-forest-soft px-3.5 py-3">
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                    <div className="text-[10.5px] leading-relaxed text-forest">
                      <p className="font-semibold">Delivery available to {pincodeState.result.pincode}.</p>
                      <p className="text-forest/80">
                        {pincodeState.result.area}, {pincodeState.result.city} · arrives in{' '}
                        {pincodeState.result.etaDays}{' '}
                        {pincodeState.result.etaDays === 1 ? 'day' : 'days'} ·{' '}
                        {pincodeState.result.codAvailable
                          ? 'cash on delivery available'
                          : 'prepaid only (UPI or card)'}
                      </p>
                    </div>
                  </div>
                )}

                {pincodeState.status === 'unserviceable' && pincodeState.result && (
                  <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-rani/20 bg-rani-soft px-3.5 py-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rani" />
                    <div className="text-[10.5px] leading-relaxed text-rani">
                      <p className="font-semibold">We cannot deliver to this pincode yet.</p>
                      <p className="text-rani/80">{pincodeState.result.message}</p>
                    </div>
                  </div>
                )}

                {pincodeState.status === 'idle' && delivery.pincode.length === 0 && (
                  <p className="mt-2.5 text-[9.5px] text-muted">
                    Enter your pincode and we will check serviceability automatically.
                  </p>
                )}
              </section>

              {/* Payment */}
              <section className="rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-saffron">Step 02</p>
                    <h2 className="mt-1 font-display text-xl font-semibold text-plum">Payment method</h2>
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-plum-mist text-plum">
                    <CreditCard className="h-4 w-4" />
                  </span>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {PAYMENT_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const disabled = option.id === 'COD' && !codAvailable;
                    const active = method === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => setMethod(option.id)}
                        className={`rounded-2xl border p-3 text-left transition ${
                          active
                            ? 'border-plum bg-plum/5 ring-1 ring-plum/20'
                            : 'border-line bg-paper hover:border-plum/25'
                        } ${disabled ? 'cursor-not-allowed opacity-45' : ''}`}
                      >
                        <Icon className={`h-4 w-4 ${active ? 'text-plum' : 'text-muted'}`} />
                        <p className="mt-2 text-[11px] font-semibold text-ink">{option.label}</p>
                        <p className="mt-0.5 text-[8.5px] leading-snug text-muted">
                          {disabled ? 'Not available at this pincode' : option.note}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {method === 'UPI' && (
                  <div className="mt-4 rounded-2xl border border-line bg-paper p-4">
                    <label className="block">
                      <span className="mb-1 block text-[10px] font-medium text-ink">UPI ID</span>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(event) => setUpiId(event.target.value.trimStart())}
                        placeholder="yourname@okhdfcbank"
                        autoComplete="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        className="field"
                      />
                    </label>
                    <p className="mt-2 text-[9px] leading-relaxed text-muted">
                      Any valid-looking UPI ID works in this demo, for example{' '}
                      <button
                        type="button"
                        onClick={() => setUpiId('ananya@okhdfcbank')}
                        className="font-mono text-plum underline decoration-dotted"
                      >
                        ananya@okhdfcbank
                      </button>
                      . No collect request is sent.
                    </p>
                  </div>
                )}

                {method === 'CARD' && (
                  <div className="mt-4 space-y-3 rounded-2xl border border-line bg-paper p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-plum">Card details</p>
                      <button
                        type="button"
                        onClick={useDemoCard}
                        className="rounded-full border border-plum/20 bg-surface px-2.5 py-1 text-[9px] font-semibold text-plum transition hover:border-plum/40"
                      >
                        Use demo card · 4111 1111 1111 1111
                      </button>
                    </div>

                    <label className="block">
                      <span className="mb-1 block text-[10px] font-medium text-ink">Card number</span>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={card.number}
                          onChange={(event) =>
                            setCard((previous) => ({ ...previous, number: formatCardNumber(event.target.value) }))
                          }
                          placeholder="1234 5678 9012 3456"
                          autoComplete="cc-number"
                          className="field pr-16"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8.5px] font-semibold uppercase tracking-[0.1em] text-muted">
                          {cardDigits.length >= 2 ? cardBrand : 'CARD'}
                        </span>
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-[10px] font-medium text-ink">Name on card</span>
                      <input
                        type="text"
                        value={card.name}
                        onChange={(event) => setCard((previous) => ({ ...previous, name: event.target.value }))}
                        placeholder={user?.name || 'As printed on the card'}
                        autoComplete="cc-name"
                        className="field"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="mb-1 block text-[10px] font-medium text-ink">Expiry</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={card.expiry}
                          onChange={(event) =>
                            setCard((previous) => ({ ...previous, expiry: formatExpiry(event.target.value) }))
                          }
                          placeholder="MM/YY"
                          autoComplete="cc-exp"
                          maxLength={5}
                          className="field"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[10px] font-medium text-ink">CVV</span>
                        <input
                          type="password"
                          inputMode="numeric"
                          value={card.cvv}
                          onChange={(event) =>
                            setCard((previous) => ({
                              ...previous,
                              cvv: event.target.value.replace(/\D/g, '').slice(0, cvvLength)
                            }))
                          }
                          placeholder={cvvLength === 4 ? '4 digits' : '3 digits'}
                          autoComplete="cc-csc"
                          className="field"
                        />
                      </label>
                    </div>

                    <div className="flex items-start gap-2 rounded-xl border border-forest/15 bg-forest-soft/60 px-3 py-2.5 text-[9px] leading-relaxed text-forest">
                      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <p>
                        Card number and CVV stay in this browser tab. On submit, Rentique receives only{' '}
                        <span className="font-semibold">
                          {cardBrand} •••• {cardDigits.slice(-4) || 'last4'}
                        </span>{' '}
                        and the cardholder name.
                      </p>
                    </div>
                  </div>
                )}

                {method === 'COD' && (
                  <div className="mt-4 rounded-2xl border border-line bg-paper p-4">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-plum" />
                      <p className="text-[10.5px] font-semibold text-ink">
                        Pay {formatINR(totalPayable)} in cash when your outfit arrives.
                      </p>
                    </div>
                    <p className="mt-2 text-[9.5px] leading-relaxed text-muted">
                      Cash on delivery is available for {pincodeState.result?.city || 'serviceable pincodes'}.
                      Because there is no card or UPI source for the refund, your security deposit is always
                      returned to the Rentique wallet.
                    </p>
                  </div>
                )}

                {method !== 'COD' ? (
                  <div className="mt-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
                      Deposit refund destination
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {[
                        { id: 'APP_WALLET', icon: Wallet, title: 'Rentique wallet', note: 'Instant credit' },
                        {
                          id: 'ORIGINAL_PAYMENT_METHOD',
                          icon: CreditCard,
                          title: 'Original source',
                          note: '3–5 working days'
                        }
                      ].map((option) => {
                        const Icon = option.icon;
                        const active = refundPreference === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setRefundPreference(option.id)}
                            className={`rounded-xl border p-2.5 text-left transition ${
                              active
                                ? 'border-plum bg-plum/5'
                                : 'border-line bg-paper hover:border-plum/25'
                            }`}
                          >
                            <Icon className={`h-3.5 w-3.5 ${active ? 'text-plum' : 'text-muted'}`} />
                            <p className="mt-1 text-[10px] font-semibold text-ink">{option.title}</p>
                            <p className="mt-0.5 text-[8px] text-muted">{option.note}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-line px-3.5 py-3 text-[9.5px] text-muted">
                    <Wallet className="mt-0.5 h-3.5 w-3.5 shrink-0 text-plum" />
                    Refund destination: <span className="font-semibold text-ink">Rentique wallet</span> (fixed for
                    cash on delivery).
                  </div>
                )}
              </section>
            </div>

            {/* Order summary */}
            <aside className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-lift">
                <div className="flex gap-3 border-b border-line p-4">
                  {heroImage && (
                    <img
                      src={heroImage}
                      alt={product.title}
                      className="h-24 w-20 shrink-0 rounded-xl border border-line object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-saffron">
                      {product.category || 'Rentique edit'}
                    </p>
                    <h2 className="mt-1 font-display text-base font-semibold leading-tight text-plum">
                      {product.title}
                    </h2>
                    <p className="mt-1 text-[9.5px] text-muted">
                      {duration} days · size {selectedSize}
                    </p>
                    <p className="mt-1 text-[9px] text-muted/80">Retail {formatINR(pricing.actualPrice)}</p>
                  </div>
                </div>

                {sizes.length > 0 && (
                  <div className="border-b border-line px-4 py-3">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">Size</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[34px] rounded-lg border px-2 py-1 text-[10px] font-semibold transition ${
                            selectedSize === size
                              ? 'border-plum bg-plum text-paper'
                              : 'border-line bg-paper text-ink hover:border-plum/40'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 p-4 text-[10.5px]">
                  <div className="flex justify-between text-muted">
                    <span>Rental fee ({duration} days)</span>
                    <span className="font-medium text-ink">{formatINR(pricing.rentalPrice)}</span>
                  </div>
                  {pricing.discountAmount > 0 && (
                    <div className="flex justify-between text-forest">
                      <span>{quote.loyalty?.tier || 'Loyalty'} discount</span>
                      <span>−{formatINR(pricing.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted">
                    <span>Refundable deposit</span>
                    <span className="font-medium text-ink">{formatINR(pricing.securityDeposit)}</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-muted/80">
                    <span>Deposit rate</span>
                    <span>{pricing.depositRate}</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-plum">
                      {method === 'COD' ? 'Pay on delivery' : 'Payable now'}
                    </span>
                    <span className="font-display text-2xl font-semibold text-plum">
                      {formatINR(totalPayable)}
                    </span>
                  </div>
                  <p className="text-[8.5px] leading-relaxed text-muted/80">
                    {formatINR(pricing.securityDeposit)} is a refundable security deposit, returned after the
                    return inspection.
                  </p>
                </div>

                <div className="border-t border-line p-4">
                  {formError && (
                    <div className="mb-3 flex items-start gap-2 rounded-xl border border-rani/20 bg-rani-soft px-3 py-2.5 text-[9.5px] leading-relaxed text-rani">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={submitting || !isServiceable}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-plum px-5 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-paper transition hover:bg-saffron hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {method === 'COD' ? 'Confirming order…' : 'Processing demo payment…'}
                      </>
                    ) : (
                      <>
                        {method === 'COD' ? `Confirm COD · ${formatINR(totalPayable)}` : `Pay ${formatINR(totalPayable)} securely`}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                  {!isServiceable && (
                    <p className="mt-2 text-center text-[9px] text-muted">
                      Add a serviceable pincode to continue.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 space-y-2 rounded-2xl border border-line bg-surface p-4 text-[9.5px] text-muted">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-forest" />
                  Visual condition record uploaded before dispatch.
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5 shrink-0 text-forest" />
                  Insured delivery and pickup included.
                </div>
                <div className="flex items-center gap-2">
                  <Wallet className="h-3.5 w-3.5 shrink-0 text-forest" />
                  Deposit returned after inspection — no hidden deductions.
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
}
