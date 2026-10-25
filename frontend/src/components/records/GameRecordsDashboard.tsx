import { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Select } from '@components/common/Select';
import { GameDefinition } from '@games/types';
import { GameRecord } from '@records/recordStore';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface GameRecordsDashboardProps {
  game: GameDefinition;
  records: GameRecord[]; // 최신순
}

export function GameRecordsDashboard({ game, records }: GameRecordsDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>(game.metricOptions[0]?.value ?? 'accuracy');
  const metricLabel = game.metricOptions.find((opt) => opt.value === selectedMetric)?.label ?? selectedMetric;

  const chartData = useMemo(() => {
    const ordered = [...records].reverse();
    return {
      labels: ordered.map((r) => new Date(r.playedAt).toLocaleString()),
      datasets: [{
        label: metricLabel,
        data: ordered.map((r) => game.metrics(r.results)[selectedMetric] ?? 0),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      }],
    };
  }, [records, game, selectedMetric, metricLabel]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: `${metricLabel} 추이 (최근 ${records.length}회)` },
    },
    scales: { y: { min: 0, max: selectedMetric.toLowerCase().includes('accuracy') ? 100 : undefined } },
  }), [metricLabel, records.length, selectedMetric]);

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">대시보드</h2>
      <Select
        id="metric-select"
        label="표시할 통계 선택"
        options={game.metricOptions}
        value={selectedMetric}
        onChange={(e) => setSelectedMetric(e.target.value)}
      />
      <div className="mt-8 flex-grow flex items-center justify-center">
        {records.length > 0 ? <Line data={chartData} options={chartOptions} /> : <p>표시할 기록이 없습니다.</p>}
      </div>
    </>
  );
}
