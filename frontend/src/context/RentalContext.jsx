import React, { createContext, useContext, useState } from 'react';
import api from '../api/client';

const RentalContext = createContext(null);

export const RentalProvider = ({ children }) => {
  const [activeRental, setActiveRental] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const calculateBreakdown = (actualPrice, days = 3, discountPercent = 0, isTrusted = false) => {
    const baseRent = Math.round(actualPrice * 0.20);
    const discount = Math.round(baseRent * (discountPercent / 100));
    const rentalPrice = baseRent - discount;
    const depositRate = isTrusted ? 0.20 : 0.30;
    const securityDeposit = Math.round(actualPrice * depositRate);
    const totalInitial = rentalPrice + securityDeposit;

    return {
      actualPrice,
      rentalPrice,
      originalRentalPrice: baseRent,
      discountAmount: discount,
      securityDeposit,
      depositRate: isTrusted ? '20% (Trusted Renter Perk)' : '30%',
      totalInitial
    };
  };

  const bookRental = async (payload) => {
    const { data } = await api.post('/rentals', payload);
    if (data.success) {
      setBookingSuccess(data.rental);
      return data.rental;
    }
  };

  return (
    <RentalContext.Provider
      value={{
        activeRental,
        setActiveRental,
        bookingSuccess,
        setBookingSuccess,
        calculateBreakdown,
        bookRental
      }}
    >
      {children}
    </RentalContext.Provider>
  );
};

export const useRental = () => useContext(RentalContext);
