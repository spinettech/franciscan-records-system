import React from 'react';

interface FinanceStatsProps {
  stats: {
    totalIncome: number;
    totalExpenditure: number;
    monthlyIncome: number;
    monthlyExpenditure: number;
    balance: number;
  };
  formatCurrency: (amount: number) => string;
}

const FinanceStats: React.FC<FinanceStatsProps> = ({ stats, formatCurrency }) => (
  <div className="stats-grid mb-8">
    <div className="stat-card">
      <div className="stat-label">Net Balance</div>
      <div className="stat-value">{formatCurrency(stats.balance)}</div>
      <div className={`stat-trend ${stats.balance >= 0 ? 'positive' : 'negative'}`}>
        Overall Financial Standing
      </div>
    </div>
    <div className="stat-card">
      <div className="stat-label">Total Income</div>
      <div className="stat-value text-success">{formatCurrency(stats.totalIncome)}</div>
      <div className="stat-trend positive">All time record</div>
    </div>
    <div className="stat-card">
      <div className="stat-label">Monthly Expenditure</div>
      <div className="stat-value text-danger">{formatCurrency(stats.monthlyExpenditure)}</div>
      <div className="stat-trend info">Current month</div>
    </div>
    <div className="stat-card">
      <div className="stat-label">Monthly Income</div>
      <div className="stat-value text-primary">{formatCurrency(stats.monthlyIncome)}</div>
      <div className="stat-trend positive">Current month</div>
    </div>
  </div>
);

export default FinanceStats;
