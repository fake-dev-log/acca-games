// 게임 기록 저장소 — 브라우저 IndexedDB 에 세션 단위로 저장한다.
// 세션 하나 = 레코드 하나(설정 + 결과 전체). id 는 엔진이 게임 시작 시 만든 sessionId(시작 시각 ms)라서
// 같은 세션을 여러 번 저장해도(StrictMode 이중 실행 등) 한 건으로 덮인다.

export interface GameRecord<S = unknown, R = unknown> {
  id: number;
  gameCode: string;
  playedAt: string; // ISO 8601
  settings: S;
  results: R[];
}

export interface RecordPage<S = unknown, R = unknown> {
  records: GameRecord<S, R>[];
  totalCount: number;
}

const DB_NAME = 'acca-games';
const DB_VERSION = 1;
const STORE = 'records';
const BY_GAME = 'byGame'; // [gameCode, id]

function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// factory 를 생략하면 브라우저의 indexedDB 를 쓰고, null 이면 저장소가 없는 환경으로 본다.
// 저장소가 막힌 환경(일부 사생활 보호 모드)에서는 indexedDB 접근 자체가 예외를 던지므로 처음 열 때 읽는다.
export function createRecordStore(factory?: IDBFactory | null) {
  let dbPromise: Promise<IDBDatabase> | null = null;

  const resolveFactory = (): IDBFactory | null => {
    if (factory !== undefined) return factory;
    try {
      return globalThis.indexedDB ?? null;
    } catch {
      return null;
    }
  };

  const open = (): Promise<IDBDatabase> => {
    const idb = resolveFactory();
    if (!idb) {
      return Promise.reject(new Error('이 브라우저에서는 기록 저장소(IndexedDB)를 쓸 수 없습니다.'));
    }
    if (!dbPromise) {
      dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
        const request = idb.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const store = request.result.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex(BY_GAME, ['gameCode', 'id']);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error('기록 저장소가 다른 탭에서 사용 중입니다.'));
      }).catch((err) => {
        dbPromise = null; // 다음 호출에서 다시 연다
        throw err;
      });
    }
    return dbPromise;
  };

  const gameRange = (gameCode: string) =>
    IDBKeyRange.bound([gameCode, -Infinity], [gameCode, Infinity]);

  return {
    async save<S, R>(record: GameRecord<S, R>): Promise<void> {
      const db = await open();
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(record);
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error ?? new Error('기록 저장이 취소되었습니다.'));
      });
    },

    async get<S, R>(id: number): Promise<GameRecord<S, R> | undefined> {
      const db = await open();
      return promisify(db.transaction(STORE).objectStore(STORE).get(id));
    },

    // 최신순. page 는 1부터.
    async list<S, R>(gameCode: string, page: number, limit: number): Promise<RecordPage<S, R>> {
      const db = await open();
      const index = db.transaction(STORE).objectStore(STORE).index(BY_GAME);
      const range = gameRange(gameCode);
      const totalCount = await promisify(index.count(range));
      const offset = Math.max(0, (page - 1) * limit);
      const records: GameRecord<S, R>[] = [];
      if (offset >= totalCount || limit <= 0) return { records, totalCount };

      await new Promise<void>((resolve, reject) => {
        let skipped = offset === 0;
        const request = index.openCursor(range, 'prev');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) return resolve();
          if (!skipped) {
            skipped = true;
            cursor.advance(offset);
            return;
          }
          records.push(cursor.value);
          if (records.length >= limit) return resolve();
          cursor.continue();
        };
      });
      return { records, totalCount };
    },
  };
}

export type RecordStore = ReturnType<typeof createRecordStore>;

export const recordStore = createRecordStore();
