export interface IResponse {
  status?: number;
  success?: boolean;
  message?: string;
  data?: object;
}

export interface IPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  empty: boolean;
}