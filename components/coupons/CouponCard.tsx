'use client';

import React, { useState } from 'react';
import { Ticket, Copy, Clock, CheckCircle } from 'lucide-react';
import { Coupon } from '@/lib/types/user';
import { calculateDiscount, isCouponValidForOrder } from '@/lib/services/coupon-service';

interface CouponCardProps {
  coupon: Coupon;
  orderAmount?: number;
  onApply?: (coupon: Coupon) => void;
  onCopy?: (code: string) => void;
  showApplyButton?: boolean;
  className?: string;
}

const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  orderAmount,
  onApply,
  onCopy,
  showApplyButton = false,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);

  const isExpired = new Date(coupon.expires_at) < new Date();
  const isUsed = coupon.is_used;
  const isValidForOrder = orderAmount ? isCouponValidForOrder(coupon, orderAmount) : true;
  const discountAmount = orderAmount ? calculateDiscount(coupon, orderAmount) : 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      onCopy?.(coupon.code);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy coupon code:', error);
    }
  };

  const handleApply = () => {
    if (!isExpired && !isUsed && isValidForOrder) {
      onApply?.(coupon);
    }
  };

  const formatExpiryTime = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const diffInHours = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 0) return 'Expired';
    if (diffInHours < 24) return `${diffInHours}h left`;
    return `${Math.floor(diffInHours / 24)}d left`;
  };

  const getDiscountText = () => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% OFF`;
    } else {
      return `৳${coupon.discount_value} OFF`;
    }
  };

  const getStatusColor = () => {
    if (isUsed) return 'bg-gray-100 border-gray-300';
    if (isExpired) return 'bg-red-50 border-red-200';
    if (!isValidForOrder) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getStatusText = () => {
    if (isUsed) return 'Used';
    if (isExpired) return 'Expired';
    if (!isValidForOrder && orderAmount) {
      return `Min order ৳${coupon.minimum_order_amount}`;
    }
    return 'Available';
  };

  return (
    <div className={`relative overflow-hidden rounded-lg border-2 border-dashed transition-all duration-200 hover:shadow-md ${getStatusColor()} ${className}`}>
      {/* Coupon Design */}
      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Welcome Coupon</span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isUsed ? 'bg-gray-200 text-gray-600' :
            isExpired ? 'bg-red-200 text-red-700' :
            !isValidForOrder ? 'bg-yellow-200 text-yellow-700' :
            'bg-green-200 text-green-700'
          }`}>
            {getStatusText()}
          </div>
        </div>

        {/* Discount Amount */}
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {getDiscountText()}
          </div>
          {orderAmount && isValidForOrder && (
            <div className="text-sm text-green-600 font-medium">
              Save ৳{discountAmount.toFixed(2)}
            </div>
          )}
        </div>

        {/* Coupon Code */}
        <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">Coupon Code</div>
              <div className="font-mono text-lg font-bold text-gray-900 tracking-wider">
                {coupon.code}
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              disabled={copied}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Expiry Info */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatExpiryTime(coupon.expires_at)}</span>
          </div>
          {coupon.minimum_order_amount > 0 && (
            <div className="text-xs">
              Min order: ৳{coupon.minimum_order_amount}
            </div>
          )}
        </div>

        {/* Apply Button */}
        {showApplyButton && onApply && (
          <button
            onClick={handleApply}
            disabled={isExpired || isUsed || !isValidForOrder}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              isExpired || isUsed || !isValidForOrder
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isExpired ? 'Expired' :
             isUsed ? 'Already Used' :
             !isValidForOrder ? 'Not Applicable' :
             'Apply Coupon'}
          </button>
        )}

        {/* Terms */}
        <div className="mt-3 text-xs text-gray-500">
          • Valid for one-time use only<br />
          • Cannot be combined with other offers<br />
          • Expires in 72 hours from registration
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-8 h-8 bg-white rounded-full transform translate-x-4 -translate-y-4 border-2 border-dashed border-gray-300"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full transform translate-x-4 translate-y-4 border-2 border-dashed border-gray-300"></div>
      <div className="absolute top-0 left-0 w-8 h-8 bg-white rounded-full transform -translate-x-4 -translate-y-4 border-2 border-dashed border-gray-300"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 bg-white rounded-full transform -translate-x-4 translate-y-4 border-2 border-dashed border-gray-300"></div>
    </div>
  );
};

export default CouponCard;