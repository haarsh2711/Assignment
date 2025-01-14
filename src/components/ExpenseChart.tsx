import React, { useState, useEffect } from 'react';
import { PieChart as Chart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { supabase } from '../lib/supabase';

interface CategoryTotal {
  category: string;
  total: number;
}

const COLORS = [
  '#2563eb', // blue-600
  '#dc2626', // red-600
  '#16a34a', // green-600
  '#9333ea', // purple-600
  '#ea580c', // orange-600
  '#0891b2', // cyan-600
  '#4f46e5', // indigo-600
  '#be123c', // rose-600
];

export function ExpenseChart() {
  const [data, setData] = useState<CategoryTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategoryTotals() {
      try {
        const { data: expenses, error } = await supabase
          .from('expenses')
          .select('category, amount');

        if (error) throw error;

        const totals = expenses?.reduce((acc: Record<string, number>, curr) => {
          acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
          return acc;
        }, {});

        const chartData = Object.entries(totals || {}).map(([category, total]) => ({
          category,
          total: Number(total)
        }));

        setData(chartData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch expense data');
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryTotals();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading chart data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">No expense data available</div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Expense Distribution</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <Chart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={150}
              label={({ category, percent }) => 
                `${category} (${(percent * 100).toFixed(1)}%)`
              }
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total']}
            />
            <Legend />
          </Chart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-center text-gray-600">
        Total Expenses: ${total.toFixed(2)}
      </div>
    </div>
  );
}