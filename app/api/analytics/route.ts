import { NextRequest, NextResponse } from 'next/server';

// In-memory real-time store (use Redis in production)
const analyticsStore = new Map<string, any>();
const SESSIONS = new Map<string, { startTime: number; pages: string[]; referrer: string; country: string; device: string; os: string; browser: string }>();

// Generate realistic demo data that matches your Vercel screenshot (526 visitors, 3221 pageviews)
function generateDemoData(days: number) {
  const now = Date.now();
  const data: any = {
    visitors: 0,
    pageviews: 0,
    bounceRate: 0,
    avgDuration: 0,
    timeSeries: [],
    topPages: [],
    topReferrers: [],
    countries: [],
    devices: [],
    browsers: [],
    os: [],
    routes: [],
    hostnames: [],
    utmParams: [],
  };

  // Match your actual numbers from Vercel
  const baseVisitors = days === 1 ? 80 : days === 7 ? 526 : days === 30 ? 2100 : 6300;
  const basePageviews = days === 1 ? 450 : days === 7 ? 3221 : days === 30 ? 12800 : 38400;

  // Generate time series
  const points = days === 1 ? 24 : days;
  for (let i = 0; i < points; i++) {
    const date = new Date(now - (points - i) * (days === 1 ? 3600000 : 86400000));
    const label = days === 1 
      ? date.toLocaleTimeString('en-US', { hour: '2-digit' })
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const visitors = Math.round(baseVisitors / points * (0.7 + Math.random() * 0.6));
    const pageviews = Math.round(visitors * (4 + Math.random() * 3));
    
    data.timeSeries.push({
      date: label,
      visitors,
      pageviews,
      bounceRate: Math.round(25 + Math.random() * 20),
      avgDuration: Math.round(120 + Math.random() * 240),
    });
  }

  data.visitors = data.timeSeries.reduce((s: number, d: any) => s + d.visitors, 0);
  data.pageviews = data.timeSeries.reduce((s: number, d: any) => s + d.pageviews, 0);
  data.bounceRate = Math.round(data.timeSeries.reduce((s: number, d: any) => s + d.bounceRate, 0) / points);
  data.avgDuration = Math.round(data.timeSeries.reduce((s: number, d: any) => s + d.avgDuration, 0) / points);

  // Top Pages
  const pages = ['/', '/typing-test', '/notes', '/about', '/contact', '/mock-test', '/practice', '/results', '/leaderboard', '/profile'];
  data.topPages = pages.map((p, i) => ({
    path: p,
    visitors: Math.round(baseVisitors * (0.3 - i * 0.025)),
    pageviews: Math.round(basePageviews * (0.25 - i * 0.02)),
    trend: Math.round((Math.random() - 0.5) * 40),
  })).filter((p: any) => p.visitors > 0);

  // Top Referrers
  const referrers = ['google.com', 'direct', 'facebook.com', 'twitter.com', 'github.com', 'reddit.com', 'linkedin.com', 'bing.com'];
  data.topReferrers = referrers.map((r, i) => ({
    hostname: r,
    visitors: Math.round(baseVisitors * (0.4 - i * 0.04)),
    pageviews: Math.round(basePageviews * (0.35 - i * 0.035)),
    trend: Math.round((Math.random() - 0.5) * 30),
  })).filter((r: any) => r.visitors > 0);

  // Countries
  const countries = ['India', 'United States', 'United Kingdom', 'Canada', 'Germany', 'Australia', 'France', 'Brazil', 'Japan', 'South Korea'];
  data.countries = countries.map((c, i) => ({
    name: c,
    visitors: Math.round(baseVisitors * (0.5 - i * 0.04)),
    pageviews: Math.round(basePageviews * (0.45 - i * 0.035)),
    percentage: 0,
  })).map((c: any, _: number, arr: any[]) => ({ ...c, percentage: Math.round((c.visitors / arr[0].visitors) * 100) }));

  // Devices
  data.devices = [
    { name: 'Desktop', visitors: Math.round(baseVisitors * 0.45), value: 45 },
    { name: 'Mobile', visitors: Math.round(baseVisitors * 0.48), value: 48 },
    { name: 'Tablet', visitors: Math.round(baseVisitors * 0.07), value: 7 },
  ];

  // Browsers
  data.browsers = [
    { name: 'Chrome', visitors: Math.round(baseVisitors * 0.62), value: 62 },
    { name: 'Safari', visitors: Math.round(baseVisitors * 0.18), value: 18 },
    { name: 'Firefox', visitors: Math.round(baseVisitors * 0.12), value: 12 },
    { name: 'Edge', visitors: Math.round(baseVisitors * 0.06), value: 6 },
    { name: 'Other', visitors: Math.round(baseVisitors * 0.02), value: 2 },
  ];

  // OS
  data.os = [
    { name: 'Windows', visitors: Math.round(baseVisitors * 0.38), value: 38 },
    { name: 'Android', visitors: Math.round(baseVisitors * 0.28), value: 28 },
    { name: 'iOS', visitors: Math.round(baseVisitors * 0.20), value: 20 },
    { name: 'macOS', visitors: Math.round(baseVisitors * 0.12), value: 12 },
    { name: 'Linux', visitors: Math.round(baseVisitors * 0.02), value: 2 },
  ];

  // Routes
  data.routes = pages.slice(0, 6).map((p, i) => ({
    route: p,
    visitors: Math.round(baseVisitors * (0.25 - i * 0.03)),
    pageviews: Math.round(basePageviews * (0.22 - i * 0.025)),
  }));

  // Hostnames
  data.hostnames = [
    { name: 'cpct-in.vercel.app', visitors: Math.round(baseVisitors * 0.95), pageviews: Math.round(basePageviews * 0.94) },
    { name: 'www.cpct.in', visitors: Math.round(baseVisitors * 0.05), pageviews: Math.round(basePageviews * 0.06) },
  ];

  // UTM Parameters
  data.utmParams = [
    { source: 'google', medium: 'organic', campaign: 'seo', visitors: Math.round(baseVisitors * 0.4) },
    { source: 'facebook', medium: 'social', campaign: 'summer2026', visitors: Math.round(baseVisitors * 0.15) },
    { source: 'newsletter', medium: 'email', campaign: 'weekly', visitors: Math.round(baseVisitors * 0.1) },
    { source: 'direct', medium: 'none', campaign: 'none', visitors: Math.round(baseVisitors * 0.35) },
  ];

  return data;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'all';
    const days = parseInt(searchParams.get('days') || '7');
    const tab = searchParams.get('tab') || 'overview';

    const cacheKey = `${days}-${tab}`;
    
    // Return cached or generate new
    if (!analyticsStore.has(cacheKey) || Math.random() > 0.9) {
      analyticsStore.set(cacheKey, generateDemoData(days));
    }

    const data = analyticsStore.get(cacheKey);

    // Real-time additions
    const realtime = {
      activeUsers: Math.floor(3 + Math.random() * 12),
      lastMinuteViews: Math.floor(2 + Math.random() * 8),
      lastMinuteVisitors: Math.floor(1 + Math.random() * 5),
    };

    switch (endpoint) {
      case 'realtime':
        return NextResponse.json({ success: true, data: realtime });
      case 'overview':
        return NextResponse.json({
          success: true,
          data: {
            visitors: { total: data.visitors, trend: 33 },
            pageviews: { total: data.pageviews, trend: 36 },
            bounceRate: { total: data.bounceRate, trend: -9 },
            avgDuration: { total: data.avgDuration, trend: 12 },
            timeSeries: data.timeSeries,
          }
        });
      case 'pages':
        return NextResponse.json({ success: true, data: { pages: data.topPages, routes: data.routes, hostnames: data.hostnames } });
      case 'referrers':
        return NextResponse.json({ success: true, data: { referrers: data.topReferrers, utm: data.utmParams } });
      case 'geo':
        return NextResponse.json({ success: true, data: { countries: data.countries } });
      case 'tech':
        return NextResponse.json({ success: true, data: { devices: data.devices, browsers: data.browsers, os: data.os } });
      case 'all':
      default:
        return NextResponse.json({
          success: true,
          data: {
            ...data,
            realtime,
          },
          timestamp: new Date().toISOString(),
        });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}