async function testVercel() {
  const baseUrl = 'https://wastesignal.vercel.app';
  console.log('--- Probing Live Vercel Deployment ---');
  console.log('Target URL:', baseUrl);

  // 1. Root page
  try {
    const resRoot = await fetch(baseUrl);
    console.log('1. Root URL GET /:', resRoot.status, resRoot.headers.get('content-type'));
    const html = await resRoot.text();
    console.log('   Contains <title>WasteSignal:', html.includes('WasteSignal'));
    console.log('   Contains root div:', html.includes('id="root"'));
  } catch (err: any) {
    console.error('1. Root URL failed:', err.message);
  }

  // 2. Deep route
  try {
    const resDeep = await fetch(`${baseUrl}/dashboard?demo=judge`);
    console.log('2. Deep route GET /dashboard?demo=judge:', resDeep.status, resDeep.headers.get('content-type'));
  } catch (err: any) {
    console.error('2. Deep route failed:', err.message);
  }

  // 3. /api/health
  try {
    const resHealth = await fetch(`${baseUrl}/api/health`);
    console.log('3. GET /api/health:', resHealth.status, resHealth.headers.get('content-type'));
    const body = await resHealth.text();
    console.log('   Response snippet (first 120 chars):', body.slice(0, 120));
  } catch (err: any) {
    console.error('3. /api/health failed:', err.message);
  }

  // 4. /api/aws/status
  try {
    const resStatus = await fetch(`${baseUrl}/api/aws/status`);
    console.log('4. GET /api/aws/status:', resStatus.status, resStatus.headers.get('content-type'));
    const body = await resStatus.text();
    console.log('   Response snippet (first 120 chars):', body.slice(0, 120));
  } catch (err: any) {
    console.error('4. /api/aws/status failed:', err.message);
  }
}

testVercel();
