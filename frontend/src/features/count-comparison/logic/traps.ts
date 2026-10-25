import { AppliedTrap } from './types';

const TRAP_TYPE_LABELS: Record<string, string> = {
  FontWeight: '글자 굵기',
  FontSize: '글자 크기',
  CountNumber: '개수 숫자',
  Color: '색상',
  Transparency: '투명도',
  Density: '밀도',
  GapProbability: '간격 확률',
};

const APPLIED_TO_LABELS: Record<string, string> = {
  left: '왼쪽',
  right: '오른쪽',
  both: '양쪽',
};

export const NO_TRAP_LABEL = '함정 없음';

export function formatTrap(trap: AppliedTrap): string {
  const type = TRAP_TYPE_LABELS[trap.type] ?? trap.type;
  const appliedTo = APPLIED_TO_LABELS[trap.appliedTo] ?? trap.appliedTo;
  return `${type}(${appliedTo})`;
}

export function formatTraps(traps: AppliedTrap[]): string {
  return traps.length === 0 ? NO_TRAP_LABEL : traps.map(formatTrap).join(', ');
}
