import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { MultipleExpenseItems } from '@/components/expenses/multiple-expense-items';
import { requireAdmin } from '@/lib/auth/admin';
import { setFlash } from '@/lib/flash';
import { expenseBatchSchema } from '@/lib/validations/expense';
import type { PaymentStatus, AccountType } from '@/lib/types/database';

function getTodayDateInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default async function NewExpensePage() {
  await requireAdmin();
  const today = getTodayDateInputValue();

  async function createExpense(formData: FormData) {
    'use server';

    const { supabase, user } = await requireAdmin();
    const purposes = formData.getAll('purpose').map(String);
    const requestedBy = formData.getAll('requested_by').map(String);
    const amounts = formData.getAll('amount').map(String);

    const raw = {
      date: formData.get('date') as string,
      check_number: formData.get('check_number') as string,
      voucher_number: formData.get('voucher_number') as string,
      account_type: formData.get('account_type') as AccountType,
      status: formData.get('status') as PaymentStatus,
      line_items: purposes.map((purpose, index) => ({
        purpose,
        requested_by: requestedBy[index],
        amount: amounts[index],
      })),
    };

    const parsed = expenseBatchSchema.safeParse(raw);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => i.message).join(', ');
      await setFlash('error', errors);
      redirect('/expenses/new');
    }

    const rows = parsed.data.line_items.map((item) => ({
      date: parsed.data.date,
      check_number: parsed.data.check_number,
      voucher_number: parsed.data.voucher_number,
      purpose: item.purpose,
      amount: item.amount,
      requested_by: item.requested_by,
      account_type: parsed.data.account_type,
      status: parsed.data.status,
      created_by: user.id,
    }));

    const { error } = await supabase.from('expenses').insert(rows);

    if (error) {
      await setFlash('error', error.message);
      redirect('/expenses/new');
    }

    await setFlash(
      'success',
      `${rows.length} expense item${rows.length === 1 ? '' : 's'} created successfully.`,
    );
    redirect('/expenses');
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { label: 'Expenses', href: '/expenses' },
          { label: 'New Expense' },
        ]}
      />
      <Link
        href="/expenses"
        className="text-sm text-blue-700 hover:underline mb-4 inline-block"
      >
        ← Back to expenses
      </Link>
      <h1 className="text-2xl font-bold text-slate-950 mb-6 font-mono">
        New Expense
      </h1>
      <form
        action={createExpense}
        className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm shadow-blue-100/60 space-y-4"
      >
        <input type="hidden" name="status" value="Released" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            name="date"
            label="Date"
            type="date"
            defaultValue={today}
            required
          />
          <Field
            name="check_number"
            label="Check Number"
            placeholder="e.g. 123456"
            required
          />
          <Field
            name="voucher_number"
            label="Voucher Number"
            placeholder="e.g. 123456"
            required
          />
          <SelectField
            name="account_type"
            label="Account Type"
            options={['Project Account', 'Expenses Account', 'Savings Account']}
            required
          />
        </div>
        <MultipleExpenseItems />
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors"
        >
          Create Expense
        </button>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  placeholder,
  defaultValue,
  type = 'text',
  required = false,
}: {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-blue-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function SelectField({
  name,
  label,
  options,
  defaultValue,
  required = false,
}: {
  name: string;
  label: string;
  options: string[];
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-blue-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-blue-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="" disabled={required}>
          Select...
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
