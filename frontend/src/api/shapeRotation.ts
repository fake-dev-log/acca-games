import { types } from '@wails/go/models';
import { GetPaginatedShapeRotationSessionsWithResults } from '@wails/go/main/App';

export const getPaginatedShapeRotationSessionsWithResults = (
  page: number,
  limit: number,
): Promise<types.PaginatedShapeRotationSessions> => {
  return GetPaginatedShapeRotationSessionsWithResults(page, limit);
};
