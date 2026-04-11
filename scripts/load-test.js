/**
 * Load Testing Script
 * 
 * Usage: node scripts/load-test.js
 * 
 * This script simulates concurrent users to test system performance
 */

const http = require('http');
const https = require('https');

const config = {
  host: process.env.TEST_HOST || 'localhost',
  port: process.env.TEST_PORT || 3001,
  protocol: process.env.TEST_PROTOCOL || 'http',
  concurrentUsers: parseInt(process.env.CONCURRENT_USERS || '100'),
  duration: parseInt(process.env.TEST_DURATION || '60'), // seconds
  rampUp: parseInt(process.env.RAMP_UP || '10'), // seconds
};

const stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalLatency: 0,
  minLatency: Infinity,
  maxLatency: 0,
  latencies: [],
};

function makeRequest(path = '/api/v1/health') {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const client = config.protocol === 'https' ? https : http;

    const req = client.request(
      {
        hostname: config.host,
        port: config.port,
        path,
        method: 'GET',
      },
      (res) => {
        const latency = Date.now() - startTime;
        stats.totalRequests++;
        stats.totalLatency += latency;
        stats.latencies.push(latency);
        stats.minLatency = Math.min(stats.minLatency, latency);
        stats.maxLatency = Math.max(stats.maxLatency, latency);

        if (res.statusCode >= 200 && res.statusCode < 300) {
          stats.successfulRequests++;
        } else {
          stats.failedRequests++;
        }

        res.on('data', () => {});
        res.on('end', () => resolve());
      }
    );

    req.on('error', () => {
      stats.totalRequests++;
      stats.failedRequests++;
      resolve();
    });

    req.setTimeout(30000, () => {
      req.destroy();
      stats.totalRequests++;
      stats.failedRequests++;
      resolve();
    });

    req.end();
  });
}

async function simulateUser() {
  const endpoints = [
    '/api/v1/health',
    '/api/v1/health/ready',
    '/api/v1/health/live',
  ];

  while (Date.now() < stats.endTime) {
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    await makeRequest(endpoint);
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  }
}

function calculatePercentile(arr, percentile) {
  const sorted = arr.slice().sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}

function printStats() {
  console.log('\n' + '='.repeat(60));
  console.log('LOAD TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`Total Requests:      ${stats.totalRequests}`);
  console.log(`Successful:          ${stats.successfulRequests} (${((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2)}%)`);
  console.log(`Failed:              ${stats.failedRequests} (${((stats.failedRequests / stats.totalRequests) * 100).toFixed(2)}%)`);
  console.log(`\nLatency Statistics:`);
  console.log(`  Min:               ${stats.minLatency}ms`);
  console.log(`  Max:               ${stats.maxLatency}ms`);
  console.log(`  Average:           ${(stats.totalLatency / stats.totalRequests).toFixed(2)}ms`);
  console.log(`  P50 (Median):      ${calculatePercentile(stats.latencies, 50)}ms`);
  console.log(`  P95:               ${calculatePercentile(stats.latencies, 95)}ms`);
  console.log(`  P99:               ${calculatePercentile(stats.latencies, 99)}ms`);
  console.log(`\nThroughput:          ${(stats.totalRequests / config.duration).toFixed(2)} req/s`);
  console.log('='.repeat(60) + '\n');
}

async function runLoadTest() {
  console.log('\n' + '='.repeat(60));
  console.log('STARTING LOAD TEST');
  console.log('='.repeat(60));
  console.log(`Target:              ${config.protocol}://${config.host}:${config.port}`);
  console.log(`Concurrent Users:    ${config.concurrentUsers}`);
  console.log(`Duration:            ${config.duration}s`);
  console.log(`Ramp-up:             ${config.rampUp}s`);
  console.log('='.repeat(60) + '\n');

  stats.startTime = Date.now();
  stats.endTime = stats.startTime + config.duration * 1000;

  const users = [];
  const usersPerSecond = config.concurrentUsers / config.rampUp;

  // Ramp up users gradually
  for (let i = 0; i < config.concurrentUsers; i++) {
    users.push(simulateUser());
    
    if ((i + 1) % Math.ceil(usersPerSecond) === 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      process.stdout.write(`\rRamping up... ${i + 1}/${config.concurrentUsers} users`);
    }
  }

  console.log('\n\nAll users active. Running test...\n');

  // Wait for all users to complete
  await Promise.all(users);

  printStats();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nTest interrupted. Printing partial results...\n');
  printStats();
  process.exit(0);
});

// Run the test
runLoadTest().catch((error) => {
  console.error('Load test failed:', error);
  process.exit(1);
});
