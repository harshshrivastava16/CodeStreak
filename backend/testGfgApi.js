const { fetchGfgStats } = require('./utils/fetchers/gfg');

async function testGfgApi() {
  try {
    console.log("Testing GFG API with validation...");
    const stats = await fetchGfgStats('harshshrivastava16');
    console.log("GFG Stats Result:", stats);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testGfgApi();
