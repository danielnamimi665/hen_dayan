'use client'

import WorkDays from './WorkDays'
import InvoicesPage from './InvoicesPage'
import ExpensesPage from './ExpensesPage'
import ToolsMaintenancePage from './ToolsMaintenancePage'
import CustomersPage from './CustomersPage'

interface ContentAreaProps {
  selectedCategory: string
}

export default function ContentArea({ selectedCategory }: ContentAreaProps) {
  switch (selectedCategory) {
    case 'ימי עבודה':
      return <WorkDays />
    case 'חשבוניות':
      return <InvoicesPage />
    case 'הוצאות':
      return <ExpensesPage />
    case 'טיפול כלים':
      return <ToolsMaintenancePage />
    case 'חזרה ללקוחות':
      return <CustomersPage />
    default:
      return (
        <div className="min-h-screen bg-transparent p-4 rtl">
          <div className="text-center py-8">
            <h1 className="text-3xl font-bold text-white mb-6">בחר קטגוריה</h1>
            <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg border-2 border-gray-300 flex items-center justify-center">
              <div className="text-gray-500 text-center">
                <div className="text-4xl mb-2">📋</div>
                <div className="text-sm">בחר קטגוריה מהתפריט למעלה</div>
              </div>
            </div>
          </div>
        </div>
      )
  }
}
