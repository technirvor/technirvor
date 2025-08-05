'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Phone, Shield, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PhoneVerificationData } from '@/lib/types/user';
import { validateVerificationCode, formatBangladeshiPhone, maskPhoneNumber } from '@/lib/utils/phone-validation';
import { sendPhoneVerification, verifyPhoneNumber } from '@/lib/services/user-auth';

// Validation schema
const verificationSchema = z.object({
  verification_code: z.string().refine((code) => {
    const validation = validateVerificationCode(code);
    return validation.isValid;
  }, 'Please enter a valid 6-digit verification code')
});

type VerificationFormData = z.infer<typeof verificationSchema>;

interface PhoneVerificationFormProps {
  phone: string;
  onSuccess?: () => void;
  onBack?: () => void;
}

export default function PhoneVerificationForm({ phone, onSuccess, onBack }: PhoneVerificationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds cooldown
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema)
  });

  const watchedCode = watch('verification_code');

  // Countdown timer for resend button
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (watchedCode && watchedCode.length === 6 && /^[0-9]{6}$/.test(watchedCode)) {
      handleSubmit(onSubmit)();
    }
  }, [watchedCode]);

  const onSubmit = async (data: VerificationFormData) => {
    if (attempts >= maxAttempts) {
      setError('Too many failed attempts. Please request a new verification code.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const verificationData: PhoneVerificationData = {
        phone: phone,
        verification_code: data.verification_code
      };

      const result = await verifyPhoneNumber(verificationData);

      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
        }, 1500);
      } else {
        setError(result.message);
        setAttempts(prev => prev + 1);
        reset();
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('An unexpected error occurred. Please try again.');
      setAttempts(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await sendPhoneVerification(phone);

      if (result.success) {
        setSuccess('Verification code sent successfully!');
        setTimeLeft(60);
        setCanResend(false);
        setAttempts(0); // Reset attempts on new code
        reset();
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Resend error:', error);
      setError('Failed to resend verification code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Phone className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Verify Your Phone</CardTitle>
        <CardDescription className="text-gray-600">
          We've sent a 6-digit verification code to
          <br />
          <span className="font-medium text-gray-900">
            {formatBangladeshiPhone(phone, 'international')}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Verification Code Input */}
          <div className="space-y-2">
            <Label htmlFor="verification_code" className="text-sm font-medium text-gray-700">
              Verification Code
            </Label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="verification_code"
                type="text"
                placeholder="Enter 6-digit code"
                className="pl-10 text-center text-lg font-mono tracking-widest"
                maxLength={6}
                {...register('verification_code')}
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
            {errors.verification_code && (
              <p className="text-sm text-red-600">{errors.verification_code.message}</p>
            )}
            
            {/* Attempts Warning */}
            {attempts > 0 && attempts < maxAttempts && (
              <p className="text-sm text-orange-600">
                {maxAttempts - attempts} attempt{maxAttempts - attempts !== 1 ? 's' : ''} remaining
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            disabled={isLoading || attempts >= maxAttempts}
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Phone Number'
            )}
          </Button>

          {/* Resend Code */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Didn't receive the code?
            </p>
            {canResend ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleResendCode}
                disabled={isResending}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend Code'
                )}
              </Button>
            ) : (
              <p className="text-sm text-gray-500">
                Resend available in {formatTime(timeLeft)}
              </p>
            )}
          </div>

          {/* Back Button */}
          {onBack && (
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back to Registration
              </Button>
            </div>
          )}
        </form>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Having trouble?</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Make sure your phone has good signal reception</li>
            <li>• Check if the SMS is in your spam/junk folder</li>
            <li>• The code expires in 10 minutes</li>
            <li>• Contact support if you continue having issues</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}