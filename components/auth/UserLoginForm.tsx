'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Phone, Shield, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoginData } from '@/lib/types/user';
import { validatePhoneForRegistration, formatBangladeshiPhone } from '@/lib/utils/phone-validation';
import { loginUser } from '@/lib/services/user-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Validation schema
const loginSchema = z.object({
  phone: z.string().refine((phone) => {
    const validation = validatePhoneForRegistration(phone);
    return validation.isValid;
  }, 'Please enter a valid Bangladeshi phone number'),
  password: z.string().min(1, 'Password is required'),
  remember_me: z.boolean().optional()
});

type LoginFormData = z.infer<typeof loginSchema>;

interface UserLoginFormProps {
  onSuccess?: (user: any, sessionToken?: string) => void;
  onForgotPassword?: (phone: string) => void;
  redirectTo?: string;
}

export default function UserLoginForm({ onSuccess, onForgotPassword, redirectTo }: UserLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    getValues
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      remember_me: false
    }
  });

  const watchedPhone = watch('phone');

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const loginData: LoginData = {
        phone: data.phone,
        password: data.password,
        remember_me: data.remember_me
      };

      const result = await loginUser(loginData);

      if (result.success) {
        // Store session token if remember me is checked
        if (data.remember_me && result.session_token) {
          localStorage.setItem('user_session_token', result.session_token);
        }

        if (onSuccess) {
          onSuccess(result.user, result.session_token);
        } else {
          // Default redirect behavior
          router.push(redirectTo || '/dashboard');
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    const phone = getValues('phone');
    if (phone && onForgotPassword) {
      onForgotPassword(phone);
    } else {
      router.push('/auth/forgot-password');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <LogIn className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
        <CardDescription className="text-gray-600">
          Sign in to your Tech Nirvor account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="01712345678 or +8801712345678"
                className="pl-10"
                {...register('phone')}
                autoComplete="tel"
              />
            </div>
            {watchedPhone && (
              <p className="text-xs text-gray-500">
                Format: {formatBangladeshiPhone(watchedPhone, 'international')}
              </p>
            )}
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="pl-10 pr-10"
                {...register('password')}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember_me"
                {...register('remember_me')}
              />
              <Label htmlFor="remember_me" className="text-sm text-gray-700">
                Remember me
              </Label>
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">
                Create account
              </Link>
            </p>
          </div>
        </form>

        {/* Benefits Section */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Why create an account?</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>🎁 Earn reward points with every purchase</li>
            <li>📱 Track your orders in real-time</li>
            <li>💰 Get exclusive discounts and offers</li>
            <li>🚚 Faster checkout with saved addresses</li>
            <li>🎂 Special birthday rewards</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}