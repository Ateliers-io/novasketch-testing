# NovaSketch Testing Report

---

## 📋 Table of Contents
1. [Testing Overview](#testing-overview)
2. [Unit Testing (Frontend)](#1-unit-testing-frontend)
3. [Unit Testing (Backend)](#2-unit-testing-backend)
4. [Integration Testing](#3-integration-testing)
5. [Regression Testing](#4-regression-testing)
6. [Performance Testing](#5-performance-testing)
7. [Test Results Summary](#6-test-results-summary)

---

## Testing Overview

### Testing Types Executed

| S.No | Test Type | Test Cases | Tool Used |
|------|-----------|------------|-----------|
| 1 | **Unit Testing (Frontend)** | 101 tests | Vitest |
| 2 | **Unit Testing (Backend)** | 62 tests | Jest |
| 3 | **Integration Testing** | 4 tests | Jest (Supertest) |
| 4 | **Regression Testing** | 9 test suites | Jest (Supertest) |
| 5 | **Performance Testing** | 1 audit | Lighthouse |

**Total Test Coverage**: 167+ Tests
**Pass Rate**: 100%

---

## 1. Unit Testing (Frontend)

### 1.1 shapes.test.ts

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Should create a rectangle with default properties | Rectangle shape with type, position, size, default styles | Rectangle created with all defaults | ✅ Pass |
| 2 | Should create a circle with default properties | Circle shape with type, position, radius, default styles | Circle created correctly | ✅ Pass |
| 3 | Should create an ellipse with default properties | Ellipse shape with type, position, radii, default styles | Ellipse created correctly | ✅ Pass |
| 4 | Should create a line with default properties | Line shape with type, start/end points, default stroke | Line created correctly | ✅ Pass |
| 5 | Should create an arrow with default properties | Arrow with type, points, default styles + arrow heads | Arrow created correctly | ✅ Pass |
| 6 | Should create a triangle with default properties | Triangle with type, points, default styles | Triangle created correctly | ✅ Pass |
| 7 | Should have correct ShapeType enum values | Enum values match 'rectangle', 'circle', etc. | All enum values correct | ✅ Pass |
| 8 | Should have correct ToolType enum values | Enum values match 'select', 'rectangle', etc. | All enum values correct | ✅ Pass |
| 9 | Should generate unique IDs for each shape | Each created shape has a unique [id](file:///c:/Users/karth/Desktop/NovaSketch/novasketch-backend/tests/regression/models.regression.test.js#16-28) | Unique IDs generated via nanoid | ✅ Pass |

### 1.2 boundingBox.test.ts

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | BBox for rectangle at origin | `{x:0, y:0, width:100, height:50}` | Correct bbox | ✅ Pass |
| 2 | BBox for circle | Circle bbox centered correctly | Correct bbox | ✅ Pass |
| 3 | BBox for ellipse | Ellipse bbox from radii | Correct bbox | ✅ Pass |
| 4 | BBox for line | Line bbox from start/end pts | Correct bbox | ✅ Pass |
| 5 | BBox for arrow | Arrow bbox from points | Correct bbox | ✅ Pass |
| 6 | BBox for triangle | Triangle bbox from vertices | Correct bbox | ✅ Pass |
| 7 | BBox with rotation | Expanded bbox after rotation | Correct rotated bbox | ✅ Pass |
| 8 | BBox with scaling | Scaled bbox dimensions | Correct scaled bbox | ✅ Pass |
| 9 | Intersection detection between bboxes | Returns true/false for overlap | Correct intersection results | ✅ Pass |

### 1.3 coordinates.test.ts

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Global to relative coordinate transform | Correct relative coordinates | Transformed correctly | ✅ Pass |
| 2 | Relative to global coordinate transform | Correct global coordinates | Transformed correctly | ✅ Pass |
| 3 | Identity transform (no offset/scale) | Same coordinates returned | Identity preserved | ✅ Pass |

### 1.4 nameSanitizer.test.ts

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Sanitize valid display name | Name unchanged | Name preserved | ✅ Pass |
| 2 | Strip invalid characters | Characters removed | Sanitized correctly | ✅ Pass |
| 3 | Handle accented characters | Accents stripped/replaced | Handled correctly | ✅ Pass |
| 4 | Validate name length constraints | Accept 2-30 chars, reject others | Validated correctly | ✅ Pass |

### 1.5 Landing.test.tsx

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Renders Hero section | Hero text and CTA visible | Rendered correctly | ✅ Pass |
| 2 | Renders Navbar | Nav links visible | Rendered correctly | ✅ Pass |
| 3 | Renders Features section | Feature cards visible | Rendered correctly | ✅ Pass |
| 4 | Renders Preview section | Preview content visible | Rendered correctly | ✅ Pass |
| 5 | Renders Footer | Footer text visible | Rendered correctly | ✅ Pass |
| 6 | Navigation to login | Navigates to /auth on CTA click | Navigation triggered | ✅ Pass |

### 1.6 Login.test.tsx

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Renders login page | Login form elements visible | Rendered correctly | ✅ Pass |
| 2 | Google sign-in button present | Button visible and clickable | Button rendered | ✅ Pass |
| 3 | Navigation to home on auth | Navigates away after login | Navigation triggered | ✅ Pass |
| 4 | Button disabled states | Buttons disabled during loading | States toggled correctly | ✅ Pass |

### 1.7 Dashboard.test.tsx

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Renders dashboard layout | Sidebar and main area visible | Rendered correctly | ✅ Pass |
| 2 | Renders project cards | Project cards with names displayed | Cards rendered | ✅ Pass |
| 3 | Search filters projects | Only matching projects shown | Filtered correctly | ✅ Pass |
| 4 | Sort projects by date | Projects reordered by date | Sorted correctly | ✅ Pass |
| 5 | Logout button works | Auth state cleared, redirect to login | Logout succeeded | ✅ Pass |
| 6 | Sidebar navigation | Sidebar links functional | Navigation works | ✅ Pass |

### 1.8 SVGShapeRenderer.test.tsx

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Generate straight line path | SVG path `M...L...` format | Correct SVG path | ✅ Pass |
| 2 | Generate stepped line path | SVG path with step segments | Correct stepped path | ✅ Pass |
| 3 | Generate curved line path | SVG path with bezier curves | Correct curved path | ✅ Pass |
| 4 | Generate arrow path data | SVG path with arrowhead | Correct arrow path | ✅ Pass |

### 1.9 strokeSmoother.test.ts

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | getSmoothedStroke returns stroke points | Array of smoothed points | Points array returned | ✅ Pass |
| 2 | getSvgPathFromStroke creates path | Valid SVG path string | SVG path generated | ✅ Pass |
| 3 | Handles empty input | Empty array or empty path | Handled gracefully | ✅ Pass |

### 1.10 AnalyzeWithAI.test.tsx

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Renders AI analysis button | Button visible | Rendered | ✅ Pass |
| 2 | Captures canvas for AI analysis | Canvas exported as image | Canvas captured | ✅ Pass |
| 3 | Interacts with ChatGPT provider | Sends data to ChatGPT | Interaction works | ✅ Pass |
| 4 | Interacts with Gemini provider | Sends data to Gemini | Interaction works | ✅ Pass |
| 5 | Copies result to clipboard | Text copied via clipboard API | Copy succeeded | ✅ Pass |

### 1.11 HamburgerMenu.test.tsx

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Opens and closes menu | Menu visibility toggles | Toggled correctly | ✅ Pass |
| 2 | Theme toggle works | Theme switches light/dark | Theme toggled | ✅ Pass |
| 3 | Canvas clear option | Canvas cleared on click | Canvas cleared | ✅ Pass |
| 4 | Export as PNG option | Export triggered | Export works | ✅ Pass |
| 5 | Export as SVG option | Export triggered | Export works | ✅ Pass |
| 6 | Custom menu sections render | Additional sections visible | Sections rendered | ✅ Pass |

### 1.12 LiveCollaborationMenu.test.tsx

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Displays QR code for room | QR code rendered | QR code visible | ✅ Pass |
| 2 | Copy link button copies URL | URL copied to clipboard | Link copied | ✅ Pass |
| 3 | Share button triggers share API | navigator.share called | Share triggered | ✅ Pass |

### 1.13 RemoteCursors.test.tsx

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Renders remote cursor with name | Cursor + label visible | Rendered correctly | ✅ Pass |
| 2 | Positions cursor with transform | CSS transform applied at x,y | Positioned correctly | ✅ Pass |
| 3 | Applies coordinate transformation | Viewport transform applied | Transformed correctly | ✅ Pass |
| 4 | Accessibility attributes present | aria-label set for cursor | Attributes present | ✅ Pass |

### 1.14 Stroke.test.tsx

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Renders standard Konva Line | Konva Line component in tree | Line rendered | ✅ Pass |
| 2 | Renders Magic Pencil stroke | Smoothed SVG path rendered | Path rendered | ✅ Pass |
| 3 | Maps stroke properties correctly | Color, width, opacity mapped | Properties correct | ✅ Pass |

### 1.15 useSelectionBounds.test.ts

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Returns null when no items selected | null returned | null | ✅ Pass |
| 2 | Returns bbox for single selected shape | Correct bbox | Correct bbox | ✅ Pass |
| 3 | Returns union bbox for multiple shapes | Combined bbox | Correct union bbox | ✅ Pass |
| 4 | Handles transformed shapes | Bbox accounts for rotation/scale | Correct transformed bbox | ✅ Pass |
| 5 | Updates during drag state | Bbox updates with drag offset | Updated correctly | ✅ Pass |

### 1.16 brushUtils.test.ts

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Returns correct brush size | Numeric brush size | Correct size | ✅ Pass |
| 2 | Returns stroke dash array for dashed | `[dash, gap]` array | Correct dash array | ✅ Pass |
| 3 | Returns empty array for solid | `[]` | Empty array | ✅ Pass |

### 1.17 eraserUtils.test.ts

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | isPointInShape for rectangle | true if point inside rect | Correct detection | ✅ Pass |
| 2 | isPointInShape for circle | true if point inside circle | Correct detection | ✅ Pass |
| 3 | isPointInShape for ellipse | true if point inside ellipse | Correct detection | ✅ Pass |
| 4 | isPointInShape for line | true if point near line | Correct detection | ✅ Pass |
| 5 | eraseAtPosition removes shapes | Shapes under eraser removed | Shapes removed | ✅ Pass |
| 6 | removeStrokesAt removes strokes | Strokes under eraser removed | Strokes removed | ✅ Pass |

### 1.18 frameUtils.test.ts

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Hit-test with rotation | Correct hit detection on rotated frame | Detection correct | ✅ Pass |
| 2 | BBox with scaling | Scaled frame bbox | Correct scaled bbox | ✅ Pass |
| 3 | Create frame | Frame created with defaults | Frame created | ✅ Pass |
| 4 | isFrame type guard | true for frames, false for others | Type guard works | ✅ Pass |

### 1.19 mathUtils.test.ts

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Distance calculation | Euclidean distance between points | Correct distance | ✅ Pass |
| 2 | Segment-circle intersection | true/false for intersection | Correct result | ✅ Pass |
| 3 | moveForward in array | Element moved up one index | Moved correctly | ✅ Pass |
| 4 | moveBackward in array | Element moved down one index | Moved correctly | ✅ Pass |
| 5 | Font family fallback | Returns fallback font if primary unavailable | Fallback returned | ✅ Pass |

### 1.20 useSync.test.ts

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Initializes with initialLocked state | `isLocked === true` | true | ✅ Pass |
| 2 | Updates isLocked when prop changes | `isLocked` reflects new prop | Updated correctly | ✅ Pass |
| 3 | setIsLocked manually toggles lock | `isLocked` toggled to true | Toggled correctly | ✅ Pass |
| 4 | Exposes updateCursorPosition function | Function is typeof 'function' | Function exposed | ✅ Pass |
| 5 | updateCursorPosition doesn't throw | No error thrown | No throw | ✅ Pass |
| 6 | Handles negative cursor coordinates | No error thrown | No throw | ✅ Pass |
| 7 | Handles zero cursor coordinates | No error thrown | No throw | ✅ Pass |
| 8 | Initializes users as empty array | `users === []` | Empty array | ✅ Pass |
| 9 | Users property holds cursor data | `Array.isArray(users) === true` | Is array | ✅ Pass |

---

## 2. Unit Testing (Backend)

### 2.1 Canvas.test.js

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Create and save canvas successfully | Canvas saved with correct fields | Saved correctly | ✅ Pass |
| 2 | Set default values if not provided | name='Untitled Board', is_locked=false | Defaults set | ✅ Pass |
| 3 | Fail validation if _id missing | ValidationError with _id error | Error thrown | ✅ Pass |
| 4 | Fail validation if owner missing | ValidationError with owner error | Error thrown | ✅ Pass |
| 5 | Fail validation if participant role invalid | ValidationError on role enum | Error thrown | ✅ Pass |

### 2.2 Room.test.js

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Create and save room successfully | Room saved with Buffer data | Saved correctly | ✅ Pass |
| 2 | Retrieve room and decode buffer | Yjs doc restored with shapes | Decoded correctly | ✅ Pass |

### 2.3 User.test.js

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Create & save user successfully | User saved with correct fields, avatar="" | Saved correctly | ✅ Pass |
| 2 | Create user without required field fails | ValidationError on displayName | Error thrown | ✅ Pass |
| 3 | Create duplicate googleId fails | MongoDB error code 11000 | Duplicate error | ✅ Pass |

### 2.4 authController.test.js

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Return 400 if auth code missing | Status 400, error message | 400 returned | ✅ Pass |
| 2 | Create new user and return token | User.create called, JWT returned | User created + token | ✅ Pass |
| 3 | Return token for existing user | User.create NOT called, JWT returned | Login succeeded | ✅ Pass |
| 4 | Return 401 if Google OAuth fails | Status 401 | 401 returned | ✅ Pass |
| 5 | Return user data if user exists (getMe) | User JSON returned | User data returned | ✅ Pass |
| 6 | Return 404 if user not found (getMe) | Status 404 | 404 returned | ✅ Pass |
| 7 | Return 500 on DB error (getMe) | Status 500 | 500 returned | ✅ Pass |

### 2.5 authMiddleware.test.js

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Call next() with valid token | next() called, req.userId set | next() called | ✅ Pass |
| 2 | Return 401 with no Authorization header | Status 401 | 401 returned | ✅ Pass |
| 3 | Return 401 with undefined Authorization | Status 401 | 401 returned | ✅ Pass |
| 4 | Return 401 without Bearer prefix | Status 401 | 401 returned | ✅ Pass |
| 5 | Return 401 with expired token | Status 401 | 401 returned | ✅ Pass |
| 6 | Return 401 with malformed token | Status 401 | 401 returned | ✅ Pass |
| 7 | Return 401 with wrong secret | Status 401 | 401 returned | ✅ Pass |

### 2.6 authRouteGuard.test.js

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Reject request with no token | Status 401, next not called | 401 returned | ✅ Pass |
| 2 | Reject request with empty Bearer | Status 401 | 401 returned | ✅ Pass |
| 3 | Reject random string as token | Status 401 | 401 returned | ✅ Pass |
| 4 | Allow valid JWT and set userId | next() called, req.userId set | Allowed | ✅ Pass |
| 5 | Pass userId to downstream handlers | req.userId is valid string | userId set | ✅ Pass |
| 6 | Multiple sequential requests with same token | All 3 requests pass | Session persists | ✅ Pass |
| 7 | Public route does not use protect | protect blocks unauthenticated | Verified | ✅ Pass |

### 2.7 canvasController.test.js

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | createCanvas success | Status 201, canvasId + name + url | Canvas created | ✅ Pass |
| 2 | getUserCanvases returns 404 if user not found | Status 404 | 404 returned | ✅ Pass |
| 3 | getUserCanvases returns formatted list | Status 200, canvases array | List returned | ✅ Pass |
| 4 | getCanvas returns details | Status 200 | Details returned | ✅ Pass |
| 5 | lockCanvas updates lock state | Status 200, is_locked=true | Lock updated | ✅ Pass |
| 6 | lockCanvas returns 400 for non-boolean | Status 400 | 400 returned | ✅ Pass |
| 7 | lockCanvas returns 404 if not found | Status 404 | 404 returned | ✅ Pass |
| 8 | addParticipant success | Status 200, membership upserted | Participant added | ✅ Pass |
| 9 | addParticipant returns 403 for non-owner | Status 403 | 403 returned | ✅ Pass |
| 10 | addParticipant defaults to editor role | Role defaults to 'editor' | Defaulted correctly | ✅ Pass |
| 11 | updateCanvasName success | Name changed, status 200 | Name updated | ✅ Pass |
| 12 | updateCanvasName returns 400 if name missing | Status 400 | 400 returned | ✅ Pass |
| 13 | deleteCanvas success for owner | Canvas + memberships deleted, 200 | Deleted | ✅ Pass |
| 14 | deleteCanvas returns 403 for non-owner | Status 403, deleteOne not called | 403 returned | ✅ Pass |
| 15 | joinCanvas success | Membership upserted, user updated, 200 | Joined | ✅ Pass |

### 2.8 canvasMembership.test.js

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Create and save membership | Membership saved with correct fields | Saved | ✅ Pass |
| 2 | Fail if required fields missing | ValidationError | Error thrown | ✅ Pass |
| 3 | Fail if role is invalid | ValidationError on role | Error thrown | ✅ Pass |
| 4 | Fail on duplicate canvasId+userId | MongoDB 11000 error | Duplicate rejected | ✅ Pass |

### 2.9 checkSessionLock.test.js

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Call next() when canvas unlocked | next() called | next() called | ✅ Pass |
| 2 | Return 403 when canvas locked | Status 403 | 403 returned | ✅ Pass |
| 3 | Return 404 when canvas not found | Status 404 | 404 returned | ✅ Pass |
| 4 | Return 500 on DB error | Status 500 | 500 returned | ✅ Pass |

### 2.10 concurrentEditing.test.js (35 tests)

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Create Yjs doc with shared types | Map and Array defined | Created | ✅ Pass |
| 2 | CRDT merge of concurrent edits | Both docs have both shapes | Merged | ✅ Pass |
| 3 | Preserve edits on different keys | Both shapes in both docs | Preserved | ✅ Pass |
| 4 | Last writer wins on same key | Both docs converge | Converged | ✅ Pass |
| 5 | Encode/decode state correctly | Restored doc matches original | Correct | ✅ Pass |
| 6 | Accept valid resize payload | valid=true | true | ✅ Pass |
| 7 | Accept valid rotate payload | valid=true | true | ✅ Pass |
| 8 | Reject undocumented type | valid=false | false | ✅ Pass |
| 9 | Reject payload without type | valid=false, error contains 'type' | Rejected | ✅ Pass |
| 10 | Reject missing objectId | valid=false | Rejected | ✅ Pass |
| 11 | Accept whitespace objectId (current behavior) | valid=true | true | ✅ Pass |
| 12 | Reject invalid type 'delete' | valid=false | Rejected | ✅ Pass |
| 13 | Reject missing properties object | valid=false | Rejected | ✅ Pass |
| 14 | Reject non-numeric width | valid=false | Rejected | ✅ Pass |
| 15 | Accept negative width (no check) | valid=true | true | ✅ Pass |
| 16 | Accept zero height | valid=true | true | ✅ Pass |
| 17 | Reject non-numeric rotation | valid=false | Rejected | ✅ Pass |
| 18 | Reject null payload | valid=false | Rejected | ✅ Pass |
| 19 | Reject undefined payload | valid=false | Rejected | ✅ Pass |
| 20-30 | Group/frame_meta validation (11 tests) | Correct valid/invalid results | All correct | ✅ Pass |
| 31-35 | Unique ID + sync protocol encoding (5 tests) | Correct encoding/decoding | All correct | ✅ Pass |

### 2.11 networkOptimization.test.js (17 tests)

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1-3 | Ephemeral message encoding (Type 2) | Correct encode/decode of position, cursor, rapid updates | All correct | ✅ Pass |
| 4-6 | Yjs optimistic updates | Immediate local update, pending state tracking, concurrent handling | All correct | ✅ Pass |
| 7-9 | Batch encoding (transactions) | Single update event, smaller payload, batch type-3 message | All correct | ✅ Pass |
| 10-11 | Debounced persistence | Single save after rapid updates, batched Yjs state | All correct | ✅ Pass |
| 12-14 | Broadcast optimization | Excludes sender, empty room handling, efficient batch size | All correct | ✅ Pass |
| 15-17 | Message type handling | Differentiates types 0-3, empty payload, large payload | All correct | ✅ Pass |

### 2.12 oauthIntegration.test.js (10 tests)

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | OAuth2Client initialized with correct creds | Constructor args match env vars | Correct | ✅ Pass |
| 2 | Uses 'postmessage' as redirect URI | Third arg is 'postmessage' | Correct | ✅ Pass |
| 3 | Exchanges auth code for tokens | getToken called with code | Called | ✅ Pass |
| 4 | Returns 400 when no ID token | Status 400 | 400 returned | ✅ Pass |
| 5 | Returns 401 for expired code | Status 401 | 401 returned | ✅ Pass |
| 6 | Returns 401 for tampered token | Status 401 | 401 returned | ✅ Pass |
| 7 | Extracts user identity from payload | User.create called with correct fields | Identity extracted | ✅ Pass |
| 8 | Handles missing profile picture | Avatar defaults to '' | Empty string | ✅ Pass |
| 9 | JWT signed with correct payload | sign called with userId + email + 7d | Signed correctly | ✅ Pass |
| 10 | JWT response includes token + user | Response has token and user object | Correct response | ✅ Pass |

### 2.13 presenceEvents.test.js (9 tests)

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Extract name and clientId from URL | Correct name, clientId, roomId | Extracted | ✅ Pass |
| 2 | Fallback to 'Anonymous' without name param | name='Anonymous' | Fallback works | ✅ Pass |
| 3 | Handle URL-encoded names | 'John Doe' | Decoded correctly | ✅ Pass |
| 4 | buildPresenceMessage produces type-4 msg | Uint8Array starting with 4 | Correct type | ✅ Pass |
| 5 | Decode back to original JSON | Matching payload | Decoded correctly | ✅ Pass |
| 6-7 | user_joined event fields + count | Correct event, name, count | Correct | ✅ Pass |
| 8-9 | user_left event + room_state | Correct event, decremented count, member list | Correct | ✅ Pass |

### 2.14 redisCanvasService.test.js (12 tests)

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | saveShape HSET with correct key/field/value | HSET called with canvas:...:shapes | Called correctly | ✅ Pass |
| 2 | Accept pre-stringified value | No double-encoding | Stored as-is | ✅ Pass |
| 3 | Refresh 24h TTL on every write | EXPIRE called with 86400 | TTL refreshed | ✅ Pass |
| 4 | HSET called before EXPIRE | Call order: hset, expire | Correct order | ✅ Pass |
| 5 | Return parsed shapes from HGETALL | Parsed JSON objects | Parsed correctly | ✅ Pass |
| 6 | Return empty object for no shapes | `{}` | Empty object | ✅ Pass |
| 7 | Fall back to raw string for non-JSON | Raw string returned | Fallback works | ✅ Pass |
| 8-9 | deleteShape/deleteCanvas correct keys | HDEL/DEL with correct keys | Called correctly | ✅ Pass |
| 10-12 | Error propagation (3 tests) | Errors thrown through | Propagated | ✅ Pass |

### 2.15 redisPersistenceService.test.js (4 tests)

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Sync shapes to Room + Canvas timestamp | Room.findByIdAndUpdate + Canvas.findByIdAndUpdate called | Synced | ✅ Pass |
| 2 | Skip sync if Redis hash empty | No DB writes | Skipped | ✅ Pass |
| 3 | Handle raw string fallbacks | Non-JSON stored as raw | Handled | ✅ Pass |
| 4 | Only sync dirty canvases on interval | 2 hgetall calls for 2 dirty canvases | Synced dirty only | ✅ Pass |

### 2.16 validation.test.js (11 tests)

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Reject non-object payload | valid=false | Rejected | ✅ Pass |
| 2 | Reject missing objectId | valid=false | Rejected | ✅ Pass |
| 3 | Reject invalid type | valid=false | Rejected | ✅ Pass |
| 4 | Reject missing properties | valid=false | Rejected | ✅ Pass |
| 5 | Accept valid resize | valid=true | Accepted | ✅ Pass |
| 6 | Reject non-numeric width | valid=false | Rejected | ✅ Pass |
| 7 | Accept valid rotate | valid=true | Accepted | ✅ Pass |
| 8 | Reject non-numeric rotation | valid=false | Rejected | ✅ Pass |
| 9-11 | Group + frame_meta validation | Correct results | All correct | ✅ Pass |

---

## 3. Integration Testing

### 3.1 authRoutes.test.js (11 tests)

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Register new user → 201 + hashed password | Status 201, bcrypt hash in DB | Registered | ✅ Pass |
| 2 | Duplicate email → 409 | Status 409 | 409 returned | ✅ Pass |
| 3 | Weak password → 400 | Status 400 | 400 returned | ✅ Pass |
| 4 | Login with correct credentials → 200 | Status 200 + token | Logged in | ✅ Pass |
| 5 | Login with wrong password → 401 | Status 401 | 401 returned | ✅ Pass |
| 6 | Login with non-existent email → 401 | Status 401 | 401 returned | ✅ Pass |
| 7 | Access /me with valid token → 200 | Status 200 + user data | Accessed | ✅ Pass |
| 8 | Access /me without token → 401 | Status 401 | 401 returned | ✅ Pass |
| 9 | Access /me with invalid token → 401 | Status 401 | 401 returned | ✅ Pass |
| 10 | Google OAuth login → 200 | Status 200, user created in DB | Login succeeded | ✅ Pass |
| 11 | Link Google to existing email user | Status 200, googleId updated | Account linked | ✅ Pass |

### 3.2 canvasRoutes.test.js (20 tests)

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | GET canvas with is_locked=false default | Status 200, is_locked=false | Correct | ✅ Pass |
| 2 | GET locked canvas | Status 200, is_locked=true | Correct | ✅ Pass |
| 3 | GET unknown canvas → 404 | Status 404 | 404 returned | ✅ Pass |
| 4 | POST create canvas with auth → 201 | Status 201, canvasId + url | Created | ✅ Pass |
| 5 | POST create without auth → 401 | Status 401 | 401 returned | ✅ Pass |
| 6 | PATCH lock canvas | Status 200, is_locked=true | Locked | ✅ Pass |
| 7 | PATCH unlock canvas | Status 200, is_locked=false | Unlocked | ✅ Pass |
| 8 | PATCH lock with string → 400 | Status 400 | 400 returned | ✅ Pass |
| 9 | GET /mine returns user canvases | Status 200, canvases array | Returned | ✅ Pass |
| 10 | GET /mine with isCollab=true | isCollab=true for multi-participants | Correct | ✅ Pass |
| 11 | POST join as owner | 200, 'Joined as owner' | Joined | ✅ Pass |
| 12 | POST join as guest | 200, participant + membership added | Joined | ✅ Pass |
| 13-20 | Participants, rename, delete (8 tests) | Correct status codes and DB state | All correct | ✅ Pass |

### 3.3 healthRoutes.test.js (1 test)

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | GET /health → 200 OK | Status 200, `{ status: 'OK' }` | 200 OK | ✅ Pass |

### 3.4 shapeRoutes.test.js (4 tests)

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | GET shapes for non-existent room → 404 | Status 404 | 404 returned | ✅ Pass |
| 2 | GET shapes returns list | Status 200, shapes array with count | Returned | ✅ Pass |
| 3 | GET specific shape by ID | Status 200, shape data | Returned | ✅ Pass |
| 4 | GET missing shape → 404 | Status 404 | 404 returned | ✅ Pass |

---

## 4. Regression Testing

### 4.1 auth.regression.test.js (21 tests)

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Register new user → 201 | 201 + token | Registered | ✅ Pass |
| 2 | Duplicate email → 409 | 409, field='email' | 409 returned | ✅ Pass |
| 3 | Case-insensitive email duplicate | 409 | 409 returned | ✅ Pass |
| 4-8 | Password validation (5 tests) | 400 for each weakness | All 400 | ✅ Pass |
| 9 | Invalid email format → 400 | 400, field='email' | 400 returned | ✅ Pass |
| 10-11 | Name length validation | 400 for too short/long | 400 returned | ✅ Pass |
| 12 | NoSQL injection in email | Non-201 status | Rejected | ✅ Pass |
| 13-16 | Login edge cases (4 tests) | Correct status codes | All correct | ✅ Pass |
| 17-21 | Google OAuth + JWT regression (5 tests) | Correct auth flow | All correct | ✅ Pass |

### 4.2 canvas.regression.test.js (24 tests)

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1-6 | Canvas creation (6 tests) | 201, UUID, defaults, membership, user array, 401 | All correct | ✅ Pass |
| 7-10 | Get user canvases (4 tests) | empty/full, isCollab, 401 | All correct | ✅ Pass |
| 11-12 | Get single canvas (2 tests) | 200 with owner, 404 | All correct | ✅ Pass |
| 13-17 | Canvas rename (5 tests) | 200/403/400/404/401 | All correct | ✅ Pass |
| 18-23 | Lock/unlock (6 tests) | Boolean validation, 404 for non-owner | All correct | ✅ Pass |
| 24 | Join + add participant tests | Membership created, upsert works | All correct | ✅ Pass |

### 4.3 models.regression.test.js (30 tests)

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1-16 | User model (16 tests) | Validation, hashing, comparePassword, defaults | All correct | ✅ Pass |
| 17-28 | Canvas + CanvasMembership (12 tests) | UUID _id, defaults, roles, compound index | All correct | ✅ Pass |
| 29-30 | Room model buffer roundtrip | Yjs encode/save/decode intact | All correct | ✅ Pass |

### 4.4 redisServices.regression.test.js (15 tests)

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1-7 | redisCanvasService (7 tests) | HSET/HGETALL/HDEL/DEL with correct keys | All correct | ✅ Pass |
| 8-15 | redisPersistenceService (8 tests) | markDirty, syncCanvasToMongo, periodic sync lifecycle | All correct | ✅ Pass |

### 4.5 security.regression.test.js (15 tests)

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | User B cannot rename User A's canvas | 403 | 403 returned | ✅ Pass |
| 2 | User B cannot lock User A's canvas | 404 | 404 returned | ✅ Pass |
| 3 | User B cannot delete User A's canvas | 403 | 403 returned | ✅ Pass |
| 4 | User B cannot add participants | 403 | 403 returned | ✅ Pass |
| 5 | Owner operations still work after unauthorized attempt | 200 | 200 returned | ✅ Pass |
| 6 | User B can join canvas | 200 | 200 returned | ✅ Pass |
| 7 | Unauthenticated → 401 on all endpoints | All 401 | All 401 | ✅ Pass |
| 8 | Forged JWT → 401 | 401 | 401 returned | ✅ Pass |
| 9-11 | Injection safety (login) | 400/401, never 200 | Rejected | ✅ Pass |
| 12-15 | Canvas name injection + auth edge cases | No 500, correct 401s | All correct | ✅ Pass |

### 4.6 sessionLock.regression.test.js (7 tests)

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Canvas unlocked → next() | next() called | Called | ✅ Pass |
| 2 | is_locked undefined → next() | next() called | Called | ✅ Pass |
| 3 | Canvas locked → 403 | 403 + error body | 403 returned | ✅ Pass |
| 4 | Canvas not found → 404 | 404 + message body | 404 returned | ✅ Pass |
| 5 | DB error → 500 | 500 + message body | 500 returned | ✅ Pass |
| 6 | Passes correct canvasId to findById | findById called with ID | Called correctly | ✅ Pass |
| 7 | No next() after 403/404 | next() not called | Not called | ✅ Pass |

### 4.7 shapes.regression.test.js (10 tests)

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | GET shapes for non-existent room → 404 | 404 | 404 returned | ✅ Pass |
| 2 | GET shapes for room with no data → 404 | 404 | 404 returned | ✅ Pass |
| 3 | GET empty shapes → 200 with count=0 | 200, empty array | Returned | ✅ Pass |
| 4 | GET populated shapes → 200 with correct data | 200, shapes match | Returned | ✅ Pass |
| 5 | Shape properties preserved | All properties intact | Preserved | ✅ Pass |
| 6-10 | Single shape endpoint tests (5 tests) | Correct 200/404 responses | All correct | ✅ Pass |

### 4.8 validation.regression.test.js (27 tests)

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1-6 | Payload structure validation | null/string/number/missing fields rejected | All rejected | ✅ Pass |
| 7-9 | move type (no validator) | Always valid with any properties | All pass | ✅ Pass |
| 10-16 | resize validation (7 tests) | width/height/radius numeric checks | All correct | ✅ Pass |
| 17-22 | rotate validation (6 tests) | rotation numeric, 0, negative, float | All correct | ✅ Pass |
| 23-27 | group + frame_meta (5 tests) | parentId/childrenIds/name/ownerId checks | All correct | ✅ Pass |

### 4.9 websocket.regression.test.js (10 tests)

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Sends room_state on connection | Type-4 message with members | Received | ✅ Pass |
| 2 | Sends Yjs sync step 1 on connection | Type-0 message | Received | ✅ Pass |
| 3 | Loads persisted Yjs snapshot from Room | Seeded shape available in client doc | Loaded | ✅ Pass |
| 4 | user_joined event broadcast | user_joined event to existing clients | Broadcast | ✅ Pass |
| 5 | user_left event broadcast | user_left event on disconnect | Broadcast | ✅ Pass |
| 6 | room_state includes all members | All members listed | Listed | ✅ Pass |
| 7 | Yjs update broadcast to peers | Type-0 received by other client | Broadcast | ✅ Pass |
| 8 | No echo back to sender | No update broadcast back | No echo | ✅ Pass |
| 9 | session_locked for locked room | session_locked event on write | Locked | ✅ Pass |
| 10 | Valid property update relayed | Type-3 received by peer | Relayed | ✅ Pass |

---

## 5. Performance Testing

| S.No | Test Case | Expected Output | Output Got | Pass/Fail |
|------|-----------|----------------|------------|-----------|
| 1 | Lighthouse Performance Audit | Performance score ≥ 70 | Score achieved | ✅ Pass |

---

## 6. Test Results Summary

| Category | Total Tests | Passed | Failed | Pass Rate |
|----------|------------|--------|--------|-----------|
| **Unit Testing (Frontend)** | 101 | 101 | 0 | 100% |
| **Unit Testing (Backend)** | 62 | 62 | 0 | 100% |
| **Integration Testing** | 36 | 36 | 0 | 100% |
| **Regression Testing** | 159 | 159 | 0 | 100% |
| **Performance Testing** | 1 | 1 | 0 | 100% |
| **Overall** | **359** | **359** | **0** | **100%** |

### Tools Used

| Tool | Purpose | Version |
|------|---------|---------|
| **Vitest** | Frontend unit testing | Latest |
| **Jest** | Backend unit/integration/regression testing | Latest |
| **Supertest** | HTTP endpoint integration testing | Latest |
| **React Testing Library** | Component rendering and interaction | Latest |
| **MongoDB Memory Server** | In-memory DB for test isolation | Latest |
| **Lighthouse** | Performance auditing | Latest |

### Key Testing Observations

1. **CRDT Synchronization**: All Yjs CRDT conflict resolution tests pass — concurrent edits on different keys preserve both, same-key edits converge deterministically.
2. **Authentication Security**: JWT validation, route guarding, cross-user access control, and injection safety all verified.
3. **Session Lock**: The `checkSessionLock` middleware correctly blocks writes to locked canvases at both REST and WebSocket layers.
4. **Redis Layer**: Shape persistence, TTL management, and periodic sync-to-MongoDB all function correctly with proper error propagation.
5. **Real-time Collaboration**: WebSocket presence events, Yjs sync, ephemeral message broadcasting, and property update validation all verified end-to-end.
