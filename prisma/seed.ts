import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Seed Categories
  const categories = [
    {
      name: "Real Estate & Property",
      slug: "real-estate",
      description: "Leases, property notices, tenancy and rental documentation.",
      icon: "Building",
    },
    {
      name: "Corporate & Business",
      slug: "business",
      description: "Agreements, confidentiality, partnerships, and commercial contracts.",
      icon: "Briefcase",
    },
    {
      name: "Employment & HR",
      slug: "employment",
      description: "Staff hiring, employment contracts, offer letters, and job terms.",
      icon: "Users",
    },
    {
      name: "Personal & Legal Declarations",
      slug: "personal-legal",
      description: "Affidavits, authorization letters, sworn statements, and declarations.",
      icon: "FileCheck",
    },
    {
      name: "Finance & Debt",
      slug: "finance",
      description: "Promissory notes, debt repayment schedules, and loan agreements.",
      icon: "CreditCard",
    },
  ];

  const createdCategories: Record<string, string> = {};

  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, icon: cat.icon },
      create: cat,
    });
    createdCategories[cat.slug] = record.id;
  }

  // 2. Seed Demo Users
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash("Admin@123456", salt);
  const userHash = await bcrypt.hash("User@123456", salt);

  const admin = await prisma.user.upsert({
    where: { email: "admin@prelegal.com" },
    update: {
      name: "Administrator",
      passwordHash: adminHash,
      role: "ADMIN",
    },
    create: {
      name: "Administrator",
      email: "admin@prelegal.com",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "user@prelegal.com" },
    update: {
      name: "Demo Professional",
      passwordHash: userHash,
      role: "USER",
    },
    create: {
      name: "Demo Professional",
      email: "user@prelegal.com",
      passwordHash: userHash,
      role: "USER",
    },
  });

  console.log("Users created:", admin.email, demoUser.email);

  // 3. Seed 8 Detailed Templates
  const templates = [
    // 1. Rental Agreement
    {
      title: "Residential Rental Agreement",
      slug: "rental-agreement",
      description:
        "Comprehensive residential lease agreement defining tenancy duration, monthly rent, security deposits, and maintenance obligations.",
      categoryId: createdCategories["real-estate"],
      isPopular: true,
      fieldsSchema: JSON.stringify([
        {
          name: "landlordName",
          label: "Landlord Full Name",
          type: "text",
          required: true,
          placeholder: "e.g., Sarah Jenkins",
          section: "Parties",
        },
        {
          name: "landlordAddress",
          label: "Landlord Address",
          type: "text",
          required: true,
          placeholder: "e.g., 104 Willow St, Austin, TX",
          section: "Parties",
        },
        {
          name: "tenantName",
          label: "Tenant Full Name",
          type: "text",
          required: true,
          placeholder: "e.g., Michael Chen",
          section: "Parties",
        },
        {
          name: "propertyAddress",
          label: "Leased Property Address",
          type: "text",
          required: true,
          placeholder: "e.g., Apt 4B, 742 Evergreen Terrace, Austin, TX",
          section: "Property Details",
        },
        {
          name: "startDate",
          label: "Lease Start Date",
          type: "date",
          required: true,
          section: "Lease Terms",
        },
        {
          name: "endDate",
          label: "Lease End Date",
          type: "date",
          required: true,
          section: "Lease Terms",
        },
        {
          name: "monthlyRent",
          label: "Monthly Rent Amount ($)",
          type: "number",
          required: true,
          placeholder: "e.g., 2200",
          section: "Financial Terms",
        },
        {
          name: "securityDeposit",
          label: "Security Deposit ($)",
          type: "number",
          required: true,
          placeholder: "e.g., 2200",
          section: "Financial Terms",
        },
        {
          name: "paymentDueDate",
          label: "Rent Due Day of Month",
          type: "select",
          required: true,
          options: ["1st of each month", "5th of each month", "15th of each month"],
          section: "Financial Terms",
        },
        {
          name: "utilitiesIncluded",
          label: "Utilities Included in Rent",
          type: "text",
          required: false,
          placeholder: "e.g., Water, Trash, Sewer",
          section: "Maintenance & Utilities",
        },
        {
          name: "petPolicy",
          label: "Pet Policy",
          type: "select",
          required: true,
          options: ["No pets permitted", "Pets allowed with prior approval", "Cats only allowed", "Dogs allowed under 30 lbs"],
          section: "House Rules",
        },
        {
          name: "additionalTerms",
          label: "Special Covenants / Additional Terms",
          type: "textarea",
          required: false,
          placeholder: "e.g., Tenant is responsible for minor repairs under $100.",
          section: "House Rules",
        },
      ]),
      contentTemplate: `RESIDENTIAL LEASE AGREEMENT

This Residential Lease Agreement ("Agreement") is entered into on this date between the following parties:

LANDLORD: {{landlordName}}, residing at {{landlordAddress}}
TENANT: {{tenantName}}

1. DEMISED PREMISES
The Landlord hereby leases to the Tenant, and the Tenant hereby rents from the Landlord, the real property located at:
{{propertyAddress}} ("Premises"), for residential dwelling purposes only.

2. TERM OF LEASE
The term of this Agreement shall commence on {{startDate}} and shall terminate on {{endDate}}, unless earlier terminated in accordance with the provisions hereof.

3. RENT & PAYMENT DUE DATE
The Tenant agrees to pay to the Landlord as rent the sum of \${{monthlyRent}} per month.
Rent payments are due on the {{paymentDueDate}}. Failure to pay rent within 5 days of the due date may incur a standard late assessment fee.

4. SECURITY DEPOSIT
Upon execution of this Agreement, the Tenant shall deposit with the Landlord the sum of \${{securityDeposit}} as a security deposit. The security deposit shall be held as security for the faithful performance by the Tenant of all terms of this lease, and returned less lawful deductions upon vacancy inspection.

5. UTILITIES AND SERVICES
The following utilities and services are agreed to be provided or paid by Landlord:
{{utilitiesIncluded}}
All other utilities and services not explicitly designated above shall be the sole financial responsibility of the Tenant.

6. PET RESTRICTIONS & USE
Pet Policy: {{petPolicy}}.
The Tenant shall not permit unauthorized animals on the premises without express written consent.

7. MAINTENANCE AND REPAIRS
The Tenant shall maintain the premises in a clean, sanitary, and good condition and promptly notify the Landlord of any damage or required maintenance.
{{#if additionalTerms}}
8. ADDITIONAL COVENANTS & TERMS
{{additionalTerms}}
{{/if}}

IN WITNESS WHEREOF, the Landlord and Tenant have executed this Residential Lease Agreement as of the date signed below.`,
    },

    // 2. Affidavit
    {
      title: "General Sworn Affidavit",
      slug: "affidavit",
      description:
        "Formal voluntary statement of fact written under oath, signed before an authorized notary public or legal commissioner.",
      categoryId: createdCategories["personal-legal"],
      isPopular: true,
      fieldsSchema: JSON.stringify([
        {
          name: "affiantName",
          label: "Affiant Full Legal Name",
          type: "text",
          required: true,
          placeholder: "e.g., Jonathan Ray Miller",
          section: "Affiant Information",
        },
        {
          name: "idNumber",
          label: "Government ID / Passport Number",
          type: "text",
          required: true,
          placeholder: "e.g., Driver License #D9481920",
          section: "Affiant Information",
        },
        {
          name: "residentialAddress",
          label: "Affiant Residential Address",
          type: "text",
          required: true,
          placeholder: "e.g., 402 Pine Boulevard, Chicago, IL",
          section: "Affiant Information",
        },
        {
          name: "jurisdiction",
          label: "State & County / Legal Jurisdiction",
          type: "text",
          required: true,
          placeholder: "e.g., Cook County, State of Illinois",
          section: "Legal Venue",
        },
        {
          name: "affidavitPurpose",
          label: "Purpose / Title of Affidavit",
          type: "text",
          required: true,
          placeholder: "e.g., Statement of Lost Document and Proof of Residence",
          section: "Affidavit Subject",
        },
        {
          name: "statementOne",
          label: "First Sworn Statement / Fact 1",
          type: "textarea",
          required: true,
          placeholder: "State fact 1 clearly and truthfully...",
          section: "Statements of Fact",
        },
        {
          name: "statementTwo",
          label: "Second Sworn Statement / Fact 2",
          type: "textarea",
          required: true,
          placeholder: "State fact 2 clearly and truthfully...",
          section: "Statements of Fact",
        },
        {
          name: "statementThree",
          label: "Third Sworn Statement / Fact 3 (Optional)",
          type: "textarea",
          required: false,
          placeholder: "Additional facts or clarifications...",
          section: "Statements of Fact",
        },
      ]),
      contentTemplate: `GENERAL SWORN AFFIDAVIT

STATE / JURISDICTION OF: {{jurisdiction}}

BEFORE ME, the undersigned authority, personally appeared {{affiantName}}, who being by me first duly sworn, deposes and states under oath as follows:

1. AFFIANT DETAILS
My full legal name is {{affiantName}}, residing at {{residentialAddress}}.
I am over the age of eighteen (18) years, of sound mind, and fully competent to testify to the matters stated herein. I hold legal identification verified as {{idNumber}}.

2. PURPOSE
This Affidavit is submitted for the official purpose of:
{{affidavitPurpose}}

3. STATEMENTS OF FACT
I hereby voluntarily declare and attest that the following statements are true and accurate to the best of my personal knowledge, recollection, and belief:

Statement 1:
{{statementOne}}

Statement 2:
{{statementTwo}}
{{#if statementThree}}

Statement 3:
{{statementThree}}
{{/if}}

4. SOLEMN AFFIRMATION
I make this solemn declaration conscientiously believing the same to be true, and knowing that it is of the same legal force and effect as if made under oath in a court of law.

DEPONENT SIGNATURE:
__________________________________
{{affiantName}}
Date: ____________________________

NOTARY / WITNESS ACKNOWLEDGMENT
Subscribed and sworn to before me on this _____ day of _______________, 20___.

__________________________________
Notary Public / Authorized Official
My Commission Expires: ___________`,
    },

    // 3. Non-Disclosure Agreement (NDA)
    {
      title: "Non-Disclosure Agreement (NDA)",
      slug: "nda-agreement",
      description:
        "Standard mutual or unilateral confidentiality agreement safeguarding proprietary business secrets, customer lists, and code.",
      categoryId: createdCategories["business"],
      isPopular: true,
      fieldsSchema: JSON.stringify([
        {
          name: "disclosingParty",
          label: "Disclosing Party (Company or Individual)",
          type: "text",
          required: true,
          placeholder: "e.g., NovaTech Solutions Inc.",
          section: "Parties",
        },
        {
          name: "receivingParty",
          label: "Receiving Party (Recipient)",
          type: "text",
          required: true,
          placeholder: "e.g., Marcus Vance & Associates LLC",
          section: "Parties",
        },
        {
          name: "purpose",
          label: "Business Purpose for Discussion",
          type: "text",
          required: true,
          placeholder: "e.g., Exploring prospective software acquisition and joint venture",
          section: "Scope of Disclosure",
        },
        {
          name: "confidentialityTerm",
          label: "Confidentiality Duration",
          type: "select",
          required: true,
          options: ["1 Year", "2 Years", "3 Years", "5 Years", "In perpetuity (Trade Secrets)"],
          section: "Terms",
        },
        {
          name: "governingLaw",
          label: "Governing Law / Jurisdiction",
          type: "text",
          required: true,
          placeholder: "e.g., State of Delaware",
          section: "Terms",
        },
        {
          name: "returnPeriodDays",
          label: "Days to Return/Destroy Materials upon Request",
          type: "number",
          required: true,
          placeholder: "e.g., 14",
          section: "Terms",
        },
      ]),
      contentTemplate: `CONFIDENTIALITY & NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is made effective between:

DISCLOSING PARTY: {{disclosingParty}}
RECEIVING PARTY: {{receivingParty}}

WHEREAS, the Disclosing Party possesses certain non-public, sensitive, and proprietary information and the parties wish to engage in discussions regarding {{purpose}} ("Permitted Purpose");

NOW, THEREFORE, the parties agree as follows:

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" encompasses all tangible and intangible data, technical specifications, source code, designs, algorithms, business strategies, pricing structures, customer records, and operational forecasts disclosed directly or indirectly.

2. DUTY OF STRICT CONFIDENTIALITY
The Receiving Party shall maintain the Confidential Information in strict confidence and shall exercise at least the same degree of care as it uses with its own valuable trade secrets, but not less than reasonable care.

3. RESTRICTION ON DISCLOSURE & USE
The Receiving Party agrees not to publish, copy, disseminate, or disclose any portion of the Confidential Information to any third party without express prior written consent from {{disclosingParty}}.

4. RETURN OR DESTRUCTION OF ASSETS
Within {{returnPeriodDays}} business days of a written request by the Disclosing Party or upon termination of discussions, the Receiving Party shall return or certifiedly destroy all copies and records of Confidential Information.

5. TERM AND SURVIVAL
The confidentiality obligations under this Agreement shall endure for a duration of {{confidentialityTerm}} from the effective date of disclosure.

6. GOVERNING LAW
This Agreement shall be construed and governed in all respects in accordance with the laws of {{governingLaw}}, without regard to conflicts of law principles.

7. INJUNCTIVE RELIEF
The Receiving Party acknowledges that monetary damages may be inadequate in the event of a breach, and the Disclosing Party shall be entitled to seek injunctive relief in any court of competent jurisdiction.

DISCLOSING PARTY:
Signature: ___________________________
Representative: {{disclosingParty}}

RECEIVING PARTY:
Signature: ___________________________
Representative: {{receivingParty}}`,
    },

    // 4. Employment Agreement
    {
      title: "Standard Employment Agreement",
      slug: "employment-agreement",
      description:
        "Comprehensive employment contract detailing compensation, working hours, responsibilities, probation, and termination protocol.",
      categoryId: createdCategories["employment"],
      isPopular: true,
      fieldsSchema: JSON.stringify([
        {
          name: "companyName",
          label: "Employer / Company Name",
          type: "text",
          required: true,
          placeholder: "e.g., Apex Global Technologies Corp",
          section: "Employer Details",
        },
        {
          name: "companyAddress",
          label: "Company Registered Address",
          type: "text",
          required: true,
          placeholder: "e.g., 500 Market Street, Suite 900, San Francisco, CA",
          section: "Employer Details",
        },
        {
          name: "employeeName",
          label: "Employee Full Name",
          type: "text",
          required: true,
          placeholder: "e.g., David Alexander Patel",
          section: "Employee Details",
        },
        {
          name: "jobTitle",
          label: "Job Title / Role",
          type: "text",
          required: true,
          placeholder: "e.g., Senior Full-Stack Engineer",
          section: "Position",
        },
        {
          name: "employmentType",
          label: "Employment Classification",
          type: "select",
          required: true,
          options: ["Full-Time (Exempt)", "Full-Time (Non-Exempt)", "Part-Time", "Fixed-Term Contract"],
          section: "Position",
        },
        {
          name: "startDate",
          label: "Employment Start Date",
          type: "date",
          required: true,
          section: "Position",
        },
        {
          name: "salaryAmount",
          label: "Base Compensation Amount ($)",
          type: "number",
          required: true,
          placeholder: "e.g., 115000",
          section: "Compensation",
        },
        {
          name: "payFrequency",
          label: "Payroll Schedule",
          type: "select",
          required: true,
          options: ["Bi-weekly", "Semi-monthly (15th & End of Month)", "Monthly"],
          section: "Compensation",
        },
        {
          name: "probationMonths",
          label: "Probationary Period (Months)",
          type: "number",
          required: true,
          placeholder: "e.g., 3",
          section: "Terms",
        },
        {
          name: "noticeWeeks",
          label: "Resignation / Termination Notice (Weeks)",
          type: "number",
          required: true,
          placeholder: "e.g., 2",
          section: "Terms",
        },
      ]),
      contentTemplate: `EMPLOYMENT CONTRACT & APPOINTMENT AGREEMENT

This Employment Agreement is entered into between:

EMPLOYER: {{companyName}}, located at {{companyAddress}}
EMPLOYEE: {{employeeName}}

1. POSITION AND TITLE
The Employer agrees to employ the Employee in the capacity of {{jobTitle}}. The Employee shall perform duties faithfully and to the best of their skill and talent.

2. EMPLOYMENT STATUS & COMMENCEMENT
The Employee's commencement date shall be {{startDate}}.
Classification: {{employmentType}}.

3. PROBATION PERIOD
The first {{probationMonths}} month(s) of employment shall serve as an introductory probationary period, during which either party may terminate this agreement with minimal statutory notice.

4. COMPENSATION & BENEFITS
The Employer will pay the Employee a base compensation of \${{salaryAmount}} per annum (or pro-rated as applicable), payable on a {{payFrequency}} basis, subject to applicable payroll tax withholdings and deductions.

5. TERMINATION AND RESIGNATION NOTICE
Following completion of the probationary period, either party may terminate this employment relationship by furnishing a written advance notice of at least {{noticeWeeks}} week(s).

6. INTELLECTUAL PROPERTY ASSIGNMENT
All works, codes, inventions, algorithms, designs, and materials conceived or authored by the Employee during working hours or using company equipment shall belong exclusively to {{companyName}}.

EMPLOYER:
Authorized Signature: _______________________
For: {{companyName}}

EMPLOYEE:
Signature: _______________________
Name: {{employeeName}}
Date: ____________________________`,
    },

    // 5. Authorization Letter
    {
      title: "Formal Letter of Authorization",
      slug: "authorization-letter",
      description:
        "Official authorization granting a trusted agent or legal representative power to act, sign documents, or retrieve records.",
      categoryId: createdCategories["personal-legal"],
      isPopular: false,
      fieldsSchema: JSON.stringify([
        {
          name: "grantorName",
          label: "Authorizing Person (Grantor)",
          type: "text",
          required: true,
          placeholder: "e.g., Elena Rostova",
          section: "Grantor Information",
        },
        {
          name: "grantorId",
          label: "Grantor Identification Number",
          type: "text",
          required: true,
          placeholder: "e.g., National ID #8839201",
          section: "Grantor Information",
        },
        {
          name: "representativeName",
          label: "Authorized Representative / Agent",
          type: "text",
          required: true,
          placeholder: "e.g., Robert Sterling",
          section: "Representative Information",
        },
        {
          name: "representativeId",
          label: "Representative ID Number",
          type: "text",
          required: true,
          placeholder: "e.g., Passport #P4810294",
          section: "Representative Information",
        },
        {
          name: "recipientEntity",
          label: "Addressed Organization / Authority",
          type: "text",
          required: true,
          placeholder: "e.g., Department of Motor Vehicles / First National Bank",
          section: "Authorization Scope",
        },
        {
          name: "authorizedAction",
          label: "Specific Actions Authorized",
          type: "textarea",
          required: true,
          placeholder: "e.g., Collect vehicle registration documents, sign delivery receipts, and process title transfer...",
          section: "Authorization Scope",
        },
        {
          name: "expiryDate",
          label: "Authorization Expiration Date",
          type: "date",
          required: true,
          section: "Validity Period",
        },
      ]),
      contentTemplate: `FORMAL LETTER OF AUTHORIZATION

TO: {{recipientEntity}}
DATE: {{expiryDate}}

SUBJECT: Letter of Formal Authorization for {{representativeName}}

Dear Sir / Madam,

I, {{grantorName}}, holder of identification {{grantorId}}, do hereby grant formal authorization to {{representativeName}}, holder of identification {{representativeId}}, to act on my behalf and as my lawful representative before {{recipientEntity}}.

Specifically, my representative is authorized to conduct and execute the following matters:
{{authorizedAction}}

Any documents, representations, or receipts endorsed by {{representativeName}} within the specific scope granted above shall carry the same effect as if executed personally by myself.

This authorization shall remain in full force and effect until {{expiryDate}}, unless formally revoked by me in writing prior to said date.

A copy of my official identification is attached hereto for verification purposes.

Sincerely,

___________________________________
Signature of Grantor: {{grantorName}}
Contact Phone / Email: ___________________________

SPECIMEN SIGNATURE OF AUTHORIZED AGENT:
___________________________________
Representative: {{representativeName}}`,
    },

    // 6. Business Agreement
    {
      title: "Commercial Business Services Agreement",
      slug: "business-agreement",
      description:
        "B2B service level contract outlining project scope, deliverables, compensation schedule, intellectual property, and warranties.",
      categoryId: createdCategories["business"],
      isPopular: true,
      fieldsSchema: JSON.stringify([
        {
          name: "clientName",
          label: "Client Company Name",
          type: "text",
          required: true,
          placeholder: "e.g., Horizon Retail Ventures LLC",
          section: "Parties",
        },
        {
          name: "providerName",
          label: "Service Provider / Agency Name",
          type: "text",
          required: true,
          placeholder: "e.g., Quantum Cloud Consulting Corp",
          section: "Parties",
        },
        {
          name: "serviceScope",
          label: "Scope of Services & Deliverables",
          type: "textarea",
          required: true,
          placeholder: "e.g., Development of an enterprise inventory management portal...",
          section: "Project Scope",
        },
        {
          name: "contractValue",
          label: "Total Contract Compensation ($)",
          type: "number",
          required: true,
          placeholder: "e.g., 25000",
          section: "Compensation",
        },
        {
          name: "paymentStructure",
          label: "Billing / Milestone Schedule",
          type: "select",
          required: true,
          options: ["50% Upfront, 50% upon Completion", "33% Deposit, 33% Beta Delivery, 34% Final Launch", "Monthly retainer invoicing (Net 30)"],
          section: "Compensation",
        },
        {
          name: "completionTimeline",
          label: "Projected Completion Target Date",
          type: "date",
          required: true,
          section: "Schedule",
        },
      ]),
      contentTemplate: `COMMERCIAL SERVICES AGREEMENT

This Agreement is entered into between:

CLIENT: {{clientName}}
SERVICE PROVIDER: {{providerName}}

1. SERVICES ENGAGEMENT
The Service Provider agrees to deliver to the Client the following technical and professional services ("Services"):
{{serviceScope}}

2. TIMELINE & DELIVERABLES
The Service Provider shall use diligent commercial efforts to accomplish the deliverables on or before {{completionTimeline}}.

3. CONSIDERATION AND FEES
In consideration for satisfactory performance of the Services, the Client shall pay a total sum of \${{contractValue}}.
Payment schedule: {{paymentStructure}}.

4. INDEPENDENT CONTRACTOR RELATIONSHIP
The Service Provider operates solely as an independent contractor. Neither party is authorized to bind the other in any contract or representation.

5. INTELLECTUAL PROPERTY RIGHTS
Upon receipt of full payment from Client, all custom deliverable works authored for this project shall transfer to {{clientName}}, excluding Provider's pre-existing software libraries.

CLIENT:
Authorized Representative: _______________________
For: {{clientName}}

SERVICE PROVIDER:
Authorized Representative: _______________________
For: {{providerName}}`,
    },

    // 7. Payment Agreement
    {
      title: "Debt Repayment & Installment Agreement",
      slug: "payment-agreement",
      description:
        "Legally structured promissory payment contract establishing acknowledged debt balance, installment timetable, and default penalties.",
      categoryId: createdCategories["finance"],
      isPopular: false,
      fieldsSchema: JSON.stringify([
        {
          name: "creditorName",
          label: "Creditor / Lender Name",
          type: "text",
          required: true,
          placeholder: "e.g., Capital Trust Holdings",
          section: "Parties",
        },
        {
          name: "debtorName",
          label: "Debtor / Borrower Name",
          type: "text",
          required: true,
          placeholder: "e.g., Samuel James Foster",
          section: "Parties",
        },
        {
          name: "principalAmount",
          label: "Acknowledged Total Debt Amount ($)",
          type: "number",
          required: true,
          placeholder: "e.g., 8500",
          section: "Debt Terms",
        },
        {
          name: "installmentAmount",
          label: "Periodic Installment Amount ($)",
          type: "number",
          required: true,
          placeholder: "e.g., 500",
          section: "Repayment Terms",
        },
        {
          name: "frequency",
          label: "Payment Frequency",
          type: "select",
          required: true,
          options: ["Monthly", "Bi-weekly", "Weekly"],
          section: "Repayment Terms",
        },
        {
          name: "firstPaymentDate",
          label: "Date of First Installment",
          type: "date",
          required: true,
          section: "Repayment Terms",
        },
        {
          name: "interestRate",
          label: "Annual Interest Rate (%)",
          type: "number",
          required: true,
          placeholder: "e.g., 0 for interest-free, or 5",
          section: "Debt Terms",
        },
      ]),
      contentTemplate: `DEBT REPAYMENT & PROMISSORY AGREEMENT

This Agreement is executed between:

CREDITOR: {{creditorName}}
DEBTOR: {{debtorName}}

1. DEBT ACKNOWLEDGMENT
The Debtor unconditionally acknowledges and agrees that they are legally indebted to the Creditor in the total principal sum of \${{principalAmount}}, carrying an agreed annual interest rate of {{interestRate}}%.

2. REPAYMENT STRUCTURE
The Debtor promises and covenants to satisfy the total debt through consecutive installments of \${{installmentAmount}} each, payable on a {{frequency}} basis.

3. COMMENCEMENT
The initial installment shall be delivered on {{firstPaymentDate}}, and subsequent payments shall continue uninterruptedly until the entire balance is liquidated.

4. DEFAULT PROVISION
Should the Debtor fail to make any scheduled payment within ten (10) calendar days of its due date, the entire remaining unpaid balance shall become immediately due and payable at the option of the Creditor.

CREDITOR:
Signature: __________________________
Name: {{creditorName}}

DEBTOR:
Signature: __________________________
Name: {{debtorName}}
Date: _______________________________`,
    },

    // 8. General Declaration
    {
      title: "General Legal Declaration & Attestation",
      slug: "general-declaration",
      description:
        "Versatile formal declaration document for attesting to specific events, asset ownership, address confirmation, or formal claims.",
      categoryId: createdCategories["personal-legal"],
      isPopular: false,
      fieldsSchema: JSON.stringify([
        {
          name: "declarantName",
          label: "Declarant Legal Full Name",
          type: "text",
          required: true,
          placeholder: "e.g., Catherine Walsh",
          section: "Declarant Information",
        },
        {
          name: "declarantContact",
          label: "Declarant Email / Phone",
          type: "text",
          required: true,
          placeholder: "e.g., catherine.walsh@example.com",
          section: "Declarant Information",
        },
        {
          name: "declarationSubject",
          label: "Declaration Subject / Title",
          type: "text",
          required: true,
          placeholder: "e.g., Declaration of Sole Ownership of Property",
          section: "Subject",
        },
        {
          name: "statementDetails",
          label: "Detailed Declaration Statement",
          type: "textarea",
          required: true,
          placeholder: "Explain in complete detail the facts you are officially declaring...",
          section: "Declaration Statement",
        },
        {
          name: "witnessName",
          label: "Attesting Witness Name (Optional)",
          type: "text",
          required: false,
          placeholder: "e.g., Brian O'Connor",
          section: "Witness",
        },
      ]),
      contentTemplate: `FORMAL DECLARATION & STATEMENT OF TRUTH

I, {{declarantName}}, with contact details at {{declarantContact}}, do solemnly, sincerely, and truly declare as follows:

RE: {{declarationSubject}}

1. I am making this formal declaration with full knowledge and understanding of its implications.

2. STATEMENT OF FACTS:
{{statementDetails}}

3. I declare under penalty of perjury that the foregoing statements and representations are true, complete, and correct to the best of my knowledge and belief.

EXECUTED by the Declarant:
Signature: ___________________________________
Name: {{declarantName}}
Date: _______________________________________
{{#if witnessName}}

ATTESTED BY WITNESS:
Signature: ___________________________________
Witness Name: {{witnessName}}
Date: _______________________________________
{{/if}}`,
    },
  ];

  for (const tpl of templates) {
    await prisma.template.upsert({
      where: { slug: tpl.slug },
      update: {
        title: tpl.title,
        description: tpl.description,
        categoryId: tpl.categoryId,
        fieldsSchema: tpl.fieldsSchema,
        contentTemplate: tpl.contentTemplate,
        isPopular: tpl.isPopular,
      },
      create: tpl,
    });
  }

  // 4. Create a sample generated document for demoUser so dashboard immediately has realistic data!
  const rentalTpl = await prisma.template.findUnique({ where: { slug: "rental-agreement" } });
  if (rentalTpl) {
    const sampleFormData = {
      landlordName: "Sarah Jenkins",
      landlordAddress: "104 Willow St, Austin, TX",
      tenantName: "Demo Professional",
      propertyAddress: "Apt 4B, 742 Evergreen Terrace, Austin, TX",
      startDate: "2026-10-01",
      endDate: "2027-09-30",
      monthlyRent: "2200",
      securityDeposit: "2200",
      paymentDueDate: "1st of each month",
      utilitiesIncluded: "Water, Trash, Sewer",
      petPolicy: "Cats only allowed",
      additionalTerms: "Tenant shall change air filters quarterly.",
    };

    const sampleContent = `RESIDENTIAL LEASE AGREEMENT

This Residential Lease Agreement ("Agreement") is entered into on this date between the following parties:

LANDLORD: Sarah Jenkins, residing at 104 Willow St, Austin, TX
TENANT: Demo Professional

1. DEMISED PREMISES
The Landlord hereby leases to the Tenant, and the Tenant hereby rents from the Landlord, the real property located at:
Apt 4B, 742 Evergreen Terrace, Austin, TX ("Premises"), for residential dwelling purposes only.

2. TERM OF LEASE
The term of this Agreement shall commence on 2026-10-01 and shall terminate on 2027-09-30, unless earlier terminated in accordance with the provisions hereof.

3. RENT & PAYMENT DUE DATE
The Tenant agrees to pay to the Landlord as rent the sum of $2200 per month.
Rent payments are due on the 1st of each month. Failure to pay rent within 5 days of the due date may incur a standard late assessment fee.

4. SECURITY DEPOSIT
Upon execution of this Agreement, the Tenant shall deposit with the Landlord the sum of $2200 as a security deposit. The security deposit shall be held as security for the faithful performance by the Tenant of all terms of this lease, and returned less lawful deductions upon vacancy inspection.

5. UTILITIES AND SERVICES
The following utilities and services are agreed to be provided or paid by Landlord:
Water, Trash, Sewer
All other utilities and services not explicitly designated above shall be the sole financial responsibility of the Tenant.

6. PET RESTRICTIONS & USE
Pet Policy: Cats only allowed.
The Tenant shall not permit unauthorized animals on the premises without express written consent.

7. MAINTENANCE AND REPAIRS
The Tenant shall maintain the premises in a clean, sanitary, and good condition and promptly notify the Landlord of any damage or required maintenance.

8. ADDITIONAL COVENANTS & TERMS
Tenant shall change air filters quarterly.

IN WITNESS WHEREOF, the Landlord and Tenant have executed this Residential Lease Agreement as of the date signed below.`;

    const existingDoc = await prisma.document.findFirst({
      where: { userId: demoUser.id, templateId: rentalTpl.id },
    });

    if (!existingDoc) {
      await prisma.document.create({
        data: {
          userId: demoUser.id,
          templateId: rentalTpl.id,
          title: "Residential Lease Agreement - Apt 4B Evergreen",
          status: "GENERATED",
          formData: JSON.stringify(sampleFormData),
          generatedContent: sampleContent,
        },
      });
    }
  }

  console.log("Database seeded successfully with 8 templates and sample document!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
