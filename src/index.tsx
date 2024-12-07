import React, { Profiler, ProfilerOnRenderCallback, ReactNode } from 'react';

interface RenderMetrics {
  id: string;
  phase: 'mount' | 'update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  interactions: Set<any>;
}

interface PerformanceReport {
  componentId: string;
  averageRenderTime: number;
  renderCount: number;
  suggestions: string[];
  lastRenderTimestamp: number;
}

type ProfilerCallback = (
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number,
  interactions: Set<any>
) => void;

export class RPOProfiler {
  private metricsStore: Map<string, RenderMetrics[]> = new Map();
  protected _threshold: number = 16; // ~60fps threshold in ms
  private lastReportTimestamp: number = Date.now();

  get threshold(): number {
    return this._threshold;
  }

  set threshold(value: number) {
    this._threshold = value;
  }

  onRenderCallback: ProfilerCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions
  ) => {
    const metrics: RenderMetrics = {
      id,
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
      interactions,
    };

    if (!this.metricsStore.has(id)) {
      this.metricsStore.set(id, []);
    }
    const componentMetrics = this.metricsStore.get(id);
    if (componentMetrics) {
      componentMetrics.push(metrics);
      // Keep only last 100 metrics to prevent memory bloat
      if (componentMetrics.length > 100) {
        componentMetrics.shift();
      }
    }

    // Analyze performance in real-time
    this.analyzePerformance(id);
  };

  private analyzePerformance(componentId: string): void {
    const metrics = this.metricsStore.get(componentId);
    if (!metrics || metrics.length === 0) return;

    const recentMetrics = metrics.slice(-10); // Analyze last 10 renders
    const averageRenderTime = recentMetrics.reduce((sum, m) => sum + m.actualDuration, 0) / recentMetrics.length;

    if (averageRenderTime > this.threshold) {
      console.warn(
        `Performance warning for component ${componentId}:\n` +
        `Average render time: ${averageRenderTime.toFixed(2)}ms\n` +
        `Suggestion: Consider implementing React.memo or optimizing render logic.`
      );
    }
  }

  generateReport(): PerformanceReport[] {
    const currentTime = Date.now();
    const reports: PerformanceReport[] = [];

    this.metricsStore.forEach((metrics, componentId) => {
      if (metrics.length === 0) return;

      const recentMetrics = metrics.slice(-10);
      const averageRenderTime = recentMetrics.reduce((sum, m) => sum + m.actualDuration, 0) / recentMetrics.length;
      const suggestions = this.generateSuggestions(recentMetrics);

      reports.push({
        componentId,
        averageRenderTime,
        renderCount: metrics.length,
        suggestions,
        lastRenderTimestamp: currentTime
      });
    });

    this.lastReportTimestamp = currentTime;
    return reports;
  }

  private generateSuggestions(metrics: RenderMetrics[]): string[] {
    const suggestions: string[] = [];
    const averageRenderTime = metrics.reduce((sum, m) => sum + m.actualDuration, 0) / metrics.length;
    const updateCount = metrics.filter(m => m.phase === 'update').length;

    if (averageRenderTime > this.threshold) {
      suggestions.push('Consider implementing React.memo to prevent unnecessary re-renders');
      suggestions.push('Review and optimize expensive computations within the component');
    }

    if (updateCount > 5 && metrics.length >= 10) {
      suggestions.push('High update frequency detected - review dependency arrays in useEffect and useMemo hooks');
      suggestions.push('Consider implementing useMemo for expensive computations');
      suggestions.push('Check if useCallback would help prevent recreation of event handlers');
    }

    if (metrics.some(m => m.baseDuration > this.threshold * 2)) {
      suggestions.push('Component has high base render time - consider code splitting or lazy loading');
    }

    return suggestions;
  }

  clearMetrics(): void {
    this.metricsStore.clear();
    this.lastReportTimestamp = Date.now();
  }
}

interface RPOWrapperProps {
  children: ReactNode;
  onReport?: (report: PerformanceReport[]) => void;
  reportInterval?: number; // milliseconds
  threshold?: number; // milliseconds
}

export const RPOWrapper: React.FC<RPOWrapperProps> = ({ 
  children, 
  onReport, 
  reportInterval = 5000,
  threshold = 16 
}) => {
  const profiler = React.useMemo(() => {
    const instance = new RPOProfiler();
    if (threshold) {
      instance.threshold = threshold;
    }
    return instance;
  }, [threshold]);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      const report = profiler.generateReport();
      onReport?.(report);
    }, reportInterval);

    return () => {
      clearInterval(intervalId);
      profiler.clearMetrics();
    };
  }, [profiler, onReport, reportInterval]);

  return (
    <Profiler id="root" onRender={profiler.onRenderCallback as ProfilerOnRenderCallback}>
      {children}
    </Profiler>
  );
};

export type { PerformanceReport, RenderMetrics };
