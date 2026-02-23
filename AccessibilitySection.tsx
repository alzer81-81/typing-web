import React from "react";

export default function AccessibilitySection() {
  return (
    <section
      id="accessibility"
      data-section="accessibility"
      className="bg-white py-20 md:py-24"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 md:grid-cols-2 md:gap-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
            Accessibility
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Built for Every Learner
          </h2>
          <p className="mt-4 max-w-xl text-base text-slate-600">
            Inclusive design that supports diverse learning needs and assistive technologies.
          </p>
        </div>

        <ul className="space-y-3 text-slate-700">
          <li className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-0.5 text-blue-600">✓</span>
            <span>Screen reader compatible</span>
          </li>
          <li className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-0.5 text-blue-600">✓</span>
            <span>Full keyboard navigation</span>
          </li>
          <li className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-0.5 text-blue-600">✓</span>
            <span>High-contrast &amp; zoom support</span>
          </li>
          <li className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-0.5 text-blue-600">✓</span>
            <span>WCAG 2.2 AA aligned</span>
          </li>
        </ul>

        <div className="md:col-start-1">
          <a
            href="/accessibility"
            className="inline-flex rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            aria-label="View Accessibility Details"
          >
            View Accessibility Details
          </a>
        </div>
      </div>
    </section>
  );
}
