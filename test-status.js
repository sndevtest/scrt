async function computeUpdate(drvRec, userObj, appStatus, payload){
  // NEW 4-CASE LOGIC matching the rewritten TODA logic
  let finalAppStatus = appStatus;
  let finalIsApplying = undefined;
  
  try {
    const statusStr = (appStatus || '').toString().toUpperCase();
    
    // CASE 1: APPROVED - transition to ADDED if IsActive=true
    if (statusStr.includes('APPROVED')) {
      const isActiveTruthy = userObj && userObj.IsActive;
      if (isActiveTruthy) {
        finalAppStatus = 'ADDED';
        finalIsApplying = false;
      } else {
        finalAppStatus = 'APPROVED';
        finalIsApplying = drvRec && typeof drvRec.IsApplying !== 'undefined' ? drvRec.IsApplying : true;
      }
    }
    // CASE 2: REJECTED or EXPIRED
    else if (statusStr.includes('REJECTED') || statusStr.includes('EXPIRED')) {
      const isApplyingTrue = drvRec && drvRec.IsApplying === true;
      const isActiveFalse = userObj && userObj.IsActive === false;
      const isActiveTruthy = userObj && userObj.IsActive;
      
      if (isApplyingTrue && isActiveFalse) {
        // Keep same ApplicationStatus, IsApplying stays true
        finalAppStatus = appStatus;
        finalIsApplying = true;
      } else if (!isApplyingTrue && isActiveTruthy) {
        // IsApplying=false and IsActive=true, so set IsApplying=true
        finalAppStatus = appStatus;
        finalIsApplying = true;
      } else {
        // Keep same
        finalAppStatus = appStatus;
        finalIsApplying = drvRec && typeof drvRec.IsApplying !== 'undefined' ? drvRec.IsApplying : true;
      }
    }
    // CASE 3: TO REVIEW - only update ApplicationStatus, no IsApplying/IsActive changes
    else if (statusStr.includes('TO REVIEW')) {
      finalAppStatus = 'TO REVIEW';
      finalIsApplying = drvRec && typeof drvRec.IsApplying !== 'undefined' ? drvRec.IsApplying : true;
    }
    // CASE 4: ADDED (if already marked as ADDED)
    else if (statusStr.includes('ADDED')) {
      finalAppStatus = 'ADDED';
      finalIsApplying = false;
    }
    // Default fallback
    else {
      finalAppStatus = appStatus;
      finalIsApplying = drvRec && typeof drvRec.IsApplying !== 'undefined' ? drvRec.IsApplying : true;
    }
  } catch (e) {
    console.warn('Error in ApplicationStatus conditional logic:', e);
    finalAppStatus = appStatus;
    finalIsApplying = undefined;
  }

  const driverUpdatePayload = { ApplicationStatus: finalAppStatus };
  if (typeof finalIsApplying !== 'undefined') {
    driverUpdatePayload.IsApplying = finalIsApplying;
  }
  if (payload.license) driverUpdatePayload.LicenseNumber = payload.license;
  driverUpdatePayload.TricyclePlateNumber = payload.plate || '';
  driverUpdatePayload.TricycleNumber = payload.tricycleNumber || '';
  if (payload.franchiseExpiry) driverUpdatePayload.FranchiseExpiry = payload.franchiseExpiry;

  return { finalAppStatus, finalIsApplying, driverUpdatePayload };
}

(async ()=>{
  const payload = { license: 'A01-23-456789', plate: 'ABC123', tricycleNumber: 'T123', franchiseExpiry: '2025-12-31' };

  const cases = [
    // CASE 1: APPROVED scenarios
    { name: 'CASE 1a: APPROVED + IsActive=true → should become ADDED', drv:{IsApplying:true}, user:{IsActive:true}, appStatus:'APPROVED', expected:{finalAppStatus:'ADDED', finalIsApplying:false} },
    { name: 'CASE 1b: APPROVED + IsActive="true" (string) → should become ADDED', drv:{IsApplying:true}, user:{IsActive:'true'}, appStatus:'APPROVED', expected:{finalAppStatus:'ADDED', finalIsApplying:false} },
    { name: 'CASE 1c: APPROVED + IsActive=false → stays APPROVED', drv:{IsApplying:true}, user:{IsActive:false}, appStatus:'APPROVED', expected:{finalAppStatus:'APPROVED', finalIsApplying:true} },
    { name: 'CASE 1d: APPROVED + IsActive=false (any IsApplying) → stays APPROVED', drv:{IsApplying:false}, user:{IsActive:false}, appStatus:'APPROVED', expected:{finalAppStatus:'APPROVED', finalIsApplying:false} },
    
    // CASE 2: REJECTED scenarios
    { name: 'CASE 2a: REJECTED + IsApplying=true + IsActive=false → stays REJECTED', drv:{IsApplying:true}, user:{IsActive:false}, appStatus:'REJECTED', expected:{finalAppStatus:'REJECTED', finalIsApplying:true} },
    { name: 'CASE 2b: REJECTED + IsApplying=false + IsActive=true → becomes REJECTED + IsApplying=true', drv:{IsApplying:false}, user:{IsActive:true}, appStatus:'REJECTED', expected:{finalAppStatus:'REJECTED', finalIsApplying:true} },
    { name: 'CASE 2c: EXPIRED + IsApplying=true + IsActive=false → stays EXPIRED', drv:{IsApplying:true}, user:{IsActive:false}, appStatus:'EXPIRED', expected:{finalAppStatus:'EXPIRED', finalIsApplying:true} },
    
    // CASE 3: TO REVIEW scenario
    { name: 'CASE 3: TO REVIEW + IsApplying=true → TO REVIEW keeps IsApplying=true (no change)', drv:{IsApplying:true}, user:{IsActive:true}, appStatus:'TO REVIEW', expected:{finalAppStatus:'TO REVIEW', finalIsApplying:true} },
    
    // CASE 4: ADDED scenario
    { name: 'CASE 4: ADDED + any flags → stays ADDED with IsApplying=false', drv:{IsApplying:true}, user:{IsActive:true}, appStatus:'ADDED', expected:{finalAppStatus:'ADDED', finalIsApplying:false} }
  ];

  let passed = 0, failed = 0;
  for (const c of cases){
    const res = await computeUpdate(c.drv, c.user, c.appStatus, payload);
    const statusMatch = res.finalAppStatus === c.expected.finalAppStatus;
    const isApplyingMatch = res.finalIsApplying === c.expected.finalIsApplying;
    const success = statusMatch && isApplyingMatch;
    
    if (success) {
      console.log('✓ PASS:', c.name);
      passed++;
    } else {
      console.log('✗ FAIL:', c.name);
      console.log('  Expected: finalAppStatus=' + c.expected.finalAppStatus + ', finalIsApplying=' + c.expected.finalIsApplying);
      console.log('  Got: finalAppStatus=' + res.finalAppStatus + ', finalIsApplying=' + res.finalIsApplying);
      failed++;
    }
  }
  
  console.log('\n==== TEST SUMMARY ====');
  console.log('Passed: ' + passed);
  console.log('Failed: ' + failed);
  console.log('Total: ' + (passed + failed));
})();
