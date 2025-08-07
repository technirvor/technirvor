"use client";

import type React from "react";
import {
  MapPin,
  CreditCard,
  Smartphone,
  Building2,
  Banknote,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCartStore } from "@/lib/cart-store";
import { supabase } from "@/lib/supabase";
import type { District } from "@/lib/types";
import { toast } from "sonner";
import { sendMetaConversionEvent } from "@/lib/analytics";

export default function CheckoutPage() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null,
  );
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    address: "",
    paymentMethod: "cod",
    transactionId: "",
  });
  const [transactionIdError, setTransactionIdError] = useState<string>("");
  const [validationTimeout, setValidationTimeout] =
    useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchDistricts();
  }, []);

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, [validationTimeout]);

  useEffect(() => {
    if (formData.paymentMethod) {
      sendMetaConversionEvent("AddPaymentInfo", {
        currency: "BDT",
        value: getTotalPrice() + (selectedDistrict?.delivery_charge || 60),
      });
    }
  }, [formData.paymentMethod]);

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
      return;
    }
    // Validate products in cart exist in DB
    const validateProducts = async () => {
      // Separate regular products and combo products
      const regularItems = items.filter((item) => !item.isCombo);
      const comboItems = items.filter((item) => item.isCombo);

      // Validate regular products
      if (regularItems.length > 0) {
        const productIds = regularItems.map((item) => item.product.id);
        const { data, error } = await supabase
          .from("products")
          .select("id")
          .in("id", productIds);
        if (error) return;
        const validIds = (data || []).map((p) => p.id);
        const invalidRegularItems = regularItems.filter(
          (item) => !validIds.includes(item.product.id),
        );
        if (invalidRegularItems.length > 0) {
          clearCart();
          toast.error(
            "Some products in your cart are no longer available. Cart has been cleared.",
          );
          router.push("/cart");
          return;
        }
      }

      // Validate combo products
      if (comboItems.length > 0) {
        const comboIds = comboItems.map((item) => item.comboId).filter(Boolean);
        if (comboIds.length > 0) {
          const { data, error } = await supabase
            .from("combo_products")
            .select("id")
            .in("id", comboIds)
            .eq("is_active", true);
          if (error) return;
          const validComboIds = (data || []).map((c) => c.id);
          const invalidComboItems = comboItems.filter(
            (item) => !validComboIds.includes(item.comboId),
          );
          if (invalidComboItems.length > 0) {
            clearCart();
            toast.error(
              "Some combo offers in your cart are no longer available. Cart has been cleared.",
            );
            router.push("/cart");
            return;
          }
        }
      }
    };
    validateProducts();
  }, [items, router, clearCart]);

  const fetchDistricts = async () => {
    try {
      const { data, error } = await supabase
        .from("districts")
        .select("*")
        .order("name");
      if (error) throw error;
      setDistricts(data || []);
    } catch (error) {
      console.error("Error fetching districts:", error);
      toast.error("Failed to load districts");
    }
  };

  const handleDistrictChange = (districtId: string) => {
    const district = districts.find((d) => d.id === districtId);
    setSelectedDistrict(district || null);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateTransactionId = async (txId: string) => {
    if (!txId || txId.trim() === "") {
      setTransactionIdError("");
      return;
    }

    try {
      const { data: existingOrder, error } = await supabase
        .from("orders")
        .select("id")
        .eq("transaction_id", txId.trim())
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking transaction ID:", error);
        return;
      }

      if (existingOrder) {
        setTransactionIdError("Transaction ID already used for another order");
      } else {
        setTransactionIdError("");
      }
    } catch (error) {
      console.error("Error validating transaction ID:", error);
    }
  };

  const handleTransactionIdChange = (value: string) => {
    setFormData((prev) => ({ ...prev, transactionId: value }));

    // Clear previous timeout
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    // Set new timeout for validation
    const timeoutId = setTimeout(() => {
      validateTransactionId(value);
    }, 500);

    setValidationTimeout(timeoutId);
  };

  // Bangladeshi phone number validation
  const isValidBangladeshiPhone = (phone: string) => {
    // Accepts 01410077761 or +8801410077761 (11 or 14 digits)
    const pattern = /^(\+8801|01)[3-9]\d{8}$/;
    return pattern.test(phone.trim());
  };

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      toast.error("Customer name is required");
      return false;
    }
    if (!formData.customerPhone.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    if (!isValidBangladeshiPhone(formData.customerPhone)) {
      toast.error("Please enter a valid phone number");
      return false;
    }
    if (!selectedDistrict) {
      toast.error("Please select a district");
      return false;
    }
    if (!formData.address.trim()) {
      toast.error("Address is required");
      return false;
    }

    // Validate transaction ID for mobile payments
    if (["bkash", "nagad", "rocket", "upay"].includes(formData.paymentMethod)) {
      if (!formData.transactionId.trim()) {
        toast.error("Transaction ID is required for mobile payments");
        return false;
      }
      if (transactionIdError) {
        toast.error("Please fix the transaction ID error before proceeding");
        return false;
      }
    }

    return true;
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            );
            const data = await response.json();
            if (data.display_name) {
              setFormData((prev) => ({
                ...prev,
                address: data.display_name,
              }));
              toast.success("Location fetched successfully");
            } else {
              toast.error("Could not find address details");
            }
          } catch (error) {
            console.error("Error fetching address:", error);
            toast.error("Failed to fetch address");
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          if (error.code === error.PERMISSION_DENIED) {
            toast.error(
              "Location access denied. Please enable location services in your browser settings.",
            );
          } else {
            toast.error(
              "Could not access location. Please enable location services.",
            );
          }
        },
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Additional validation for transaction ID uniqueness before submission
      if (
        ["bkash", "nagad", "rocket", "upay"].includes(formData.paymentMethod) &&
        formData.transactionId.trim()
      ) {
        const { data: existingOrder, error: checkError } = await supabase
          .from("orders")
          .select("id")
          .eq("transaction_id", formData.transactionId.trim())
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          throw checkError;
        }

        if (existingOrder) {
          toast.error(
            "Transaction ID already exists. Please use a unique transaction ID.",
          );
          setLoading(false);
          return;
        }
      }
      const orderItems = items.flatMap((item) => {
        if (item.isCombo && item.comboItems) {
          // For combo items, create order items for each individual product
          return item.comboItems.map((comboItem) => ({
            product_id: comboItem.product.id,
            quantity: comboItem.quantity * item.quantity,
            price: (item.comboPrice || 0) / item.comboItems!.length, // Distribute combo price evenly
            is_combo: true,
            combo_id: item.comboId,
            combo_name: item.comboName,
          }));
        } else {
          // Regular product
          return [
            {
              product_id: item.product.id,
              quantity: item.quantity,
              price: item.product.sale_price || item.product.price,
              is_combo: false,
            },
          ];
        }
      });

      const subtotal = getTotalPrice();

      // Check delivery logic: Free delivery only if ALL products have free delivery
      const freeDeliveryProducts = items.filter(
        (item) => item.product.has_free_delivery === true,
      );
      const regularProducts = items.filter(
        (item) => item.product.has_free_delivery !== true,
      );
      const allProductsHaveFreeDelivery =
        items.length > 0 && regularProducts.length === 0;
      const baseDeliveryCharge = selectedDistrict?.delivery_charge || 60;
      const deliveryCharge = allProductsHaveFreeDelivery
        ? 0
        : baseDeliveryCharge;
      const totalAmount = subtotal + deliveryCharge;

      const orderData = {
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        district: selectedDistrict?.name,
        address: formData.address,
        payment_method: formData.paymentMethod,
        transaction_id: formData.transactionId || null,
        items: orderItems,
        total_amount: totalAmount,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to place order");
      }

      // Send purchase event to Meta
      sendMetaConversionEvent("Purchase", {
        content_ids: items.map((item) => item.product.id),
        content_type: "product",
        currency: "BDT",
        value: totalAmount,
        num_items: items.reduce((acc, item) => acc + item.quantity, 0),
        order_id: result.order.id,
      });

      // Clear cart and redirect to confirmation
      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/order-confirmation/${result.order.id}`);
    } catch (error: any) {
      console.error("Order submission error:", error);

      // Handle unique constraint violation for transaction ID
      if (
        error?.code === "23505" &&
        error?.message?.includes("transaction_id")
      ) {
        toast.error(
          "Transaction ID already exists. Please use a unique transaction ID.",
        );
      } else {
        toast.error(
          error instanceof Error ? error.message : "Failed to place order",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getTotalPrice();

  // Check delivery logic: Free delivery only if ALL products have free delivery
  const freeDeliveryProducts = items.filter(
    (item) => item.product.has_free_delivery === true,
  );
  const regularProducts = items.filter(
    (item) => item.product.has_free_delivery !== true,
  );
  const allProductsHaveFreeDelivery =
    items.length > 0 && regularProducts.length === 0;
  const baseDeliveryCharge = selectedDistrict?.delivery_charge || 60;
  const deliveryCharge = allProductsHaveFreeDelivery ? 0 : baseDeliveryCharge;
  const total = subtotal + deliveryCharge;

  if (!hydrated || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="customerName">Full Name *</Label>
                  <Input
                    id="customerName"
                    type="text"
                    value={formData.customerName}
                    onChange={(e) =>
                      handleInputChange("customerName", e.target.value)
                    }
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) =>
                      handleInputChange("customerPhone", e.target.value)
                    }
                    placeholder="01410077761"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="district">District *</Label>
                  <Select onValueChange={handleDistrictChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your district" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name} - ৳{district.delivery_charge}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <Label htmlFor="address">Full Address *</Label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="House/Flat, Road, Area"
                    required
                  />
                  <MapPin
                    className="absolute top-8 right-3 h-5 w-5 text-gray-400 cursor-pointer"
                    onClick={handleLocationClick}
                  />
                </div>

                <div>
                  <Label className="text-lg font-bold text-gray-900 mb-6 block">
                    Choose Payment Method
                  </Label>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      handleInputChange("paymentMethod", value)
                    }
                    className="space-y-6"
                  >
                    {/* Mobile Financial Services */}
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl border border-pink-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Smartphone className="w-5 h-5 text-pink-600" />
                        <h4 className="text-base font-semibold text-gray-800">
                          Mobile Financial Services
                        </h4>
                        <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full font-medium">
                          Most Popular
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div
                          className={`flex items-center space-x-3 p-4 border-2 rounded-xl transition-all cursor-pointer ${
                            formData.paymentMethod === "bkash"
                              ? "border-pink-500 bg-pink-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-pink-300 hover:shadow-sm"
                          }`}
                        >
                          <RadioGroupItem
                            value="bkash"
                            id="bkash"
                            className="text-pink-600"
                          />
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm">
                              <span className="text-white font-bold text-sm">
                                bK
                              </span>
                            </div>
                            <div>
                              <Label
                                htmlFor="bkash"
                                className="font-semibold cursor-pointer text-gray-800"
                              >
                                bKash
                              </Label>
                              <p className="text-xs text-gray-600">
                                Most trusted mobile wallet
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`flex items-center space-x-3 p-4 border-2 rounded-xl transition-all cursor-pointer ${
                            formData.paymentMethod === "nagad"
                              ? "border-orange-500 bg-orange-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm"
                          }`}
                        >
                          <RadioGroupItem
                            value="nagad"
                            id="nagad"
                            className="text-orange-600"
                          />
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
                              <span className="text-white font-bold text-sm">
                                N
                              </span>
                            </div>
                            <div>
                              <Label
                                htmlFor="nagad"
                                className="font-semibold cursor-pointer text-gray-800"
                              >
                                Nagad
                              </Label>
                              <p className="text-xs text-gray-600">
                                Government backed service
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`flex items-center space-x-3 p-4 border-2 rounded-xl transition-all cursor-pointer ${
                            formData.paymentMethod === "rocket"
                              ? "border-purple-500 bg-purple-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm"
                          }`}
                        >
                          <RadioGroupItem
                            value="rocket"
                            id="rocket"
                            className="text-purple-600"
                          />
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                              <span className="text-white font-bold text-sm">
                                R
                              </span>
                            </div>
                            <div>
                              <Label
                                htmlFor="rocket"
                                className="font-semibold cursor-pointer text-gray-800"
                              >
                                Rocket
                              </Label>
                              <p className="text-xs text-gray-600">
                                DBBL mobile banking
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`flex items-center space-x-3 p-4 border-2 rounded-xl transition-all cursor-pointer ${
                            formData.paymentMethod === "upay"
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                          }`}
                        >
                          <RadioGroupItem
                            value="upay"
                            id="upay"
                            className="text-blue-600"
                          />
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                              <span className="text-white font-bold text-sm">
                                U
                              </span>
                            </div>
                            <div>
                              <Label
                                htmlFor="upay"
                                className="font-semibold cursor-pointer text-gray-800"
                              >
                                Upay
                              </Label>
                              <p className="text-xs text-gray-600">
                                UCB Fintech wallet
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Other Payment Methods */}
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <h4 className="text-base font-semibold text-gray-800">
                          Other Payment Options
                        </h4>
                      </div>

                      <div className="space-y-3">
                        <div
                          className={`flex items-center space-x-3 p-4 border-2 rounded-xl transition-all cursor-pointer ${
                            formData.paymentMethod === "card"
                              ? "border-blue-500 bg-blue-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                          }`}
                        >
                          <RadioGroupItem
                            value="card"
                            id="card"
                            className="text-blue-600"
                          />
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
                              <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <Label
                                htmlFor="card"
                                className="font-semibold cursor-pointer text-gray-800"
                              >
                                Credit/Debit Card
                              </Label>
                              <p className="text-xs text-gray-600">
                                Visa, Mastercard, American Express
                              </p>
                            </div>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                            Secure
                          </span>
                        </div>

                        <div
                          className={`flex items-center space-x-3 p-4 border-2 rounded-xl transition-all cursor-pointer ${
                            formData.paymentMethod === "bank_transfer"
                              ? "border-green-500 bg-green-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-green-300 hover:shadow-sm"
                          }`}
                        >
                          <RadioGroupItem
                            value="bank_transfer"
                            id="bank_transfer"
                            className="text-green-600"
                          />
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                              <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <Label
                                htmlFor="bank_transfer"
                                className="font-semibold cursor-pointer text-gray-800"
                              >
                                Bank Transfer
                              </Label>
                              <p className="text-xs text-gray-600">
                                Direct bank account transfer
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`flex items-center space-x-3 p-4 border-2 rounded-xl transition-all cursor-pointer ${
                            formData.paymentMethod === "cod"
                              ? "border-gray-500 bg-gray-50 shadow-md"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                          }`}
                        >
                          <RadioGroupItem
                            value="cod"
                            id="cod"
                            className="text-gray-600"
                          />
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center shadow-sm">
                              <Banknote className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <Label
                                htmlFor="cod"
                                className="font-semibold cursor-pointer text-gray-800"
                              >
                                Cash on Delivery
                              </Label>
                              <p className="text-xs text-gray-600">
                                Pay when you receive your order
                              </p>
                            </div>
                          </div>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            Safe
                          </span>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>

                  {/* Payment Instructions */}
                  {formData.paymentMethod &&
                    formData.paymentMethod !== "cod" && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">
                          Payment Instructions
                        </h4>
                        {formData.paymentMethod === "bkash" && (
                          <div className="text-sm text-blue-800">
                            <p className="mb-2">
                              • Dial *247# or use bKash app
                            </p>
                            <p className="mb-2">• Select "Send Money"</p>
                            <p className="mb-2">
                              • Enter merchant number:{" "}
                              <strong>01410077761</strong>
                            </p>
                            <p className="mb-2">
                              • Enter amount:{" "}
                              <strong>৳{total.toLocaleString()}</strong>
                            </p>
                            <p>
                              • Save the transaction ID for order confirmation
                            </p>
                          </div>
                        )}
                        {formData.paymentMethod === "nagad" && (
                          <div className="text-sm text-blue-800">
                            <p className="mb-2">
                              • Dial *167# or use Nagad app
                            </p>
                            <p className="mb-2">• Select "Send Money"</p>
                            <p className="mb-2">
                              • Enter merchant number:{" "}
                              <strong>01410077761</strong>
                            </p>
                            <p className="mb-2">
                              • Enter amount:{" "}
                              <strong>৳{total.toLocaleString()}</strong>
                            </p>
                            <p>
                              • Save the transaction ID for order confirmation
                            </p>
                          </div>
                        )}
                        {formData.paymentMethod === "rocket" && (
                          <div className="text-sm text-blue-800">
                            <p className="mb-2">
                              • Dial *322# or use Rocket app
                            </p>
                            <p className="mb-2">• Select "Send Money"</p>
                            <p className="mb-2">
                              • Enter merchant number:{" "}
                              <strong>01410077761</strong>
                            </p>
                            <p className="mb-2">
                              • Enter amount:{" "}
                              <strong>৳{total.toLocaleString()}</strong>
                            </p>
                            <p>
                              • Save the transaction ID for order confirmation
                            </p>
                          </div>
                        )}
                        {formData.paymentMethod === "upay" && (
                          <div className="text-sm text-blue-800">
                            <p className="mb-2">• Use Upay app</p>
                            <p className="mb-2">• Select "Send Money"</p>
                            <p className="mb-2">
                              • Enter merchant number:{" "}
                              <strong>01410077761</strong>
                            </p>
                            <p className="mb-2">
                              • Enter amount:{" "}
                              <strong>৳{total.toLocaleString()}</strong>
                            </p>
                            <p>
                              • Save the transaction ID for order confirmation
                            </p>
                          </div>
                        )}
                        {formData.paymentMethod === "bank_transfer" && (
                          <div className="text-sm text-blue-800">
                            <p className="mb-2">
                              <strong>Bank Details:</strong>
                            </p>
                            <p className="mb-1">
                              • Bank: Dutch-Bangla Bank Limited
                            </p>
                            <p className="mb-1">• Account Name: Technirvor</p>
                            <p className="mb-1">
                              • Account Number: <strong>XXXXXXXXXX</strong>
                            </p>
                            <p className="mb-1">
                              • Routing Number: <strong>XXXXXXXXX</strong>
                            </p>
                            <p>
                              • Amount:{" "}
                              <strong>৳{total.toLocaleString()}</strong>
                            </p>
                          </div>
                        )}
                        {formData.paymentMethod === "card" && (
                          <div className="text-sm text-blue-800">
                            <p className="mb-2">
                              • You will be redirected to secure payment gateway
                            </p>
                            <p className="mb-2">
                              • Supports Visa, Mastercard, American Express
                            </p>
                            <p>• SSL encrypted secure transaction</p>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Transaction ID field for mobile payments */}
                  {["bkash", "nagad", "rocket", "upay"].includes(
                    formData.paymentMethod,
                  ) && (
                    <div className="mt-4">
                      <Label htmlFor="transactionId">Transaction ID *</Label>
                      <div>
                        <Input
                          id="transactionId"
                          type="text"
                          value={formData.transactionId}
                          onChange={(e) =>
                            handleTransactionIdChange(e.target.value)
                          }
                          placeholder="Enter transaction ID after payment"
                          required
                          className={`mt-1 ${transactionIdError ? "border-red-500" : ""}`}
                        />
                        {transactionIdError && (
                          <p className="text-red-500 text-sm mt-1">
                            {transactionIdError}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Complete the payment first, then enter the transaction
                          ID here
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || transactionIdError !== ""}
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {item.product.name}
                      {item.isCombo && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Combo
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600">
                      ৳
                      {item.isCombo && item.comboPrice
                        ? item.comboPrice.toLocaleString()
                        : (
                            item.product.sale_price || item.product.price
                          ).toLocaleString()}{" "}
                      × {item.quantity}
                    </p>
                    {item.isCombo && item.comboItems && (
                      <p className="text-xs text-gray-500 mt-1">
                        Includes:{" "}
                        {item.comboItems
                          .map((ci) => ci.product.name)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                  <span className="font-medium">
                    ৳
                    {item.isCombo && item.comboPrice
                      ? (item.comboPrice * item.quantity).toLocaleString()
                      : (
                          (item.product.sale_price || item.product.price) *
                          item.quantity
                        ).toLocaleString()}
                  </span>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <div className="text-right">
                    {allProductsHaveFreeDelivery ? (
                      <div>
                        <span className="line-through text-gray-400 text-sm">
                          ৳{baseDeliveryCharge.toLocaleString()}
                        </span>
                        <span className="text-green-600 font-medium ml-2">
                          FREE
                        </span>
                      </div>
                    ) : (
                      <span>৳{deliveryCharge.toLocaleString()}</span>
                    )}
                  </div>
                </div>
                {allProductsHaveFreeDelivery && (
                  <div className="text-xs text-green-600 font-medium">
                    🎉 Free delivery applied!
                  </div>
                )}
                {freeDeliveryProducts.length > 0 &&
                  regularProducts.length > 0 && (
                    <div className="text-xs text-amber-600 font-medium">
                      ⚠️ Mix of free delivery and regular products - delivery
                      charge applies
                    </div>
                  )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>৳{total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
