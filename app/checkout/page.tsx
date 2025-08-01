"use client";

import type React from "react";
import { MapPin } from "lucide-react";
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
  });

  useEffect(() => {
    fetchDistricts();
  }, []);

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

  // Bangladeshi phone number validation
  const isValidBangladeshiPhone = (phone: string) => {
    // Accepts 01XXXXXXXXX or +8801XXXXXXXXX (11 or 14 digits)
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
          return [{
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.sale_price || item.product.price,
            is_combo: false,
          }];
        }
      });

      const subtotal = getTotalPrice();
      
      // Check delivery logic: Free delivery only if ALL products have free delivery
      const freeDeliveryProducts = items.filter(item => item.product.has_free_delivery === true);
      const regularProducts = items.filter(item => item.product.has_free_delivery !== true);
      const allProductsHaveFreeDelivery = items.length > 0 && regularProducts.length === 0;
      const baseDeliveryCharge = selectedDistrict?.delivery_charge || 60;
      const deliveryCharge = allProductsHaveFreeDelivery ? 0 : baseDeliveryCharge;
      const totalAmount = subtotal + deliveryCharge;

      const orderData = {
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        district: selectedDistrict?.name,
        address: formData.address,
        payment_method: formData.paymentMethod,
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
    } catch (error) {
      console.error("Order submission error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to place order",
      );
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getTotalPrice();
  
  // Check delivery logic: Free delivery only if ALL products have free delivery
  const freeDeliveryProducts = items.filter(item => item.product.has_free_delivery === true);
  const regularProducts = items.filter(item => item.product.has_free_delivery !== true);
  const allProductsHaveFreeDelivery = items.length > 0 && regularProducts.length === 0;
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
                    placeholder="01XXXXXXXXX"
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
                  <Label>Payment Method</Label>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      handleInputChange("paymentMethod", value)
                    }
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod">Cash on Delivery</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bkash" id="bkash" />
                      <Label htmlFor="bkash">bKash</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nagad" id="nagad" />
                      <Label htmlFor="nagad">Nagad</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
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
                        Includes: {item.comboItems.map(ci => ci.product.name).join(", ")}
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
                        <span className="line-through text-gray-400 text-sm">৳{baseDeliveryCharge.toLocaleString()}</span>
                        <span className="text-green-600 font-medium ml-2">FREE</span>
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
                {freeDeliveryProducts.length > 0 && regularProducts.length > 0 && (
                  <div className="text-xs text-amber-600 font-medium">
                    ⚠️ Mix of free delivery and regular products - delivery charge applies
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
