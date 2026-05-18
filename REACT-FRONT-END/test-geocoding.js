/**
 * Test script to verify geocoding functionality
 * Run with: node test-geocoding.js
 */

async function testGeocode(address) {
  try {
    const searchQuery = `${address}, San Vicente, Apalit, Pampanga, Philippines`;
    
    console.log(`\n🔍 Testing geocoding for: "${address}"`);
    console.log(`   Full query: "${searchQuery}"`);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(searchQuery)}` +
      `&format=json` +
      `&limit=1` +
      `&countrycodes=ph` +
      `&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BarangayConnectApp/1.0'
        }
      }
    );
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      console.log(`✅ SUCCESS - Location found!`);
      console.log(`   Latitude: ${data[0].lat}`);
      console.log(`   Longitude: ${data[0].lon}`);
      console.log(`   Display Name: ${data[0].display_name}`);
      console.log(`   🗺️  Map URL: https://www.openstreetmap.org/?mlat=${data[0].lat}&mlon=${data[0].lon}&zoom=16`);
      return true;
    } else {
      console.log(`❌ FAILED - No location found`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ERROR - ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🗺️  GEOCODING FUNCTIONALITY TEST');
  console.log('═══════════════════════════════════════════════════════');
  
  const testAddresses = [
    'San Vicente',
    'Barangay San Vicente',
    'San Vicente Barangay Hall',
    'San Vicente Elementary School',
    'San Vicente Chapel',
    'Purok 1, San Vicente',
    'Purok 2, San Vicente',
    'Main Road, San Vicente',
    'San Vicente Basketball Court'
  ];
  
  let successCount = 0;
  
  for (const address of testAddresses) {
    const success = await testGeocode(address);
    if (success) successCount++;
    
    // Wait 1 second between requests (Nominatim rate limit)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`📊 RESULTS: ${successCount}/${testAddresses.length} addresses successfully geocoded`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (successCount === testAddresses.length) {
    console.log('✅ ALL TESTS PASSED - Geocoding is working perfectly!');
  } else if (successCount > 0) {
    console.log('⚠️  PARTIAL SUCCESS - Some addresses could not be geocoded');
    console.log('   This is normal for very specific or new addresses.');
    console.log('   The map will show San Vicente default location as fallback.');
  } else {
    console.log('❌ ALL TESTS FAILED - Check internet connection or API availability');
  }
}

runTests();
