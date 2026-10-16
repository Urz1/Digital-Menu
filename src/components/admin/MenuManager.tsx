'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Restaurant, Category, MenuItem, ScheduledMenu, MenuVersion, UserRole } from '@/types/database';
import { formatMoney, triggerHaptic } from '@/lib/utils';
import {
  exportMenuToCsv,
  parseMenuFromCsv,
  applyBulkPriceChange,
} from '@/lib/admin-engine';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Upload,
  Download,
  Check,
  X,
  Edit2,
  Trash2,
  Copy,
  Archive,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  History,
  Clock,
  Sparkles,
  Flame,
  CheckCircle2,
  DollarSign,
  Layers,
  Percent,
  Sliders,
  Eye,
  Camera,
  Info,
} from 'lucide-react';

interface MenuManagerProps {
  restaurant: Restaurant;
  categories: Category[];
  menuItems: MenuItem[];
  scheduledMenus: ScheduledMenu[];
  menuVersions: MenuVersion[];
  userRole: UserRole;
  onSaveItem: (item: Partial<MenuItem>) => Promise<MenuItem>;
  onDuplicateItem: (itemId: string) => Promise<void>;
  onArchiveItem: (itemId: string, archived: boolean) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onBulkUpdate: (itemIds: string[], updates: Partial<MenuItem>) => Promise<void>;
  onReorderItems: (reordered: MenuItem[]) => void;
  onSaveCategory: (cat: Partial<Category>) => Promise<Category>;
  onSaveScheduledMenu: (menu: ScheduledMenu) => Promise<void>;
  onCreateVersion: (label: string) => Promise<void>;
  onRestoreVersion: (versionId: string) => Promise<void>;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  isAddModalOpenInitially?: boolean;
  onCloseAddModal?: () => void;
}

function compressImage(file: File, maxDim = 800, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve((e.target?.result as string) || '');
        }
      };
      img.onerror = () => resolve((e.target?.result as string) || '');
      img.src = (e.target?.result as string) || '';
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export function MenuManager({
  restaurant,
  categories,
  menuItems,
  scheduledMenus,
  menuVersions,
  userRole,
  onSaveItem,
  onDuplicateItem,
  onArchiveItem,
  onDeleteItem,
  onBulkUpdate,
  onReorderItems,
  onSaveCategory,
  onSaveScheduledMenu,
  onCreateVersion,
  onRestoreVersion,
  onShowToast,
  isAddModalOpenInitially = false,
  onCloseAddModal,
}: MenuManagerProps) {
  const isStaff = userRole === 'staff';

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'sold_out' | 'draft' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'sort_order' | 'name' | 'price_asc' | 'price_desc'>('sort_order');

  // Bulk Selection
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Modal States
  const [isDishModalOpen, setIsDishModalOpen] = useState(isAddModalOpenInitially);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
  const [isSchedulesModalOpen, setIsSchedulesModalOpen] = useState(false);
  const [newVersionLabel, setNewVersionLabel] = useState('');

  // Bulk Price Dialog State
  const [bulkPriceType, setBulkPriceType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [bulkPriceValue, setBulkPriceValue] = useState<string>('10');
  const [bulkPriceDirection, setBulkPriceDirection] = useState<'increase' | 'decrease'>('increase');

  // Inline editing state: { itemId: string, field: 'name' | 'price', value: string }
  const [inlineEditing, setInlineEditing] = useState<{ id: string; field: 'name' | 'price'; value: string } | null>(null);

  // CSV file input ref
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));
      if (!match) return false;
    }

    // Category
    if (selectedCategoryId !== 'all' && item.category_id !== selectedCategoryId) {
      return false;
    }

    // Status filter
    if (statusFilter === 'available' && (!item.is_available || item.is_archived || item.is_draft)) return false;
    if (statusFilter === 'sold_out' && item.is_available) return false;
    if (statusFilter === 'draft' && !item.is_draft) return false;
    if (statusFilter === 'archived' && !item.is_archived) return false;
    if (statusFilter !== 'archived' && item.is_archived) return false; // hide archived by default

    return true;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    return a.sort_order - b.sort_order;
  });

  // Toggle item availability
  const handleToggleSoldOut = async (item: MenuItem) => {
    triggerHaptic(12);
    const updated = await onSaveItem({
      ...item,
      is_available: !item.is_available,
    });
    onShowToast(
      updated.is_available
        ? `"${item.name}" is now available to order.`
        : `"${item.name}" marked as sold out today.`,
      'info'
    );
  };

  // Reordering handlers (up / down)
  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (isStaff) return;
    const newItems = [...filteredItems];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    triggerHaptic(10);
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    // Recalculate sort_order
    const updatedWithOrder = newItems.map((it, idx) => ({ ...it, sort_order: idx + 1 }));
    onReorderItems(updatedWithOrder);
    onShowToast('Dishes reordered successfully.', 'success');
  };

  // Save inline edit
  const handleSaveInline = async (item: MenuItem) => {
    if (!inlineEditing || inlineEditing.id !== item.id) return;
    triggerHaptic(10);

    let updates: Partial<MenuItem> = {};
    if (inlineEditing.field === 'name') {
      if (!inlineEditing.value.trim()) {
        setInlineEditing(null);
        return;
      }
      updates = { name: inlineEditing.value.trim() };
    } else if (inlineEditing.field === 'price') {
      const parsed = parseFloat(inlineEditing.value);
      if (isNaN(parsed) || parsed < 0) {
        setInlineEditing(null);
        return;
      }
      updates = { price: Math.round(parsed * 100) / 100 };
    }

    await onSaveItem({ ...item, ...updates });
    setInlineEditing(null);
    onShowToast('Changes saved.', 'success');
  };

  // Bulk Selection Toggles
  const handleToggleSelectAll = () => {
    if (selectedItemIds.size === filteredItems.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(filteredItems.map((i) => i.id)));
    }
  };

  const handleToggleSelectItem = (id: string) => {
    const next = new Set(selectedItemIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedItemIds(next);
  };

  // Apply Bulk Price Changes
  const handleApplyBulkPrices = async () => {
    triggerHaptic(15);
    const numVal = parseFloat(bulkPriceValue) || 0;
    const finalDelta = bulkPriceDirection === 'decrease' ? -numVal : numVal;

    const ids = Array.from(selectedItemIds);
    const updatedList = applyBulkPriceChange(
      menuItems,
      ids,
      bulkPriceType === 'percentage' ? 'percent' : 'amount',
      finalDelta
    );

    for (const item of updatedList) {
      if (ids.includes(item.id)) {
        await onSaveItem(item);
      }
    }

    setIsBulkPriceModalOpen(false);
    setSelectedItemIds(new Set());
    onShowToast(`Updated prices for ${ids.length} dishes.`, 'success');
  };

  // CSV Export
  const handleExportCsv = () => {
    triggerHaptic(10);
    const csvStr = exportMenuToCsv(menuItems, categories);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${restaurant.slug}-menu-export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Menu CSV exported successfully.', 'success');
  };

  // CSV Import
  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = parseMenuFromCsv(text, restaurant.id, categories[0]?.id || 'cat-starters');
        if (parsed.items.length > 0) {
          for (const item of parsed.items) {
            await onSaveItem(item);
          }
          onShowToast(`Imported ${parsed.items.length} dishes from CSV.`, 'success');
        } else {
          onShowToast(parsed.errors[0] || 'No dishes found in CSV.', 'error');
        }
      } catch (err) {
        onShowToast('Failed to parse CSV file. Please check headers.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-6 pb-20 max-w-7xl mx-auto w-full">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-white">Menu & Dish Management</h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-neutral-300">
              {menuItems.length} items
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            {isStaff
              ? 'Quickly toggle sold out items for service.'
              : 'Add, organize, schedule, and price dishes with instant live updates.'}
          </p>
        </div>

        {/* Primary Controls (Only for Owner) */}
        {!isStaff && (
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                triggerHaptic(10);
                setIsVersionsModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/5"
            >
              <History className="w-3.5 h-3.5" />
              <span>Versions</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic(10);
                setIsSchedulesModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/5"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Schedules</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/5"
              title="Download menu CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <label className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5 border border-white/5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Import</span>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCsv}
                className="hidden"
              />
            </label>

            <button
              onClick={() => {
                triggerHaptic(12);
                setEditingItem({
                  restaurant_id: restaurant.id,
                  category_id: categories[0]?.id || 'cat-starters',
                  name: '',
                  price: 15.0,
                  image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
                  tags: [],
                  allergens: [],
                  spice_level: 0,
                  is_available: true,
                  is_chefs_pick: false,
                  is_draft: false,
                });
                setIsDishModalOpen(true);
              }}
              data-testid="add-dish-button"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Dish</span>
            </button>
          </div>
        )}
      </div>

      {/* Search, Category Filter, and View Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-[#12141C] border border-white/5">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              data-testid="menu-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, tags, or ingredients..."
              className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 max-w-[160px] truncate"
          >
            <option value="all" className="bg-[#12141C]">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#12141C]">
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status and Sort Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="all" className="bg-[#12141C]">All Statuses</option>
            <option value="available" className="bg-[#12141C]">Available Only</option>
            <option value="sold_out" className="bg-[#12141C]">Sold Out</option>
            <option value="draft" className="bg-[#12141C]">Drafts</option>
            <option value="archived" className="bg-[#12141C]">Archived</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="sort_order" className="bg-[#12141C]">Menu Order</option>
            <option value="name" className="bg-[#12141C]">Alphabetical</option>
            <option value="price_asc" className="bg-[#12141C]">Price: Low to High</option>
            <option value="price_desc" className="bg-[#12141C]">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Sticky Bar (when items are selected) */}
      {!isStaff && selectedItemIds.size > 0 && (
        <div className="sticky top-4 z-30 p-3.5 rounded-2xl bg-amber-600/95 backdrop-blur-md text-white shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-black/30 flex items-center justify-center text-xs font-bold">
              {selectedItemIds.size}
            </span>
            <span className="text-xs font-bold">dishes selected</span>
            <button
              onClick={() => setSelectedItemIds(new Set())}
              className="text-xs underline text-amber-100 hover:text-white ml-2"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={async () => {
                await onBulkUpdate(Array.from(selectedItemIds), { is_available: true });
                setSelectedItemIds(new Set());
                onShowToast('Marked selected dishes as available.', 'success');
              }}
              className="px-3 py-1.5 rounded-xl bg-black/25 hover:bg-black/40 text-xs font-bold transition-colors"
            >
              Mark Available
            </button>

            <button
              onClick={async () => {
                await onBulkUpdate(Array.from(selectedItemIds), { is_available: false });
                setSelectedItemIds(new Set());
                onShowToast('Marked selected dishes as sold out.', 'info');
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-xs font-bold transition-colors"
            >
              Mark Sold Out
            </button>

            <button
              onClick={() => setIsBulkPriceModalOpen(true)}
              data-testid="bulk-price-modal-trigger"
              className="px-3 py-1.5 rounded-xl bg-black/25 hover:bg-black/40 text-xs font-bold transition-colors flex items-center gap-1"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Change Prices</span>
            </button>

            <button
              onClick={async () => {
                await onBulkUpdate(Array.from(selectedItemIds), { is_archived: true });
                setSelectedItemIds(new Set());
                onShowToast('Archived selected dishes.', 'info');
              }}
              className="px-3 py-1.5 rounded-xl bg-black/25 hover:bg-black/40 text-xs font-bold transition-colors flex items-center gap-1"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive</span>
            </button>
          </div>
        </div>
      )}

      {/* Dish List Table / Cards */}
      <div className="rounded-2xl bg-[#12141C] border border-white/5 overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 border-b border-white/10 text-xs font-semibold text-neutral-400 bg-white/[0.02]">
          <div className="col-span-1 flex items-center gap-2">
            {!isStaff && (
              <input
                type="checkbox"
                checked={selectedItemIds.size > 0 && selectedItemIds.size === filteredItems.length}
                onChange={handleToggleSelectAll}
                className="w-4 h-4 rounded bg-white/10 border-white/20 text-amber-500 cursor-pointer"
              />
            )}
            <span>#</span>
          </div>
          <div className="col-span-5">Dish & Details</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2 text-right">Availability & Actions</div>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto text-neutral-500 mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No dishes match your filter</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
              Try adjusting your search query, selecting "All Categories", or creating a new dish.
            </p>
          </div>
        )}

        {/* Dish Rows */}
        <div className="divide-y divide-white/5">
          {filteredItems.map((item, index) => {
            const category = categories.find((c) => c.id === item.category_id);
            const isSelected = selectedItemIds.has(item.id);

            return (
              <div
                key={item.id}
                data-testid={`dish-row-${item.id}`}
                className={`p-4 md:px-5 md:py-3.5 grid grid-cols-1 md:grid-cols-12 gap-3 items-center transition-colors ${
                  isSelected ? 'bg-amber-500/10' : 'hover:bg-white/[0.02]'
                }`}
              >
                {/* Checkbox & Order controls */}
                <div className="col-span-1 flex items-center gap-2">
                  {!isStaff && (
                    <input
                      type="checkbox"
                      data-testid="dish-select-checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectItem(item.id)}
                      className="w-4 h-4 rounded bg-white/10 border-white/20 text-amber-500 cursor-pointer"
                    />
                  )}

                  {!isStaff && sortBy === 'sort_order' && (
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleMoveItem(index, 'up')}
                        disabled={index === 0}
                        className="text-neutral-500 hover:text-white disabled:opacity-20 transition-colors"
                        title="Move up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveItem(index, 'down')}
                        disabled={index === filteredItems.length - 1}
                        className="text-neutral-500 hover:text-white disabled:opacity-20 transition-colors"
                        title="Move down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <span className="text-xs text-neutral-500 font-mono hidden md:inline">
                    {index + 1}
                  </span>
                </div>

                {/* Dish Essentials & Inline Name Edit */}
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <div style={{ position: 'relative' }} className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0 border border-white/10">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Inline Name Edit */}
                    {!isStaff && inlineEditing?.id === item.id && inlineEditing.field === 'name' ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={inlineEditing.value}
                          onChange={(e) =>
                            setInlineEditing({ ...inlineEditing, value: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveInline(item);
                            if (e.key === 'Escape') setInlineEditing(null);
                          }}
                          autoFocus
                          className="px-2 py-1 bg-white/10 border border-amber-500 rounded text-xs text-white w-full focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveInline(item)}
                          className="p-1 rounded bg-amber-500 text-black hover:bg-amber-400"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span
                          onClick={() => {
                            if (!isStaff) {
                              setInlineEditing({ id: item.id, field: 'name', value: item.name });
                            }
                          }}
                          className={`text-sm font-bold text-white truncate ${
                            !isStaff ? 'hover:text-amber-400 cursor-pointer' : ''
                          }`}
                          title={!isStaff ? 'Click to edit name' : undefined}
                        >
                          {item.name}
                        </span>

                        {item.is_chefs_pick && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 uppercase">
                            Chef's Pick
                          </span>
                        )}
                        {item.is_draft && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-500/20 text-blue-300 uppercase">
                            Draft
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-neutral-400 truncate mt-0.5">
                      {item.description || 'No description provided.'}
                    </p>

                    {/* Tags row */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {item.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.2 rounded text-[10px] bg-white/5 text-neutral-400 capitalize"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Category badge */}
                <div className="col-span-2 hidden md:flex items-center gap-1.5 text-xs text-neutral-300">
                  <span>{category?.icon || '🍽️'}</span>
                  <span className="truncate">{category?.name || 'Uncategorized'}</span>
                </div>

                {/* Price & Inline Price Edit */}
                <div className="col-span-2">
                  {!isStaff && inlineEditing?.id === item.id && inlineEditing.field === 'price' ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.25"
                        value={inlineEditing.value}
                        onChange={(e) =>
                          setInlineEditing({ ...inlineEditing, value: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveInline(item);
                          if (e.key === 'Escape') setInlineEditing(null);
                        }}
                        autoFocus
                        className="px-2 py-1 bg-white/10 border border-amber-500 rounded text-xs text-white font-mono w-24 focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveInline(item)}
                        className="p-1 rounded bg-amber-500 text-black hover:bg-amber-400"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        if (!isStaff) {
                          setInlineEditing({
                            id: item.id,
                            field: 'price',
                            value: item.price.toString(),
                          });
                        }
                      }}
                      className={`text-sm font-extrabold font-mono text-white ${
                        !isStaff ? 'hover:text-amber-400 cursor-pointer' : ''
                      }`}
                      title={!isStaff ? 'Click to edit price' : undefined}
                    >
                      {formatMoney(item.price, restaurant.currency)}
                    </div>
                  )}
                </div>

                {/* Availability Toggle & Actions */}
                <div className="col-span-2 flex items-center justify-between md:justify-end gap-2.5">
                  {/* One-Tap Sold Out Today Toggle */}
                  <button
                    onClick={() => handleToggleSoldOut(item)}
                    data-testid={`sold-out-toggle-${item.id}`}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      item.is_available
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.is_available ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                    />
                    <span>{item.is_available ? 'Available' : 'Sold Out Today'}</span>
                  </button>

                  {/* Edit & More menu for Owner */}
                  {!isStaff && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          triggerHaptic(8);
                          setEditingItem({ ...item });
                          setIsDishModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                        title="Edit dish"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={async () => {
                          triggerHaptic(10);
                          await onDuplicateItem(item.id);
                          onShowToast(`Duplicated "${item.name}".`, 'success');
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                        title="Duplicate dish"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={async () => {
                          if (confirm(`Archive "${item.name}"? It can be restored anytime.`)) {
                            triggerHaptic(10);
                            await onArchiveItem(item.id, true);
                            onShowToast(`Archived "${item.name}".`, 'info');
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-rose-400 transition-colors"
                        title="Archive dish"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DISH ADD / EDIT MODAL */}
      {isDishModalOpen && editingItem && (
        <div
          data-testid="dish-form-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-2xl bg-[#12141C] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  {editingItem.id ? 'Edit Dish' : 'Add New Dish'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsDishModalOpen(false);
                  if (onCloseAddModal) onCloseAddModal();
                }}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* ESSENTIALS FIRST */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Essentials First
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Dish Name *
                    </label>
                    <input
                      type="text"
                      data-testid="dish-form-name"
                      value={editingItem.name || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      placeholder="e.g. Truffle Burrata & Heirloom Crudo"
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Price ({restaurant.currency}) *
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      data-testid="dish-form-price"
                      value={editingItem.price ?? ''}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="18.50"
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Category *
                    </label>
                    <select
                      data-testid="dish-form-category"
                      value={editingItem.category_id || categories[0]?.id}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, category_id: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#12141C]">
                          {c.icon} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Dish Photo (Camera Snapshot, Gallery, or URL)
                    </label>

                    {/* Live Image Preview */}
                    {editingItem.image_url && (
                      <div className="relative w-full h-36 rounded-xl overflow-hidden mb-2 border border-white/10 group bg-neutral-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={editingItem.image_url}
                          alt="Dish preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, image_url: '' })}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Direct Camera Capture & Gallery Upload Buttons */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <label className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold cursor-pointer transition-colors active:scale-95">
                        <Camera className="w-4 h-4" />
                        <span>Take Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          data-testid="dish-camera-input"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              onShowToast('Optimizing photo...', 'info');
                              const compressed = await compressImage(file);
                              if (compressed) {
                                triggerHaptic(12);
                                setEditingItem({ ...editingItem, image_url: compressed });
                                onShowToast('Photo optimized & loaded!', 'success');
                              }
                            }
                          }}
                        />
                      </label>

                      <label className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 text-xs font-bold cursor-pointer transition-colors active:scale-95">
                        <Upload className="w-4 h-4" />
                        <span>From Gallery</span>
                        <input
                          type="file"
                          accept="image/*"
                          data-testid="dish-gallery-input"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              onShowToast('Optimizing photo...', 'info');
                              const compressed = await compressImage(file);
                              if (compressed) {
                                triggerHaptic(12);
                                setEditingItem({ ...editingItem, image_url: compressed });
                                onShowToast('Photo optimized from gallery!', 'success');
                              }
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingItem.image_url || ''}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, image_url: e.target.value })
                        }
                        placeholder="Or paste image URL (https://...)"
                        className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Photo Tips Box */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5 text-xs text-neutral-400">
                  <Camera className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Instant Capture Tip:</span> Snap food straight from your phone camera or select from your gallery. Photos are instantly compressed for ultra-fast mobile customer viewing.
                  </div>
                </div>
              </div>

              {/* "MORE OPTIONS" ACCORDION */}
              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsMoreOptionsOpen(!isMoreOptionsOpen)}
                  data-testid="toggle-more-options"
                  className="w-full py-2 flex items-center justify-between text-xs font-bold text-amber-400 hover:text-amber-300"
                >
                  <span>
                    {isMoreOptionsOpen ? '− Hide optional details' : '+ More options (allergens, spice, calories, tags, schedule)'}
                  </span>
                  {isMoreOptionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isMoreOptionsOpen && (
                  <div className="space-y-4 pt-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">
                        Description (English)
                      </label>
                      <textarea
                        rows={2}
                        value={editingItem.description || ''}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, description: e.target.value })
                        }
                        placeholder="Artisanal textures, flavors, pairings..."
                        className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Trilingual Localization Fields (Amharic & Somali) */}
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                      <div className="text-xs font-bold text-amber-300">
                        Multilingual Translations (Amharic & Somali)
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                            Name (Amharic - አማርኛ)
                          </label>
                          <input
                            type="text"
                            value={editingItem.name_am || ''}
                            onChange={(e) =>
                              setEditingItem({ ...editingItem, name_am: e.target.value })
                            }
                            placeholder="የምግብ ስም በአማርኛ"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                            Name (Somali - Af-Soomaali)
                          </label>
                          <input
                            type="text"
                            value={editingItem.name_so || ''}
                            onChange={(e) =>
                              setEditingItem({ ...editingItem, name_so: e.target.value })
                            }
                            placeholder="Magaca cuntada ee Soomaaliga"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                            Description (Amharic - አማርኛ)
                          </label>
                          <textarea
                            rows={2}
                            value={editingItem.description_am || ''}
                            onChange={(e) =>
                              setEditingItem({ ...editingItem, description_am: e.target.value })
                            }
                            placeholder="የምግቡ ዝርዝር መግለጫ..."
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                            Description (Somali - Af-Soomaali)
                          </label>
                          <textarea
                            rows={2}
                            value={editingItem.description_so || ''}
                            onChange={(e) =>
                              setEditingItem({ ...editingItem, description_so: e.target.value })
                            }
                            placeholder="Faahfaahinta cuntada..."
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">
                          Spice Level
                        </label>
                        <select
                          value={editingItem.spice_level ?? 0}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              spice_level: parseInt(e.target.value, 10),
                            })
                          }
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                        >
                          <option value={0} className="bg-[#12141C]">0 - Not Spicy</option>
                          <option value={1} className="bg-[#12141C]">1 - Mild</option>
                          <option value={2} className="bg-[#12141C]">2 - Medium</option>
                          <option value={3} className="bg-[#12141C]">3 - Hot</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">
                          Calories (kcal)
                        </label>
                        <input
                          type="number"
                          value={editingItem.calories ?? ''}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              calories: parseInt(e.target.value, 10) || undefined,
                            })
                          }
                          placeholder="e.g. 540"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-300 mb-1">
                          Custom Badge
                        </label>
                        <input
                          type="text"
                          value={editingItem.custom_badge || ''}
                          onChange={(e) =>
                            setEditingItem({ ...editingItem, custom_badge: e.target.value })
                          }
                          placeholder="e.g. House Special"
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Common Allergens checkboxes */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        Allergens
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['Dairy', 'Gluten', 'Nuts', 'Seafood', 'Egg', 'Soy'].map((all) => {
                          const hasAllergen = editingItem.allergens?.includes(all);
                          return (
                            <button
                              key={all}
                              type="button"
                              onClick={() => {
                                const current = editingItem.allergens || [];
                                const updated = hasAllergen
                                  ? current.filter((a) => a !== all)
                                  : [...current, all];
                                setEditingItem({ ...editingItem, allergens: updated });
                              }}
                              className={`px-3 py-1 rounded-xl text-xs font-medium border transition-colors ${
                                hasAllergen
                                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                                  : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                              }`}
                            >
                              {all}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dietary Tags */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        Dietary Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['vegetarian', 'vegan', 'gluten-free', 'halal', 'chefsPick'].map((tag) => {
                          const hasTag = editingItem.tags?.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                const current = editingItem.tags || [];
                                const updated = hasTag
                                  ? current.filter((t) => t !== tag)
                                  : [...current, tag];
                                setEditingItem({
                                  ...editingItem,
                                  tags: updated,
                                  is_chefs_pick: tag === 'chefsPick' ? !hasTag : editingItem.is_chefs_pick,
                                });
                              }}
                              className={`px-3 py-1 rounded-xl text-xs font-medium capitalize border transition-colors ${
                                hasTag
                                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                  : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Draft vs Published */}
                    <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div>
                        <p className="text-xs font-bold text-white">Save as Draft</p>
                        <p className="text-[11px] text-neutral-400">
                          Draft items are invisible to guests until published.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={editingItem.is_draft ?? false}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, is_draft: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
              <button
                type="button"
                onClick={() => {
                  setIsDishModalOpen(false);
                  if (onCloseAddModal) onCloseAddModal();
                }}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                data-testid="save-dish-button"
                onClick={async () => {
                  if (!editingItem.name?.trim()) {
                    onShowToast('Please provide a dish name.', 'error');
                    return;
                  }
                  triggerHaptic(15);
                  await onSaveItem(editingItem);
                  setIsDishModalOpen(false);
                  if (onCloseAddModal) onCloseAddModal();
                  onShowToast(
                    editingItem.id ? 'Dish updated successfully.' : 'New dish added to menu.',
                    'success'
                  );
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save & Publish Dish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK PRICE CHANGE MODAL */}
      {isBulkPriceModalOpen && (
        <div
          data-testid="bulk-price-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md bg-[#12141C] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Bulk Price Adjustment</h3>
              </div>
              <button
                onClick={() => setIsBulkPriceModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Apply a price change across {selectedItemIds.size || filteredItems.length} dishes.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBulkPriceDirection('increase')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    bulkPriceDirection === 'increase'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-white/10 bg-white/5 text-neutral-400'
                  }`}
                >
                  + Increase Prices
                </button>
                <button
                  type="button"
                  onClick={() => setBulkPriceDirection('decrease')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    bulkPriceDirection === 'decrease'
                      ? 'border-rose-500 bg-rose-500/10 text-rose-300'
                      : 'border-white/10 bg-white/5 text-neutral-400'
                  }`}
                >
                  − Decrease Prices
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Adjustment Type
                  </label>
                  <select
                    value={bulkPriceType}
                    onChange={(e) => setBulkPriceType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="percentage" className="bg-[#12141C]">Percentage (%)</option>
                    <option value="fixed_amount" className="bg-[#12141C]">Fixed Amount ({restaurant.currency})</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Value
                  </label>
                  <input
                    type="number"
                    data-testid="bulk-price-input-value"
                    value={bulkPriceValue}
                    onChange={(e) => setBulkPriceValue(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsBulkPriceModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="apply-bulk-price-btn"
                onClick={handleApplyBulkPrices}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all"
              >
                Apply to Selected Dishes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERSION HISTORY DRAWER / MODAL */}
      {isVersionsModalOpen && (
        <div
          data-testid="menu-versions-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg bg-[#12141C] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Menu Version Snapshots</h3>
              </div>
              <button
                onClick={() => setIsVersionsModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Restore past menu states with one tap. Changes are backed up before every major update.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newVersionLabel}
                onChange={(e) => setNewVersionLabel(e.target.value)}
                placeholder="Snapshot label (e.g. Pre-Summer Menu)"
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={async () => {
                  if (!newVersionLabel.trim()) return;
                  await onCreateVersion(newVersionLabel.trim());
                  setNewVersionLabel('');
                  onShowToast('Created new menu version snapshot.', 'success');
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                Save Snapshot
              </button>
            </div>

            <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
              {menuVersions.map((ver) => (
                <div key={ver.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-white">{ver.label}</p>
                    <p className="text-[10px] text-neutral-400">
                      {new Date(ver.created_at).toLocaleString()} • {ver.items_snapshot.length} items
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (confirm(`Restore snapshot "${ver.label}"? Current menu will be replaced.`)) {
                        await onRestoreVersion(ver.id);
                        setIsVersionsModalOpen(false);
                        onShowToast(`Restored version: ${ver.label}`, 'success');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-amber-400 transition-colors"
                  >
                    Restore
                  </button>
                </div>
              ))}
              {menuVersions.length === 0 && (
                <p className="py-6 text-center text-xs text-neutral-500">No versions saved yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULED MENUS MODAL */}
      {isSchedulesModalOpen && (
        <div
          data-testid="scheduled-menus-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg bg-[#12141C] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Scheduled Menus</h3>
              </div>
              <button
                onClick={() => setIsSchedulesModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Automatically swap or highlight menus (Breakfast, Lunch, Dinner, Late Night) based on the current time of day.
            </p>

            <div className="space-y-3">
              {scheduledMenus.map((sched) => (
                <div
                  key={sched.id}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-white">{sched.name}</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {sched.start_time} – {sched.end_time} • {sched.category_ids.length} categories
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      await onSaveScheduledMenu({
                        ...sched,
                        is_active: !sched.is_active,
                      });
                      onShowToast(
                        `${sched.name} schedule is now ${!sched.is_active ? 'active' : 'paused'}.`,
                        'info'
                      );
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      sched.is_active
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/10 text-neutral-400'
                    }`}
                  >
                    {sched.is_active ? 'Active' : 'Paused'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
