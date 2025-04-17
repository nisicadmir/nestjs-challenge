export interface ISort {
  sortBy: string;
  sortOrder: 1 | -1;
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}
