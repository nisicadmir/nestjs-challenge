/**
 * Helper methods for pagination.
 */
import { SortOrder, ISort } from './paginate.model';

export const getLimit = (limit: number, maximumLimit: number = 200) => {
  return limit && limit > 0 ? Math.min(limit, maximumLimit) : maximumLimit;
};

export const getSortOrder = (sort: string): 1 | -1 | null => {
  if (!sort) {
    return -1;
  }

  return sort === SortOrder.ASC ? 1 : -1;
};

// const next = 'next' in data && data.next ? JSON.parse(Buffer.from(data.next, 'base64').toString('utf8')) : null;
export const parseNextPageToken = (
  next: string,
): { _id: string; [key: string]: any } | null => {
  return next ? JSON.parse(Buffer.from(next, 'base64').toString('utf8')) : null;
};

export const generateNextPageToken = (
  items: any[],
  sort: ISort | null,
  limit: number,
): string | null => {
  if (!sort || items.length === 0 || limit > items.length) {
    return null;
  }

  const item = items[items.length - 1];
  const nextObject = { _id: item._id, [sort.sortBy]: item[sort.sortBy] };
  return Buffer.from(JSON.stringify(nextObject), 'utf8').toString('base64');
};

export function generatePaginationQuery(
  query: any,
  sort: ISort | null,
  nextObject?: { _id: string; [key: string]: any },
): any {
  if (!nextObject || !sort) {
    return query;
  }

  const sortField = sort.sortBy;
  const sortOperator = sort.sortOrder === 1 ? '$gt' : '$lt';
  const sortOperatorEqual = sort.sortOrder === 1 ? '$gte' : '$lte';

  const queryForPagination = [
    { [sortField]: { [sortOperator]: nextObject[sortField] } },
    {
      $and: [
        { [sortField]: nextObject[sortField] },
        { _id: { [sortOperator]: nextObject._id } },
      ],
    },
  ];

  if (query.$and) {
    // Add filter which will exclude all those items above/below the previous next item.
    query.$and.push({
      [sortField]: { [sortOperatorEqual]: nextObject[sortField] },
    });
    query.$and.push({ $or: queryForPagination });
    return query;
  }

  return { $and: [query, { $or: queryForPagination }] };
}
