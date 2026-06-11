// test-query-optimized.js
// Compare performance of different query approaches

const service = require('./orders-service-optimized');

// Helper to format time nicely
function formatTime(ms) {
  return `${ms.toFixed(2)}ms`;
}

// Helper to run a query multiple times and get stats
async function benchmarkQuery(name, queryFn, iterations = 3) {
  console.log(`\n📊 Benchmarking: ${name}`);
  console.log('='.repeat(70));

  const times = [];
  
  for (let i = 1; i <= iterations; i++) {
    try {
      const startTime = process.hrtime();
      const result = await queryFn();
      const endTime = process.hrtime(startTime);
      const executionTimeMs = endTime[0] * 1000 + endTime[1] / 1000000;

      times.push(executionTimeMs);
      console.log(`  Run ${i}/${iterations}: ${formatTime(executionTimeMs)} (${result.length} orders)`);
    } catch (error) {
      console.error(`  Run ${i}/${iterations}: ERROR - ${error.message}`);
      return null;
    }
  }

  // Calculate statistics
  const avgTime = times.reduce((a, b) => a + b) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  console.log('-'.repeat(70));
  console.log(`  Average: ${formatTime(avgTime)}`);
  console.log(`  Min:     ${formatTime(minTime)}`);
  console.log(`  Max:     ${formatTime(maxTime)}`);

  return { name, avgTime, minTime, maxTime, times };
}

async function runBenchmarks() {
  console.log('\n🚀 PERFORMANCE COMPARISON TEST');
  console.log('Testing customer ID 1 from 2023-01-01 to 2023-12-31');
  console.log('Each query will run 3 times to get accurate measurements\n');

  const results = [];

  // Test 1: Original slow query
  results.push(
    await benchmarkQuery(
      '❌ ORIGINAL (with correlated subqueries)',
      () => service.getCustomerOrderDetails(1, '2023-01-01', '2023-12-31')
    )
  );

  // Small delay between tests
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: Optimized V1
  results.push(
    await benchmarkQuery(
      '✅ OPTIMIZED V1 (CTE with joins)',
      () => service.getCustomerOrderDetailsOptimized_V1(1, '2023-01-01', '2023-12-31')
    )
  );

  // Small delay between tests
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 3: Optimized V2
  results.push(
    await benchmarkQuery(
      '✅ OPTIMIZED V2 (3 separate queries)',
      () => service.getCustomerOrderDetailsOptimized_V2(1, '2023-01-01', '2023-12-31')
    )
  );

  // Summary comparison
  console.log('\n' + '='.repeat(70));
  console.log('📈 PERFORMANCE SUMMARY');
  console.log('='.repeat(70));

  const validResults = results.filter(r => r !== null);
  
  if (validResults.length > 0) {
    const slowest = validResults[0];
    
    console.log(`\nOriginal Speed:        ${formatTime(slowest.avgTime)}`);
    
    for (let i = 1; i < validResults.length; i++) {
      const result = validResults[i];
      const improvement = ((slowest.avgTime - result.avgTime) / slowest.avgTime) * 100;
      const speedup = (slowest.avgTime / result.avgTime).toFixed(1);
      
      console.log(`${result.name}`);
      console.log(`  Time:                ${formatTime(result.avgTime)}`);
      console.log(`  ⚡ Improvement:       ${improvement.toFixed(1)}% faster (${speedup}x speedup)`);
    }
  }

  console.log('='.repeat(70) + '\n');
  
  console.log('💡 LESSONS LEARNED:');
  console.log('  1. Correlated subqueries run for EVERY row (N+1 problem)');
  console.log('  2. Indexes are essential - add them on foreign keys!');
  console.log('  3. CTEs or separate queries are much faster');
  console.log('  4. Measuring is key - always run EXPLAIN ANALYZE\n');
}

// Run the benchmarks
runBenchmarks()
  .catch(console.error)
  .finally(() => {
    process.exit(0);
  });
