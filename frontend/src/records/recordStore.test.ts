import { describe, it, expect } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { createRecordStore, GameRecord } from './recordStore';

const record = (id: number, gameCode = 'RPS', results: unknown[] = [{ isCorrect: true }]): GameRecord => ({
  id, gameCode, playedAt: new Date(id).toISOString(), settings: { n: id }, results,
});

describe('recordStore', () => {
  it('saves and reads back a record', async () => {
    const store = createRecordStore(new IDBFactory());
    await store.save(record(1000, 'RPS', [{ isCorrect: false, ms: 1 }]));
    expect(await store.get(1000)).toEqual(record(1000, 'RPS', [{ isCorrect: false, ms: 1 }]));
  });

  it('lists one game newest first, paginated, with the total count', async () => {
    const store = createRecordStore(new IDBFactory());
    for (const id of [1, 5, 3, 4, 2]) await store.save(record(id));
    await store.save(record(9, 'N_BACK'));

    const page1 = await store.list('RPS', 1, 2);
    const page3 = await store.list('RPS', 3, 2);
    expect(page1.totalCount).toBe(5);
    expect(page1.records.map((r) => r.id)).toEqual([5, 4]);
    expect(page3.records.map((r) => r.id)).toEqual([1]);
    expect((await store.list('N_BACK', 1, 10)).records.map((r) => r.id)).toEqual([9]);
  });

  it('overwrites instead of duplicating when the same session is saved twice', async () => {
    const store = createRecordStore(new IDBFactory());
    await store.save(record(7));
    await store.save({ ...record(7), results: [{ isCorrect: true }, { isCorrect: false }] });
    const { records, totalCount } = await store.list('RPS', 1, 10);
    expect(totalCount).toBe(1);
    expect(records[0].results).toHaveLength(2);
  });

  it('returns empty pages and undefined for missing data', async () => {
    const store = createRecordStore(new IDBFactory());
    expect(await store.get(123)).toBeUndefined();
    expect(await store.list('RPS', 1, 10)).toEqual({ records: [], totalCount: 0 });
    await store.save(record(1));
    expect(await store.list('RPS', 2, 10)).toEqual({ records: [], totalCount: 1 });
    expect((await store.list('', 1, 10)).totalCount).toBe(0);
  });

  it('rejects with a readable message when IndexedDB is unavailable', async () => {
    const store = createRecordStore(null);
    await expect(store.save(record(1))).rejects.toThrow('IndexedDB');
    await expect(store.list('RPS', 1, 10)).rejects.toThrow('IndexedDB');
  });

  it('keeps unicode and nested settings intact', async () => {
    const store = createRecordStore(new IDBFactory());
    const r = { ...record(42), settings: { label: '도형 회전 🙂', nested: { a: [1, 2] } } };
    await store.save(r);
    expect((await store.get(42))!.settings).toEqual({ label: '도형 회전 🙂', nested: { a: [1, 2] } });
  });
});
