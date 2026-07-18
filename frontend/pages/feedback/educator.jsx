import React from 'react'
import { MessageCircle } from 'lucide-react'
import AppShell from '../../components/AppShell'

/**
 * Replace this with your real Google Form embed URL:
 *   1. Open your Google Form -> Send -> the "<>" embed icon.
 *   2. Copy the URL inside src="..." (it ends in /viewform?embedded=true).
 *   3. Paste it below in place of EDUCATOR_FEEDBACK_FORM_URL.
 * Use a separate Google Form from the student one so responses stay
 * grouped by audience in Google Sheets.
 */
const EDUCATOR_FEEDBACK_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSf_REPLACE_WITH_YOUR_EDUCATOR_FORM_ID/viewform?embedded=true'

export default function EducatorFeedbackPage() {
  return (
    <AppShell
      eyebrow="Educator Feedback"
      title="Help us improve the educator workspace"
      description="Tell us what's working across classrooms, grading, meetings, and AI tools, and what's getting in your way. Feedback goes straight to the product team."
    >
      <div className="card p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-zinc-950 p-3 text-[#d9c25c]">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="section-kicker text-[#18181b]">Google Form</p>
            <h2 className="text-xl font-bold text-zinc-950">Educator feedback form</h2>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
          <iframe
            title="Educator Feedback Form"
            src={EDUCATOR_FEEDBACK_FORM_URL}
            width="100%"
            height="900"
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
          >
            Loading form...
          </iframe>
        </div>

        <p className="mt-4 text-sm text-zinc-600">
          Prefer to fill it out in a new tab?{' '}
          <a
            href={EDUCATOR_FEEDBACK_FORM_URL.replace('?embedded=true', '')}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-zinc-950 underline"
          >
            Open the form directly
          </a>
          .
        </p>
      </div>
    </AppShell>
  )
}
