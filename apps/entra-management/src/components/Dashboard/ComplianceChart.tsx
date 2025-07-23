import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FrameworkSummary {
  frameworkId: string;
  frameworkName: string;
  overallScore: number;
  totalControls: number;
  passedControls: number;
  failedControls: number;
  notConfiguredControls: number;
}

interface ComplianceChartProps {
  frameworkSummaries: FrameworkSummary[];
  isLoading: boolean;
}

export const ComplianceChart: React.FC<ComplianceChartProps> = ({
  frameworkSummaries,
  isLoading,
}) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Compliance Scores by Framework',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          },
        },
      },
    },
  };

  const data = {
    labels: frameworkSummaries.map(f => f.frameworkName.replace(/^(NIST|ISO|CIS)\s+/, '')),
    datasets: [
      {
        label: 'Compliance Score',
        data: frameworkSummaries.map(f => f.overallScore),
        backgroundColor: frameworkSummaries.map(f => 
          f.overallScore >= 80 ? 'rgba(34, 197, 94, 0.8)' :
          f.overallScore >= 60 ? 'rgba(245, 158, 11, 0.8)' :
          'rgba(239, 68, 68, 0.8)'
        ),
        borderColor: frameworkSummaries.map(f => 
          f.overallScore >= 80 ? 'rgba(34, 197, 94, 1)' :
          f.overallScore >= 60 ? 'rgba(245, 158, 11, 1)' :
          'rgba(239, 68, 68, 1)'
        ),
        borderWidth: 1,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Compliance Overview</h3>
        </div>
        <div className="card-body">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900">Compliance Overview</h3>
      </div>
      <div className="card-body">
        <div className="h-64">
          <Bar data={data} options={options} />
        </div>
        
        {/* Framework Details */}
        <div className="mt-6 space-y-3">
          {frameworkSummaries.map((framework) => (
            <div key={framework.frameworkId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {framework.frameworkName}
                </h4>
                <p className="text-sm text-gray-600">
                  {framework.passedControls} of {framework.totalControls} controls passed
                </p>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  framework.overallScore >= 80 ? 'text-success-600' :
                  framework.overallScore >= 60 ? 'text-warning-600' :
                  'text-danger-600'
                }`}>
                  {framework.overallScore}%
                </div>
                <div className="text-xs text-gray-500">
                  {framework.failedControls} failed, {framework.notConfiguredControls} pending
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};