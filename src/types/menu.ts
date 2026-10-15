import { MenuItem, ItemOption } from './database';

export interface CartItem {
  cartId: string;
  item: MenuItem;
  quantity: number;
  options: ItemOption[];
  notes?: string;
  unitPrice: number;
}

export type DietaryFilter = 
  | 'all'
  | 'onOffer'
  | 'chefsPick'
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'halal'
  | 'spicy'
  | 'nut-free'
  | 'favorites';

export type SortOrder = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

export type SupportedLocale = 'en' | 'es';
