/**
 * CoderRide Visual CLI Test Runner
 * 
 * Usage: 
 *   node cli-test-runner.js
 *   node cli-test-runner.js --token="YOUR_JWT_TOKEN"
 */

const http = require('http');

const BASE_URL = 'http://localhost:8080';
const args = process.argv.slice(2);
let userToken = '';

args.forEach(arg => {
    if (arg.startsWith('--token=')) {
        userToken = arg.split('=')[1];
    }
});

// ANSI Color Codes
const c = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    gray: "\x1b[90m"
};

const tests = [
    // --- AUTH & USER SERVICE ---
    { name: 'Auth: Get Current User (No Token)', method: 'GET', path: '/api/v1/auth/me', expected: 401 },
    { name: 'Auth: Get Current User (With Token)', method: 'GET', path: '/api/v1/auth/me', expected: 200, useToken: true },
    { name: 'Auth: Github Login Missing Body', method: 'POST', path: '/api/v1/auth/github', expected: 400, body: {} },
    { name: 'Users: Get All Users (No Token)', method: 'GET', path: '/api/v1/users', expected: 401 },
    { name: 'Users: Get All Users (With Token)', method: 'GET', path: '/api/v1/users', expected: 200, useToken: true },
    { name: 'Users: Get Pending Users (With Token)', method: 'GET', path: '/api/v1/users/pending', expected: 200, useToken: true },
    { name: 'Users: Get Lead Users (With Token)', method: 'GET', path: '/api/v1/users/leads', expected: 200, useToken: true },
    { name: 'Users: Approve User (No Token)', method: 'PUT', path: '/api/v1/users/99999/approve', expected: 401 },
    { name: 'Users: Approve User (With Token, likely 403 or 404)', method: 'PUT', path: '/api/v1/users/99999/approve', expected: [403, 404], useToken: true },
    { name: 'Users: Reject User (With Token, likely 403 or 404)', method: 'PUT', path: '/api/v1/users/99999/reject', expected: [403, 404], useToken: true },
    { name: 'Users: Update Role (With Token)', method: 'PUT', path: '/api/v1/users/99999/role', expected: [403, 404], useToken: true, body: { roleName: 'ADMIN' } },
    { name: 'Users: Update Custom Role (With Token)', method: 'PUT', path: '/api/v1/users/99999/custom-role', expected: [403, 404], useToken: true, body: { customRoleId: 1 } },
    { name: 'Users: Delete Custom Role (With Token)', method: 'DELETE', path: '/api/v1/users/99999/custom-role', expected: [403, 404], useToken: true },
    
    // --- MEMBER SERVICE ---
    { name: 'Members: Get All Members', method: 'GET', path: '/api/v1/members', expected: 200 },
    { name: 'Members: Get Member By ID', method: 'GET', path: '/api/v1/members/1', expected: [200, 404] },
    { name: 'Members: Get Non-Existent Member', method: 'GET', path: '/api/v1/members/999999', expected: 404 },
    { name: 'Members: Get My Profile (No Token)', method: 'GET', path: '/api/v1/members/profile', expected: 401 },
    { name: 'Members: Get My Profile (With Token)', method: 'GET', path: '/api/v1/members/profile', expected: [200, 404], useToken: true },
    { name: 'Members: Update Profile (No Token)', method: 'PUT', path: '/api/v1/members/profile', expected: 401, body: { bio: "New bio", location: "Remote" } },
    { name: 'Members: Update Profile (With Token)', method: 'PUT', path: '/api/v1/members/profile', expected: [200, 404], useToken: true, body: { bio: "Updated Bio", location: "Remote" } },
    { name: 'Members: Add Skill to Profile (No Token)', method: 'POST', path: '/api/v1/members/skills', expected: 401, body: { skillId: 1, proficiencyLevel: "EXPERT", isVerified: false } },
    { name: 'Members: Add Skill to Profile (With Token)', method: 'POST', path: '/api/v1/members/skills', expected: [200, 201, 400, 404], useToken: true, body: { skillId: 1, proficiencyLevel: "EXPERT", isVerified: false } },
    { name: 'Members: Remove Skill (With Token)', method: 'DELETE', path: '/api/v1/members/skills/99999', expected: [200, 204, 400, 404], useToken: true },

    // --- PROJECT SERVICE ---
    { name: 'Projects: Get All Approved Projects', method: 'GET', path: '/api/v1/projects', expected: 200 },
    { name: 'Projects: Get Pending Projects (No Token)', method: 'GET', path: '/api/v1/projects/pending', expected: 401 },
    { name: 'Projects: Get Pending Projects (With Token)', method: 'GET', path: '/api/v1/projects/pending', expected: [200, 403], useToken: true },
    { name: 'Projects: Get Project By ID', method: 'GET', path: '/api/v1/projects/1', expected: [200, 404] },
    { name: 'Projects: Create Project (No Auth)', method: 'POST', path: '/api/v1/projects', expected: 401, body: { title: "Test", description: "Test" } },
    { name: 'Projects: Create Bad Project (Missing Title)', method: 'POST', path: '/api/v1/projects', expected: 400, useToken: true, body: { description: "Missing title" } },
    { name: 'Projects: Create Project (Valid)', method: 'POST', path: '/api/v1/projects', expected: [200, 201], useToken: true, body: { title: "CLI Project", description: "Test Desc", githubRepositoryUrl: "https://github.com/test", status: "PENDING" } },
    { name: 'Projects: Update Project (No Token)', method: 'PUT', path: '/api/v1/projects/1', expected: 401, body: { title: "Updated" } },
    { name: 'Projects: Update Project (With Token)', method: 'PUT', path: '/api/v1/projects/1', expected: [200, 400, 403, 404], useToken: true, body: { title: "Updated Title" } },
    { name: 'Projects: Approve Project (With Token)', method: 'PUT', path: '/api/v1/projects/1/approval', expected: [200, 400, 403, 404], useToken: true, body: { approved: true, reviewNotes: "Looks good" } },
    { name: 'Projects: Reject Project (With Token)', method: 'PUT', path: '/api/v1/projects/1/approval', expected: [200, 400, 403, 404], useToken: true, body: { approved: false, reviewNotes: "Needs work" } },
    { name: 'Projects: Delete Project (With Token)', method: 'DELETE', path: '/api/v1/projects/99999', expected: [200, 204, 403, 404], useToken: true },

    // --- TAGS (Project Service) ---
    { name: 'Tags: Get All Tags', method: 'GET', path: '/api/v1/tags', expected: 200 },
    { name: 'Tags: Search Tags', method: 'GET', path: '/api/v1/tags/search?query=java', expected: 200 },
    { name: 'Tags: Create Tag (No Auth)', method: 'POST', path: '/api/v1/tags', expected: 401, body: { name: "NewTag", description: "Test" } },
    { name: 'Tags: Create Tag (With Token)', method: 'POST', path: '/api/v1/tags', expected: [200, 201, 400, 403], useToken: true, body: { name: "CLITestTag", description: "Created by CLI" } },
    { name: 'Tags: Delete Tag (No Token)', method: 'DELETE', path: '/api/v1/tags/99999', expected: 401 },
    { name: 'Tags: Delete Tag (With Token)', method: 'DELETE', path: '/api/v1/tags/99999', expected: [200, 204, 403, 404], useToken: true },

    // --- ROLE SERVICE ---
    { name: 'Roles: Get All Custom Roles', method: 'GET', path: '/api/v1/roles', expected: 200 },
    { name: 'Roles: Get Role By ID', method: 'GET', path: '/api/v1/roles/1', expected: [200, 404] },
    { name: 'Roles: Create Role (No Auth)', method: 'POST', path: '/api/v1/roles', expected: 401, body: { roleName: "TEST_ROLE", description: "Test" } },
    { name: 'Roles: Create Role (With Token)', method: 'POST', path: '/api/v1/roles', expected: [200, 201, 400, 403], useToken: true, body: { roleName: "TEST_ROLE", description: "Test Role" } },
    { name: 'Roles: Update Role (With Token)', method: 'PUT', path: '/api/v1/roles/99999', expected: [200, 400, 403, 404], useToken: true, body: { roleName: "UPDATED", description: "Updated" } },
    { name: 'Roles: Delete Role (With Token)', method: 'DELETE', path: '/api/v1/roles/99999', expected: [200, 204, 403, 404], useToken: true },

    // --- SKILL SERVICE ---
    { name: 'Skills: Get All Skills', method: 'GET', path: '/api/v1/skills', expected: 200 },
    { name: 'Skills: Get Skill By ID', method: 'GET', path: '/api/v1/skills/1', expected: [200, 404] },
    { name: 'Skills: Create Skill (No Auth)', method: 'POST', path: '/api/v1/skills', expected: 401, body: { name: "TestSkill", category: "Language" } },
    { name: 'Skills: Create Skill (With Token)', method: 'POST', path: '/api/v1/skills', expected: [200, 201, 400, 403], useToken: true, body: { name: "TestSkillCLI", category: "Language" } },
    { name: 'Skills: Update Skill (With Token)', method: 'PUT', path: '/api/v1/skills/99999', expected: [200, 400, 403, 404], useToken: true, body: { name: "TestSkillCLIUpdated", category: "Language" } },
    { name: 'Skills: Delete Skill (With Token)', method: 'DELETE', path: '/api/v1/skills/99999', expected: [200, 204, 403, 404], useToken: true },

    // --- EVENT SERVICE ---
    { name: 'Events: Get Upcoming Events', method: 'GET', path: '/api/v1/events', expected: 200 },
    { name: 'Events: Get Non-Existent Event', method: 'GET', path: '/api/v1/events/999999', expected: 404 },
    { name: 'Events: Create Event (No Auth)', method: 'POST', path: '/api/v1/events', expected: 401, body: { title: "New Event", date: "2026-12-31T00:00:00Z" } },
    { name: 'Events: Create Event (Bad Request)', method: 'POST', path: '/api/v1/events', expected: [400, 403], useToken: true, body: { description: "Missing title" } },
    { name: 'Events: Create Event (With Token)', method: 'POST', path: '/api/v1/events', expected: [200, 201, 403], useToken: true, body: { title: "CLI Event", description: "Test", startDate: "2026-12-31T10:00:00Z", endDate: "2026-12-31T12:00:00Z", location: "Online", isOnline: true } },
    { name: 'Events: Update Event (With Token)', method: 'PUT', path: '/api/v1/events/99999', expected: [200, 400, 403, 404], useToken: true, body: { title: "CLI Event Updated", startDate: "2026-12-31T10:00:00Z", endDate: "2026-12-31T12:00:00Z" } },
    { name: 'Events: Feature Event (With Token)', method: 'PUT', path: '/api/v1/events/99999/featured', expected: [200, 400, 403, 404], useToken: true, body: { isFeatured: true } },
    { name: 'Events: Delete Event (With Token)', method: 'DELETE', path: '/api/v1/events/99999', expected: [200, 204, 403, 404], useToken: true },

    // --- NOTIFICATION SERVICE ---
    { name: 'Notifications: Subscribe (No Token)', method: 'POST', path: '/api/v1/notifications/subscribe', expected: 401, body: { topic: "all" } },
    { name: 'Notifications: Subscribe (With Token)', method: 'POST', path: '/api/v1/notifications/subscribe', expected: [200, 201, 400], useToken: true, body: { email: "test@example.com", preferences: {} } },
    { name: 'Notifications: Unsubscribe (With Token)', method: 'POST', path: '/api/v1/notifications/unsubscribe', expected: [200, 204, 400], useToken: true, body: { email: "test@example.com" } },
    { name: 'Notifications: Send Manual Push (With Token)', method: 'POST', path: '/api/v1/notifications/send', expected: [200, 201, 403], useToken: true, body: { subject: "Test", content: "Test Msg" } }
];

function makeRequest(test) {
    return new Promise((resolve) => {
        const options = {
            method: test.method,
            headers: {}
        };

        if (test.useToken && userToken) {
            options.headers['Authorization'] = `Bearer ${userToken}`;
        }

        if (test.body) {
            options.headers['Content-Type'] = 'application/json';
        }

        const req = http.request(BASE_URL + test.path, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const passed = Array.isArray(test.expected) ? test.expected.includes(res.statusCode) : res.statusCode === test.expected;
                resolve({ test, statusCode: res.statusCode, passed, responseTime: 0, data });
            });
        });

        req.on('error', (err) => {
            resolve({ test, statusCode: 'ERR', passed: false, error: err.message });
        });

        if (test.body) {
            req.write(JSON.stringify(test.body));
        }
        
        req.end();
    });
}

async function runTests() {
    console.log(`\n${c.cyan}${c.bold}🚀 Starting CoderRide API Visual Tests${c.reset}`);
    console.log(`${c.gray}Target: ${BASE_URL}${c.reset}`);
    console.log(`${c.gray}Token Provided: ${userToken ? c.green + 'Yes' : c.yellow + 'No (Token-dependent tests will fail/skip)'}${c.reset}\n`);

    let passedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        
        // Skip token tests if no token provided
        if (test.useToken && !userToken) {
            console.log(` ${c.yellow}⏭️  SKIPPED${c.reset}  | ${c.bold}${test.name.padEnd(50)}${c.reset} | ${c.gray}Requires --token=...${c.reset}`);
            continue;
        }

        process.stdout.write(` ${c.blue}⏳ RUNNING${c.reset}  | ${c.bold}${test.name.padEnd(50)}${c.reset}\r`);
        
        const startTime = Date.now();
        const result = await makeRequest(test);
        const duration = Date.now() - startTime;

        const timeStr = `${duration}ms`.padStart(6);
        const statusStr = result.statusCode.toString().padEnd(3);

        const expectedStr = Array.isArray(test.expected) ? test.expected.join(' or ') : test.expected;
        
        if (result.passed) {
            console.log(` ${c.green}✅ PASSED ${c.reset}  | ${c.bold}${test.name.padEnd(55)}${c.reset} | Expected: ${expectedStr.toString().padEnd(10)} | Got: ${c.green}${statusStr}${c.reset} | ⏱️ ${timeStr}`);
            passedCount++;
        } else {
            console.log(` ${c.red}❌ FAILED ${c.reset}  | ${c.bold}${test.name.padEnd(55)}${c.reset} | Expected: ${expectedStr.toString().padEnd(10)} | Got: ${c.red}${statusStr}${c.reset} | ⏱️ ${timeStr}`);
            if (result.error) console.log(`              ${c.red}└─ Error: ${result.error}${c.reset}`);
            failedCount++;
        }
    }

    console.log(`\n${c.cyan}========================================================================${c.reset}`);
    console.log(`${c.bold}📊 TEST SUMMARY${c.reset}`);
    console.log(`${c.cyan}========================================================================${c.reset}`);
    console.log(`  ${c.green}Passed: ${passedCount}${c.reset}`);
    console.log(`  ${c.red}Failed: ${failedCount}${c.reset}`);
    
    if (failedCount > 0) {
        console.log(`\n${c.red}${c.bold}⚠️  Some tests failed. Please review the output above.${c.reset}\n`);
    } else {
        console.log(`\n${c.green}${c.bold}🎉 All tests passed successfully!${c.reset}\n`);
    }
}

runTests();
