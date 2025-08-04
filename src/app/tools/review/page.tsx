'use client'

import { useState } from 'react'
import DailyReview from '@/components/review/DailyReview'
import WeeklyReview from '@/components/review/WeeklyReview'
import MonthlyReview from '@/components/review/MonthlyReview'

export default function ReviewPage() {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            📝 个人复盘系统
          </h1>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setActiveTab('daily')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  activeTab === 'daily'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                每日复盘
              </button>
              <button
                onClick={() => setActiveTab('weekly')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  activeTab === 'weekly'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                每周复盘
              </button>
              <button
                onClick={() => setActiveTab('monthly')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  activeTab === 'monthly'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                每月复盘
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'daily' && <DailyReview />}
            {activeTab === 'weekly' && <WeeklyReview />}
            {activeTab === 'monthly' && <MonthlyReview />}
          </div>
        </div>
      </div>
    </div>
  )
}