'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Phone, Mail, User, MapPin, Calendar, Shield, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserRegistrationData, RegistrationFormErrors } from '@/lib/types/user';
import { validatePhoneForRegistration, formatBangladeshiPhone } from '@/lib/utils/phone-validation';
import { registerUser } from '@/lib/services/user-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Validation schema
const registrationSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name is too long'),
  phone: z.string().refine((phone) => {
    const validation = validatePhoneForRegistration(phone);
    return validation.isValid;
  }, 'Please enter a valid Bangladeshi phone number'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirm_password: z.string(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  referral_code: z.string().optional(),
  agree_to_terms: z.boolean().refine((val) => val === true, 'You must agree to the terms and conditions')
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

// Bangladesh districts
const BANGLADESH_DISTRICTS = [
  'Barisal', 'Barguna', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur',
  'Bandarban', 'Brahmanbaria', 'Chandpur', 'Chittagong', 'Comilla', 'Cox\'s Bazar',
  'Feni', 'Khagrachhari', 'Lakshmipur', 'Noakhali', 'Rangamati',
  'Dhaka', 'Faridpur', 'Gazipur', 'Gopalganj', 'Kishoreganj', 'Madaripur',
  'Manikganj', 'Munshiganj', 'Narayanganj', 'Narsingdi', 'Rajbari', 'Shariatpur', 'Tangail',
  'Bagerhat', 'Chuadanga', 'Jessore', 'Jhenaidah', 'Khulna', 'Kushtia',
  'Magura', 'Meherpur', 'Narail', 'Satkhira',
  'Jamalpur', 'Mymensingh', 'Netrakona', 'Sherpur',
  'Bogra', 'Joypurhat', 'Naogaon', 'Natore', 'Nawabganj', 'Pabna',
  'Rajshahi', 'Sirajganj',
  'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari',
  'Panchagarh', 'Rangpur', 'Thakurgaon',
  'Habiganj', 'Moulvibazar', 'Sunamganj', 'Sylhet'
];

interface UserRegistrationFormProps {
  onSuccess?: (user: any) => void;
  onVerificationRequired?: (phone: string) => void;
}

export default function UserRegistrationForm({ onSuccess, onVerificationRequired }: UserRegistrationFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      agree_to_terms: false
    }
  });

  const watchedPhone = watch('phone');

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const registrationData: UserRegistrationData = {
        full_name: data.full_name,
        phone: data.phone,
        email: data.email || undefined,
        password: data.password,
        confirm_password: data.confirm_password,
        date_of_birth: data.date_of_birth || undefined,
        gender: data.gender,
        district: data.district || undefined,
        address: data.address || undefined,
        referral_code: data.referral_code || undefined,
        agree_to_terms: data.agree_to_terms
      };

      const result = await registerUser(registrationData);

      if (result.success) {
        setSuccess(result.message);
        if (result.verification_required && onVerificationRequired) {
          onVerificationRequired(data.phone);
        } else if (result.user && onSuccess) {
          onSuccess(result.user);
        }
        reset();
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">Create Your Account</CardTitle>
        <CardDescription className="text-gray-600">
          Join Tech Nirvor and start earning rewards with every purchase!
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
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
              Full Name *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="full_name"
                type="text"
                placeholder="Enter your full name"
                className="pl-10"
                {...register('full_name')}
              />
            </div>
            {errors.full_name && (
              <p className="text-sm text-red-600">{errors.full_name.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Phone Number * <span className="text-xs text-gray-500">(Bangladeshi numbers only)</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="01712345678 or +8801712345678"
                className="pl-10"
                {...register('phone')}
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

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address <span className="text-xs text-gray-500">(Optional)</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                className="pl-10"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password *
            </Label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                className="pl-10 pr-10"
                {...register('password')}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Must contain at least 8 characters with uppercase, lowercase, and number
            </p>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="text-sm font-medium text-gray-700">
              Confirm Password *
            </Label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="confirm_password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                className="pl-10 pr-10"
                {...register('confirm_password')}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-sm text-red-600">{errors.confirm_password.message}</p>
            )}
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="date_of_birth" className="text-sm font-medium text-gray-700">
                Date of Birth
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="date_of_birth"
                  type="date"
                  className="pl-10"
                  {...register('date_of_birth')}
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                Gender
              </Label>
              <Select onValueChange={(value) => setValue('gender', value as 'male' | 'female' | 'other')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* District */}
          <div className="space-y-2">
            <Label htmlFor="district" className="text-sm font-medium text-gray-700">
              District
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Select onValueChange={(value) => setValue('district', value)}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Select your district" />
                </SelectTrigger>
                <SelectContent>
                  {BANGLADESH_DISTRICTS.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-gray-700">
              Address
            </Label>
            <Input
              id="address"
              type="text"
              placeholder="Enter your full address"
              {...register('address')}
            />
          </div>

          {/* Referral Code */}
          <div className="space-y-2">
            <Label htmlFor="referral_code" className="text-sm font-medium text-gray-700">
              Referral Code <span className="text-xs text-gray-500">(Optional)</span>
            </Label>
            <div className="relative">
              <Gift className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="referral_code"
                type="text"
                placeholder="Enter referral code to earn bonus points"
                className="pl-10"
                {...register('referral_code')}
              />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="agree_to_terms"
              {...register('agree_to_terms')}
              className="mt-1"
            />
            <Label htmlFor="agree_to_terms" className="text-sm text-gray-700 leading-relaxed">
              I agree to the{' '}
              <Link href="/terms-and-conditions" className="text-blue-600 hover:underline">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>
          {errors.agree_to_terms && (
            <p className="text-sm text-red-600">{errors.agree_to_terms.message}</p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}