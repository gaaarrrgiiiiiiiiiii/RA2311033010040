Stage 1: API Design
Endpoints
1. Get Notifications

GET /notifications

Response:
{
"notifications": [
{
"id": "string",
"type": "Placement | Result | Event",
"message": "string",
"timestamp": "datetime",
"isRead": false
}
]
}

2. Create Notification

POST /notifications

Request:
{
"userId": "string",
"type": "Placement | Result | Event",
"message": "string"
}

3. Mark as Read

PATCH /notifications//read

Response:
{
"message": "Notification marked as read"
}

Real-time Mechanism

To deliver notifications in real-time, we can use:

WebSockets (preferred for bi-directional communication)
Server-Sent Events (SSE) for simpler implementation
Stage 2: Database Design

I would use PostgreSQL for storing notifications because:

Strong consistency
Efficient indexing
Suitable for structured data
Schema

notifications table:

id (UUID)
userId (string)
type (ENUM: Placement, Result, Event)
message (text)
createdAt (timestamp)
isRead (boolean)
Indexing

CREATE INDEX idx_notifications
ON notifications(userId, isRead, createdAt DESC);

Challenges at Scale
Large volume of data (millions of notifications)
Slow queries
Solutions
Proper indexing
Pagination
Archiving old data
Partitioning tables
Stage 3: Query Optimization

Given query:
SELECT * FROM notifications
WHERE studentID = ? AND isRead = false
ORDER BY createdAt DESC;

Issues:
Full table scan
Sorting overhead
Solution:
Add composite index (studentID, isRead, createdAt)
Note:

Indexing every column is not efficient because:

Increases storage
Slows down writes
Stage 4: Performance Optimization
Problem:

Fetching notifications on every request causes high DB load.

Solutions:
Caching (Redis)
Store recent notifications
Reduces DB hits
Pagination
Load limited data per request
Lazy Loading / Infinite Scroll
Fetch data as needed
Debouncing API calls
Prevent excessive requests
Tradeoffs:
Method	Pros	Cons
Cache	Fast	Memory cost
Pagination	Scalable	Multiple requests
Stage 5: Reliable Notification System
Problem:

If sending email fails midway, system becomes inconsistent.

Solution: Use Queue System

Use tools like:

RabbitMQ
Kafka
Improved Flow:
Push job to queue
Worker processes job:
Send email
Save to DB
Push notification
Benefits:
Retry mechanism
Fault tolerance
Non-blocking system
Stage 6: Priority Notification System
Requirement:

Show top N important unread notifications.

Priority Logic:

Priority based on:

Type (Placement > Result > Event)
Recency (latest first)
Strategy:
Assign weight to type
Combine with timestamp
Sort notifications
Return top N (e.g., 10)
Handling New Notifications:
Maintain sorted structure (heap / priority queue)
Update dynamically on new arrival
