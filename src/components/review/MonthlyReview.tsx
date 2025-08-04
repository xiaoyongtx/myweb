'use client'

import { useState, useEffect } from 'react'

interface MonthlyReviewData {
  year: number
  month: number
  monthlyGoals: string
  goalReasonable: string
  planExecution: string
  executionTime: string
  executionContent: string
  results: string
  completionTime: string
  completionResults: string
  problemAnalysis: string
  majorEvents: string
  nextMonthGoals: string
  personalGrowth: string
  nextSteps: string
  summary: string
}

export default function MonthlyReview() {
  const [reviewData, setReviewData] = useState<MonthlyReviewData>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    monthlyGoals: '',
    goalReasonable: '',
    planExecution: '',
    executionTime: '',
    executionContent: '',
    results: '',
    completionTime: '',
    completionResults: '',
    problemAnalysis: '',
    majorEvents: '',
    nextMonthGoals: '',
    personalGrowth: '',
    nextSteps: '',
    summary: ''
  })

  const [savedReviews, setSavedReviews] = useState<MonthlyReviewData[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('monthlyReviews')
    if (saved) {
      setSavedReviews(JSON.parse(saved))
    }
  }, [])

  const handleInputChange = (field: keyof MonthlyReviewData, value: string | number) => {
    setReviewData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const saveReview = () => {
    const monthKey = `${reviewData.year}-${reviewData.month}`
    const updatedReviews = [...savedReviews.filter(r => `${r.year}-${r.month}` !== monthKey), reviewData]
    setSavedReviews(updatedReviews)
    localStorage.setItem('monthlyReviews', JSON.stringify(updatedReviews))
    alert('月复盘已保存！')
  }

  const questions = [
    { 
      key: 'monthlyGoals', 
      label: '1. 本月目标是否合理？目标是否完成？', 
      placeholder: '回顾本月设定的目标，分析其合理性和完成情况...',
      rows: 3
    },
    { 
      key: 'planExecution', 
      label: '2. 计划具体行动执行时间&执行内容', 
      placeholder: '详细记录计划的执行过程...',
      rows: 4
    },
    { 
      key: 'results', 
      label: '3. 检查结果：完成时间&完成结果', 
      placeholder: '客观评估完成情况和结果质量...',
      rows: 3
    },
    { 
      key: 'problemAnalysis', 
      label: '4. 问题分析完成&未完成', 
      placeholder: '深入分析完成和未完成的原因...',
      rows: 4
    },
    { 
      key: 'majorEvents', 
      label: '5. 本月大事记：写下月度大事记；自己取得的进步与成就', 
      placeholder: '记录本月的重要事件和个人成长...',
      rows: 4
    },
    { 
      key: 'nextSteps', 
      label: '6. 下步计划继续做，停止做，开始做', 
      placeholder: '继续做：...\n停止做：...\n开始做：...',
      rows: 4
    },
    { 
      key: 'summary', 
      label: '7. 总结成文（总结行动计划，方案，总结经历中可复用的方法论、目前复盘中的问题，复盘给我的收获）', 
      placeholder: '深度总结本月的经验教训和方法论...',
      rows: 5
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          👋 每月复盘
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <select
              value={reviewData.year}
              onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
            <select
              value={reviewData.month}
              onChange={(e) => handleInputChange('month', parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{month}月</option>
              ))}
            </select>
          </div>
          <button
            onClick={saveReview}
            className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors"
          >
            保存复盘
          </button>
        </div>
      </div>

      {/* 历史复盘快速访问 */}
      {savedReviews.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">历史月复盘</h3>
          <div className="flex flex-wrap gap-2">
            {savedReviews.slice(-12).reverse().map((review) => (
              <button
                key={`${review.year}-${review.month}`}
                onClick={() => setReviewData(review)}
                className="px-3 py-1 bg-white border border-gray-200 rounded-md text-sm hover:bg-purple-50 hover:border-purple-300 transition-colors"
              >
                {review.year}年{review.month}月
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
              value={reviewData[question.key as keyof MonthlyReviewData] as string}
              onChange={(e) => handleInputChange(question.key as keyof MonthlyReviewData, e.target.value)}
              placeholder={question.placeholder}
              rows={question.rows}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>
        ))}
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <p className="text-sm text-purple-700">
          💡 <strong>提醒：</strong>每月28日晚上10点前完成本月复盘和次月计划
        </p>
      </div>
    </div>
  )
}