import React, { useState } from 'react';
import { TERMS_SECTIONS, TERMS_FAQS } from '../data/websiteData';

export const TermsPage: React.FC = () => {
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0]);

  const toggleFaq = (index: number) => {
    if (openFaqIndices.includes(index)) {
      setOpenFaqIndices(openFaqIndices.filter((i) => i !== index));
    } else {
      setOpenFaqIndices([...openFaqIndices, index]);
    }
  };

  return (
    <div className="w-full py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-[var(--secondary)]">
            Legal & Operational Guidelines
          </span>
          <h1
            style={{ fontFamily: 'Georgia, serif' }}
            className="font-bold text-3xl sm:text-5xl text-[var(--text)] mt-2 tracking-tight"
          >
            Terms & Conditions of Service
          </h1>
          <p className="text-[var(--muted)] text-base sm:text-lg mt-3 leading-relaxed">
            Standard production terms governing creative commissions, digital deliverables, payment schedules, intellectual property, and revisions with Horizon Digital Media.
          </p>

          {/* Legal Qualification Box (Prompt Section 11) */}
          <div className="mt-6 p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] flex items-start gap-3">
            <i className="fa-solid fa-scale-balanced text-[var(--secondary)] text-sm mt-0.5"></i>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              <strong>Advisory Notice:</strong> These terms serve as the standard operational guidelines of Horizon Digital Media and should be reviewed and adapted by qualified local legal counsel prior to formal execution as a custom binding contract.
            </p>
          </div>
        </div>

        {/* 10 Terms Sections (Prompt Section 11) */}
        <div className="space-y-6 mb-20">
          {TERMS_SECTIONS.map((sec) => (
            <div
              key={sec.number}
              className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 sm:p-8 card-hover-glow"
            >
              <div className="flex items-baseline gap-4 mb-3">
                <span className="font-display font-bold text-xl sm:text-2xl text-[var(--secondary)]">
                  {sec.number}.
                </span>
                <h2 className="font-display font-bold text-lg sm:text-xl text-[var(--text)]">
                  {sec.title}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed pl-8 sm:pl-10">
                {sec.content}
              </p>
            </div>
          ))}
        </div>

        {/* Client Pre-Order FAQ (Prompt Section 11) */}
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[24px] p-6 sm:p-10 shadow-xl">
          <div className="max-w-2xl mb-8">
            <span className="text-xs uppercase font-bold tracking-widest text-[var(--secondary)]">
              Questions & Answers
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[var(--text)] mt-1">
              Client Pre-Order FAQ
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-2">
              Common operational questions regarding retainers, revisions, NDAs, and project approvals.
            </p>
          </div>

          <div className="space-y-3">
            {TERMS_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndices.includes(idx);
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="font-display font-semibold text-sm sm:text-base text-[var(--text)]">
                      {faq.question}
                    </span>
                    <i
                      className={`fa-solid fa-chevron-down text-xs text-[var(--secondary)] transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    ></i>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[var(--muted)] leading-relaxed border-t border-[var(--line)]/50 animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
