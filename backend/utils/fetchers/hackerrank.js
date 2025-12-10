const puppeteer = require('puppeteer');

const fetchHackerRankStats = async (username) => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`https://www.hackerrank.com/profile/${username}`, { waitUntil: 'networkidle2' });

    const stats = await page.evaluate(() => {
      // Scrape the stats from the page
      // Selectors may need adjustment based on actual page structure
      const totalSolvedElement = document.querySelector('.stats .total-solved') || document.querySelector('[data-attr="total-solved"]') || document.querySelector('.total-solved');
      const easyElement = document.querySelector('.stats .easy') || document.querySelector('[data-attr="easy"]') || document.querySelector('.easy');
      const mediumElement = document.querySelector('.stats .medium') || document.querySelector('[data-attr="medium"]') || document.querySelector('.medium');
      const hardElement = document.querySelector('.stats .hard') || document.querySelector('[data-attr="hard"]') || document.querySelector('.hard');
      const accuracyElement = document.querySelector('.stats .accuracy') || document.querySelector('[data-attr="accuracy"]') || document.querySelector('.accuracy');

      const totalSolved = totalSolvedElement ? parseInt(totalSolvedElement.textContent.trim()) || 0 : 0;
      const easy = easyElement ? parseInt(easyElement.textContent.trim()) || 0 : 0;
      const medium = mediumElement ? parseInt(mediumElement.textContent.trim()) || 0 : 0;
      const hard = hardElement ? parseInt(hardElement.textContent.trim()) || 0 : 0;
      const accuracy = accuracyElement ? parseFloat(accuracyElement.textContent.trim()) || 0 : 0;

      return { totalSolved, easy, medium, hard, accuracy };
    });

    await browser.close();

    // Calculate lastActive from recent submissions (if available)
    // Note: HackerRank scraping might not provide timestamps, so lastActive might be null
    let lastActive = null;
    // If we can scrape submission dates, calculate here. For now, set to null as it's not implemented.

    return {
      ...stats,
      currentStreak: 0, // HackerRank does not provide streak data
      longestStreak: 0, // HackerRank does not provide streak data
      lastActive,
    };
  } catch (error) {
    console.error(` Error fetching HackerRank stats:`, error.message);
    return { totalSolved: 0, easy: 0, medium: 0, hard: 0, accuracy: 0, currentStreak: 0, longestStreak: 0 };
  }
};

module.exports = { fetchHackerRankStats };
