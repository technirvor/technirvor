"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Heart,
  Share2,
  Minus,
  Plus,
  Star,
  Clock,
} from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@/lib/types";
import { toast } from "sonner";
import { sendMetaConversionEvent } from "@/lib/analytics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ImageUpload from "@/components/image-upload";

interface Review {
  id: string;
  product_id: string;
  order_number: string;
  phone_number: string;
  review_text: string;
  review_images: string[];
  rating: number;
  created_at: string;
}

interface Props {
  product: Product;
}

export default function ProductPageClient({ product }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]); // New state for reviews
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    sendMetaConversionEvent("ViewContent", {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      currency: "BDT",
      value: product.price,
    });

    fetchReviews(); // Fetch reviews when component mounts or product changes
  }, [product]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${product.id}`);
      if (response.ok) {
        const data: Review[] = await response.json();
        setReviews(data);
        if (data.length > 0) {
          const sumRatings = data.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating(sumRatings / data.length);
          setTotalReviews(data.length);
        } else {
          setAverageRating(0);
          setTotalReviews(0);
        }
      } else {
        console.error("Failed to fetch reviews:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!orderNumber || !phoneNumber || !reviewText || rating === 0) {
      toast.error("Please fill in all required fields and provide a rating.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          orderNumber,
          phoneNumber,
          reviewText,
          reviewImages,
          rating,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Review submitted successfully!");
        setShowReviewForm(false);
        setOrderNumber("");
        setPhoneNumber("");
        setReviewText("");
        setReviewImages([]);
        setRating(0);
        fetchReviews(); // Re-fetch reviews after successful submission
      } else {
        toast.error(data.error || "Failed to submit review.");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`Added ${quantity} item(s) to cart!`);
    sendMetaConversionEvent("AddToCart", {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      currency: "BDT",
      value: product.price,
    });
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    sendMetaConversionEvent("InitiateCheckout", {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      currency: "BDT",
      value: product.price,
      num_items: quantity,
    });
    window.location.href = "/checkout";
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.description,
      url: window.location.href,
    };
    if (
      navigator.share &&
      (typeof navigator.canShare !== "function" ||
        navigator.canShare(shareData))
    ) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // If user cancels or share fails, fallback to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast.success("Product link copied to clipboard!");
        } catch {
          toast.error("Unable to share or copy link.");
        }
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Product link copied to clipboard!");
      } catch {
        toast.error("Unable to copy link to clipboard.");
      }
    } else {
      // Fallback for very old browsers
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success("Product link copied to clipboard!");
      } catch {
        toast.error("Unable to share or copy link.");
      }
      document.body.removeChild(textArea);
    }
  };

  const currentPrice = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image_url];

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 sm:mb-8">
          <div className="flex flex-wrap items-center space-x-2 text-xs sm:text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-gray-900">
              Products
            </Link>
            <span>/</span>
            {product.category && (
              <>
                <Link
                  href={
                    "slug" in product.category
                      ? `/category/${product.category.slug}`
                      : "#"
                  }
                  className="hover:text-gray-900"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <span className="text-gray-900">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-3 sm:space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-white w-full max-w-md mx-auto lg:mx-0">
              <Image
                src={images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_flash_sale && (
                  <Badge variant="destructive">
                    <Clock className="w-3 h-3 mr-1" />
                    Flash Sale
                  </Badge>
                )}
                {hasDiscount && (
                  <Badge variant="secondary">-{discountPercentage}% OFF</Badge>
                )}
                {product.is_featured && <Badge>Featured</Badge>}
              </div>
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto snap-x snap-mandatory pb-2 -mx-2 px-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 snap-center focus:outline-none ${
                      selectedImage === index
                        ? "border-blue-500"
                        : "border-gray-200"
                    }`}
                    aria-label={`Show image ${index + 1}`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-2 sm:mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-gray-600">
                  ({averageRating.toFixed(1)}) • {totalReviews} reviews
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-2 sm:space-x-4 mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  ৳{currentPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-lg sm:text-xl text-gray-500 line-through">
                    ৳{product.price.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-4 sm:mb-6">
                {product.stock > 0 ? (
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    In Stock ({product.stock} available)
                  </Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <Card className="bg-white">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 border-b pb-2">
                    What's special about this product?
                  </h3>
                  <div
                    className={`prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed transition-all duration-500 ease-in-out ${
                      showFullDescription ? "max-h-full" : "max-h-40"
                    } overflow-hidden`}
                  >
                    <p className="whitespace-pre-line">{product.description}</p>
                  </div>
                  {product.description.length > 180 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-2 px-0 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      onClick={() => setShowFullDescription((prev) => !prev)}
                    >
                      {showFullDescription ? "Show Less" : "Read More..."}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Quantity and Actions */}
            {product.stock > 0 && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-10 sm:w-12 text-center font-medium">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-4">
                  <Button onClick={handleAddToCart} className="flex-1">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    variant="outline"
                    className="flex-1 bg-transparent"
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-4">
              <Button variant="outline" size="sm" className="bg-transparent">
                <Heart className="w-4 h-4 mr-2" />
                Add to Wishlist
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="bg-transparent"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Product Details */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">
                  Product Details
                </h3>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">
                      {product.category?.name || "Uncategorized"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-medium font-mono">
                      {product.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Availability:</span>
                    <span className="font-medium">
                      {product.stock > 0
                        ? `${product.stock} in stock`
                        : "Out of stock"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Review Button */}
            <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
              <Button
                onClick={() => setShowReviewForm(true)}
                className="w-full"
              >
                Add Review
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 sm:mt-12 max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Customer Reviews ({totalReviews})
          </h2>
          {reviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {reviews.map((review) => (
                <Card key={review.id} className="bg-white shadow-sm">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm sm:text-base text-gray-800 mb-3">
                      {review.review_text}
                    </p>
                    {review.review_images && review.review_images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {review.review_images.map((image, index) => (
                          <Image
                            key={index}
                            src={image}
                            alt={`Review image ${index + 1}`}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Reviewed by: {review.phone_number.slice(0, 3)}***
                      {review.phone_number.slice(-4)} on{" "}
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Review Form Dialog */}
      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="sm:max-w-lg md:max-w-2xl lg:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Add Your Review</DialogTitle>
            <DialogDescription>
              Share your experience with this product.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 px-2 sm:px-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Your order number"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Your phone number (will not be shown)"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reviewText">Review</Label>
                <Textarea
                  id="reviewText"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write your review here..."
                  rows={5}
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Your Rating</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <Star
                      key={starValue}
                      className={`w-6 h-6 cursor-pointer ${
                        starValue <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                      onClick={() => setRating(starValue)}
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reviewImages">Images (Max 5)</Label>
                <div>
                  <ImageUpload
                    value={reviewImages}
                    onChange={(urls) => setReviewImages(urls)}
                    maxFiles={5}
                    maxSize={5 * 1024 * 1024} // 5MB
                    fileTypes={["image/*"]}
                    options={{ folder: "reviews", uploadProvider: "supabase" }} // Specify the folder for review images and explicitly set provider
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="px-2 sm:px-4">
            <Button onClick={handleSubmitReview} disabled={isSubmittingReview}>
              {isSubmittingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
