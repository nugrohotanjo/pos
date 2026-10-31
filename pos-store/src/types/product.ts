import React from 'react';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  tag: string;
  stockNote: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export type CartState = Record<number, number>;