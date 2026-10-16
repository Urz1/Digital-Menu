import { MenuItem, Offer, DishReview, Restaurant } from '@/types/database';

export type SyncEvent =
  | { type: 'ITEM_UPDATED'; item: MenuItem }
  | { type: 'ITEM_DELETED'; itemId: string }
  | { type: 'ITEMS_REFRESH' }
  | { type: 'REVIEW_SUBMITTED'; review: DishReview }
  | { type: 'REVIEW_UPDATED'; review: DishReview }
  | { type: 'OFFER_UPDATED'; offer: Offer }
  | { type: 'OFFERS_REFRESH' }
  | { type: 'RESTAURANT_UPDATED'; restaurant: Restaurant };

const CHANNEL_NAME = 'digital_menu_sync_v1';

let broadcastChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  } catch {
    broadcastChannel = null;
  }
}

/**
 * Broadcast an update to all open tabs / windows in this browser.
 */
export function broadcastSync(event: SyncEvent): void {
  if (typeof window === 'undefined') return;

  // 1. Send via BroadcastChannel (instant cross-tab communication)
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(event);
    } catch {
      // Ignore transfer errors
    }
  }

  // 2. Dispatch custom event for same-window components
  window.dispatchEvent(new CustomEvent('digital-menu-sync', { detail: event }));

  // 3. Trigger cross-tab storage event
  try {
    localStorage.setItem('digital_menu_last_sync', JSON.stringify({ event, ts: Date.now() }));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Subscribe to cross-tab updates. Returns cleanup function.
 */
export function subscribeSync(onEvent: (event: SyncEvent) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleBroadcast = (e: MessageEvent<SyncEvent>) => {
    if (e.data && e.data.type) {
      onEvent(e.data);
    }
  };

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<SyncEvent>;
    if (custom.detail && custom.detail.type) {
      onEvent(custom.detail);
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === 'digital_menu_last_sync' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed.event) {
          onEvent(parsed.event);
        }
      } catch {
        // Ignore JSON error
      }
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }
  window.addEventListener('digital-menu-sync', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('digital-menu-sync', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}
