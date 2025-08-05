'use client';

import React, { useState, useEffect } from 'react';
import { Ticket, Gift, Clock, CheckCircle } from 'lucide-react';
import { Coupon } from '@/lib/types/user';
import { getUserCoupons, calculateDiscount } from '@/lib/services/coupon-service';
import CouponCard from './CouponCard';

interface CouponListProps {
  sessionToken: string;
  orderTotal?: number;
  onCouponApplied?: (coupon: Coupon, discountAmount: number) => void;
  className?: string;
}

const CouponList: React.FC<CouponListProps> = ({
  sessionToken,
  orderTotal,
  onCouponApplied,
  className = ''
}) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'valid' | 'used' | 'expired'>('all');

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await getUserCoupons(sessionToken);
      
      if (response.success && response.coupons) {
        setCoupons(response.coupons);
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCoupons = () => {
    const now = new Date();
    
    return coupons.filter(coupon => {
      switch (filter) {
        case 'valid':
          return !coupon.is_used && new Date(coupon.expires_at) > now;
        case 'used':
          return coupon.is_used;
        case 'expired':
          return !coupon.is_used && new Date(coupon.expires_at) <= now;
        default:
          return true;
      }
    });
  };

  const getCouponStats = () => {
    const now = new Date();
    const valid = coupons.filter(c => !c.is_used && new Date(c.expires_at) > now).length;
    const used = coupons.filter(c => c.is_used).length;
    const expired = coupons.filter(c => !c.is_used && new Date(c.expires_at) <= now).length;
    
    return { valid, used, expired, total: coupons.length };
  };

  const filteredCoupons = getFilteredCoupons();
  const stats = getCouponStats();

  const filterOptions = [
    { key: 'all', label: 'All', count: stats.total, icon: Ticket },
    { key: 'valid', label: 'Valid', count: stats.valid, icon: Gift },
    { key: 'used', label: 'Used', count: stats.used, icon: CheckCircle },
    { key: 'expired', label: 'Expired', count: stats.expired, icon: Clock }
  ] as const;

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Ticket className="w-6 h-6 text-blue-600" />
            My Coupons
          </h2>
          {orderTotal && (
            <div className="text-sm text-gray-600">
              Order Total: <span className="font-medium">৳{orderTotal.toFixed(2)}</span>
            </div>
          )}
        </div>
        
        {/* Filter Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {filterOptions.map(({ key, label, count, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                filter === key
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Coupons List */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading coupons...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="text-center py-8">
            <Ticket className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No coupons available' : `No ${filter} coupons`}
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'You don\'t have any coupons yet. Complete orders to earn coupons!'
                : `You don't have any ${filter} coupons.`
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCoupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                orderAmount={orderTotal}
                onApply={onCouponApplied ? (coupon) => {
                  const discountAmount = calculateDiscount(coupon, orderTotal || 0);
                  onCouponApplied(coupon, discountAmount);
                } : undefined}
                showApplyButton={!!orderTotal && !!onCouponApplied}
              />
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {!loading && coupons.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.valid}</p>
              <p className="text-sm text-gray-600">Valid</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.used}</p>
              <p className="text-sm text-gray-600">Used</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              <p className="text-sm text-gray-600">Expired</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponList;