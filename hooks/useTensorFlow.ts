'use client';

import { useState, useEffect, useCallback } from 'react';

export function useTensorFlowPredictions(timeSeriesData: any[]) {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const predict = useCallback(async () => {
    if (timeSeriesData.length < 3) return;
    setLoading(true);

    try {
      // Simple linear regression prediction (no TF.js import needed for basic prediction)
      // For actual TF.js, install: npm install @tensorflow/tfjs
      const visitors = timeSeriesData.map((d: any) => d.visitors);
      const n = visitors.length;
      
      // Calculate trend using least squares
      const sumX = visitors.reduce((s: number, _: number, i: number) => s + i, 0);
      const sumY = visitors.reduce((s: number, v: number) => s + v, 0);
      const sumXY = visitors.reduce((s: number, v: number, i: number) => s + i * v, 0);
      const sumX2 = visitors.reduce((s: number, _: number, i: number) => s + i * i, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      // Predict next 7 days
      const predicted = [];
      for (let i = 1; i <= 7; i++) {
        const nextIndex = n + i;
        const predictedValue = Math.max(0, Math.round(slope * nextIndex + intercept + (Math.random() - 0.5) * slope * 2));
        const lastDate = new Date();
        lastDate.setDate(lastDate.getDate() + i);
        
        predicted.push({
          date: lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          visitors: predictedValue,
          pageviews: Math.round(predictedValue * 5.5),
          isPrediction: true,
        });
      }
      
      setPredictions(predicted);
    } catch (e) {
      console.error('Prediction error:', e);
    } finally {
      setLoading(false);
    }
  }, [timeSeriesData]);

  useEffect(() => {
    predict();
  }, [predict]);

  return { predictions, loading, predict };
}