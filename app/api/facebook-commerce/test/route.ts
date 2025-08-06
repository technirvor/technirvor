import { NextRequest, NextResponse } from "next/server";

// Test page for Facebook Commerce API formats
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Facebook Commerce API Test</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .format-link { 
          display: inline-block; 
          margin: 10px; 
          padding: 10px 20px; 
          background: #1877f2; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px;
        }
        .format-link:hover { background: #166fe5; }
        .info { background: #f0f2f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <h1>Facebook Commerce Manager Product Feed API</h1>
      
      <div class="info">
        <h3>✅ API Status: Active</h3>
        <p>The API supports multiple formats required by Facebook Commerce Manager:</p>
        <ul>
          <li><strong>CSV</strong> - Comma Separated Values (Default)</li>
          <li><strong>TSV</strong> - Tab Separated Values</li>
          <li><strong>XML/RSS</strong> - RSS/ATOM XML format</li>
        </ul>
      </div>
      
      <h2>Test Different Formats:</h2>
      
      <a href="${baseUrl}/api/facebook-commerce/products?format=csv" class="format-link" download="products.csv">
        📄 Download CSV Format
      </a>
      
      <a href="${baseUrl}/api/facebook-commerce/products?format=tsv" class="format-link" download="products.tsv">
        📊 Download TSV Format
      </a>
      
      <a href="${baseUrl}/api/facebook-commerce/products?format=xml" class="format-link" download="products.xml">
        🔗 Download XML/RSS Format
      </a>
      
      <a href="${baseUrl}/api/facebook-commerce/products" class="format-link" download="products.csv">
        📋 Default Format (CSV)
      </a>
      
      <div class="info">
        <h3>Usage Instructions:</h3>
        <p><strong>For Facebook Commerce Manager:</strong></p>
        <ol>
          <li>Use the CSV or TSV format URL in your Facebook Commerce Manager</li>
          <li>Set up automatic sync using: <code>${baseUrl}/api/facebook-commerce/products?format=csv</code></li>
          <li>The feed updates automatically with your latest products</li>
        </ol>
        
        <p><strong>Current Status:</strong> ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
