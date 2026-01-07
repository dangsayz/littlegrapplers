import { Metadata } from 'next';
import FAQContent, { faqCategories } from './faq-content';
import { FAQJsonLd } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'FAQ - Kids BJJ Questions Answered',
  description:
    'Find answers to common questions about Little Grapplers youth Brazilian Jiu-Jitsu programs, including age requirements, safety, pricing, and belt progression.',
  keywords: [
    'kids BJJ FAQ',
    'youth martial arts questions',
    'BJJ for children',
    'kids jiu-jitsu safety',
    'BJJ belt system kids',
  ],
  openGraph: {
    title: 'Frequently Asked Questions - Little Grapplers',
    description: 'Get answers to all your questions about youth BJJ classes in Dallas-Fort Worth.',
  },
};

export default function FAQPage() {
  const allFaqs = faqCategories.flatMap((cat) =>
    cat.questions.map((q) => ({ question: q.question, answer: q.answer }))
  );

  return (
    <>
      <FAQJsonLd faqs={allFaqs} />
      <FAQContent />
    </>
  );
}
