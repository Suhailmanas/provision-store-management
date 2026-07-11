'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProducts, addPurchase } from '@/app/actions/products'
import { useLanguage } from '@/components/language-provider'
import LoadingScreen from '@/components/loading-screen'

type Type = { id: string; variantName: string; size?: string | null; unit: string; buyingPrice: string; activeStatus: boolean }
type Product = { id: string; name: string; expiryTracking?: boolean; variants: Type[] }

export default function PurchasesForm() {
  const router = useRouter(); const { t } = useLanguage()
  const [products, setProducts] = useState<Product[]>([]); const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [priceOverride, setPriceOverride] = useState(false)
  const [formData, setFormData] = useState({ productId: '', variantId: '', quantity: 0, cost: 0, purchaseDate: new Date().toISOString().split('T')[0], batchNumber: '', expiryDate: '' })
  useEffect(() => { getProducts().then((data) => setProducts(data as Product[])).catch(console.error) }, [])
  const product = products.find((item) => item.id === formData.productId)
  const types = product?.variants.filter((type) => type.activeStatus) ?? []
  const type = types.find((item) => item.id === formData.variantId)
  useEffect(() => { if (type && !priceOverride) setFormData((current) => ({ ...current, cost: Number(type.buyingPrice) })) }, [type, priceOverride])
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(''); setLoading(true)
    try {
      if (!formData.productId || !formData.variantId) throw new Error(`${t('common.selectProduct')} / ${t('common.selectType')}`)
      if (formData.quantity <= 0 || formData.cost <= 0) throw new Error('Enter a quantity and buying price')
      await addPurchase({ ...formData, quantity: Number(formData.quantity), cost: Number(formData.cost), batchNumber: formData.batchNumber || undefined, expiryDate: formData.expiryDate || undefined })
      router.push('/')
    } catch (err) { setError(err instanceof Error ? err.message : t('purchases.recordFailed')) } finally { setLoading(false) }
  }
  return <div className="relative">{loading && <LoadingScreen message={t('purchases.recording')} />}<form onSubmit={submit} className="rounded-lg border border-gray-200 bg-white p-6">
    {error && <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
    <Select label={t('common.product')} value={formData.productId} disabled={loading} onChange={(value) => { setPriceOverride(false); setFormData((current) => ({ ...current, productId: value, variantId: '', cost: 0 })) }}><option value="">{t('common.selectProduct')}</option>{products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
    <Select label={t('common.type')} value={formData.variantId} disabled={loading || !product} onChange={(value) => { setPriceOverride(false); setFormData((current) => ({ ...current, variantId: value, cost: 0 })) }}><option value="">{t('common.selectType')}</option>{types.map((item) => <option key={item.id} value={item.id}>{item.variantName}{item.size ? ` (${item.size})` : ''}</option>)}</Select>
    {type && <div className="mb-4 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">{t('common.masterPrice')}: <b>₹{type.buyingPrice}</b> {t('common.perUnit', { unit: type.unit })}</div>}
    <div className="mb-4 grid grid-cols-2 gap-4"><NumberField label={t('common.quantity')} value={formData.quantity} onChange={(value) => setFormData({ ...formData, quantity: value })} disabled={loading} /><NumberField label={t('purchases.costPerUnit')} value={formData.cost} step="0.01" onChange={(value) => setFormData({ ...formData, cost: value })} disabled={loading || !priceOverride} /></div>
    {type && <label className="mb-4 flex items-center text-sm font-medium"><input type="checkbox" checked={priceOverride} onChange={(event) => setPriceOverride(event.target.checked)} className="mr-2" />{t('common.overridePrice')}</label>}
    {product?.expiryTracking && <><TextField label={t('common.batchNumber')} value={formData.batchNumber} onChange={(value) => setFormData({ ...formData, batchNumber: value })} disabled={loading} /><div className="mb-4"><label className="mb-2 block text-sm font-medium">{t('common.expiryDate')}</label><input type="date" value={formData.expiryDate} onChange={(event) => setFormData({ ...formData, expiryDate: event.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2" /></div></>}
    {formData.quantity > 0 && formData.cost > 0 && <div className="mb-4 rounded border border-blue-200 bg-blue-50 p-3"><p className="text-sm text-gray-600">{t('common.totalCost')}</p><p className="text-2xl font-bold text-blue-600">₹{(formData.quantity * formData.cost).toFixed(2)}</p></div>}
    <div className="mb-4"><label className="mb-2 block text-sm font-medium">{t('common.date')}</label><input type="date" value={formData.purchaseDate} onChange={(event) => setFormData({ ...formData, purchaseDate: event.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2" /></div><button disabled={loading} className="w-full rounded-lg bg-green-600 px-4 py-3 font-bold text-white">{t('purchases.recordButton')}</button><button type="button" onClick={() => router.back()} className="mt-2 w-full rounded-lg bg-gray-200 px-4 py-3">{t('common.cancel')}</button>
  </form></div>
}
function Select({ label, value, disabled, onChange, children }: { label: string; value: string; disabled?: boolean; onChange: (value: string) => void; children: React.ReactNode }) { return <div className="mb-4"><label className="mb-2 block text-sm font-medium">{label}</label><select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2">{children}</select></div> }
function NumberField({ label, value, disabled, onChange, step }: { label: string; value: number; disabled?: boolean; onChange: (value: number) => void; step?: string }) { return <div><label className="mb-2 block text-sm font-medium">{label}</label><input type="number" min="0" step={step} value={value} disabled={disabled} onChange={(event) => onChange(Number(event.target.value) || 0)} className="w-full rounded-lg border border-gray-300 px-4 py-2" /></div> }
function TextField({ label, value, disabled, onChange }: { label: string; value: string; disabled?: boolean; onChange: (value: string) => void }) { return <div className="mb-4"><label className="mb-2 block text-sm font-medium">{label}</label><input value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2" /></div> }
