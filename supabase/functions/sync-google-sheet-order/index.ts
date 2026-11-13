// chantan:public
import { corsHeaders, handleCors } from '../_shared/cors.ts'

const SHEETS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwRlLFrQfNESvMo4ugpn9p2uUb1_5r2C30iH6G78YXCBhwUepFCeIQxUvdqC4O6fOmz/exec'

type OrderItem = { id: string; volume: '50 ml' | '100 ml'; qty: number }
type Product = { id: string; name: string; price_50: number; price_100: number; in_stock: boolean }

const reply = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
const clean = (value: unknown, max = 500) => typeof value === 'string' ? value.trim().slice(0, max) : ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCors()
  if (req.method !== 'POST') return reply(405, { ok: false, error: 'Method not allowed' })

  try {
    const token = Deno.env.get('GOOGLE_SHEETS_SYNC_TOKEN')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    if (!token || !supabaseUrl || !anonKey) return reply(503, { ok: false, error: 'Sync is not configured' })

    const input = await req.json()
    const customer_name = clean(input.customer_name, 120)
    const phone = clean(input.phone, 50)
    const city = clean(input.city, 120)
    const address = clean(input.address, 500)
    const promo_code = clean(input.promo_code, 32).toUpperCase()
    const items = input.items as OrderItem[]
    if (!customer_name || !phone || !city || !address || !Array.isArray(items) || !items.length || items.length > 30) {
      return reply(400, { ok: false, error: 'Invalid order details' })
    }
    if (promo_code && promo_code !== 'LUXE10') return reply(400, { ok: false, error: 'Invalid promo code' })
    if (items.some((item) => !item || !/^[0-9a-f-]{36}$/i.test(item.id) || !['50 ml', '100 ml'].includes(item.volume) || !Number.isInteger(item.qty) || item.qty < 1 || item.qty > 99)) {
      return reply(400, { ok: false, error: 'Invalid order items' })
    }

    const ids = [...new Set(items.map((item) => item.id))]
    const params = new URLSearchParams({ select: 'id,name,price_50,price_100,in_stock', id: `in.(${ids.join(',')})` })
    const productsResponse = await fetch(`${supabaseUrl}/rest/v1/products?${params}`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    })
    if (!productsResponse.ok) throw new Error('Product prices could not be confirmed')
    const products = await productsResponse.json() as Product[]
    const byId = new Map(products.map((product) => [product.id, product]))
    let subtotal = 0
    const pricedItems = items.map((item) => {
      const product = byId.get(item.id)
      if (!product || !product.in_stock) throw new Error('A selected perfume is unavailable')
      const price = Number(item.volume === '100 ml' ? product.price_100 : product.price_50)
      if (!Number.isFinite(price) || price < 0) throw new Error('A product price is invalid')
      subtotal += price * item.qty
      return { id: product.id, name: product.name, volume: item.volume, price, qty: item.qty }
    })
    const normalizedCity = city.toLocaleLowerCase('en')
    const delivery_fee = normalizedCity === 'nador' ? 0 : ['casablanca', 'rabat'].includes(normalizedCity) ? 30 : 40
    const discount_amount = promo_code === 'LUXE10' ? Math.round(subtotal * 0.1 * 100) / 100 : 0
    const order = {
      id: crypto.randomUUID(), customer_name, phone, city, address,
      items: pricedItems,
      total: Math.max(0, subtotal - discount_amount + delivery_fee),
      status: 'Pending', created_at: new Date().toISOString(),
      delivery_fee, discount_amount, promo_code: promo_code || '',
    }

    const sheetResponse = await fetch(SHEETS_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, order }),
      redirect: 'follow',
    })
    const result = await sheetResponse.json().catch(() => null)
    if (!sheetResponse.ok || !result?.ok) return reply(502, { ok: false, error: 'Google Sheets did not confirm the order' })
    return reply(200, { ok: true })
  } catch (error) {
    console.error('Google Sheets order sync failed:', error instanceof Error ? error.message : 'Unknown error')
    return reply(502, { ok: false, error: 'Google Sheets sync failed' })
  }
})
