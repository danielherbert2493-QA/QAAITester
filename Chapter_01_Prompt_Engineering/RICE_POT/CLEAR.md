Context: I'm a QA engineer testing the login page of https://app.wingify.com/login

Limits: Create around 20 test cases covering positive, negative and basic UI/security scenarios. Keep them short and in simple language.

Example: "Validate login with valid credentials" and "Validate login with incorrect password".

Action: Give the output as an Excel sheet (.xlsx) with these columns: Test Case ID, Type (Positive/Negative/UI/Security), Scenario, Steps, Expected Result, Priority (High/Medium/Low). Create a Output folder in the same folder and add it.

Review: After creating the sheet, check that these areas are covered: valid login, wrong credentials, empty fields, invalid email format, Forgot Password link, show/hide password, Enter-key submit, account lockout, SQL injection or special characters, leading and trailing spaces, session after login, and SSO login if available. List anything left out.