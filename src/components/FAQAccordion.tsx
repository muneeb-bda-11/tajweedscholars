import React, { useState } from "react";
import { FAQS, FAQ } from "../config/site";
import { Icon } from "./Icon";
import { motion, AnimatePresence } from "motion/react";

interface FAQAccordionProps {
  category?: "trial" | "pricing" | "all";
  limit?: number;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ category = "all", limit }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  const filteredFaqs = FAQS.filter(
    (faq) => category === "all" || faq.category === category
  ).slice(0, limit || FAQS.length);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFaq(id);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4" id="faq-accordion-container">
      {filteredFaqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div
            key={faq.id}
            className={`border rounded-2xl transition-all duration-300 ${
              isOpen
                ? "border-emerald-600 bg-stone-50/50 shadow-sm"
                : "border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-stone-100/40"
            }`}
            id={`faq-item-${faq.id}`}
          >
            <h3>
              <button
                type="button"
                onClick={() => toggleFaq(faq.id)}
                onKeyDown={(e) => handleKeyDown(e, faq.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${faq.id}`}
                id={`faq-btn-${faq.id}`}
                className="w-full flex items-center justify-between text-left px-6 py-5 cursor-pointer text-stone-900 font-display font-semibold text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 rounded-2xl"
              >
                <span>{faq.question}</span>
                <span
                  className={`ml-4 shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-stone-200/50 text-stone-700 transition-transform duration-300 ${
                    isOpen ? "rotate-180 bg-emerald-100 text-emerald-800" : ""
                  }`}
                >
                  <Icon name="ChevronDown" size={16} />
                </span>
              </button>
            </h3>
            
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-answer-${faq.id}`}
                  role="region"
                  aria-labelledby={`faq-btn-${faq.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 text-stone-600 text-sm md:text-base leading-relaxed border-t border-stone-200/60 pt-4 font-normal">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
