# Admin Dashboard Components Analysis

## Overview
This document provides a comprehensive breakdown of four key admin dashboard components that can be integrated into a consolidated multi-tab dashboard.

---

## 1. BOOKING MANAGEMENT

### Main State Variables
```javascript
// Modal Control
const [showFilterModal, setShowFilterModal] = useState(false);

// Raw Firebase Objects
const [rawUsers, setRawUsers] = useState({});
const [rawDrivers, setRawDrivers] = useState({});
const [rawPassengers, setRawPassengers] = useState({});
const [rawBookings, setRawBookings] = useState({});

// Derived UI Arrays
const [allBookings, setAllBookings] = useState([]);
const [filteredBookings, setFilteredBookings] = useState([]);

// Filter States
const [dateFrom, setDateFrom] = useState("");
const [dateTo, setDateTo] = useState("");
const [selectedDriver, setSelectedDriver] = useState("All Drivers");
const [statusFilters, setStatusFilters] = useState({
  Completed: true,
  Pending: true,
  Cancelled: true
});
```

### Key useEffect Hooks
1. **Database Listeners Hook** (runs once on mount)
   - Sets up real-time listeners on: `users`, `drivers`, `passengers`, `bookings`
   - Updates raw state objects as data changes
   - Cleans up subscriptions on unmount

2. **Booking Derivation Hook** (depends on: rawUsers, rawDrivers, rawPassengers, rawBookings)
   - Transforms Firebase objects into UI-friendly booking array
   - Performs data enrichment:
     - Passenger name from `passengers → users` relationship
     - Driver name from `drivers → users` relationship (or fallback to driverSnapshot)
     - Date formatting from `RequestedAt` timestamp
     - Fare and distance calculation
   - Creates `allBookings` array
   - Initializes `filteredBookings` with full array

### Important Helper Functions
```javascript
// Hash function to convert Firebase keys to integers
const hashKeyToInt = (key) => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// Get status color for visual indication
const getStatusColor = (status) => {
  // Returns: green for Completed, yellow for Pending, red for Cancelled
};

// Apply all active filters to booking list
const applyFilters = () => {
  // Filter by date range (dateFrom, dateTo)
  // Filter by driver selection
  // Filter by status checkboxes
  // Updates filteredBookings state
};

// Reset all filters to default
const resetFilters = () => {
  // Clears all filter states
  // Sets filteredBookings back to allBookings
};

// Toggle individual status filters
const toggleStatus = (status) => {
  // Toggles Completed/Pending/Cancelled checkboxes
};

// Extract unique driver names from active drivers
const driverNames = useMemo(() => {
  // Filters drivers where IsActive !== false and DeletedAt not set
  // Maps to user full names via UserID relationship
  // Returns sorted array
}, [rawDrivers, rawUsers]);
```

### Booking Item Data Structure
```javascript
{
  id: integer,                    // Hash of Firebase key
  passenger: string,              // Passenger name
  pickup: string,                 // Pickup location
  destination: string,            // Dropoff location
  fare: number,                   // Total fare amount
  status: string,                 // "Completed" | "Pending" | "Cancelled"
  driver: string,                 // Driver full name
  driverTricycle: string,         // Tricycle number
  driverLicense: string,          // Driver license number
  distance: string,               // e.g., "5km"
  date: string,                   // YYYY-MM-DD format
  time: string                    // HH:MM format
}
```

### Main UI Sections
1. **Header**
   - Title: "Booking Management"
   - Admin badge with avatar

2. **Filter Bar**
   - Button to open filter modal
   - Displays count: `({filteredBookings.length} Bookings)`

3. **Booking List**
   - Card-based layout for each booking
   - Shows: Booking ID, Passenger, Route, Driver, Distance, Date/Time, Fare
   - Status badge with color coding
   - Empty state message if no bookings match filters

4. **Filter Modal**
   - Date range picker (dateFrom, dateTo)
   - Driver dropdown (populated from driverNames)
   - Status checkboxes (Completed, Pending, Cancelled)
   - Buttons: Reset, Cancel, Apply Filters

### Filter/Search Functionality
- **Date Range**: Filters bookings where `booking.date >= dateFrom AND booking.date <= dateTo`
- **Driver Selection**: Filters where `booking.driver === selectedDriver`
- **Status Selection**: Multi-select with checkboxes for Completed, Pending, Cancelled
- Filters are cumulative (AND logic)

---

## 2. AUDIT LOGS

### Main State Variables
```javascript
// Data Arrays
const [logs, setLogs] = useState([]);
const [searchTerm, setSearchTerm] = useState("");

// Driver Information
const [drivers, setDrivers] = useState({});        // Lookup map: driverId → name
const [rawDrivers, setRawDrivers] = useState({});  // Full driver objects
const [rawUsers, setRawUsers] = useState({});      // Full user objects
const [driversLoaded, setDriversLoaded] = useState(false);
```

### Key useEffect Hooks
1. **Driver Map Loader** (runs once on mount)
   - Loads all drivers and users
   - Creates a lookup map for driver name resolution
   - Prefers linked user's full name over driver record name
   - Sets `driversLoaded` flag

2. **Audit Logs Listener** (depends on: rawDrivers, rawUsers)
   - Real-time listener on `auditLogs` path
   - Transforms each log entry:
     - Formats `ViolationTimestamp` to YYYY-MM-DD
     - Resolves driver name (live lookup → stored name → fallback)
     - Maps `IsFlaggedForReview` to status ("Flagged" or "Reviewed")
   - Creates searchable log array

### Audit Log Item Data Structure
```javascript
{
  id: string,           // "LOG001", "LOG002", etc.
  dbKey: string,        // Firebase path key
  bookingId: string,    // Reference to booking
  driver: string,       // Driver full name (resolved)
  driverId: string,     // Driver ID
  event: string,        // Violation type (e.g., "Speeding")
  location: string,     // Where violation occurred
  timestamp: string,    // YYYY-MM-DD format
  status: string        // "Flagged" | "Reviewed"
}
```

### Important Helper Functions
```javascript
// Format timestamp to YYYY-MM-DD
const formatDate = (timestamp) => {
  // Converts ISO timestamp to YYYY-MM-DD string
};

// Handle status toggle (Flagged ↔ Reviewed)
const handleStatusChange = (dbKey, currentStatus) => {
  // Updates Firebase: IsFlaggedForReview = true/false
  // Toggles status badge appearance
};

// Filter logs based on search term
const filteredLogs = logs.filter(log =>
  // Case-insensitive search across:
  // - log.id
  // - log.bookingId
  // - log.driver
  // - log.event
  // - log.location
  // - log.status
);
```

### Main UI Sections
1. **Header**
   - Title: "Audit Logs"
   - Search input with icon (searches across all fields)
   - Admin badge

2. **Logs Table**
   - Column headers: Log ID, BookingID, Driver, Event, Location, Timestamp, Status
   - Rows: One audit log per row
   - Hover effect on rows
   - Status badge is clickable to toggle Flagged/Reviewed

3. **Empty State**
   - Message when no logs match search

### Filter/Search Functionality
- **Full-Text Search**: Searches across Log ID, BookingID, Driver name, Event, Location, Status
- **Case-insensitive** matching
- **Real-time** filtering as user types
- **Status Toggle**: Click status badge to toggle Flagged ↔ Reviewed (updates Firebase)

---

## 3. PASSENGER MANAGEMENT

### Main State Variables
```javascript
// Modal Control
const [showEditModal, setShowEditModal] = useState(false);
const [showFilterModal, setShowFilterModal] = useState(false);
const [selectedPassenger, setSelectedPassenger] = useState(null);
const [selectedPassengerIndex, setSelectedPassengerIndex] = useState(null);

// Filter/Search States
const [searchQuery, setSearchQuery] = useState("");
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

// Validation Errors
const [emailError, setEmailError] = useState("");
const [phoneError, setPhoneError] = useState("");

// Raw Firebase Objects
const [rawUsers, setRawUsers] = useState({});
const [rawPassengers, setRawPassengers] = useState({});
const [rawDrivers, setRawDrivers] = useState({});
const [rawBookings, setRawBookings] = useState({});
const [rawFeedback, setRawFeedback] = useState({});

// Derived UI Arrays
const [passengers, setPassengers] = useState([]);
const [rideHistory, setRideHistory] = useState([]);
```

### Key useEffect Hooks
1. **Database Listeners** (runs once on mount)
   - Listens to: `users`, `passengers`, `drivers`, `booking`, `feedback`
   - Updates raw state objects
   - Cleans up on unmount

2. **Passenger & Ride History Derivation** (depends on: all raw objects)
   - **Passenger Array Construction**:
     - Filters users by RoleID = "3" (Passenger)
     - Counts total rides per passenger using PassengerID
     - Derives initials from name
     - Determines status (ACTIVE/INACTIVE) from `IsActive` flag
   
   - **Ride History Array Construction**:
     - Iterates through bookings
     - Looks up passenger via PassengerID → user record
     - Looks up driver via DriverID → user record
     - Finds feedback/rating for booking
     - Formats fare with ₱ symbol
     - Extracts date, tricycle number, locations

### Important Helper Functions
```javascript
// Strip phone number prefix
const stripPhonePrefix = (phone) => {
  // If starts with "+63", removes it
  // Returns remaining digits for display
};

// Full name from user object
const makeFullName = (u) => {
  // Concatenates: Firstname Middlename Lastname
  // Filters out empty parts
};

// Filter rides based on all criteria
const getFilteredRides = () => {
  // Filters by searchQuery across:
  //   - passengerId, passengerName, driverName, tricycleNo, pickup, dropOff
  // Filters by date range (startDate, endDate)
  // Returns filtered array
};

// Edit passenger record
const handleEdit = (passenger, index) => {
  // Opens edit modal with cloned passenger data
  // Stores index for later save
};

// Save passenger changes to Firebase
const handleSave = async () => {
  // Validates email format (gmail.com only)
  // Validates phone (exactly 11 digits)
  // Updates Firebase users/{userId}:
  //   - Firstname, Middlename, Lastname (parsed from name input)
  //   - MobileNumber
  //   - Email
  // Updates local state
  // Shows success alert
};
```

### Passenger Item Data Structure
```javascript
{
  id: string,          // PassengerID from user record
  userId: string,      // Firebase user key
  initials: string,    // First 2 letters of name
  name: string,        // Full name
  phone: string,       // Mobile number
  email: string,       // Email address
  rides: number,       // Total count of bookings
  status: string       // "ACTIVE" | "INACTIVE"
}
```

### Ride History Item Data Structure
```javascript
{
  passengerId: string,     // Passenger ID
  passengerName: string,   // Passenger full name
  driverName: string,      // Driver full name
  fare: string,            // "₱ XX.XX" format
  tricycleNo: string,      // Vehicle number
  pickup: string,          // Pickup location
  dropOff: string,         // Dropoff location
  payment: string,         // "Cash" (placeholder)
  rating: string,          // "X/5" or "No rating"
  date: string             // YYYY-MM-DD format
}
```

### Main UI Sections
1. **Header**
   - Title: "Passenger Management"
   - Admin badge

2. **Passenger List**
   - Card-based layout for each passenger
   - Avatar with initials and status color (green = ACTIVE, gray = INACTIVE)
   - Shows: Name, Passenger ID, Phone number, Total rides
   - Status badge
   - Edit button

3. **Filter Modal (Ride History)**
   - Search input: "Passenger, Driver, Tricycle #, Location..."
   - Date range: start and end date
   - Clear button to reset all filters
   - Table showing filtered rides with columns:
     - Date, Passenger ID/Name, Fare, Tricycle No., Pickup, Drop Off, Payment, Rating
   - Empty state icon if no rides found

4. **Edit Passenger Modal**
   - Passenger name input (full name)
   - Email input (validates gmail.com)
   - Contact number input (11 digits only)
   - Real-time validation error messages
   - Cancel / Save Changes buttons

### Filter/Search Functionality
- **Search**: Full-text search across passenger ID, names, driver name, tricycle number, locations
- **Date Range**: Filters rides by date >= startDate AND date <= endDate
- **Multi-field**: Searches multiple fields simultaneously (OR logic within search)
- **Ride History**: Separate modal from passenger list, shows detailed ride records

### Modal Implementations
1. **Edit Passenger Modal**
   - Pre-fills with selected passenger data
   - Real-time validation for email (must be @gmail.com)
   - Real-time validation for phone (must be 11 digits)
   - Shows validation errors below inputs
   - Saves to Firebase users/{userId}

2. **Filter Passenger Modal**
   - Displays entire ride history table
   - Search + date range filtering
   - Clickable Clear button resets all filters
   - Close button closes modal

---

## 4. FARE MATRIX

### Main State Variables
```javascript
const [showModal, setShowModal] = useState(false);
const [modalTitle, setModalTitle] = useState("");
const [modalValue, setModalValue] = useState("");
```

### Key Features
- **No Real-time Data Loading**: Static display of fare information
- **No useEffect Hooks**: All data is hardcoded in UI
- Simple modal for editing values

### Important Helper Functions
```javascript
// Get current page for sidebar highlighting
const getLinkClass = (page) => {
  // Returns Tailwind classes for active/inactive nav links
  // Active: bg-yellow-500 text-gray-900 font-semibold
  // Inactive: text-gray-300 hover:bg-gray-700
};

// Open edit modal
const handleEdit = (title, currentValue) => {
  // Sets modal state with title and value
  // Opens modal
};
```

### Main UI Sections
1. **Header**
   - Title: "Fare Matrix"
   - Admin badge

2. **Sidebar Navigation**
   - Links to all dashboard pages
   - Active page highlighted in yellow
   - Navigation items:
     - Dashboard, Drivers, Passengers, Bookings, Logs, Fare Matrix, Log out

3. **Fare Settings Section**
   - Title: "Fare Matrix Settings"
   - Settings cards in grid layout:
     - **Base Fare Rate**: ₱30 for first km (3-4 passengers), ₱5 per km additional
     - **Service Area**: Bagong Silangan, Quezon City
   - Each card is hover-interactive with edit button (not shown in current version)

4. **Edit Modal**
   - Opens when edit button clicked
   - Title shows which setting is being edited
   - Input field for new value
   - Cancel / Save Changes buttons
   - Shows success alert on save

### Future Integration Notes
- **No Firebase integration**: Currently hardcoded values
- **No validation logic**: Can be added when connecting to database
- **Static content**: Service area and fare tiers are displayed as information blocks

---

## Integration Recommendations for Consolidated Dashboard

### Tab Structure
```
┌─ Booking Management (Tab 1)
├─ Logs (Tab 2)
├─ Passengers (Tab 3)
├─ Fare Matrix (Tab 4)
└─ Other pages...
```

### Shared Components
1. **Sidebar Navigation**: Already consistent across all pages
2. **Header**: Consistent admin badge and page titles
3. **Color Scheme**: Dark theme (bg-[#0a0e1a], cards bg-[#1e2538])
4. **Scrollbar Styling**: Golden gradient scrollbar (shared CSS)

### Data Dependencies
- **Booking Management** depends on: users, drivers, passengers, bookings
- **Logs** depends on: auditLogs, drivers, users
- **Passenger Management** depends on: users, passengers, drivers, bookings, feedback
- **Fare Matrix** is independent

### Firebase Paths Used
- `/users` - User records (full names, emails, phone, role)
- `/drivers` - Driver records (linked to users via UserID)
- `/passengers` - Passenger records (linked to users via UserID)
- `/bookings` (or `/booking`) - Booking records (trip details)
- `/auditLogs` - Violation/event logs
- `/feedback` - Passenger ratings

### Common Patterns Observed
1. **Raw Object → Derived Array Pattern**
   - Store raw Firebase objects in state
   - Use useEffect to transform into UI-friendly arrays
   - Benefits: Automatic updates from real-time listeners

2. **Full Name Assembly**
   - `makeFullName(user)` = `[Firstname, Middlename, Lastname].filter(Boolean).join(' ')`
   - Used consistently across components

3. **User Role Filtering**
   - Passenger: RoleID = "3"
   - Driver: (implied from drivers collection relationship)
   - Filter by IsActive flag and check for DeletedAt

4. **Modal Pattern**
   - Boolean state (`showModal`)
   - Optional selected item state
   - Title/value states for edit modals
   - Cleanup handlers for cancel operations

5. **Real-time Listeners**
   - All components use Firebase Realtime Database with `onValue`
   - Cleanup in return of useEffect to prevent memory leaks
   - Safe checks for null/undefined responses

### Data Validation Rules (from Passenger Management)
- **Email**: Must be @gmail.com domain
- **Phone**: Must be exactly 11 digits
- **Name**: Split into firstname, middlename, lastname for storage
- **Status**: Boolean IsActive flag in users collection

### Performance Considerations
1. **Memoization**: `driverNames` uses `useMemo` to avoid recalculation
2. **Filter Functions**: `applyFilters`, `getFilteredRides`, `filteredLogs` all use in-memory arrays
3. **Real-time Updates**: Components stay in sync with Firebase changes automatically
4. **Search**: Full-text search is client-side, performed on derived arrays

---

## Code Organization Summary

### Common Imports
```javascript
// React and Firebase are loaded via CDN scripts in <head>
// React, ReactDOM, useState, useEffect, useMemo are accessed from window
// Firebase imports are exposed at module level, then wrapped in window.*

// Common Firebase functions exposed:
window.db              // Database instance
window.dbRef           // ref() function
window.dbOnValue       // onValue() listener
window.dbUpdate        // update() function
window.dbGet           // get() function
window.dbSet           // set() function
```

### CSS Patterns
- **Tailwind CSS** for all styling
- **Dark theme**: bg-[#0a0e1a], bg-[#0e1420], bg-[#1a202e], bg-[#1e2538], bg-[#252d42]
- **Accent colors**: Yellow (#fbbf24, #f59e0b) for active states
- **Status colors**: Green (#059669) for success/active, Yellow for pending, Red for error/cancelled
- **Scrollbar**: Custom golden gradient (requires -webkit vendor prefixes)

### Error Handling Patterns
- Try-catch blocks around Firebase operations
- Validation before updates (email domain, phone length)
- Fallback values ("Unknown", "Driver", etc.)
- Alert system using `window.showAlert()` (from ui-modals.js)

---

## ui-modals.js Integration

Both Passenger Management and Fare Matrix reference `<script src="ui-modals.js"></script>` 

This likely provides:
- `window.showAlert(message, type)` function
- Modal styling utilities
- Common modal interaction helpers

---

## Next Steps for Integration

1. **Create Main Dashboard Component**
   - Implement tab switching mechanism
   - Share sidebar and header
   - Lift common state (user info, etc.)

2. **Extract Shared Logic**
   - Create utility functions for common patterns
   - Firebase listener setup helpers
   - Name formatting and validation functions

3. **Optimize Firebase Listeners**
   - Consider centralizing all data fetching
   - Use Context API to share raw data objects
   - Reduce duplicate listeners

4. **Add Component Props**
   - Make each component accept props for:
     - Raw data objects
     - Update handlers
     - Modal control functions
   - Enable tab-based component reuse

5. **Connect Fare Matrix to Firebase**
   - Add listeners for fare configuration path
   - Implement actual save functionality
   - Add validation and error handling
