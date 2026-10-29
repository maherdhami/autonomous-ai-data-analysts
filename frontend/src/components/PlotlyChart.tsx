'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface PlotlyChartProps {
  data: any;
  layout?: any;
  title?: string;
}

export function PlotlyChart({ data, layout, title }: PlotlyChartProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !data) {
    return (
      <div className="w-full h-80 bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 text-sm font-medium">
        Loading Interactive Chart...
      </div>
    );
  }

  const defaultLayout = {
    autosize: true,
    margin: { l: 40, r: 40, t: 50, b: 40 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { family: 'Inter, sans-serif', color: '#94A3B8' },
    title: title ? { text: title, font: { family: 'Poppins, sans-serif', size: 14, color: '#FFFFFF' } } : undefined,
    xaxis: {
      gridcolor: '#1E293B',
      linecolor: '#1E293B',
      tickfont: { color: '#94A3B8', size: 10 },
      title: { font: { color: '#94A3B8', size: 11 } },
    },
    yaxis: {
      gridcolor: '#1E293B',
      linecolor: '#1E293B',
      tickfont: { color: '#94A3B8', size: 10 },
      title: { font: { color: '#94A3B8', size: 11 } },
    },
    ...layout,
  };

  return (
    <div className="w-full dark-glass-card-interactive rounded-2xl p-4 shadow-xl">
      <Plot
        data={Array.isArray(data) ? data : [data]}
        layout={defaultLayout}
        useResizeHandler={true}
        className="w-full h-80"
        config={{ responsive: true, displayModeBar: false, displaylogo: false }}
      />
    </div>
  );
}
