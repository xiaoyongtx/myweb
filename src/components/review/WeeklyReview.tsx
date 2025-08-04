'use client'

import { useState, useEffect } from 'react'

interface WeeklyReviewData {
  weekStart: string
  weekEnd: string
  weeklyPlan: string
  planExecution: string
  results: string
  problemAnalysis: string
  nextWeekPlan: string
  progressTable: string
}

export default function WeeklyReview() {
  const [reviewData, setReviewData] = useState<WeeklyReviewData>({
    weekStart: '',
    weekEnd: '',
    weeklyPlan: '',
    planExecution: '',
    results: '',
    problemAnalysis: '',
    nextWeekPlan: '',
    progressTable: ''
  })

  const [savedReviews, setSavedReviews] = useState<WeeklyReviewData[]>([])

  useEffect(() => {
    // 自动设置本周日期
    const today = new Date()
    const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    
    setReviewData(prev => ({
      ...prev,
      weekStart: monday.toISOString().split('T')[0],
      weekEnd: sunday.toISOString().split('T')[0]
    }))

    const saved = localStorage.getItem('weeklyReviews')
    if (saved) {
      setSavedReviews(JSON.parse(saved))
    }
  }, [])

  const handleInputChange = (field: keyof WeeklyReviewData, value: string) => {
    setReviewData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const saveReview = () => {
    const weekKey = `${reviewData.weekStart}_${reviewData.weekEnd}`
    const updatedReviews = [...savedReviews.filter(r => `${r.weekStart}_${r.weekEnd}` !== weekKey), reviewData]
    setSavedReviews(updatedReviews)
    localStorage.setItem('weeklyReviews', JSON.stringify(updatedReviews))
    alert('周复盘已保存！')
  }

  const questions = [
    { 
      key: 'weeklyPlan', 
      label: '1. 周计划与具体行动（周六制定）', 
      placeholder: '本周的主要目标和具体行动计划...',
      rows: 4
    },
    { 
      key: 'planExecution', 
      label: '2. 周复盘根据行动验收结果&分析原因（为什么达成未达成，不断问自己为什么）', 
      placeholder: '分析本周计划的执行情况，深入思考原因...',
      rows: 5
    },
    { 
      key: 'nextWeekPlan', 
      label: '3. 下步计划继续做，停止做，开始做', 
      placeholder: '继续做：...\n停止做：...\n开始做：...',
      rows: 4
    },
    { 
      key: 'progressTable', 
      label: '4. 把下周的计划写上进度表', 
      placeholder: '制定下周的详细进度安排...',
      rows: 4
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          👋 每周复盘
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={reviewData.weekStart}
              onChange={(e) => handleInputChange('weekStart', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">至</span>
            <input
              type="date"
              value={reviewData.weekEnd}
              onChange={(e) => handleInputChange('weekEnd', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={saveReview}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            保存复盘
          </button>
        </div>
      </div>

      {/* 历史复盘快速访问 */}
      {savedReviews.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">历史周复盘</h3>
          <div className="flex flex-wrap gap-2">
            {savedReviews.slice(-8).reverse().map((review, index) => (
              <button
                key={`${review.weekStart}_${review.weekEnd}`}
                onClick={() => setReviewData(review)}
                className="px-3 py-1 bg-white border border-gray-200 rounded-md text-sm hover:bg-green-50 hover:border-green-300 transition-colors"
              >
                {review.weekStart} ~ {review.weekEnd}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {questions.map((question) => (
          <div key={question.key} className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.label}
            </label>
            <textarea
              value={reviewData[question.key as keyof WeeklyReviewData]}
              onChange={(e) => handleInputChange(question.key as keyof WeeklyReviewData, e.target.value)}
              placeholder={question.placeholder}
              rows={question.rows}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>
        ))}
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-green-700">
          💡 <strong>提醒：</strong>每周六晚上10点前完成本周复盘和下周计划
        </p>
      </div>
    </div>
  )
}