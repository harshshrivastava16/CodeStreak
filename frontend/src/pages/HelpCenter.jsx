import React, { useState } from 'react';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      question: "How do I sync my coding platforms?",
      answer: "To sync your coding platforms, navigate to the 'Settings' page and select 'Platform Sync'. Follow the instructions to connect your accounts from LeetCode, Codeforces, GFG, Hackerrank, and more. Ensure you have the correct credentials for each platform."
    },
    {
      question: "What are the benefits of maintaining a streak?",
      answer: "Maintaining a streak helps build a consistent coding habit, improves problem-solving skills, and keeps you motivated. It also allows you to track your progress over time and compete with friends on the leaderboard."
    },
    {
      question: "How can I join community challenges?",
      answer: "You can join community challenges from the 'Challenges' tab. Browse through the available challenges, select one that interests you, and click 'Join Challenge'. You'll then be able to submit your solutions and see your ranking."
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#111827] dark" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="flex h-full grow flex-col">
    

        <main className="flex-1 px-4  pt-[4.4rem] md:pt-[4.4rem] py-8 sm:px-6 md:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Help & Support</h1>
              <p className="mt-4 text-lg text-gray-400">Find answers to common questions or contact our support team for assistance.</p>
            </div>

            <div className="mt-12">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="material-symbols-outlined text-gray-400">search</span>
                </div>
                <input
                  className="block w-full rounded-lg border-gray-700 bg-gray-800 p-4 pl-10 text-white placeholder-gray-400 focus:border-[var(--primary-500)] focus:ring-[var(--primary-500)]"
                  placeholder="Search for help articles"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-16">
              <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
              <div className="mt-6 space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <details key={index} className="rounded-lg bg-gray-800 p-6 group">
                    <summary className="flex cursor-pointer items-center justify-between text-lg font-medium text-white">
                      {faq.question}
                      <span className="material-symbols-outlined text-gray-400 transition-transform group-open:rotate-180">expand_more</span>
                    </summary>
                    <p className="mt-4 text-gray-400">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>

            <div className="mt-16 text-center">
              <h2 className="text-2xl font-bold text-white">Still need help?</h2>
              <p className="mt-4 text-lg text-gray-400">If you couldn't find an answer in our FAQs, please reach out to our support team. We're here to help!</p>
              <div className="mt-6">
                <button className="inline-flex items-center justify-center rounded-lg bg-[var(--primary-600)] px-6 py-3 text-base font-medium text-white hover:bg-[var(--primary-700)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:ring-offset-2 focus:ring-offset-gray-900">
                  Contact Support
                </button>
              </div>
            </div>

            <div className="mt-16">
              <h2 className="text-2xl font-bold text-white text-center">Community & Resources</h2>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <a className="flex flex-col items-center justify-center rounded-lg border border-gray-700 bg-gray-800 p-6 text-center hover:bg-gray-700" href="#">
                  <span className="material-symbols-outlined text-4xl text-[var(--primary-400)]">forum</span>
                  <h3 className="mt-4 text-lg font-medium text-white">Community Forum</h3>
                  <p className="mt-2 text-gray-400">Ask questions and share tips with fellow coders.</p>
                </a>
                <a className="flex flex-col items-center justify-center rounded-lg border border-gray-700 bg-gray-800 p-6 text-center hover:bg-gray-700" href="#">
                  <span className="material-symbols-outlined text-4xl text-[var(--primary-400)]">menu_book</span>
                  <h3 className="mt-4 text-lg font-medium text-white">Documentation</h3>
                  <p className="mt-2 text-gray-400">Explore our comprehensive guides and tutorials.</p>
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HelpCenter;
