#!/usr/bin/env node

// Simple test script to verify SSE endpoints are accessible
const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Test GET /mcp-sse endpoint
function testSseEndpoint() {
  return new Promise((resolve, reject) => {
    console.log('Testing GET /mcp-sse endpoint...');
    
    const req = http.get(`${BASE_URL}/mcp-sse`, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      
      if (res.statusCode === 200) {
        console.log('✅ SSE endpoint is accessible');
        
        // Check if SSE headers are set correctly
        const contentType = res.headers['content-type'];
        if (contentType && contentType.includes('text/event-stream')) {
          console.log('✅ SSE content-type header is correct');
        } else {
          console.log('❌ SSE content-type header is missing or incorrect');
        }
        
        // Read a bit of the response to see if it starts properly
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
          if (data.length > 100) {
            res.destroy(); // Close after getting some data
            console.log('✅ SSE stream started successfully');
            resolve();
          }
        });
        
        res.on('end', () => {
          resolve();
        });
        
      } else {
        console.log('❌ SSE endpoint returned non-200 status');
        reject(new Error(`SSE endpoint returned status ${res.statusCode}`));
      }
    });
    
    req.on('error', (error) => {
      console.log('❌ Error connecting to SSE endpoint:', error.message);
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ SSE endpoint request timed out');
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Test POST /mcp-sse-messages endpoint (without sessionId)
function testPostEndpoint() {
  return new Promise((resolve, reject) => {
    console.log('\nTesting POST /mcp-sse-messages endpoint...');
    
    const postData = JSON.stringify({
      jsonrpc: '2.0',
      method: 'test',
      params: {},
      id: 1
    });
    
    const req = http.request(`${BASE_URL}/mcp-sse-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      console.log(`Status Code: ${res.statusCode}`);
      
      if (res.statusCode === 400) {
        console.log('✅ POST endpoint correctly rejects requests without sessionId');
        resolve();
      } else {
        console.log(`❌ POST endpoint returned unexpected status: ${res.statusCode}`);
        reject(new Error(`Unexpected status ${res.statusCode}`));
      }
    });
    
    req.on('error', (error) => {
      console.log('❌ Error connecting to POST endpoint:', error.message);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// Test if server is running
function testServerRunning() {
  return new Promise((resolve, reject) => {
    console.log('Testing if server is running...');
    
    http.get(`${BASE_URL}/mcp`, (res) => {
      if (res.statusCode === 400 || res.statusCode === 405) {
        console.log('✅ Server is running (existing /mcp endpoint accessible)');
        resolve();
      } else {
        console.log(`❌ Server returned unexpected status: ${res.statusCode}`);
        reject(new Error(`Server returned status ${res.statusCode}`));
      }
    }).on('error', (error) => {
      console.log('❌ Server is not running or not accessible:', error.message);
      reject(error);
    });
  });
}

// Run all tests
async function runTests() {
  try {
    await testServerRunning();
    await testSseEndpoint();
    await testPostEndpoint();
    
    console.log('\n🎉 All tests passed! SSE endpoints are working correctly.');
    console.log('\nTo test with Roo Code, use:');
    console.log('Endpoint: http://localhost:3000/mcp-sse');
    console.log('Transport: Server-Sent Events (SSE)');
    
  } catch (error) {
    console.log('\n❌ Tests failed:', error.message);
    console.log('\nMake sure the MCP server is running before testing.');
    process.exit(1);
  }
}

// Check if server is running, if not start it
if (require.main === module) {
  runTests();
}

module.exports = { testSseEndpoint, testPostEndpoint, testServerRunning, runTests };