"use client";

import type React from "react";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "@/components/ui/loader2";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CheckoutContent() {
  const { cartItems, totalItems, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneWarning, setPhoneWarning] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState<any[]>([]);
  const [payment, setPayment] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  useEffect(() => {
    async function fetchDistricts() {
      const response = await fetch("/api/v1/districts");
      const fetchedDistricts = await response.json();
      setDistricts(fetchedDistricts);
    }
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (district) {
      const selectedDistrict = districts.find((d) => d.name === district);
      setDeliveryCharge(selectedDistrict?.deliveryCharge || 0);
    } else {
      setDeliveryCharge(0);
    }
  }, [district, districts]);

  // Bangladeshi phone number validation (starts with 01, 11 digits)
  const isValidBDPhone = (phone: string) => {
    return /^01[3-9]\d{8}$/.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address || !district || !payment) {
      alert("Please fill in all required fields.");
      return;
    }
    if (!isValidBDPhone(phone)) {
      setPhoneWarning("Enter a valid Bangladeshi phone number (e.g., 01XXXXXXXXX)");
      return;
    } else {
      setPhoneWarning("");
    }
    if (!cartItems || cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // Validate product IDs
    try {
      const payload = { productIds: cartItems.map((item) => item.productId) };
      console.log("Validating products with payload:", payload);
      const response = await fetch("/api/v1/products/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("Validation response status:", response.status);
      if (!response.ok) {
        let errorText = await response.text();
        console.error("Validation API error response:", errorText);
        try {
          const errorData = JSON.parse(errorText);
          alert(`Invalid products in cart: ${errorData.message}`);
        } catch (parseErr) {
          alert(`Invalid products in cart. Server response: ${errorText}`);
        }
        return;
      }
      const validProductIds = await response.json();
      console.log("Valid product IDs returned:", validProductIds, "Type:", typeof validProductIds);
      if (!Array.isArray(validProductIds)) {
        alert("Product validation API did not return an array. See console for details.");
        console.error("Expected array from validation API, got:", validProductIds);
        return;
      }
      const invalidItems = cartItems.filter((item) => !validProductIds.includes(item.productId));
      if (invalidItems.length > 0) {
        alert("Some items in your cart are no longer available. Please remove them.");
        console.warn("Invalid cart items:", invalidItems);
        return;
      }
    } catch (error) {
      console.error("Error validating products:", error);
      alert("Failed to validate cart items. Please try again. See console for details.");
      return;
    }

    setLoading(true);

    console.log("Products in cart:", JSON.stringify(cartItems, null, 2));
    const orderData = {
      orderItems: cartItems?.map((item) => ({
        product: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        slug: item.slug,
        image: item.image || "", // Include image with fallback
      })),
      shippingAddress: {
        fullName: name, // Map name to fullName
        email,
        phone,
        address,
        district,
        city: "", // Optional
        postalCode: "", // Optional
        country: "Bangladesh", // Default
      },
      paymentMethod: payment,
      itemsPrice: totalPrice,
      shippingPrice: deliveryCharge,
      totalPrice: totalPrice + deliveryCharge,
    };

    try {
      const response = await fetch("/api/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Order failed:", errorData.message);
        alert(`Failed to place order: ${errorData.message}`);
        setLoading(false);
        return;
      }

      const result = await response.json();
      clearCart();
      router.push(`/order-confirmation?orderId=${result.orderId}`);
    } catch (error) {
      console.error("Error placing order:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground">Add items to your cart to proceed to checkout.</p>
        <Button className="mt-4" onClick={() => router.push("/products")}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Review your items before placing the order.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cartItems?.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium">BDT {item.price * item.quantity}</p>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between font-bold">
                <p>Delivery Charge</p>
                <p>BDT {deliveryCharge}</p>
              </div>
              <div className="flex items-center justify-between font-bold">
                <p>Total ({totalItems} items)</p>
                <p>BDT {totalPrice + deliveryCharge}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
            <CardDescription>Enter your details for delivery.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (e.target.value.length > 0 && !isValidBDPhone(e.target.value)) {
                      setPhoneWarning("Enter a valid Bangladeshi phone number (e.g., 01XXXXXXXXX)");
                    } else {
                      setPhoneWarning("");
                    }
                  }}
                  required
                  className={phoneWarning ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {phoneWarning && (
                  <p className="text-xs text-red-500 mt-1">{phoneWarning}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Shipping Address</Label>
                <Textarea
                  id="address"
                  placeholder="123 Main St, Apt 4B"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="district">District</Label>
                <Select value={district} onValueChange={setDistrict} required>
                  <SelectTrigger id="district">
                    <SelectValue placeholder="Select a district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts?.map((d: any) => (
                      <SelectItem key={d._id} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payment">Payment Method</Label>
                <Select value={payment} onValueChange={setPayment} required>
                  <SelectTrigger id="payment">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={loading || cartItems.length === 0}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Place Order"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}