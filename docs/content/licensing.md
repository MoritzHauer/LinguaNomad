# LinguaNomad Licensing Policy For Learning Content

## Policy Goal

LinguaNomad should be publishable as an open-source project without ambiguous rights over course content or supporting assets.

## Repository Rule

Do not commit source material unless its redistribution status is known and compatible with the repository.

## Content Classes

### Public Redistributable Content

This content may live in the repository and may ship with the app if:
- Its license permits redistribution
- Attribution obligations are known
- The team can comply with those obligations in both source and packaged form

### Internal Prototype Content

This content may be used for local experiments only if:
- It remains outside the public repository
- It is excluded from public builds
- It is clearly marked as non-redistributable

### Original LinguaNomad Content

Original authored lessons, notes, tasks, and metadata should be the safest long-term basis for the public course.

## Required Metadata Per Source

Every content source should record:
- Stable identifier
- Source URL
- Source name
- License summary
- Attribution text or requirement
- Commitable status
- Packagable status
- Notes on transformations or derived content

## Attribution Strategy

Attribution requirements must be satisfiable in two places:
- In the repository
- In the application or distributed content pack when required

## Review Rule

No ingestion pipeline should mark content as public by default.
Public status must be an explicit decision backed by recorded source metadata.