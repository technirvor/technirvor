import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';

// Helper functions for different formats
function generateCSV(products: any[]): string {
  if (products.length === 0) return '';
  
  const headers = Object.keys(products[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = products.map(product => 
    headers.map(header => {
      const value = product[header] || '';
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
}

function generateTSV(products: any[]): string {
  if (products.length === 0) return '';
  
  const headers = Object.keys(products[0]);
  const tsvHeaders = headers.join('\t');
  
  const tsvRows = products.map(product => 
    headers.map(header => {
      const value = product[header] || '';
      // Replace tabs and newlines in TSV
      return typeof value === 'string' ? value.replace(/[\t\n\r]/g, ' ') : value;
    }).join('\t')
  );
  
  return [tsvHeaders, ...tsvRows].join('\n');
}

function generateXML(products: any[]): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const rssStart = '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n<channel>\n';
  const channelInfo = `  <title>Technirvor Product Catalog</title>\n  <link>${process.env.NEXT_PUBLIC_SITE_URL || 'https://technirvor.com'}</link>\n  <description>Complete product feed for Facebook Commerce Manager</description>\n`;
  
  const items = products.map(product => {
    return `  <item>\n` +
      Object.entries(product).map(([key, value]) => {
        const xmlKey = key.replace(/_/g, ':');
        const xmlValue = typeof value === 'string' ? 
          value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : 
          value;
        return `    <g:${xmlKey}>${xmlValue}</g:${xmlKey}>`;
      }).join('\n') +
      `\n  </item>`;
  }).join('\n');
  
  const rssEnd = '\n</channel>\n</rss>';
  
  return xmlHeader + rssStart + channelInfo + items + rssEnd;
}

// Facebook Commerce Manager Product Feed API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv'; // Default to CSV
    
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
      const mainImage = product.images && product.images.length > 0 ? product.images[0] : product.image_url;
      
      return {
        // Required fields for Facebook Commerce
        id: product.id.toString(),
        title: product.name,
        description: (product.description || '').replace(/[\r\n\t]/g, ' ').replace(/"/g, '""'),
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
        created_time: product.created_at
      };
    }) || [];

    // Generate response based on format
    let responseContent: string;
    let contentType: string;
    let filename: string;

    switch (format.toLowerCase()) {
      case 'csv':
        responseContent = generateCSV(facebookProducts);
        contentType = 'text/csv';
        filename = 'products.csv';
        break;
      case 'tsv':
        responseContent = generateTSV(facebookProducts);
        contentType = 'text/tab-separated-values';
        filename = 'products.tsv';
        break;
      case 'xml':
      case 'rss':
      case 'atom':
        responseContent = generateXML(facebookProducts);
        contentType = 'application/xml';
        filename = 'products.xml';
        break;
      default:
        responseContent = generateCSV(facebookProducts);
        contentType = 'text/csv';
        filename = 'products.csv';
    }

    // Return response with proper headers for Facebook Commerce Manager
    const response = new NextResponse(responseContent);
    response.headers.set('Content-Type', contentType);
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);
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