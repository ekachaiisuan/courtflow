# ER Diagram: ระบบจัดการอยู่เวร

แผนภาพนี้สรุปจาก `duty_desc.md` และออกแบบให้เชื่อมกับตาราง `user` (Better Auth) ที่มีอยู่แล้วในโปรเจกต์

```mermaid
erDiagram
  USER {
    text id PK
    text name
    text email
    text role
  }

  DUTY_TYPE {
    uuid id PK
    text code
    text name
    text period
    time start_time
    time end_time
    boolean active
  }

  DUTY_ORDER {
    uuid id PK
    text order_no
    date effective_from
    date effective_to
    text status
    text created_by FK
    timestamptz created_at
  }

  DUTY_SHIFT {
    uuid id PK
    uuid duty_order_id FK
    uuid duty_type_id FK
    date duty_date
    text status
    text created_by FK
    timestamptz created_at
  }

  DUTY_ASSIGNMENT {
    uuid id PK
    uuid duty_shift_id FK
    text user_id FK
    text assignment_role
    boolean is_checker
    boolean is_security
    text status
  }

  SHIFT_CHANGE_REQUEST {
    uuid id PK
    text request_no
    text request_type
    text reason
    text status
    text requested_by FK
    text submitted_to FK
    timestamptz requested_at
  }

  SHIFT_CHANGE_ITEM {
    uuid id PK
    uuid request_id FK
    uuid from_assignment_id FK
    uuid to_shift_id FK
    text to_user_id FK
    text action_type
  }

  APPROVAL {
    uuid id PK
    text target_type
    uuid target_id
    int seq_no
    text approver_id FK
    text decision
    text comment
    timestamptz decided_at
  }

  DUTY_REPORT {
    uuid id PK
    uuid duty_shift_id FK
    text submitted_by FK
    text status
    text pdf_url
    timestamptz submitted_at
  }

  ALLOWANCE_CLAIM {
    uuid id PK
    text month_key
    text user_id FK
    uuid duty_assignment_id FK
    uuid duty_report_id FK
    uuid approved_change_request_id FK
    text eligibility_status
    numeric amount
    text verified_by FK
    timestamptz verified_at
  }

  NOTIFICATION {
    uuid id PK
    text user_id FK
    text channel
    text title
    text body
    boolean is_read
    timestamptz sent_at
  }

  USER ||--o{ DUTY_ORDER : creates
  DUTY_ORDER ||--o{ DUTY_SHIFT : contains
  DUTY_TYPE ||--o{ DUTY_SHIFT : classifies
  DUTY_SHIFT ||--o{ DUTY_ASSIGNMENT : has
  USER ||--o{ DUTY_ASSIGNMENT : assigned

  USER ||--o{ SHIFT_CHANGE_REQUEST : requests
  USER ||--o{ SHIFT_CHANGE_REQUEST : addressed_to
  SHIFT_CHANGE_REQUEST ||--o{ SHIFT_CHANGE_ITEM : includes
  DUTY_ASSIGNMENT ||--o{ SHIFT_CHANGE_ITEM : from_assignment
  DUTY_SHIFT ||--o{ SHIFT_CHANGE_ITEM : to_shift
  USER ||--o{ SHIFT_CHANGE_ITEM : to_user

  USER ||--o{ APPROVAL : decides
  SHIFT_CHANGE_REQUEST ||--o{ APPROVAL : approval_flow
  DUTY_REPORT ||--o{ APPROVAL : approval_flow

  DUTY_SHIFT ||--o{ DUTY_REPORT : produces
  USER ||--o{ DUTY_REPORT : submits

  DUTY_ASSIGNMENT ||--o{ ALLOWANCE_CLAIM : basis
  DUTY_REPORT ||--o{ ALLOWANCE_CLAIM : evidence
  SHIFT_CHANGE_REQUEST ||--o{ ALLOWANCE_CLAIM : optional_change_ref
  USER ||--o{ ALLOWANCE_CLAIM : claimant
  USER ||--o{ ALLOWANCE_CLAIM : verifier

  USER ||--o{ NOTIFICATION : receives
```

## หมายเหตุ mapping ตามเอกสาร
- `DUTY_TYPE.period`: `DAY` / `NIGHT` (รองรับ 3 ประเภทเวรตามเอกสาร)
- `DUTY_ASSIGNMENT.assignment_role`: `JUDGE` / `SUPERVISOR` / `OFFICER` / `SECURITY`
- `SHIFT_CHANGE_REQUEST.request_type`: `SWAP` / `MOVE` / `CANCEL`
- `APPROVAL.target_type`: `SHIFT_CHANGE_REQUEST` หรือ `DUTY_REPORT`
- เงื่อนไขธุรกิจ (เช่น คนตรวจเวรห้ามเป็นคนเดียวกับคนอยู่เวร, เวรชนเวรเบิกไม่ได้) ควรบังคับที่ service/server action + validation rule
