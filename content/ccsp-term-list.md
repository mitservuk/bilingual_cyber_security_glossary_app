# CCSP term list

The working list for completing CCSP: 25 terms are written and 379 are proposed, 404 in all.

This is a proposal to review, trim and add to before the entries are written.

It follows the six domains of ISC2's CCSP exam outline effective 1 August 2026,
and was checked against that outline's sub-topics, including the new sections
on artificial intelligence. Country-specific laws from outside Europe that the
outline names as examples (FERPA, PIPEDA) are left out.

A term appears once, under the domain where it matters most, even where the
exam touches it in several.

## 1. Cloud Concepts, Architecture and Design

76 terms: 4 written, 72 proposed.

**Written:** cloud computing, shared responsibility model, multitenancy, infrastructure as a service (IaaS).

**Roles** (6): cloud service provider (CSP), cloud service customer, cloud service broker, cloud service partner, cloud auditor, regulator.

**Essential characteristics** (6): on-demand self-service, broad network access, resource pooling, rapid elasticity, measured service, scalability.

**Service and deployment models** (7): platform as a service (PaaS), software as a service (SaaS), public cloud, private cloud, hybrid cloud, community cloud, multi-cloud.

**Building blocks and related technology** (11): virtualization, container, orchestration, microservices, serverless computing, edge computing, confidential computing, Internet of Things (IoT), blockchain, quantum computing, DevSecOps.

**Shared considerations** (8): interoperability, portability, reversibility, resiliency, availability, vendor lock-in, service level agreement (SLA), governance.

**Security concepts** (17): confidentiality, integrity, defence in depth, least privilege, separation of duties, zero trust, identity and access management (IAM), access control, cloud access security broker (CASB), media sanitization, cryptographic erasure, security baseline, traffic inspection, geofencing, isolation, ephemeral computing, secure by design.

**Design** (5): business impact analysis (BIA), cost-benefit analysis, return on investment (ROI), reference architecture, Well-Architected Framework.

**Evaluating providers** (4): Common Criteria, FIPS 140-3, CSA STAR, ISO/IEC 27017.

**Artificial intelligence** (8): artificial intelligence (AI), machine learning, large language model (LLM), training data, data set, model, data science, AI ethics.

## 2. Cloud Data Security

64 terms: 5 written, 59 proposed.

**Written:** encryption, data at rest, key management, tokenization, data loss prevention (DLP).

**Data lifecycle** (3): data lifecycle, data dispersion, data flow.

**Storage** (7): object storage, block storage, file storage, ephemeral storage, long-term storage, raw storage, volume storage.

**Cryptography** (16): symmetric encryption, asymmetric encryption, hashing, digital signature, digital certificate, public key infrastructure (PKI), certificate authority (CA), hardware security module (HSM), key rotation, bring your own key (BYOK), envelope encryption, homomorphic encryption, Transport Layer Security (TLS), data in transit, data in use, certificate revocation.

**Obfuscation** (4): data masking, data obfuscation, anonymization, pseudonymization.

**Discovery and classification** (11): data discovery, structured data, unstructured data, semi-structured data, data classification, data labelling, data mapping, sensitive data, personally identifiable information (PII), protected health information (PHI), cardholder data.

**Rights and retention** (6): information rights management (IRM), digital rights management (DRM), data retention, data deletion, data archiving, legal hold.

**Accountability** (6): auditability, traceability, accountability, non-repudiation, chain of custody, geolocation.

**Ownership and exposure** (6): data sovereignty, data residency, data breach, data owner, data custodian, secrets management.

## 3. Cloud Platform and Infrastructure Security

57 terms: 4 written, 53 proposed.

**Written:** hypervisor, virtual machine (VM), disaster recovery (DR), firewall.

**Infrastructure components** (10): management plane, control plane, compute, software-defined networking (SDN), virtual private cloud (VPC), virtual network, load balancer, content delivery network (CDN), region, availability zone.

**Data centre design** (9): data centre, redundancy, high availability, fault tolerance, failover, heating, ventilation and air conditioning (HVAC), uninterruptible power supply (UPS), physical security, tenant partitioning.

**Network controls** (10): network segmentation, microsegmentation, security group, intrusion detection system (IDS), intrusion prevention system (IPS), bastion host, honeypot, virtual private network (VPN), demilitarized zone (DMZ), packet capture.

**Threats** (14): threat, vulnerability, exploit, attack surface, denial of service (DoS), man-in-the-middle attack, VM escape, VM sprawl, misconfiguration, insider threat, account hijacking, advanced persistent threat (APT), malware, ransomware.

**Access** (4): identification, authentication, authorization, multi-factor authentication (MFA).

**Continuity** (6): business continuity, business continuity plan (BCP), recovery time objective (RTO), recovery point objective (RPO), tabletop exercise, recovery service level.

## 4. Cloud Application Security

63 terms: 4 written, 59 proposed.

**Written:** software development lifecycle (SDLC), sandbox, threat modelling, API.

**Development methods** (10): agile, waterfall, DevOps, continuous integration and delivery (CI/CD), pipeline, infrastructure as code (IaC), secure coding, code review, version control, software configuration management.

**Requirements and testing** (13): functional requirement, non-functional requirement, static application security testing (SAST), dynamic application security testing (DAST), interactive application security testing (IAST), software composition analysis (SCA), penetration test, vulnerability scan, fuzzing, abuse case, quality assurance (QA), black-box testing, white-box testing.

**Threat models and references** (8): STRIDE, OWASP Top 10, DREAD, PASTA, OWASP ASVS, OWASP API Security Top 10, OWASP Top 10 for LLM Applications, CWE Top 25.

**Vulnerabilities** (8): injection, SQL injection, cross-site scripting (XSS), cross-site request forgery (CSRF), server-side request forgery (SSRF), broken access control, insecure deserialization, buffer overflow.

**Software supply chain** (6): software supply chain, software bill of materials (SBOM), open-source software, third-party software, dependency, software licence.

**Application architecture** (7): web application firewall (WAF), API gateway, database activity monitoring (DAM), application virtualization, XML firewall, Docker, Kubernetes.

**Identity** (7): federated identity, identity provider (IdP), single sign-on (SSO), OAuth, OpenID Connect, SAML, privileged access management (PAM).

## 5. Cloud Security Operations

63 terms: 4 written, 59 proposed.

**Written:** incident response, patch management, log, backup.

**Building the environment** (9): trusted platform module (TPM), guest operating system, host, cluster, capacity management, performance monitoring, secure by default, type 1 hypervisor, type 2 hypervisor.

**Access and network** (7): remote access, Secure Shell (SSH), Remote Desktop Protocol (RDP), virtual LAN (VLAN), DNSSEC, DHCP, jump box.

**Hardening and change** (8): hardening, configuration management, change management, release management, deployment, rollback, maintenance window, immutable infrastructure.

**Service management** (10): ITIL, problem management, service level management, availability management, continual improvement, continuity management, COBIT, CIS Controls, COSO, ISO/IEC 20000-1.

**Monitoring** (11): monitoring, alert, security operations centre (SOC), security information and event management (SIEM), security orchestration, automation and response (SOAR), log management, event correlation, threat intelligence, indicator of compromise (IoC), vulnerability assessment, vulnerability management.

**Forensics** (4): digital forensics, evidence, e-discovery, forensic image.

**Responding** (8): containment, eradication, root cause analysis, post-incident review, playbook, runbook, escalation, stakeholder.

**Recovery** (2): restore, snapshot.

## 6. Legal, Risk and Compliance

81 terms: 4 written, 77 proposed.

**Written:** GDPR, data controller, personal data, risk assessment.

**Legal** (7): jurisdiction, applicable law, legislation, regulation, contract, liability, intellectual property.

**Privacy** (13): privacy, data protection, data subject, consent, data protection officer (DPO), data protection impact assessment (DPIA), privacy by design, data breach notification, international data transfer, right to erasure, supervisory authority, privacy impact assessment (PIA), Generally Accepted Privacy Principles (GAPP).

**Audit** (12): audit, auditor, internal audit, external audit, audit scope, audit report, gap analysis, SOC 2 report, attestation, certification, SSAE 18, ISAE 3402.

**Governance** (12): information security management system (ISMS), policy, standard, procedure, guideline, control, compliance, regulatory compliance, due diligence, due care, governance, risk and compliance (GRC), data steward.

**Risk** (16): risk, risk management, risk appetite, risk tolerance, risk treatment, risk mitigation, risk transfer, risk acceptance, risk avoidance, residual risk, inherent risk, risk register, likelihood, impact, key risk indicator (KRI), risk profile.

**Contracts and suppliers** (8): master service agreement (MSA), statement of work (SOW), right to audit, vendor management, third-party risk, outsourcing, cyber insurance, exit strategy.

**Frameworks and laws** (9): ISO/IEC 27001, ISO/IEC 27018, PCI DSS, HIPAA, Sarbanes-Oxley Act (SOX), NIST Cybersecurity Framework, CSA Cloud Controls Matrix, NERC CIP, HITECH Act.
