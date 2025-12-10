const axios = require("axios");

const testLeetcodeQuery = async (username) => {
  const query = `
    query getUserData($username: String!) {
      matchedUser(username: $username) {
        profile {
          ranking
        }
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
      userCalendar(username: $username) {
        submissionCalendar
      }
    }
  `;

  const variables = { username };

  try {
    const response = await axios.post(
      "https://leetcode.com/graphql",
      { query, variables },
      {
        headers: {
          "Content-Type": "application/json",
          Referer: `https://leetcode.com/${username}/`,
        },
      }
    );

    const data = response.data.data;
    const profile = data.matchedUser.profile;
    const stats = data.matchedUser.submitStats.acSubmissionNum;
    const calendarRaw = data.userCalendar.submissionCalendar;

    const totalSolved = stats.reduce((sum, item) => sum + item.count, 0);
    const calendarObj = JSON.parse(calendarRaw);

    const today = new Date();
    const todayDateStr = today.toISOString().split("T")[0];
    let todayCount = 0;

    for (const ts in calendarObj) {
      const date = new Date(ts * 1000).toISOString().split("T")[0];
      if (date === todayDateStr) {
        todayCount = calendarObj[ts];
        break;
      }
    }

    console.log(` Username: ${username}`);
    console.log(`🏆 Ranking: ${profile.ranking}`);
    console.log(` Total Problems Solved: ${totalSolved}`);
    console.log(`📅 Submissions Today (${todayDateStr}): ${todayCount}`);
  } catch (error) {
    if (error.response && error.response.data) {
      console.error(" LeetCode API Error:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(" Error:", error.message);
    }
  }
};

const username = process.argv[2] || "16Harsh11";
testLeetcodeQuery(username);
