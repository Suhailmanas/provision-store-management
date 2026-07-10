// IndexedDB utilities for offline support

const DB_NAME = 'kirana-store-db'
const DB_VERSION = 1

export interface SyncItem {
  id: string
  type: 'product' | 'sale' | 'purchase' | 'daily-close'
  data: Record<string, any>
  timestamp: number
  synced: boolean
}

class OfflineDB {
  private db: IDBDatabase | null = null

  async init() {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create stores for offline data
        if (!db.objectStoreNames.contains('sync-queue')) {
          db.createObjectStore('sync-queue', { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains('products')) {
          const store = db.createObjectStore('products', { keyPath: 'id' })
          store.createIndex('userId', 'userId', { unique: false })
        }

        if (!db.objectStoreNames.contains('sales')) {
          const store = db.createObjectStore('sales', { keyPath: 'id' })
          store.createIndex('userId', 'userId', { unique: false })
        }

        if (!db.objectStoreNames.contains('purchases')) {
          const store = db.createObjectStore('purchases', { keyPath: 'id' })
          store.createIndex('userId', 'userId', { unique: false })
        }
      }
    })
  }

  async addToSyncQueue(type: string, data: Record<string, any>) {
    if (!this.db) await this.init()

    const item: SyncItem = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type: type as any,
      data,
      timestamp: Date.now(),
      synced: false,
    }

    return new Promise<SyncItem>((resolve, reject) => {
      const transaction = this.db!.transaction(['sync-queue'], 'readwrite')
      const store = transaction.objectStore('sync-queue')
      const request = store.add(item)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(item)
    })
  }

  async getSyncQueue() {
    if (!this.db) await this.init()

    return new Promise<SyncItem[]>((resolve, reject) => {
      const transaction = this.db!.transaction(['sync-queue'], 'readonly')
      const store = transaction.objectStore('sync-queue')
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async markAsSynced(id: string) {
    if (!this.db) await this.init()

    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(['sync-queue'], 'readwrite')
      const store = transaction.objectStore('sync-queue')
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const item = getRequest.result
        if (item) {
          item.synced = true
          const updateRequest = store.put(item)
          updateRequest.onerror = () => reject(updateRequest.error)
          updateRequest.onsuccess = () => resolve()
        }
      }

      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async clearSyncQueue() {
    if (!this.db) await this.init()

    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(['sync-queue'], 'readwrite')
      const store = transaction.objectStore('sync-queue')
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async saveProduct(product: Record<string, any>) {
    if (!this.db) await this.init()

    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(['products'], 'readwrite')
      const store = transaction.objectStore('products')
      const request = store.put(product)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getProducts(userId: string) {
    if (!this.db) await this.init()

    return new Promise<Record<string, any>[]>((resolve, reject) => {
      const transaction = this.db!.transaction(['products'], 'readonly')
      const store = transaction.objectStore('products')
      const index = store.index('userId')
      const request = index.getAll(userId)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }
}

export const offlineDB = new OfflineDB()

// Network status utilities
export function isOnline() {
  return navigator.onLine
}

export function onOnline(callback: () => void) {
  window.addEventListener('online', callback)
  return () => window.removeEventListener('online', callback)
}

export function onOffline(callback: () => void) {
  window.addEventListener('offline', callback)
  return () => window.removeEventListener('offline', callback)
}
