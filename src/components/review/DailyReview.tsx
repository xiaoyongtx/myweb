'use client'

import { useState, useEffect } from 'react'

interface DailyReviewData {
  date: string
  whatDidToday: string
  whatOutput: string
  timeSpent: string
  shouldDo: string
  shouldNotDo: string
  problems: string
  problemCauses: string
  betterWays: string
  timeImprovement: string
  smallWins: string
  insights: string
}

export default function DailyReview() {
  const [reviewData, setReviewData] = useState<DailyReviewData>({
    date: new Date().toISOString().split('T')[0],
    whatDidToday: '',
    whatOutput: '',
    timeSpent: '',
    shouldDo: '',
    shouldNotDo: '',
    problems: '',
    problemCauses: '',
    betterWays: '',
    timeImprovement: '',
    smallWins: '',
    insights: ''
  })

  const [savedReviews, setSavedReviews] = useState<DailyReviewData[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('dailyReviews')
    if (saved) {
      setSavedReviews(JSON.parse(saved))
    }
  }, [])

  const handleInputChange = (field: keyof DailyReviewData, value: string) => {
    setReviewData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const saveReview = () => {
    const updatedReviews = [...savedReviews.filter(r => r.date !== reviewData.date), reviewData]
    setSavedReviews(updatedReviews)
    localStorage.setItem('dailyReviews', JSON.stringify(updatedReviews))
    alert('复盘已保存！')
  }

  const loadReview = (date: string) => {
    const review = savedReviews.find(r => r.date === date)
    if (review) {
      setReviewData(review)
    }
  }

  const questions = [
    { key: 'whatDidToday', label: '1. 今天都做了什么？', placeholder: '列出今天完成的主要任务和活动...' },
    { key: 'whatOutput', label: '2. 所做的事情分别有什么产出？', placeholder: '每项任务的具体成果和收获...' },
    { key: 'timeSpent', label: '3. 做这些事情，分别花了多少时间？', placeholder: '时间分配情况...' },
    { key: 'shouldDo', label: '4. 哪些是应该做的？哪些是不应该做的？', placeholder: '分析任务的必要性...' },
    { key: 'problems', label: '5. 遇到什么问题？分别是什么原因造成的？', placeholder: '问题及其根本原因...' },
    { key: 'betterWays', label: '6. 应该做的事情还有更好的方式吗？', placeholder: '改进方法和优化思路...' },
    { key: 'timeImprovement', label: '7. 在时间花费上还有哪些方面需要改进？', placeholder: '时间管理的改进点...' },
    { key: 'smallWins', label: '8. 今天的小确幸，今天发生什么好事让我快乐/感激？', placeholder: '记录今天的美好时刻...' },
    { key: 'insights', label: '9. 今天想明白的一个道理/启发', placeholder: '今天的思考和感悟...' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          👋 每日复盘
        </h2>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={reviewData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={saveReview}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            保存复盘
          </button>
        </div>
      </div>

      {/* 历史复盘快速访问 */}
      {savedReviews.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">历史复盘</h3>
          <div className="flex flex-wrap gap-2">
            {savedReviews.slice(-7).reverse().map((review) => (
              <button
                key={review.date}
                onClick={() => loadReview(review.date)}
                className="px-3 py-1 bg-white border border-gray-200 rounded-md text-sm hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                {review.date}
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
              value={reviewData[question.key as keyof DailyReviewData]}
              onChange={(e) => handleInputChange(question.key as keyof DailyReviewData, e.target.value)}
              placeholder={question.placeholder}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>提醒：</strong>每天晚上10点前完成当日复盘和次日计划
        </p>
      </div>
    </div>
  )
}