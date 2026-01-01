import { FC, useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { GetSessionResults } from "@wails/go/main/App";
import { types } from '@wails/go/models';
import { RecordPageLayout } from '@components/layout/RecordPageLayout';
import { ResultsTable } from '@components/records/ResultsTable';
import { GameCodes } from '@constants/gameCodes';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { useCatChaserStore } from '../stores/useCatChaserStore';
import { SessionList } from '@components/records/SessionList';
import { BaseGameSessionInfo } from '@type/common';
import { Card } from '@components/common/Card';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export const CatChaserSessionDetail: FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [results, setResults] = useState<types.CatChaserResult[]>([]);
  const [loading, setLoading] = useState(true);
  
  // For sidebar session list
  const { paginatedSessions, fetchPaginatedSessions } = useCatChaserStore();
  const [sessionListLoading, setSessionListLoading] = useState(false);

  useEffect(() => {
    if (paginatedSessions.sessions.length === 0) {
        setSessionListLoading(true);
        fetchPaginatedSessions(1, 20).finally(() => setSessionListLoading(false));
    }
  }, [fetchPaginatedSessions, paginatedSessions.sessions.length]);

  useEffect(() => {
    if (sessionId) {
      setLoading(true);
      GetSessionResults(GameCodes.CAT_CHASER, Number(sessionId))
        .then((dataStr) => {
            const data = JSON.parse(dataStr);
            setResults(data || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [sessionId]);
  
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
      // Map confidence 1-4 to average score
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

  const columns = [
    { header: '라운드', accessor: (r: types.CatChaserResult) => r.round },
    { header: '타겟', accessor: (r: types.CatChaserResult) => r.targetColor === 'RED' ? '빨강' : '파랑' },
    { header: '선택', accessor: (r: types.CatChaserResult) => {
        if (r.playerChoice === 'TIMEOUT') return '미제출';
        return r.playerChoice === 'CAUGHT' ? '잡았다' : '놓쳤다';
    } },
    { header: '정답', accessor: (r: types.CatChaserResult) => r.correctChoice === 'CAUGHT' ? '잡았다' : '놓쳤다' },
    { header: '확신도', accessor: (r: types.CatChaserResult) => r.confidence },
    { header: '점수', accessor: (r: types.CatChaserResult) => r.score.toFixed(1) },
    { header: '결과', accessor: (r: types.CatChaserResult) => r.isCorrect ? '정답' : '오답' },
    { header: '소요시간(ms)', accessor: (r: types.CatChaserResult) => r.responseTimeMs },
  ];
  
  // Charts Data
  // Consistent Colors: Accuracy (Teal), Time (Orange), Count (Purple)
  // Here we have Accuracy (Teal), Cat Accuracy (Split?), Confidence Score (Purple)
  
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
          data: stats ? [stats.accuracy, 100 - stats.accuracy] : [0, 0],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
          borderWidth: 0,
      }]
  };
  
  const catAccuracyData = {
      labels: ['빨간 고양이', '파란 고양이'],
      datasets: [{
          label: '정답률 (%)',
          data: stats ? [stats.redAccuracy, stats.blueAccuracy] : [0, 0],
          backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
      }]
  };
  
  const confidenceData = {
      labels: ['불확실(1)', '조금 확실(2)', '확실(3)', '매우 확실(4)'],
      datasets: [{
          label: '평균 점수',
          data: stats ? stats.avgScoreByConfidence : [],
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
      }]
  };
  
  const sessionsForList: BaseGameSessionInfo[] = paginatedSessions.sessions.map(({ results, ...sessionInfo }) => sessionInfo);

  return (
    <RecordPageLayout 
        title={`세션 상세 기록 (ID: ${sessionId})`}
        backPath="/records/cat-chaser"
        sidebarContent={
            <SessionList 
                sessions={sessionsForList} 
                loading={sessionListLoading} 
                error={null} 
                onSessionClick={(id) => window.location.hash = `#/records/cat-chaser/${id}`} 
                activeSessionId={Number(sessionId)}
            />
        }
    >
      {loading ? (
        <div>로딩 중...</div>
      ) : (
        <div className="space-y-6">
            {stats && (
                <>
                <Card title="요약 정보">
                    <p>총 문제 수 (응답 수): {stats.total}</p>
                    <p>전체 정답률: {stats.accuracy.toFixed(2)}%</p>
                    <p>빨간 고양이 정답률: {stats.redAccuracy.toFixed(2)}%</p>
                    <p>파란 고양이 정답률: {stats.blueAccuracy.toFixed(2)}%</p>
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
                </>
            )}
            
            <Card title="상세 기록">
                <ResultsTable data={results} columns={columns} />
            </Card>
        </div>
      )}
    </RecordPageLayout>
  );
};
