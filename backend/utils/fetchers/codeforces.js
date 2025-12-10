const axios = require("axios");

const fetchCodeforcesStats = async (username) => {
  try {
    // Get user submissions
    const url = `https://codeforces.com/api/user.status?handle=${encodeURIComponent(username)}&from=1&count=10000`; // Get up to 10k submissions
    const response = await axios.get(url);

    if (response.data?.status !== 'OK') {
      throw new Error("Invalid response from Codeforces API");
    }

    const submissions = response.data.result || [];

    // Count unique solved problems by difficulty
    const solvedProblems = new Set();
    let totalSubmissions = submissions.length;
    let acceptedSubmissions = 0;

    submissions.forEach(sub => {
      if (sub.verdict === 'OK') {
        acceptedSubmissions++;
        const problemKey = `${sub.problem.contestId}-${sub.problem.index}`;
        if (!solvedProblems.has(problemKey)) {
          solvedProblems.add(problemKey);
        }
      }
    });

    const totalSolved = solvedProblems.size;

    // Categorize by rating (approximate easy/medium/hard)
    const easy = [];
    const medium = [];
    const hard = [];

    solvedProblems.forEach(problemKey => {
      const sub = submissions.find(s => s.verdict === 'OK' && `${s.problem.contestId}-${s.problem.index}` === problemKey);
      if (sub && sub.problem.rating) {
        const rating = sub.problem.rating;
        if (rating < 1200) easy.push(problemKey);
        else if (rating < 1800) medium.push(problemKey);
        else hard.push(problemKey);
      }
    });

    const accuracy = totalSubmissions > 0 ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(2) : 0;

    return {
      totalSolved,
      easy: easy.length,
      medium: medium.length,
      hard: hard.length,
      accuracy: parseFloat(accuracy),
      currentStreak: 0, // Codeforces does not provide streak data
      longestStreak: 0, // Codeforces does not provide streak data
    };
  } catch (error) {
    console.error(` Error fetching Codeforces stats:`, error.message);
    return {
      totalSolved: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      accuracy: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActive: null,
    };
  }
};

module.exports = { fetchCodeforcesStats };
