'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Language = 'en' | 'ta'

type TranslationParams = Record<string, string | number>

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, params?: TranslationParams) => string
  formatDate: (value: Date | string) => string
  unitLabel: (unit: string) => string
}

const LANGUAGE_STORAGE_KEY = 'Manas-language'

const translations: Record<Language, Record<string, string>> = {
  en: {
    'common.cancel': 'Cancel',
    'common.date': 'Date',
    'common.search': 'Search products...',
    'common.save': 'Save',
    'common.close': 'Close',
    'common.selectProduct': 'Select a product',
    'common.quantity': 'Quantity *',
    'common.product': 'Product *',
    'common.pleaseWait': 'Please wait...',
    'language.english': 'English',
    'language.tamil': 'Tamil',
    'nav.dashboard': 'Dashboard',
    'nav.products': 'Products',
    'nav.addSale': 'Add Sale',
    'nav.purchases': 'Purchases',
    'nav.reports': 'Reports',
    'dashboard.title': 'Manas Store',
    'dashboard.subtitle': 'Inventory Management',
    'dashboard.products': 'Products',
    'dashboard.totalStock': 'Total Stock',
    'dashboard.todaysSales': "Today's Sales",
    'dashboard.revenue': 'Revenue',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.sale': 'Sale',
    'dashboard.purchase': 'Purchase',
    'dashboard.product': 'Product',
    'dashboard.dailyClose': 'Daily Close',
    'dashboard.lowStockTitle': 'Low Stock Alert',
    'dashboard.lowStockMessage': '{count} product(s) have low stock',
    'dashboard.viewProducts': 'View products',
    'auth.createAccount': 'Create an account',
    'auth.welcomeBack': 'Welcome back',
    'auth.signUpIntro': 'Sign up to get started',
    'auth.signInIntro': 'Sign in to your account to continue',
    'auth.name': 'Name',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.authUnavailable': 'Authentication unavailable',
    'auth.createAccountButton': 'Create account',
    'auth.signInButton': 'Sign in',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.noAccount': "Don't have an account?",
    'auth.signUpLink': 'Sign up',
    'auth.signInLink': 'Sign in',
    'auth.fullNameRequired': 'Please enter your full name.',
    'auth.serverUnavailable': 'Unable to reach the server right now.',
    'page.productsTitle': 'Products',
    'page.productsSubtitle': 'Manage your inventory',
    'page.newProductTitle': 'Add New Product',
    'page.newProductSubtitle': 'Create a new inventory item',
    'page.editProductTitle': 'Edit Product',
    'page.editProductSubtitle': 'Update inventory item details',
    'page.purchasesTitle': 'Purchases',
    'page.purchasesSubtitle': 'Purchase history',
    'page.newPurchaseTitle': 'Add Purchase',
    'page.newPurchaseSubtitle': 'Record new stock purchase',
    'page.newSaleTitle': 'Record Sale',
    'page.newSaleSubtitle': 'Quick sale entry',
    'page.reportsTitle': 'Reports & Analytics',
    'page.reportsSubtitle': 'View sales and inventory reports',
    'page.dailyCloseTitle': 'Daily Close',
    'page.dailyCloseSubtitle': 'Record end-of-day inventory',
    'products.addNew': '+ Add New Product',
    'products.noProducts': 'No products found',
    'products.createFirst': 'Create your first product',
    'products.lowStock': 'Low Stock Alert ({count})',
    'products.stock': 'Stock',
    'products.edit': 'Edit',
    'products.delete': 'Delete',
    'products.deleteConfirm': 'Are you sure you want to delete this product?',
    'products.deleteFailed': 'Failed to delete product',
    'products.name': 'Product Name *',
    'products.category': 'Category',
    'products.unit': 'Unit *',
    'products.openingStock': 'Opening Stock',
    'products.namePlaceholder': 'e.g., Rice, Flour, Oil',
    'products.categoryPlaceholder': 'e.g., Grains, Spices',
    'products.creating': 'Creating...',
    'products.createButton': 'Create Product',
    'products.updating': 'Updating...',
    'products.updateButton': 'Update Product',
    'products.currentStock': 'Current Stock',
    'products.nameRequired': 'Product name is required',
    'products.unitRequired': 'Unit is required',
    'products.createFailed': 'Failed to create product',
    'products.updateFailed': 'Failed to update product',
    'purchases.newPurchase': '+ New Purchase',
    'purchases.placeholder': 'Purchase history will appear here',
    'purchases.costPerUnit': 'Cost per Unit *',
    'purchases.totalCost': 'Total Cost',
    'purchases.recording': 'Recording...',
    'purchases.recordButton': 'Record Purchase',
    'purchases.selectRequired': 'Please select a product',
    'purchases.quantityRequired': 'Quantity must be greater than 0',
    'purchases.costRequired': 'Cost must be greater than 0',
    'purchases.recordFailed': 'Failed to record purchase',
    'sales.available': 'Available',
    'sales.pricePerUnit': 'Price per Unit *',
    'sales.totalAmount': 'Total Amount',
    'sales.recording': 'Recording...',
    'sales.recordButton': 'Record Sale',
    'sales.selectRequired': 'Please select a product',
    'sales.quantityRequired': 'Quantity must be greater than 0',
    'sales.priceRequired': 'Selling price must be greater than 0',
    'sales.stockRequired': 'Insufficient stock available',
    'sales.recordFailed': 'Failed to record sale',
    'dailyClose.noProducts': 'No products to close',
    'dailyClose.forDate': 'Close inventory for {date}',
    'dailyClose.currentStock': 'Current Stock',
    'dailyClose.expectedStock': 'Expected Stock',
    'dailyClose.difference': 'Difference',
    'dailyClose.alreadyClosed': 'Already closed today',
    'dailyClose.lockedToday': 'Locked because it was already closed today',
    'dailyClose.correctionUnlocked': 'Correction unlocked',
    'dailyClose.unlockCorrection': 'Unlock correction',
    'dailyClose.lockCorrection': 'Lock correction',
    'dailyClose.updateNotice': "You already closed some products today. Submitting again will update today's close instead of creating duplicates.",
    'dailyClose.closingStock': 'Closing Stock',
    'dailyClose.warning':
      "Daily close will lock today's inventory. Tomorrow's opening stock will be set to today's closing stock.",
    'dailyClose.closing': 'Closing...',
    'dailyClose.complete': 'Complete Daily Close',
    'dailyClose.loadFailed': 'Failed to load products',
    'dailyClose.closeFailed': 'Failed to close day',
    'reports.type': 'Report Type',
    'reports.daily': 'Daily Report',
    'reports.weekly': 'Weekly Report',
    'reports.selectDate': 'Select Date',
    'reports.salesSummary': 'Sales Summary',
    'reports.totalSalesQuantity': 'Total Sales Quantity',
    'reports.totalRevenue': 'Total Revenue',
    'reports.averageTransaction': 'Average Transaction',
    'reports.inventoryStatus': 'Inventory Status',
    'reports.totalProducts': 'Total Products',
    'reports.lowStockItems': 'Low Stock Items',
    'reports.export': 'Export Report',
    'reports.downloadPdf': 'Download as PDF',
    'reports.load': 'Load Report',
    'reports.noData': 'No data for selected date',
    'offline.message': 'You are offline - data will sync when back online',
    'unit.pieces': 'Pieces',
    'unit.kg': 'Kg',
    'unit.liter': 'Liter',
    'unit.dozen': 'Dozen',
    'unit.box': 'Box',
    'unit.packet': 'Packet',
  },
  ta: {
    'common.cancel': 'ரத்து செய்',
    'common.date': 'தேதி',
    'common.search': 'பொருட்களை தேடுங்கள்...',
    'common.save': 'சேமிக்கவும்',
    'common.close': 'மூடு',
    'common.selectProduct': 'ஒரு பொருளை தேர்ந்தெடுக்கவும்',
    'common.quantity': 'அளவு *',
    'common.product': 'பொருள் *',
    'common.pleaseWait': 'காத்திருக்கவும்...',
    'language.english': 'ஆங்கிலம்',
    'language.tamil': 'தமிழ்',
    'nav.dashboard': 'முகப்பு',
    'nav.products': 'பொருட்கள்',
    'nav.addSale': 'விற்பனை சேர்க்க',
    'nav.purchases': 'கொள்முதல்',
    'nav.reports': 'அறிக்கைகள்',
    'dashboard.title': 'மணாஸ் ஸ்டோர்ஸ்',
    'dashboard.subtitle': 'சரக்கு மேலாண்மை',
    'dashboard.products': 'பொருட்கள்',
    'dashboard.totalStock': 'மொத்த இருப்பு',
    'dashboard.todaysSales': 'இன்றைய விற்பனை',
    'dashboard.revenue': 'வருவாய்',
    'dashboard.quickActions': 'விரைவு செயல்கள்',
    'dashboard.sale': 'விற்பனை',
    'dashboard.purchase': 'கொள்முதல்',
    'dashboard.product': 'பொருள்',
    'dashboard.dailyClose': 'Daily Close',
    'dashboard.lowStockTitle': 'குறைந்த இருப்பு எச்சரிக்கை',
    'dashboard.lowStockMessage': '{count} பொருட்களில் இருப்பு குறைவாக உள்ளது',
    'dashboard.viewProducts': 'பொருட்களை பார்க்கவும்',
    'auth.createAccount': 'புதிய கணக்கு உருவாக்கவும்',
    'auth.welcomeBack': 'மீண்டும் வரவேற்கிறோம்',
    'auth.signUpIntro': 'தொடங்க பதிவு செய்யவும்',
    'auth.signInIntro': 'தொடர உங்கள் கணக்கில் உள்நுழைக',
    'auth.name': 'பெயர்',
    'auth.email': 'மின்னஞ்சல்',
    'auth.password': 'கடவுச்சொல்',
    'auth.authUnavailable': 'அடையாள சேவை கிடைக்கவில்லை',
    'auth.createAccountButton': 'கணக்கு உருவாக்கவும்',
    'auth.signInButton': 'உள்நுழைக',
    'auth.alreadyHaveAccount': 'ஏற்கனவே கணக்கு உள்ளதா?',
    'auth.noAccount': 'கணக்கு இல்லையா?',
    'auth.signUpLink': 'பதிவு செய்',
    'auth.signInLink': 'உள்நுழைக',
    'auth.fullNameRequired': 'உங்கள் முழு பெயரை உள்ளிடவும்.',
    'auth.serverUnavailable': 'சேவையகத்தை இப்போது அணுக முடியவில்லை.',
    'page.productsTitle': 'பொருட்கள்',
    'page.productsSubtitle': 'உங்கள் சரக்குகளை நிர்வகிக்கவும்',
    'page.newProductTitle': 'புதிய பொருள் சேர்க்கவும்',
    'page.newProductSubtitle': 'புதிய சரக்கு உருப்படியை உருவாக்கவும்',
    'page.purchasesTitle': 'கொள்முதல்',
    'page.purchasesSubtitle': 'கொள்முதல் வரலாறு',
    'page.newPurchaseTitle': 'கொள்முதல் சேர்க்கவும்',
    'page.newPurchaseSubtitle': 'புதிய சரக்கு கொள்முதலை பதிவு செய்யவும்',
    'page.newSaleTitle': 'விற்பனை பதிவு',
    'page.newSaleSubtitle': 'விரைவு விற்பனை பதிவு',
    'page.reportsTitle': 'அறிக்கைகள் மற்றும் பகுப்பாய்வு',
    'page.reportsSubtitle': 'விற்பனை மற்றும் சரக்கு அறிக்கைகளை பார்க்கவும்',
    'page.dailyCloseTitle': 'தினசரி மூடல்',
    'page.dailyCloseSubtitle': 'நாள் முடிவு சரக்கை பதிவு செய்யவும்',
    'products.addNew': '+ புதிய பொருள் சேர்க்கவும்',
    'products.noProducts': 'பொருட்கள் எதுவும் இல்லை',
    'products.createFirst': 'முதல் பொருளை உருவாக்கவும்',
    'products.lowStock': 'குறைந்த இருப்பு எச்சரிக்கை ({count})',
    'products.stock': 'இருப்பு',
    'products.edit': 'திருத்து',
    'products.delete': 'நீக்கு',
    'products.deleteConfirm': 'இந்த பொருளை நீக்க வேண்டுமா?',
    'products.deleteFailed': 'பொருளை நீக்க முடியவில்லை',
    'products.name': 'பொருள் பெயர் *',
    'products.category': 'வகை',
    'products.unit': 'அலகு *',
    'products.openingStock': 'தொடக்க இருப்பு',
    'products.namePlaceholder': 'எ.கா., அரிசி, மாவு, எண்ணெய்',
    'products.categoryPlaceholder': 'எ.கா., தானியங்கள், மசாலா',
    'products.creating': 'உருவாக்கப்படுகிறது...',
    'products.createButton': 'பொருள் உருவாக்கவும்',
    'products.updating': 'புதுப்பிக்கப்பட்டுக் கொண்டிருக்கிறது...',
    'products.updateButton': 'பொருளை புதுப்பிக்கவும்',
    'products.currentStock': 'தற்போதைய இருப்பு',
    'products.nameRequired': 'பொருள் பெயர் தேவை.',
    'products.unitRequired': 'அலகு தேவை.',
    'products.createFailed': 'பொருளை உருவாக்க முடியவில்லை',
    'products.updateFailed': 'பொருளை புதுப்பிக்க முடியவில்லை',
    'purchases.newPurchase': '+ புதிய கொள்முதல்',
    'purchases.placeholder': 'கொள்முதல் வரலாறு இங்கே தோன்றும்',
    'purchases.costPerUnit': 'ஒரு அலகிற்கான செலவு *',
    'purchases.totalCost': 'மொத்த செலவு',
    'purchases.recording': 'பதிவு செய்கிறது...',
    'purchases.recordButton': 'கொள்முதல் பதிவு',
    'purchases.selectRequired': 'ஒரு பொருளை தேர்ந்தெடுக்கவும்',
    'purchases.quantityRequired': 'அளவு 0-ஐ விட அதிகமாக இருக்க வேண்டும்',
    'purchases.costRequired': 'செலவு 0-ஐ விட அதிகமாக இருக்க வேண்டும்',
    'purchases.recordFailed': 'கொள்முதலை பதிவு செய்ய முடியவில்லை',
    'sales.available': 'கிடைக்கும் இருப்பு',
    'sales.pricePerUnit': 'ஒரு அலகிற்கான விலை *',
    'sales.totalAmount': 'மொத்த தொகை',
    'sales.recording': 'பதிவு செய்கிறது...',
    'sales.recordButton': 'விற்பனை பதிவு',
    'sales.selectRequired': 'ஒரு பொருளை தேர்ந்தெடுக்கவும்',
    'sales.quantityRequired': 'அளவு 0-ஐ விட அதிகமாக இருக்க வேண்டும்',
    'sales.priceRequired': 'விற்பனை விலை 0-ஐ விட அதிகமாக இருக்க வேண்டும்',
    'sales.stockRequired': 'போதுமான இருப்பு இல்லை',
    'sales.recordFailed': 'விற்பனையை பதிவு செய்ய முடியவில்லை',
    'dailyClose.noProducts': 'மூடுவதற்கு பொருட்கள் இல்லை',
    'dailyClose.forDate': '{date} க்கான சரக்கை மூடவும்',
    'dailyClose.currentStock': 'தற்போதைய இருப்பு',
    'dailyClose.expectedStock': 'எதிர்பார்க்கப்படும் இருப்பு',
    'dailyClose.difference': 'வேறுபாடு',
    'dailyClose.alreadyClosed': 'இன்று ஏற்கனவே மூடப்பட்டுள்ளது',
    'dailyClose.lockedToday': 'இன்று மூடப்பட்டதால் பூட்டப்பட்டுள்ளது',
    'dailyClose.correctionUnlocked': 'திருத்தம் திறக்கப்பட்டது',
    'dailyClose.unlockCorrection': 'திருத்தத்தை திறக்கவும்',
    'dailyClose.lockCorrection': 'திருத்தத்தை பூட்டு',
    'dailyClose.updateNotice': 'சில பொருட்கள் இன்று ஏற்கனவே மூடப்பட்டுள்ளன. மீண்டும் சமர்ப்பித்தால் புதிய பதிவுகள் உருவாக்கப்படாமல், இன்றைய மூடல் புதுப்பிக்கப்படும்.',
    'dailyClose.closingStock': 'மூடும் இருப்பு',
    'dailyClose.warning':
      'தினசரி மூடல் இன்றைய சரக்கை பூட்டும். நாளைய தொடக்க இருப்பு இன்றைய மூடும் இருப்பாக அமைக்கப்படும்.',
    'dailyClose.closing': 'மூடுகிறது...',
    'dailyClose.complete': 'தினசரி மூடலை முடிக்கவும்',
    'dailyClose.loadFailed': 'பொருட்களை ஏற்ற முடியவில்லை',
    'dailyClose.closeFailed': 'நாளை மூட முடியவில்லை',
    'reports.type': 'அறிக்கை வகை',
    'reports.daily': 'தினசரி அறிக்கை',
    'reports.weekly': 'வாராந்திர அறிக்கை',
    'reports.selectDate': 'தேதியை தேர்ந்தெடுக்கவும்',
    'reports.salesSummary': 'விற்பனை சுருக்கம்',
    'reports.totalSalesQuantity': 'மொத்த விற்பனை அளவு',
    'reports.totalRevenue': 'மொத்த வருவாய்',
    'reports.averageTransaction': 'சராசரி பரிவர்த்தனை',
    'reports.inventoryStatus': 'சரக்கு நிலை',
    'reports.totalProducts': 'மொத்த பொருட்கள்',
    'reports.lowStockItems': 'குறைந்த இருப்பு பொருட்கள்',
    'reports.export': 'அறிக்கையை ஏற்றுமதி செய்',
    'reports.downloadPdf': 'PDF ஆக பதிவிறக்கவும்',
    'reports.load': 'அறிக்கையை ஏற்று',
    'reports.noData': 'தேர்ந்தெடுத்த தேதிக்கு தரவு இல்லை',
    'offline.message': 'நீங்கள் இணையம் இன்றி உள்ளீர்கள் - இணையம் திரும்பியதும் தரவு ஒத்திசைக்கப்படும்',
    'unit.pieces': 'துண்டுகள்',
    'unit.kg': 'கிலோ',
    'unit.liter': 'லிட்டர்',
    'unit.dozen': 'டஜன்',
    'unit.box': 'பெட்டி',
    'unit.packet': 'பாக்கெட்',
  },
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function interpolate(template: string, params?: TranslationParams) {
  if (!params) {
    return template
  }

  return Object.entries(params).reduce(
    (value, [key, replacement]) => value.replaceAll(`{${key}}`, String(replacement)),
    template
  )
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (savedLanguage === 'en' || savedLanguage === 'ta') {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = useCallback((value: Language) => {
    setLanguageState(value)
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, value)
  }, [])

  const t = useCallback(
    (key: string, params?: TranslationParams) => {
      const template = translations[language][key] ?? translations.en[key] ?? key
      return interpolate(template, params)
    },
    [language]
  )

  const formatDate = useCallback(
    (value: Date | string) => {
      const date = value instanceof Date ? value : new Date(value)
      return new Intl.DateTimeFormat(language === 'ta' ? 'ta-IN' : 'en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date)
    },
    [language]
  )

  const unitLabel = useCallback(
    (unit: string) => {
      const unitKey = `unit.${unit.toLowerCase()}`
      return translations[language][unitKey] ?? translations.en[unitKey] ?? unit
    },
    [language]
  )

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      formatDate,
      unitLabel,
    }),
    [formatDate, language, setLanguage, t, unitLabel]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }

  return context
}

