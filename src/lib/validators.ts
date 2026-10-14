import { z } from 'zod';

export const orderItemSchema = z.object({
  item_id: z.string().min(1, 'Item ID required'),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  selected_options: z.array(z.object({
    name: z.string(),
    price: z.number().nonnegative()
  })),
  notes: z.string().max(250).optional(),
  line_total: z.number().nonnegative()
});

export const createOrderSchema = z.object({
  restaurant_id: z.string().uuid().or(z.string().min(1)),
  table_number: z.string().min(1, 'Table number is required').max(30),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  total: z.number().positive(),
  notes: z.string().max(500).optional(),
});

export const serviceRequestSchema = z.object({
  restaurant_id: z.string().min(1),
  table_number: z.string().min(1).max(30),
  request_type: z.enum(['waiter', 'water', 'cutlery', 'bill']),
});

export const updateItemAvailabilitySchema = z.object({
  item_id: z.string().min(1),
  is_available: z.boolean(),
});

export const updateItemPriceSchema = z.object({
  item_id: z.string().min(1),
  price: z.number().positive(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>;
