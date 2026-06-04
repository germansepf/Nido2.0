import { redirect } from 'next/navigation'

// Always redirect to /dashboard — protected layout handles auth check
export default function RootPage() {
  redirect('/dashboard')
}
