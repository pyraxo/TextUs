# Database Initialization Scripts

This directory contains scripts for initializing and populating the database with test data.

## Available Scripts

### `create_admin.sh`

Creates an admin user in the database. This should be run first before other population scripts.

```bash
./scripts/create_admin.sh
```

### `populate_db.sh`

Populates the database with sample data:

- 1 scheme (Customer Support Training)
- 2 scenarios (Product Return, Technical Support)
- 2 customers (John Doe, Jane Smith)
- 2 conversations with chat history

This script depends on the admin user existing, so make sure to run `create_admin.sh` first.

```bash
./scripts/populate_db.sh
```

## Sample Data Structure

The `populate_db.py` script creates:

1. A scheme for "Customer Support Training"
2. Two scenarios:
   - Product Return Inquiry
   - Technical Support Issue
3. Two customers:
   - John Doe: A patient customer preferring detailed explanations
   - Jane Smith: A tech-savvy customer focused on efficiency
4. Two customer-scenario connections with custom profiles
5. Two conversations with realistic chat history

## Customization

To modify the sample data, edit the `populate_db.py` script directly. Each section is clearly labeled with comments to help you identify where to make changes.
