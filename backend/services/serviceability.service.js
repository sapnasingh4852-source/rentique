const COVERAGE = {
  '560038': { area: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', etaDays: 1, codAvailable: true },
  '560034': { area: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', etaDays: 1, codAvailable: true },
  '110001': { area: 'Connaught Place', city: 'New Delhi', state: 'Delhi', etaDays: 2, codAvailable: true },
  '400001': { area: 'Fort', city: 'Mumbai', state: 'Maharashtra', etaDays: 2, codAvailable: true },
  '411001': { area: 'Camp', city: 'Pune', state: 'Maharashtra', etaDays: 2, codAvailable: true },
  '600001': { area: 'Parrys', city: 'Chennai', state: 'Tamil Nadu', etaDays: 3, codAvailable: true },
  '700001': { area: 'B B D Bagh', city: 'Kolkata', state: 'West Bengal', etaDays: 3, codAvailable: true },
  '500001': { area: 'Afzal Gunj', city: 'Hyderabad', state: 'Telangana', etaDays: 3, codAvailable: true },
  '302001': { area: 'MI Road', city: 'Jaipur', state: 'Rajasthan', etaDays: 3, codAvailable: true },
  '226001': { area: 'Hazratganj', city: 'Lucknow', state: 'Uttar Pradesh', etaDays: 3, codAvailable: true },
  '380001': { area: 'Lal Darwaja', city: 'Ahmedabad', state: 'Gujarat', etaDays: 3, codAvailable: true }
};

const DEMO_REJECTED_PINCODE = '999999';

const normalizePincode = (value = '') => String(value).replace(/\D/g, '').slice(0, 6);

class ServiceabilityService {
  check(value) {
    const pincode = normalizePincode(value);

    if (!/^[1-9]\d{5}$/.test(pincode)) {
      return {
        serviceable: false,
        reason: 'INVALID_FORMAT',
        pincode,
        codAvailable: false,
        message: 'Enter a valid 6-digit Indian pincode.'
      };
    }

    const area = COVERAGE[pincode];
    if (!area) {
      const isDemoReject = pincode === DEMO_REJECTED_PINCODE;
      return {
        serviceable: false,
        reason: isDemoReject ? 'DEMO_REJECTED' : 'OUT_OF_COVERAGE',
        pincode,
        codAvailable: false,
        message: isDemoReject
          ? 'Pincode 999999 is our demo "not serviceable" area — try 560038 (Bengaluru) or 110001 (New Delhi).'
          : `We do not deliver to ${pincode} yet. Try 560038 (Bengaluru), 110001 (New Delhi) or 400001 (Mumbai).`
      };
    }

    return {
      serviceable: true,
      reason: 'SERVICEABLE',
      pincode,
      ...area,
      message: `Delivery available in ${area.area}, ${area.city} — arrives in ${area.etaDays} ${area.etaDays === 1 ? 'day' : 'days'}.`
    };
  }

  coverage() {
    return {
      accepted: Object.entries(COVERAGE).map(([pincode, area]) => ({ pincode, ...area })),
      rejected: [{ pincode: DEMO_REJECTED_PINCODE, reason: 'Demo rejection pincode' }]
    };
  }
}

module.exports = new ServiceabilityService();
