# Security Audit Report: Stored Keys and Credentials

**Audit Date:** January 6, 2026  
**Repository:** andreisugu/gamenative-config-tools  
**Auditor:** GitHub Copilot Agent  

---

## Executive Summary

This security audit was conducted to identify any keys, tokens, credentials, or sensitive information stored in the repository. The audit examined all source files, configuration files, environment files, and git history.

### Key Findings:
- ✅ **1 Supabase API Key Found** - Intentionally public, read-only access key
- ✅ **No Private Keys or Secrets Found**
- ✅ **No Environment Files Committed**
- ✅ **Proper .gitignore Configuration**

---

## Detailed Findings

### 1. Supabase Configuration (`lib/supabase.ts`)

**Location:** `/lib/supabase.ts` (lines 5-6)

**Finding:**
```typescript
const supabaseUrl = 'https://egtttatimmnyxoivqcoi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVndHR0YXRpbW1ueXhvaXZxY29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTQ4NjEsImV4cCI6MjA3MjU3MDg2MX0.JleNsgQr4LfSikOqnQKRnPlBCzg2zlEiPPbLSDG9xmE';
```

**JWT Token Decoded:**
```json
{
    "iss": "supabase",
    "ref": "egtttatimmnyxoivqcoi",
    "role": "anon",
    "iat": 1756994861,
    "exp": 2072570861
}
```

**Token Details:**
- Issued: September 4, 2025 (iat: 1756994861)
- Expires: October 13, 2042 (exp: 2072570861)
- Role: `anon` (anonymous)

**Risk Assessment:** ✅ **LOW RISK**

**Justification:**
- The token has role `"anon"` (anonymous), which is Supabase's public, read-only role
- The code explicitly states: "Public community database credentials - intentionally not using environment variables as this is a read-only public database provided for community use"
- This is a standard Supabase anonymous key intended for client-side use
- The database is designed to be publicly accessible for reading community-submitted game configurations
- Token has a long expiration date (until 2042), which is typical for public, read-only Supabase keys

**Recommendation:** ✅ **ACCEPTABLE**
This is an appropriate use case for hardcoding a public, read-only API key. The key is meant to be public and provides only read access to community data.

---

### 2. External API URLs (`app/config-converter/page.tsx`)

**Location:** `/app/config-converter/page.tsx` (lines 198-202)

**Finding:**
```typescript
`https://api.allorigins.win/raw?url=`
`https://corsproxy.io/?`
`https://store.steampowered.com/api/appdetails?appids=${appId}`
```

**Risk Assessment:** ✅ **NO RISK**

**Justification:**
- These are public API endpoints that don't require authentication
- AllOrigins and CORSproxy are public CORS proxy services
- Steam API endpoint is a public, unauthenticated endpoint for game information
- No API keys or credentials are used with these services

---

### 3. Environment File Configuration

**Location:** `.gitignore` (line 34)

**Finding:**
```gitignore
# env files (can opt-in for committing if needed)
.env*
```

**Risk Assessment:** ✅ **PROPERLY CONFIGURED**

**Verification:**
- `.env*` pattern is properly excluded from git
- No `.env` files found in the working directory
- Git history check shows no `.env` files were previously committed

---

### 4. GitHub Actions Workflow

**Location:** `.github/workflows/deploy.yml`

**Finding:** The deployment workflow uses GitHub's built-in authentication mechanisms:
- `permissions` are properly scoped (contents: read, pages: write, id-token: write)
- No hardcoded secrets or tokens
- Uses GitHub's automatic `GITHUB_TOKEN` via actions

**Risk Assessment:** ✅ **SECURE**

---

### 5. Comprehensive Code Search Results

**Patterns Searched:**
- API keys, tokens, passwords, credentials
- Database connection strings
- Private keys, access keys, bearer tokens
- AWS, Azure, GCP, Firebase credentials

**Result:** ✅ **No sensitive credentials found** (except the intentional public Supabase key)

---

## Files Scanned

### Source Code Files (9 files):
- `lib/supabase.ts` ⚠️ (Contains public Supabase key - intentional)
- `next.config.ts` ✅
- `app/components/Sidebar.tsx` ✅
- `app/layout.tsx` ✅
- `app/config-editor/page.tsx` ✅
- `app/config-converter/page.tsx` ✅
- `app/config-browser/ConfigBrowserClient.tsx` ✅
- `app/config-browser/page.tsx` ✅
- `app/page.tsx` ✅

### Configuration Files:
- `package.json` ✅
- `.gitignore` ✅
- `.github/workflows/deploy.yml` ✅
- `tsconfig.json` ✅
- `next.config.ts` ✅
- `postcss.config.mjs` ✅

---

## Recommendations

### Current Status: ✅ **SECURE**

The repository follows security best practices:

1. ✅ **Environment files are properly ignored** - `.env*` is in `.gitignore`
2. ✅ **No secrets in source code** - Only a public, read-only Supabase key
3. ✅ **No secrets in GitHub Actions** - Uses proper GitHub authentication
4. ✅ **Clear documentation** - The public key is clearly marked as intentional

### Optional Improvements (Not Required):

While the current implementation is secure, here are optional enhancements if you want to follow a more strict security posture:

1. **Consider adding a SECURITY.md file** to document the security model
2. **Add a note in README.md** explaining that the Supabase key is intentionally public
3. **Consider using environment variables** even for public keys, to maintain consistency (though this adds unnecessary complexity for a public key)

---

## Conclusion

**Overall Risk Level:** ✅ **LOW / ACCEPTABLE**

The repository is **secure** and follows appropriate security practices for a public, client-side application. The only "secret" found is an intentionally public, read-only Supabase anonymous key, which is the standard and recommended approach for client-side access to public Supabase databases.

**No remediation actions are required.**

---

## Audit Methodology

1. **File System Scan:** Searched for common secret file patterns (`.env`, `.key`, `.pem`, `*secret*`, `*credential*`)
2. **Content Search:** Used regex patterns to search for keywords like `api_key`, `secret`, `password`, `token`, `credential`
3. **Git History Analysis:** Checked git history for previously committed secrets
4. **JWT Decoding:** Decoded and analyzed the Supabase JWT token
5. **Manual Review:** Reviewed all TypeScript/JavaScript source files
6. **Configuration Review:** Examined `.gitignore`, `package.json`, and GitHub Actions workflows

---

**Audit completed successfully.**
