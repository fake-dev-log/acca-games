import { types } from '@wails/go/models';
import { createSettingsParser } from './settingsHelper';

export function formatSettings(settings: types.CountComparisonSettings): string[] {
  return [
    `문제 수: ${settings.numProblems}개`,
    `제시 시간: ${settings.presentationTime / 1000}초`,
    `입력 시간: ${settings.inputTime / 1000}초`,
    `실전 모드: ${settings.isRealMode ? 'ON' : 'OFF'}`,
  ];
}

export const parseSettings = createSettingsParser(types.CountComparisonSettings, 'Count Comparison');

const trapTypeMap: { [key: string]: string } = {
  "FontWeight": "글자 굵기",
  "FontSize": "글자 크기",
  "CountNumber": "개수 숫자",
  "Color": "색상",
  "Transparency": "투명도",
  "Density": "밀도",
  "GapProbability": "간격 확률",
};

const appliedToMap: { [key: string]: string } = {
  "left": "왼쪽",
  "right": "오른쪽",
  "both": "양쪽",
};

export function formatAppliedTraps(appliedTrapsJson: string): string {
  try {
    const traps: types.AppliedTrap[] = JSON.parse(appliedTrapsJson);
    if (traps.length === 0) {
      return "없음";
    }

    const formatted = traps.map(trap => {
      const type = trapTypeMap[trap.type] || trap.type;
      const appliedTo = appliedToMap[trap.appliedTo] || trap.appliedTo;
      return `${type}(${appliedTo})`;
    });

    return formatted.join(', ');
  } catch (e) {
    console.error("Failed to parse or format applied traps JSON:", appliedTrapsJson, e);
    return appliedTrapsJson; // Fallback to raw JSON if parsing fails
  }
}

export function getMetricLabel(metricKey: string): string {
  if (metricKey === 'overallAccuracy') return '전체 정확도 (%)';
  if (metricKey === 'averageResponseTimeMs') return '평균 반응 시간 (ms)';
  if (metricKey === 'No Trap Accuracy') return '함정 없음 정확도 (%)';
  if (metricKey === 'No Trap Avg Response Time') return '함정 없음 평균 반응 시간 (ms)';

  const parts = metricKey.split(' ');
  if (parts.length >= 2) {
    const trapPart = parts[0];
    const metricType = parts.slice(1).join(' ');

    const trapSubParts = trapPart.split('_');
    if (trapSubParts.length === 2) {
      const type = trapSubParts[0];
      const appliedTo = trapSubParts[1];

      const translatedType = trapTypeMap[type] || type;
      const translatedAppliedTo = appliedToMap[appliedTo] || appliedTo;

      let translatedMetricType = metricType;
      if (metricType === 'Accuracy') translatedMetricType = '정확도 (%)';
      if (metricType === 'Avg Response Time') translatedMetricType = '평균 반응 시간 (ms)';

      return `${translatedType}(${translatedAppliedTo}) ${translatedMetricType}`;
    }
  }

  return metricKey;
}

export function formatTrapType(rawTrapType: string): string {
  if (rawTrapType === 'No Trap') {
    return '함정 없음';
  }

  const trapSubParts = rawTrapType.split('_'); // "FontWeight", "left"
  if (trapSubParts.length === 2) {
    const type = trapSubParts[0]; // "FontWeight"
    const appliedTo = trapSubParts[1]; // "left"

    const translatedType = trapTypeMap[type] || type;
    const translatedAppliedTo = appliedToMap[appliedTo] || appliedTo;

    return `${translatedType}(${translatedAppliedTo})`;
  }

  return rawTrapType; // Fallback if format is unexpected
}
