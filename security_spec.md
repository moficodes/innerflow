# Security Specification - InnerFlow

## Data Invariants
1. A `Session` document must have a `userId` matching the creator's ID.
2. A `Session` document once created is immutable (users shouldn't edit their past breath-hold records to "cheat").
3. A `User` profile can only be created or modified by the user with that ID.

## The "Dirty Dozen" Payloads

1. **Identity Spoofing**: Creating a session with another user's `userId`.
2. **Ghost Field Injection**: Adding an `isAdmin: true` field to a session document.
3. **Identity Tampering**: Updating an existing session's `userId`.
4. **State Poisoning**: Setting `breathHoldSeconds` to a negative value.
5. **PII Leakage**: Attempting to read all sessions in the collection without a filter on `userId`.
6. **Resource Exhaustion**: Sending a 1MB string as the `exerciseName`.
7. **Unverified Auth**: Writing data with an account that hasn't verified its email (if required by logic).
8. **Orphaned Relation**: Creating a session for a userId that hasn't been initialized in the users collection (though we usually check for the inverse).
9. **Timestamp Manipulation**: Providing a future or past `timestamp` instead of `request.time`.
10. **Type Confusion**: Sending `durationSeconds` as a string instead of a number.
11. **ID Injection**: Using a document ID containing special characters or excessively long.
12. **Malicious Enum**: Setting `type` to "admin_hack" instead of "exercise" or "hold".

## Test Scenarios
- `test_identity_spoofing`: Deny if `request.auth.uid != incoming().userId`.
- `test_session_immutability`: Deny any `update` to sessions.
- `test_type_safety`: Deny if `breathHoldSeconds` is not a number.
- `test_query_enforcement`: Deny `list` if the query doesn't filter by `ownerId`.
