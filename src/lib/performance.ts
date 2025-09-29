'use client';

// Performance monitoring hook for development
import React, { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
}

export function usePerformanceMonitor(componentName: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return;
    }

    const startTime = performance.now();

    // Monitor initial load
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;

      setMetrics({
        loadTime,
        renderTime: performance.now(),
        memoryUsage: (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize
      });

      if (console?.group) {
        console.group(`⚡ Performance - ${componentName}`);
        console.log(`Load Time: ${loadTime.toFixed(2)}ms`);
        console.log(`Render Time: ${performance.now().toFixed(2)}ms`);
        const perfMemory = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
        if (perfMemory) {
          console.log(`Memory: ${(perfMemory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
        }
        console.groupEnd();
      }
    };

    // Defer the monitoring to avoid blocking
    const timeoutId = setTimeout(handleLoad, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [componentName]);

  return metrics;
}

// Performance-aware animation wrapper
export function withPerformanceMonitoring<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>,
  componentName: string
): React.ComponentType<T> {
  return function PerformanceMonitoredComponent(props: T) {
    usePerformanceMonitor(componentName);
    return React.createElement(Component, props);
  };
}