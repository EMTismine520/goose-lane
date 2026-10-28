import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { GIFT_CODE_MAX_LENGTH } from '../src/content/gift-codes';
import { ENERGY_CONFIG } from '../src/content/production';
import { createInitialState, execute, getEnergyStatus } from '../src/domain/engine';
import type { Command } from '../src/domain/types';
import { parseSave, SaveRepository, serializeSave } from '../src/persistence/save';
import legacyFixture from './persistence-v1.fixture.json';

const now = 1_792_713_600_000;
const repositories: SaveRepository[] = [];
afterEach(() => repositories.splice(0).forEach(repository => repository.close()));

describe('offline repeatable energy gifts', () => {
  it.each(['GOOSE100', 'goose100', '  Goose100\n'])('accepts %j without changing inventory or progression', key => {
    const state = createInitialState(now);
    const result = execute(state, { type: 'redeemGift', key }, now);
    expect(result.ok).toBe(true);
    expect(result.state.energy.value).toBe(160);
    for (const field of ['board', 'storage', 'coins', 'seed', 'nextId', 'completedOrders', 'construction', 'stats'] as const) expect(result.state[field]).toEqual(state[field]);
    expect(result.events).toContainEqual({ type: 'redeem', amount: 100, message: '兑换成功，体力 +100' });
    expect(state.energy.value).toBe(60);
  });

  it.each(['', ' \n ', 'GOOSE 100', 'GOOSE101', 'GOOSE100\u200b', '兑换码', 'x'.repeat(GIFT_CODE_MAX_LENGTH + 1)])('rejects %j without even advancing recovery or revision', key => {
    const state = createInitialState(now);
    const result = execute(state, { type: 'redeemGift', key }, now + ENERGY_CONFIG.recoveryInterval);
    expect(result.ok).toBe(false);
    expect(result.state).toBe(state);
    expect(result.events[0].type).toBe('error');
  });

  it('rejects malformed non-string input at the domain boundary', () => {
    const state = createInitialState(now);
    expect(execute(state, { type: 'redeemGift', key: null } as unknown as Command, now).state).toBe(state);
  });

  it('allows separate submissions while rejecting the same command ID', () => {
    const first = execute(createInitialState(now), { type: 'redeemGift', key: 'GOOSE100', commandId: 'gift-1' }, now);
    const duplicate = execute(first.state, { type: 'redeemGift', key: 'GOOSE100', commandId: 'gift-1' }, now);
    expect(duplicate.ok).toBe(false); expect(duplicate.state).toBe(first.state);
    const second = execute(first.state, { type: 'redeemGift', key: 'GOOSE100', commandId: 'gift-2' }, now);
    expect(second.state.energy.value).toBe(260);
  });

  it('settles due natural recovery first and retains its existing clock semantics', () => {
    const state = createInitialState(now);
    const result = execute(state, { type: 'redeemGift', key: 'GOOSE100' }, now + ENERGY_CONFIG.recoveryInterval + 1234);
    expect(result.state.energy).toEqual({ value: 161, lastRecoveryAt: now + ENERGY_CONFIG.recoveryInterval });
    expect(getEnergyStatus(result.state, now + ENERGY_CONFIG.recoveryInterval * 3)).toMatchObject({ value: 161, nextRecoveryIn: 0 });
  });

  it('accepts the exact persistent energy limit and refuses a partial award above it', () => {
    const state = createInitialState(now);
    state.energy.value = ENERGY_CONFIG.maxValue - 100;
    const exact = execute(state, { type: 'redeemGift', key: 'GOOSE100' }, now);
    expect(exact.ok).toBe(true); expect(exact.state.energy.value).toBe(ENERGY_CONFIG.maxValue);
    expect(parseSave(serializeSave(exact.state)).energy.value).toBe(ENERGY_CONFIG.maxValue);
    state.energy.value++;
    const overflow = execute(state, { type: 'redeemGift', key: 'GOOSE100' }, now);
    expect(overflow.ok).toBe(false); expect(overflow.state).toBe(state);
    expect(overflow.events[0].message).toContain('上限');
    const invalid = { ...exact.state, energy: { ...exact.state.energy, value: ENERGY_CONFIG.maxValue + 1 } };
    expect(() => serializeSave(invalid)).toThrow();
  });

  it('keeps an existing sale undo usable without undoing the energy gift', () => {
    const initial = createInitialState(now);
    const sold = execute(initial, { type: 'sell', index: 16 }, now);
    expect(sold.ok).toBe(true); expect(sold.state.undo).not.toBeNull();
    const redeemed = execute(sold.state, { type: 'redeemGift', key: 'GOOSE100' }, now);
    const restored = execute(redeemed.state, { type: 'undo' }, now);
    expect(restored.ok).toBe(true);
    expect(restored.state.board).toEqual(initial.board);
    expect(restored.state.coins).toBe(initial.coins);
    expect(restored.state.energy.value).toBe(160);
  });

  it('supports migrated legacy saves without changing their schema or adding redemption fields', () => {
    const legacy = parseSave(JSON.stringify(legacyFixture));
    const result = execute(legacy, { type: 'redeemGift', key: 'GOOSE100' }, legacy.lastSeen);
    expect(result.ok).toBe(true);
    const restored = parseSave(serializeSave(result.state));
    expect(restored.energy.value).toBe(legacy.energy.value + 100);
    expect(restored.campaign).toBe('legacy');
    expect(restored.schemaVersion).toBe(legacy.schemaVersion);
    expect(Object.keys(restored).sort()).toEqual(Object.keys(legacy).sort());
  });

  it('retains the gift after reopening IndexedDB and supports existing snapshot recovery', async () => {
    const name = 'gift-redemption-reopen';
    const repository = new SaveRepository(name); repositories.push(repository);
    await repository.open();
    const initial = createInitialState(now); await repository.save(initial);
    const first = execute(initial, { type: 'redeemGift', key: 'GOOSE100' }, now).state;
    await repository.save(first);
    await repository.save(execute(first, { type: 'redeemGift', key: 'GOOSE100' }, now).state);
    repository.close();
    const reopened = new SaveRepository(name); repositories.push(reopened);
    expect((await reopened.open()).state?.energy.value).toBe(260);
    expect((await reopened.restorePrevious())?.energy.value).toBe(160);
    expect((await reopened.open()).state?.energy.value).toBe(160);
  });
});
