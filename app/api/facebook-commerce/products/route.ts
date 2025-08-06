import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';

// Facebook Commerce Manager Product Feed API
export async function GET(request: NextRequest) {
  try {
    // Use the supabase client
    
    // Get all active products with their images
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        sale_price,
        stock,
        images,
        slug,
        is_featured,
        is_flash_sale,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Transform products for Facebook Commerce Manager format
    const facebookProducts = products?.map((product: any) => {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://technirvor.com';
      const productUrl = `${baseUrl}/product/${product.slug}`;
      const mainImage = product.images && product.images.length > 0 ? product.images[0] : null;
      
      return {
        // Required fields for Facebook Commerce
        id: product.id.toString(),
        title: product.name,
        description: product.description || '',
        availability: product.stock > 0 ? 'in stock' : 'out of stock',
        condition: 'new',
        price: `${product.sale_price || product.price} BDT`,
        link: productUrl,
        image_link: mainImage,
        brand: 'Technirvor',
        
        // Additional recommended fields
        additional_image_link: product.images?.slice(1, 10).join(',') || '',
        product_type: 'Electronics > General',
        google_product_category: 'Electronics',
        gtin: '',
        mpn: product.id.toString(),
        
        // Inventory and pricing
        inventory: product.stock,
        sale_price: product.sale_price ? `${product.sale_price} BDT` : '',
        
        // Physical attributes
        weight: '1 kg',
        size: '',
        
        // SEO and metadata
        custom_label_0: product.is_featured ? 'featured' : 'regular',
        custom_label_1: '',
        custom_label_2: 'Technirvor',
        custom_label_3: product.stock > 0 ? 'in_stock' : 'out_of_stock',
        custom_label_4: product.sale_price ? 'on_sale' : 'regular_price',
        
        // Additional fields
        age_group: 'adult',
        gender: 'unisex',
        shipping_weight: '1 kg',
        
        // Facebook specific fields
        fb_product_category: 'Electronics',
        visibility: 'published',
        
        // Timestamps
        created_time: product.created_at,
        updated_time: product.updated_at
      };
    }) || [];

    // Return response with proper headers for Facebook Commerce Manager
    const response = NextResponse.json({
      success: true,
      total_products: facebookProducts.length,
      products: facebookProducts,
      feed_info: {
        title: 'Technirvor Product Catalog',
        description: 'Complete product feed for Facebook Commerce Manager',
        link: process.env.NEXT_PUBLIC_SITE_URL || 'https://technirvor.com',
        updated: new Date().toISOString()
      }
    });

    // Set headers for Facebook Commerce Manager compatibility
    response.headers.set('Content-Type', 'application/json');
    response.headers.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;
  } catch (error) {
    console.error('Facebook Commerce API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to generate product feed for Facebook Commerce Manager'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}