import { types } from '@wails/go/models';
import { GetPaginatedNumberPressingSessionsWithResults } from '@wails/go/main/App';

export const getPaginatedNumberPressingSessionsWithResults = (
  page: number,
  limit: number,
): Promise<types.PaginatedNumberPressingSessions> => {
  return GetPaginatedNumberPressingSessionsWithResults(page, limit);
};
