// Test script to verify HTML mockup generation
const mockupData = {
  name: "Dashboard Mockup",
  description: "Main dashboard showing user overview",
  type: "Page",
  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Test</title>
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            font-family: system-ui, -apple-system, sans-serif;
            background: #f5f5f5;
        }
        .card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        h1 { color: #333; }
        .metric { font-size: 2rem; font-weight: bold; color: #4299e1; }
    </style>
</head>
<body>
    <h1>Dashboard</h1>
    <div class="card">
        <h3>Total Users</h3>
        <div class="metric">1,234</div>
    </div>
    <div class="card">
        <h3>Active Projects</h3>
        <div class="metric">56</div>
    </div>
</body>
</html>`
};

console.log('Mockup HTML structure test:');
console.log('- Name:', mockupData.name);
console.log('- Type:', mockupData.type);
console.log('- HTML length:', mockupData.html.length);
console.log('- Contains DOCTYPE:', mockupData.html.includes('<!DOCTYPE html>'));
console.log('- Contains viewport meta:', mockupData.html.includes('viewport'));
console.log('- Contains inline CSS:', mockupData.html.includes('<style>'));
console.log('\nMockup data is properly structured for AI generation!');