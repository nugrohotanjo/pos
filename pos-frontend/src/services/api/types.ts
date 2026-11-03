export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  status?: string;
  order?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}
