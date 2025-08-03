# Cloudflare Security Configuration for Tech Nirvor

This document outlines the recommended Cloudflare dashboard settings to maximize security and performance for your e-commerce platform.

## 🛡️ Security Settings

### 1. SSL/TLS Configuration
- **SSL/TLS encryption mode**: Full (strict)
- **Always Use HTTPS**: ON
- **HTTP Strict Transport Security (HSTS)**: Enabled
  - Max Age Header: 6 months
  - Include Subdomains: ON
  - Preload: ON
- **Minimum TLS Version**: 1.2
- **TLS 1.3**: ON
- **Automatic HTTPS Rewrites**: ON

### 2. Firewall Rules

#### High Priority Rules (Order: 1-5)
```
1. Block Known Bad IPs
   - Expression: (ip.src in $bad_ips)
   - Action: Block

2. Allow Trusted IPs (Admin Access)
   - Expression: (http.request.uri.path contains "/admin" and ip.src in $trusted_ips)
   - Action: Allow

3. Challenge Admin Access
   - Expression: (http.request.uri.path contains "/admin")
   - Action: Managed Challenge

4. Rate Limit API Endpoints
   - Expression: (http.request.uri.path contains "/api/")
   - Action: Rate Limit (100 requests per 15 minutes)

5. Block Suspicious Countries (if needed)
   - Expression: (ip.geoip.country in {"CN" "RU" "KP"})
   - Action: Block
```

### 3. Rate Limiting

#### API Protection
- **Threshold**: 100 requests per 15 minutes
- **Path**: `/api/*`
- **Action**: Block for 1 hour

#### Admin Protection
- **Threshold**: 50 requests per 15 minutes
- **Path**: `/admin/*`
- **Action**: Managed Challenge

#### Login Protection
- **Threshold**: 5 requests per 15 minutes
- **Path**: `/auth/login`
- **Action**: Block for 1 hour

### 4. Bot Fight Mode
- **Bot Fight Mode**: ON
- **Super Bot Fight Mode**: ON (if available)
- **Challenge Passage**: 30 minutes

### 5. DDoS Protection
- **DDoS Protection**: Enabled (automatic)
- **HTTP DDoS Attack Protection**: High sensitivity
- **Network-layer DDoS Attack Protection**: High sensitivity

### 6. WAF (Web Application Firewall)
- **Security Level**: High
- **Challenge Passage**: 30 minutes
- **Browser Integrity Check**: ON

#### Managed Rules
- **Cloudflare Managed Ruleset**: ON
- **Cloudflare OWASP Core Ruleset**: ON
- **Cloudflare Exposed Credentials Check**: ON

### 7. Page Rules for Security

```
1. Admin Area Security
   URL: technirvor.com/admin/*
   Settings:
   - Security Level: High
   - Cache Level: Bypass
   - Disable Apps
   - Disable Performance

2. API Security
   URL: technirvor.com/api/*
   Settings:
   - Security Level: High
   - Cache Level: Bypass
   - Browser Integrity Check: ON

3. Auth Pages
   URL: technirvor.com/auth/*
   Settings:
   - Security Level: High
   - Cache Level: Bypass
   - Always Use HTTPS: ON
```

## ⚡ Performance Settings

### 1. Caching
- **Caching Level**: Standard
- **Browser Cache TTL**: 4 hours
- **Always Online**: ON
- **Development Mode**: OFF (production)

### 2. Speed Optimization
- **Auto Minify**: 
  - JavaScript: ON
  - CSS: ON
  - HTML: ON
- **Brotli**: ON
- **Early Hints**: ON
- **HTTP/2**: ON
- **HTTP/3 (with QUIC)**: ON
- **0-RTT Connection Resumption**: ON

### 3. Mobile Optimization
- **Mirage**: ON
- **Polish**: Lossless
- **WebP**: ON
- **Rocket Loader**: OFF (can break React apps)

## 🌍 Network Settings

### 1. DNS
- **Proxy Status**: Proxied (orange cloud) for main domain
- **DNSSEC**: Enabled

### 2. IP Geolocation
- **IP Geolocation**: ON (for country-based features)

### 3. IPv6 Compatibility
- **IPv6 Compatibility**: ON

## 📊 Analytics & Monitoring

### 1. Analytics
- **Web Analytics**: ON
- **Bot Analytics**: ON

### 2. Logs
- **Logpush**: Configure for security monitoring
- **Real-time Logs**: Enable for critical events

## 🔧 Advanced Security Features

### 1. Access (Zero Trust)
- Configure for admin access if needed
- Set up identity providers
- Create access policies

### 2. Workers (if using)
- Deploy security workers for custom logic
- Rate limiting workers
- Bot detection workers

### 3. Load Balancing
- Health checks for origin servers
- Failover configuration
- Geographic steering

## 🚨 Security Monitoring

### 1. Security Events to Monitor
- Failed login attempts
- Admin access patterns
- API abuse
- DDoS attacks
- Bot traffic
- Geographic anomalies

### 2. Alerts Setup
- Configure email alerts for:
  - High threat levels
  - DDoS attacks
  - Origin server issues
  - SSL certificate expiration

### 3. Regular Security Reviews
- Weekly: Review security events
- Monthly: Update firewall rules
- Quarterly: Security audit
- Annually: Penetration testing

## 📋 Implementation Checklist

### Phase 1: Basic Security (Immediate)
- [ ] Enable SSL/TLS Full (strict)
- [ ] Configure basic firewall rules
- [ ] Enable Bot Fight Mode
- [ ] Set up rate limiting
- [ ] Configure security headers

### Phase 2: Advanced Security (Week 1)
- [ ] Implement WAF rules
- [ ] Configure page rules
- [ ] Set up monitoring alerts
- [ ] Enable advanced DDoS protection
- [ ] Configure IP geolocation

### Phase 3: Optimization (Week 2)
- [ ] Fine-tune caching rules
- [ ] Optimize performance settings
- [ ] Set up analytics
- [ ] Configure load balancing
- [ ] Implement custom workers

### Phase 4: Monitoring & Maintenance (Ongoing)
- [ ] Regular security reviews
- [ ] Performance monitoring
- [ ] Log analysis
- [ ] Rule optimization
- [ ] Threat intelligence updates

## 🔗 Additional Resources

- [Cloudflare Security Center](https://www.cloudflare.com/security-center/)
- [Cloudflare Learning Center](https://www.cloudflare.com/learning/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Bangladesh Cyber Security Guidelines](https://cirt.gov.bd/)

## 📞 Emergency Contacts

- **Cloudflare Support**: Available 24/7 for Enterprise plans
- **Security Team**: [Your internal security contact]
- **Development Team**: [Your development team contact]

---

**Note**: This configuration is optimized for a Bangladesh-based e-commerce platform. Adjust settings based on your specific requirements and compliance needs.

**Last Updated**: January 2025
**Review Schedule**: Monthly