/**
 * Pricing & Penalty Calculation Engine
 * Handles business rules for rental pricing, late fees, damage penalties,
 * security deposit refunds, and customer trust score dynamics.
 */

class PricingService {
  /**
   * Calculate standard rental pricing:
   * Rental Price = 20% of actual price
   * Security Deposit = 30% of actual price
   * Initial Payment = Rental Price + Security Deposit
   */
  calculateRentalPricing(actualPrice, discountPercent = 0, isTrustedRenter = false, tenureDays = 3) {
    const multiplier = Math.max(1, Number(tenureDays) || 3) / 3;
    const baseRental = Math.round(actualPrice * 0.20 * multiplier);
    const discountAmount = Math.round(baseRental * (discountPercent / 100));
    const finalRentalPrice = Math.max(0, baseRental - discountAmount);

    // Trusted renters (Trust Score >= 90) get a reduced security deposit rate (20% instead of 30%)
    const depositRate = isTrustedRenter ? 0.20 : 0.30;
    const securityDeposit = Math.round(actualPrice * depositRate);

    const customerInitialPayment = finalRentalPrice + securityDeposit;

    return {
      actualPrice,
      rentalPrice: finalRentalPrice,
      originalRentalPrice: baseRental,
      discountAmount,
      securityDeposit,
      depositRate: isTrustedRenter ? '20% (Trusted Renter Perk)' : '30%',
      customerInitialPayment
    };
  }

  /**
   * Calculate late return fee:
   * lateFee = actualPrice * 0.02 * numberOfLateDays
   */
  calculateLateFee(actualPrice, dueDate, returnedDate = new Date()) {
    const due = new Date(dueDate).getTime();
    const returned = new Date(returnedDate).getTime();

    if (returned <= due) {
      return {
        numberOfLateDays: 0,
        lateFeePerDay: Math.round(actualPrice * 0.02),
        totalLateFee: 0,
        isLate: false
      };
    }

    const diffMs = returned - due;
    const numberOfLateDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const lateFeePerDay = Math.round(actualPrice * 0.02);
    const totalLateFee = lateFeePerDay * numberOfLateDays;

    return {
      numberOfLateDays,
      lateFeePerDay,
      totalLateFee,
      isLate: true
    };
  }

  /**
   * Calculate final security deposit refund:
   * Security Deposit = ₹300
   * Deduct late fee & approved damage fee
   * Refund = Security Deposit - (Late Fee + Damage Fee)
   */
  calculateFinalRefund(securityDeposit, lateFee = 0, damageFee = 0) {
    const totalDeductions = lateFee + damageFee;
    const finalRefund = Math.max(0, securityDeposit - totalDeductions);
    const balanceOwed = totalDeductions > securityDeposit ? totalDeductions - securityDeposit : 0;

    return {
      securityDeposit,
      lateFee,
      damageFee,
      totalDeductions,
      finalRefund,
      balanceOwed
    };
  }

  /**
   * Calculate customer trust score:
   * Factors: total rentals, successful returns, late returns, damage cases
   */
  calculateTrustScore(stats = {}) {
    const { totalRentals = 0, successfulReturns = 0, lateReturns = 0, damageCases = 0 } = stats;

    if (totalRentals === 0) return 95; // Default welcoming score

    let score = 95;
    score += Math.min(successfulReturns * 2, 15); // +2 per flawless return up to +15
    score -= lateReturns * 5;                    // -5 per late return
    score -= damageCases * 15;                   // -15 per damage case

    return Math.max(10, Math.min(100, Math.round(score)));
  }

  /**
   * Determine Loyalty Tier:
   * 0-4 rentals: Bronze (0% discount)
   * 5-9 rentals: Silver (5% discount)
   * 10-19 rentals: Gold (10% discount)
   * 20+ rentals: Platinum (15% discount)
   */
  determineLoyaltyTier(successfulReturns = 0) {
    if (successfulReturns >= 20) {
      return { tier: 'PLATINUM', discountPercent: 15, perk: '15% Off all rentals + Priority VIP Delivery' };
    }
    if (successfulReturns >= 10) {
      return { tier: 'GOLD', discountPercent: 10, perk: '10% Off all rentals + Lower Security Deposit' };
    }
    if (successfulReturns >= 5) {
      return { tier: 'SILVER', discountPercent: 5, perk: '5% Off all rentals' };
    }
    return { tier: 'BRONZE', discountPercent: 0, perk: 'Standard Membership' };
  }
}

module.exports = new PricingService();
