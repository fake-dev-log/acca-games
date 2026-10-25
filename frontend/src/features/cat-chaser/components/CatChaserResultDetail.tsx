import { FC, useMemo } from 'react';
import { CatChaserResult } from '@features/cat-chaser/logic/types';
import { Card } from '@components/common/Card';
import { ResultsTable } from '@components/records/ResultsTable';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface CatChaserResultDetailProps {
  results: CatChaserResult[];
}

export const CatChaserResultDetail: FC<CatChaserResultDetailProps> = ({ results }) => {
  // Calculate Stats
  const stats = useMemo(() => {
      const total = results.length;
      if (total === 0) return null;
      
      const correct = results.filter(r => r.isCorrect).length;
      const redResults = results.filter(r => r.targetColor === 'RED');
      const blueResults = results.filter(r => r.targetColor === 'BLUE');
      
      const redCorrect = redResults.filter(r => r.isCorrect).length;
      const blueCorrect = blueResults.filter(r => r.isCorrect).length;
      
      const redAccuracy = redResults.length > 0 ? (redCorrect / redResults.length) * 100 : 0;
      const blueAccuracy = blueResults.length > 0 ? (blueCorrect / blueResults.length) * 100 : 0;

      // Average Score by Confidence
      const scoreByConfidence = [0, 0, 0, 0, 0]; // index 1-4 used
      const countByConfidence = [0, 0, 0, 0, 0];
      
      results.forEach(r => {
          scoreByConfidence[r.confidence] += r.score;
          countByConfidence[r.confidence]++;
      });
      
      const avgScoreByConfidence = [1, 2, 3, 4].map(c => 
          countByConfidence[c] > 0 ? scoreByConfidence[c] / countByConfidence[c] : 0
      );

      return {
          total,
          accuracy: (correct / total) * 100,
          redAccuracy,
          blueAccuracy,
          avgScoreByConfidence,
      };
  }, [results]);

  if (!stats) return <div>결과가 없습니다.</div>;

  const columns = [
    { header: '라운드', accessor: (r: CatChaserResult) => r.round },
    { header: '타겟', accessor: (r: CatChaserResult) => r.targetColor === 'RED' ? '빨강' : '파랑' },
    { header: '선택', accessor: (r: CatChaserResult) => {
        if (r.playerChoice === 'TIMEOUT') return '미제출';
        return r.playerChoice === 'CAUGHT' ? '잡았다' : '놓쳤다';
    } },
    { header: '정답', accessor: (r: CatChaserResult) => r.correctChoice === 'CAUGHT' ? '잡았다' : '놓쳤다' },
    { header: '확신도', accessor: (r: CatChaserResult) => r.confidence },
    { header: '점수', accessor: (r: CatChaserResult) => r.score.toFixed(1) },
    { header: '결과', accessor: (r: CatChaserResult) => r.isCorrect ? '정답' : '오답' },
    { header: '소요시간(ms)', accessor: (r: CatChaserResult) => r.responseTimeMs },
  ];

  const chartOptions = (title: string, yLabel?: string, yMax?: number) => ({
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: title },
    },
    scales: {
      y: { 
          beginAtZero: true, 
          max: yMax,
          title: { display: !!yLabel, text: yLabel } 
      },
    },
  });

  const accuracyData = {
      labels: ['정답', '오답'],
      datasets: [{
          data: [stats.accuracy, 100 - stats.accuracy],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
          borderWidth: 0,
      }]
  };
  
  const catAccuracyData = {
      labels: ['빨간 고양이', '파란 고양이'],
      datasets: [{
          label: '정답률 (%)',
          data: [stats.redAccuracy, stats.blueAccuracy],
          backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
      }]
  };
  
  const confidenceData = {
      labels: ['불확실(1)', '조금 확실(2)', '확실(3)', '매우 확실(4)'],
      datasets: [{
          label: '평균 점수',
          data: stats.avgScoreByConfidence,
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
      }]
  };

  return (
    <div className="space-y-6 w-full text-left">
        <Card title="요약 정보">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>총 문제 수: {stats.total}</div>
                <div>전체 정답률: {stats.accuracy.toFixed(2)}%</div>
                <div>빨간 고양이 정답률: {stats.redAccuracy.toFixed(2)}%</div>
                <div>파란 고양이 정답률: {stats.blueAccuracy.toFixed(2)}%</div>
            </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <div className="flex flex-col items-center">
                    <h3 className="text-sm font-semibold mb-2 text-gray-500">전체 정답률</h3>
                    <div className="w-40 h-40">
                        <Doughnut data={accuracyData} />
                    </div>
                </div>
            </Card>
            
            <Card>
                    <Bar data={catAccuracyData} options={chartOptions('고양이별 정답률', '정답률 (%)', 100)} />
            </Card>
            
            <Card>
                    <Bar data={confidenceData} options={chartOptions('확신도별 평균 점수', '점수')} />
            </Card>
        </div>
        
        <Card title="상세 기록">
            <ResultsTable data={results} columns={columns} />
        </Card>
    </div>
  );
};
