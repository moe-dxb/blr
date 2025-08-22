// src/app/expenses/page.tsx
import { ExpenseClaimForm } from './ExpenseClaimForm';
import { ExpenseHistory } from './ExpenseHistory';
import { getUserExpenseHistory } from '@/lib/firebase/get-expense-data';

export default async function ExpensesPage() {
  const expenseHistory = await getUserExpenseHistory();

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Expense Claims</h1>
        <p className="text-gray-500">Submit new claims for reimbursement and view your history.</p>
      </header>
      
      <main>
        <ExpenseClaimForm />
      </main>

      <section>
        <ExpenseHistory initialHistory={expenseHistory as any} />
      </section>
    </div>
  );
}
