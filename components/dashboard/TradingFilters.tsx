'use client';

import React, { useState, useCallback } from 'react';
import { Calendar, ChevronDown, Filter, X } from 'lucide-react';
import type { DateFilterPeriod, FilterOptions, DateRange } from '@/hooks/useAdvancedTradingData';

interface TradingFiltersProps {
  currentFilters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  isLoading?: boolean;
  className?: string;
}

const PERIOD_OPTIONS = [
  { value: 'today' as DateFilterPeriod, label: '오늘' },
  { value: '7days' as DateFilterPeriod, label: '7일' },
  { value: '30days' as DateFilterPeriod, label: '30일' },
  { value: 'custom' as DateFilterPeriod, label: '사용자 지정' },
];

export default function TradingFilters({
  currentFilters,
  onFiltersChange,
  isLoading = false,
  className = '',
}: TradingFiltersProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [localDateRange, setLocalDateRange] = useState<DateRange>({
    startDate: currentFilters.dateRange?.startDate || '',
    endDate: currentFilters.dateRange?.endDate || '',
  });

  // 기간 선택 핸들러
  const handlePeriodChange = useCallback((period: DateFilterPeriod) => {
    const now = new Date();
    let newFilters: FilterOptions = { ...currentFilters, period };

    if (period !== 'custom') {
      // 미리 정의된 기간인 경우 자동으로 날짜 범위 설정
      let startDate: Date;
      
      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      newFilters.dateRange = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
      };
      setShowDatePicker(false);
    } else {
      // 사용자 지정인 경우 날짜 선택기 표시
      setShowDatePicker(true);
      if (!newFilters.dateRange) {
        const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        newFilters.dateRange = {
          startDate: defaultStart.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0],
        };
        setLocalDateRange(newFilters.dateRange);
      }
    }

    onFiltersChange(newFilters);
  }, [currentFilters, onFiltersChange]);

  // 사용자 지정 날짜 범위 적용
  const handleCustomDateApply = useCallback(() => {
    if (localDateRange.startDate && localDateRange.endDate) {
      const newFilters: FilterOptions = {
        ...currentFilters,
        period: 'custom',
        dateRange: localDateRange,
      };
      onFiltersChange(newFilters);
      setShowDatePicker(false);
    }
  }, [localDateRange, currentFilters, onFiltersChange]);

  // 날짜 범위 초기화
  const handleDateReset = useCallback(() => {
    const now = new Date();
    const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const defaultRange = {
      startDate: defaultStart.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    };
    
    setLocalDateRange(defaultRange);
    const newFilters: FilterOptions = {
      ...currentFilters,
      period: '30days',
      dateRange: defaultRange,
    };
    onFiltersChange(newFilters);
    setShowDatePicker(false);
  }, [currentFilters, onFiltersChange]);

  // 현재 선택된 기간 라벨 가져오기
  const getCurrentPeriodLabel = () => {
    const option = PERIOD_OPTIONS.find(opt => opt.value === currentFilters.period);
    if (currentFilters.period === 'custom' && currentFilters.dateRange) {
      return `${currentFilters.dateRange.startDate} ~ ${currentFilters.dateRange.endDate}`;
    }
    return option?.label || '30일';
  };

  return (
    <div className={`bg-gray-900 rounded-xl border border-gray-800 p-4 sm:p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">필터</h3>
        </div>
        {isLoading && (
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      <div className="space-y-4">
        {/* 기간 선택 드롭다운 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            조회 기간
          </label>
          <div className="relative">
            <select
              value={currentFilters.period}
              onChange={(e) => handlePeriodChange(e.target.value as DateFilterPeriod)}
              disabled={isLoading}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-sm touch-manipulation"
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          
          {/* 선택된 기간 표시 */}
          <div className="mt-2 text-sm text-gray-400">
            선택된 기간: <span className="text-blue-400 font-medium">{getCurrentPeriodLabel()}</span>
          </div>
        </div>

        {/* 사용자 지정 날짜 선택기 */}
        {(currentFilters.period === 'custom' || showDatePicker) && (
          <div className="border-t border-gray-800 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">날짜 직접 선택</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 시작일 */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  시작일
                </label>
                <input
                  type="date"
                  value={localDateRange.startDate}
                  onChange={(e) => setLocalDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  disabled={isLoading}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 sm:py-2 text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 touch-manipulation"
                />
              </div>
              
              {/* 종료일 */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  종료일
                </label>
                <input
                  type="date"
                  value={localDateRange.endDate}
                  onChange={(e) => setLocalDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  disabled={isLoading}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 sm:py-2 text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 touch-manipulation"
                />
              </div>
            </div>
            
            {/* 날짜 선택 버튼들 */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={handleCustomDateApply}
                disabled={isLoading || !localDateRange.startDate || !localDateRange.endDate}
                className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-3 sm:py-2 rounded-lg text-base sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
              >
                적용
              </button>
              <button
                onClick={handleDateReset}
                disabled={isLoading}
                className="px-4 py-3 sm:py-2 bg-gray-700 hover:bg-gray-600 active:bg-gray-800 disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-300 rounded-lg text-base sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 touch-manipulation"
              >
                초기화
              </button>
              {showDatePicker && currentFilters.period !== 'custom' && (
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 빠른 필터 정보 */}
        <div className="text-xs text-gray-500 bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>필터 변경시 즉시 업데이트됩니다</span>
          </div>
          <div>터치하기 쉬운 모바일 친화적 디자인</div>
        </div>
      </div>
    </div>
  );
}