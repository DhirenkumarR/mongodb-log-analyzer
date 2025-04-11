const fs = require('fs');
const readline = require('readline');
const cliProgress = require('cli-progress');
const { statSync } = require('fs');
const path = require('path');

// Start the timer
console.time('Total Time Taken');

// === Setup Paths ===
const filePath = 'MONGODB.log';
const totalSize = statSync(filePath).size;
const outputCsvPath = path.join(__dirname, 'slow_queries.csv');

// === CSV Header ===
const csvHeader = `"timestamp","durationMillis","nreturned","docsExamined","command"\n`;
fs.writeFileSync(outputCsvPath, csvHeader);

// === Stream Setup ===
let bytesRead = 0;
const fileStream = fs.createReadStream(filePath);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

// === Progress Bar ===
const progressBar = new cliProgress.SingleBar({
  format: 'Progress [{bar}] {percentage}% | {value}/{total} bytes',
  hideCursor: true
}, cliProgress.Presets.shades_classic);

progressBar.start(totalSize, 0);

// === Trackers ===
const userLoginCount = {};
const ipLoginCount = {};
let slowQueryCount = 0;

// === Read Stream Progress ===
fileStream.on('data', chunk => {
  bytesRead += chunk.length;
  progressBar.update(bytesRead);
});

// === Line by Line Processing ===
rl.on('line', (line) => {
  try {
    const log = JSON.parse(line);
    const msg = log.msg;
    const attr = log?.attr;
    const user = attr?.principalName;
    const ip = attr?.remote;

    // Handle login
    if (msg === 'Authentication succeeded') {
      if (user) userLoginCount[user] = (userLoginCount[user] || 0) + 1;
      if (ip) ipLoginCount[ip] = (ipLoginCount[ip] || 0) + 1;
    }

    // Handle slow query
    if (msg === 'Slow query' && attr?.durationMillis > 1000) {
      const duration = attr.durationMillis;
      const returned = attr.nreturned || 0;
      const scanned = attr.docsExamined || 0;
      const command = JSON.stringify(attr.command).replace(/"/g, '""');
      const timestamp = log?.t?.["$date"] || "";

      const row = `"${timestamp}","${duration}","${returned}","${scanned}","${command}"\n`;
      fs.appendFileSync(outputCsvPath, row);
      slowQueryCount++;
    }

  } catch (err) {
    // silently skip malformed lines
  }
});

// === Final Summary ===
rl.on('close', () => {
  progressBar.stop();

  // Print Login Counts
  console.log('\n👤 Login Count Per User:');
  console.table(userLoginCount);

  // Top 5 IPs
  const top5IPs = Object.entries(ipLoginCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const top5IPTable = {};
  top5IPs.forEach(([ip, count]) => {
    top5IPTable[ip] = count;
  });

  console.log('\n🌐 Top 5 IPs with Most Logins:');
  console.table(top5IPTable);

  // Final Summary
  console.log(`\n🐢 Slow queries logged to CSV: ${slowQueryCount}`);
  console.log(`📄 CSV file saved: ${outputCsvPath}`);
  console.timeEnd('Total Time Taken');
});
