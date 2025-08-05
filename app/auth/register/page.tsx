'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import UserRegistrationForm from '@/components/auth/UserRegistrationForm';
import PhoneVerificationForm from '@/components/auth/PhoneVerificationForm';
import { UserRegistrationData, PhoneVerificationData } from '@/lib/types/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type RegistrationStep = 'register' | 'verify' | 'success';

function RegistrationContent() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('register');
  const [registrationData, setRegistrationData] = useState<UserRegistrationData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref');

  const handleRegistrationSuccess = (user: any) => {
    setRegistrationData(user.registrationData);
    setUserId(user.id);
    setCurrentStep('verify');
  };

  const handleVerificationSuccess = () => {
    setCurrentStep('success');
    // Auto-redirect to dashboard after 3 seconds
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  };

  const handleBackToRegistration = () => {
    setCurrentStep('register');
    setRegistrationData(null);
    setUserId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Join Tech Nirvor</h1>
          <p className="text-gray-600 mt-2">
            Create your account and start earning rewards
          </p>
        </div>

        {/* Registration Step */}
        {currentStep === 'register' && (
          <UserRegistrationForm
            onSuccess={handleRegistrationSuccess}
          />
        )}

        {/* Phone Verification Step */}
        {currentStep === 'verify' && registrationData && userId && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Verify Your Phone</CardTitle>
                <CardDescription>
                  We've sent a verification code to {registrationData.phone}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PhoneVerificationForm
                  phone={registrationData.phone}
                  onSuccess={handleVerificationSuccess}
                  onBack={handleBackToRegistration}
                />
                
                <div className="mt-4 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToRegistration}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Registration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Success Step */}
        {currentStep === 'success' && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Tech Nirvor!</h2>
              <p className="text-gray-600 mb-6">
                Your account has been created successfully. You'll be redirected to your dashboard shortly.
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">🎉 Welcome Bonus!</h3>
                  <p className="text-sm text-gray-600">
                    You've earned 100 reward points for joining Tech Nirvor!
                  </p>
                </div>
                
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Go to Dashboard
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Login Link */}
        {currentStep === 'register' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        )}

        {/* Benefits Section */}
        {currentStep === 'register' && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="font-medium text-gray-900 mb-4 text-center">Why join Tech Nirvor?</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-2">🎁</div>
                <p className="text-gray-600">Earn reward points</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🚚</div>
                <p className="text-gray-600">Track orders</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">💰</div>
                <p className="text-gray-600">Exclusive discounts</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">👥</div>
                <p className="text-gray-600">Refer friends</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <RegistrationContent />
    </Suspense>
  );
}