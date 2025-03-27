# Database Initialization Scripts

This directory contains scripts for initializing and populating the database with test data.

## Available Scripts

### `create_admin.sh`

Creates an admin user in the database. This should be run first before other population scripts.

```bash
./scripts/create_admin.sh
```

### `populate_test_data.sh`

Populates the database with test data for CPF schemes and scenarios:

- 6 schemes (Home Ownership, Retirement, Healthcare, Education, Employer Services, Housing Protection)
- 2 scenarios per scheme (12 total scenarios)

This script runs both `populate_schemes.py` and `populate_scenarios.py` in the correct order.

```bash
./scripts/populate_test_data.sh
```

## Test Data Structure

The test data scripts create:

1. Six CPF Schemes:

   - Home Ownership: For housing-related assistance
   - Retirement: For retirement planning
   - Healthcare: For medical coverage and benefits
   - Education: For education financing
   - Employer Services: For employer-related services
   - Housing Protection: For housing insurance and protection

2. Two scenarios per scheme (12 total), including:
   - First-Time Home Buyer Consultation
   - CPF LIFE Scheme Explanation
   - MediSave Usage Inquiry
   - Education Savings Scheme
   - CPF Contribution Rates
   - Home Protection Scheme Claims
     And more...

## Customization

To modify the test data:

1. Edit `populate_schemes.py` to modify scheme information
2. Edit `populate_scenarios.py` to modify scenario content

Each script is clearly documented with comments to help you identify where to make changes.
