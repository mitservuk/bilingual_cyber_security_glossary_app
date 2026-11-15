# Backlog

What could be added next. Nothing here shows in the app: a certification
appears once its exam outline is loaded, and a framework once it has terms.

To work on an item, run `/add-terms <item>` in Claude Code, or follow
[ADDING-TERMS.md](ADDING-TERMS.md) by hand. Move the item out of this file in
the same pull request.

## Next up

- Situational phrases: what to say in a meeting, an incident call, an audit.

## Quality

- Entries marked `draft`: the main Spanish form has no confirmed source.
- A read by a native speaker working in the field in Spain.
- CISSP domains for the terms first written for CCSP were assigned by rule
  from each term's main topic; the debatable ones need a look.

## Certifications that are live but need a closer pass

The cloud exams (AWS, Azure, Google Cloud) and CISSP had existing terms filed
under their domains by rule from each term's main topic, with
`scripts/file_under_exam.py`. Some domains are thin or empty as a result, for
example cost optimisation in the AWS architect exams. The Google Cloud section
names and the SABSA Foundation modules were written from memory and should be
checked against the current guides.

## Certifications not started

They are already named in `taxonomy.yaml`, without domains.

- **AWS:** Cloud Practitioner.
- **Accredited training bodies:** ISO/IEC 27001 Lead Auditor, ISO/IEC 27001 Lead Implementer.
- **Cloud Security Alliance:** CCSK (Certificate of Cloud Security Knowledge), CCZT (Certificate of Competence in Zero Trust).
- **CompTIA:** Security+, CySA+ (Cybersecurity Analyst), PenTest+, SecurityX (Formerly CASP+), Cloud+.
- **EC-Council:** CEH (Certified Ethical Hacker).
- **GIAC (SANS):** GSEC (Security Essentials), GCIH (Certified Incident Handler), GCIA (Certified Intrusion Analyst), GPEN (Penetration Tester), GWAPT (Web Application Penetration Tester), GCFA (Certified Forensic Analyst), GMON (Continuous Monitoring), GDSA (Defensible Security Architecture), GSLC (Security Leadership), GSTRT (Strategic Planning, Policy and Leadership), GCLD (Cloud Security Essentials), GPCS (Public Cloud Security), GCSA (Cloud Security Automation), GCTD (Cloud Threat Detection), GCPN (Cloud Penetration Tester), GCFR (Cloud Forensics Responder), GICSP (Global Industrial Cyber Security Professional).
- **Google Cloud:** Cloud Digital Leader, Associate Cloud Engineer.
- **HashiCorp:** Terraform Associate, Vault Associate.
- **IAPP:** CIPP/E (Certified Information Privacy Professional, Europe), CIPM (Certified Information Privacy Manager), CIPT (Certified Information Privacy Technologist).
- **ISACA:** CISA (Certified Information Systems Auditor), CISM (Certified Information Security Manager), CRISC (Certified in Risk and Information Systems Control), CGEIT (Certified in the Governance of Enterprise IT), CDPSE (Certified Data Privacy Solutions Engineer).
- **ISC2:** CC (Certified in Cybersecurity), SSCP (Systems Security Certified Practitioner), CGRC (Certified in Governance, Risk and Compliance), CSSLP (Certified Secure Software Lifecycle Professional).
- **Microsoft:** AZ-900 (Azure Fundamentals), SC-900 (Security, Compliance and Identity Fundamentals), AZ-104 (Azure Administrator), SC-200 (Security Operations Analyst), SC-300 (Identity and Access Administrator).
- **OffSec:** OSCP (OffSec Certified Professional).
- **PeopleCert:** ITIL 4 Foundation.
- **The Linux Foundation:** KCNA (Kubernetes and Cloud Native Associate), CKA (Certified Kubernetes Administrator), CKAD (Certified Kubernetes Application Developer), CKS (Certified Kubernetes Security Specialist).
- **The Open Group:** TOGAF.
- **The SABSA Institute:** SABSA Practitioner (SABSA Chartered Security Architect, Practitioner (SCP)), SABSA Master (SABSA Chartered Security Architect, Master (SCM)).

## Frameworks with no terms yet

ENI, Data Act, NIS Regulations 2018, NCSC Cloud Security Principles, NIST SP 800-53, NIST SP 800-171, NIST SP 800-207, NIST Risk Management Framework, NIST AI Risk Management Framework, FedRAMP, CMMC, GLBA, CCPA and CPRA, ISO/IEC 27005, ISO/IEC 27701, ISO/IEC 42001.
