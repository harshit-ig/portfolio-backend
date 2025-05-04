/**
 * Simple API Testing Script
 * 
 * This script helps test the basic functionality of your portfolio API.
 * Run with: node scripts/test-api.js
 */

const axios = require('axios');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';
const AUTH_TOKEN = process.env.AUTH_TOKEN || ''; // Your JWT token if testing authenticated routes

// Helper to make API requests
async function callApi(method, endpoint, data = null, authenticated = false) {
  const config = {
    method,
    url: `${API_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
    },
    ...(data && { data }),
  };

  if (authenticated) {
    if (!AUTH_TOKEN) {
      console.error('⚠️  AUTH_TOKEN not provided. Authenticated requests will fail.');
    }
    config.headers['x-auth-token'] = AUTH_TOKEN;
  }

  try {
    console.log(`🔄 ${method.toUpperCase()} ${endpoint}`);
    const response = await axios(config);
    console.log(`✅ Status: ${response.status}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error: ${error.response?.status || error.message}`);
    if (error.response?.data) {
      console.error(error.response.data);
    }
    return null;
  }
}

// Test endpoints
async function runTests() {
  console.log('🚀 Starting API Tests\n');

  // 1. Test projects endpoint (public)
  console.log('\n📋 Testing Projects Endpoints:');
  const projects = await callApi('get', '/projects');
  if (projects) {
    console.log(`   Found ${projects.data?.length || 0} projects`);
  }

  // 2. Test skills endpoint (public)
  console.log('\n📋 Testing Skills Endpoints:');
  const skills = await callApi('get', '/skills');
  if (skills) {
    console.log(`   Found ${skills.data?.length || 0} skills`);
  }

  // 3. Test profile endpoint (public)
  console.log('\n📋 Testing Profile Endpoint:');
  const profile = await callApi('get', '/profile');
  if (profile) {
    console.log('   Profile data retrieved successfully');
  }

  // 4. Test authenticated endpoint (requires token)
  if (AUTH_TOKEN) {
    console.log('\n🔐 Testing Authenticated Endpoint:');
    // Try to create a simple test project
    const testProject = {
      title: 'Test Project',
      description: 'This is a test project created by the API test script',
      technologies: ['JavaScript', 'Node.js'],
      featured: false
    };
    
    const createdProject = await callApi('post', '/projects', testProject, true);
    if (createdProject) {
      console.log('   ✅ Authentication working! Project created.');
      
      // Clean up by deleting the test project
      if (createdProject.data?._id) {
        await callApi('delete', `/projects/${createdProject.data._id}`, null, true);
        console.log('   🧹 Test project deleted.');
      }
    }
  } else {
    console.log('\n⚠️  Skipping authenticated tests (no AUTH_TOKEN provided)');
  }

  console.log('\n🏁 API Tests Completed');
}

// Run the tests
runTests().catch(err => {
  console.error('🔥 Test failed with an error:', err);
}); 