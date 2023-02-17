const { GestureDescription, Finger, FingerCurl, FingerDirection } = window.fp;

export const RockGesture = new GestureDescription('rock'); // ✊️
export const PaperGesture = new GestureDescription('paper'); // 🖐
export const ScissorsGesture = new GestureDescription('scissors'); // ✌️
export const CancelGesture = new GestureDescription('cancel'); // 👎


// Rock
// -----------------------------------------------------------------------------
  
// thumb: half curled
RockGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1.0);
RockGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.5);

// all other fingers: curled
for(let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
    RockGesture.addCurl(finger, FingerCurl.FullCurl, 1.0);
    RockGesture.addCurl(finger, FingerCurl.HalfCurl, 0.9);
}


// Paper
// -----------------------------------------------------------------------------
  
// no finger should be curled
for(let finger of Finger.all) {
    PaperGesture.addCurl(finger, FingerCurl.NoCurl, 1.0);
}


// Scissors
//------------------------------------------------------------------------------
  
// index and middle finger: stretched out
ScissorsGesture.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
ScissorsGesture.addCurl(Finger.Middle, FingerCurl.NoCurl, 1.0);
  
// ring: curled
ScissorsGesture.addCurl(Finger.Ring, FingerCurl.FullCurl, 1.0);
ScissorsGesture.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.9);

// pinky: curled
ScissorsGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, 1.0);
ScissorsGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 0.9);


// Cancel
// -----------------------------------------------------------------------------

for(const finger of Finger.all) {
    CancelGesture.addCurl(finger, FingerCurl.NoCurl, 1.0);

    CancelGesture.addDirection(finger, FingerDirection.DiagonalUpRight, 1.0);
    CancelGesture.addDirection(finger, FingerDirection.DiagonalUpLeft, 1.0);

    CancelGesture.addDirection(finger, FingerDirection.HorizontalRight, 1.0);
    CancelGesture.addDirection(finger, FingerDirection.HorizontalLeft, 1.0);
}


